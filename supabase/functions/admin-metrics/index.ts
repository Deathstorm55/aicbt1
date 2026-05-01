import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAILS = ['ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com', 'odualagregory@gmail.com']

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error("Missing Authorization header")
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        // 1. Create client with user's Auth context to securely get their own user record
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        // Fetch user's own profile. RLS guarantees they can only fetch their own row.
        const { data: userProfile, error: profileError } = await userClient
            .from('users')
            .select('email')
            .single()

        if (profileError || !userProfile || !userProfile.email) {
            console.error("Auth checks failed:", profileError)
            throw new Error("Unauthorized or user profile not found.")
        }

        // 2. Verify admin email
        if (!ADMIN_EMAILS.includes(userProfile.email)) {
            throw new Error("Forbidden: Admin access required.")
        }

        // 3. Create Service Role client to bypass RLS and fetch all user metrics
        const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)

        // Fetch users
        const { data: users, error: usersError } = await adminClient
            .from('users')
            .select('id, phq9_score, needs_crisis_intervention, created_at')

        if (usersError) throw usersError

        // Fetch mood logs (for trends and active users)
        const { data: moodLogs, error: moodLogsError } = await adminClient
            .from('mood_logs')
            .select('clerk_user_id, mood, created_at')
            .order('created_at', { ascending: true })

        if (moodLogsError) throw moodLogsError

        // Fetch chat messages (for active users and usage stats)
        const { data: chatMessages, error: chatError } = await adminClient
            .from('chat_messages')
            .select('clerk_user_id, created_at')

        if (chatError) throw chatError

        // Fetch crisis keyword logs for analytics
        const { data: crisisLogs, error: crisisLogsError } = await adminClient
            .from('crisis_keyword_logs')
            .select('id', { count: 'exact' })

        if (crisisLogsError) throw crisisLogsError

        // Fetch PHQ-9 history for longitudinal tracking
        const { data: phq9History, error: phq9Error } = await adminClient
            .from('phq9_history')
            .select('*')
            .order('created_at', { ascending: true })

        if (phq9Error) throw phq9Error

        // Aggregate metrics securely on the server
        const totalUsers = users.length
        const crisisCount = users.filter(u => u.needs_crisis_intervention).length

        // Active Users: unique users who sent a chat or mood log in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const cutoffDate = sevenDaysAgo.toISOString();

        const activeUserIds = new Set();
        moodLogs.forEach(log => {
            if (log.created_at >= cutoffDate) activeUserIds.add(log.clerk_user_id);
        });
        chatMessages.forEach(msg => {
            if (msg.created_at >= cutoffDate) activeUserIds.add(msg.clerk_user_id);
        });
        const activeUsersCount = activeUserIds.size;

        // Average Chatbot Usage: total messages / total users
        const averageChatbotUsage = totalUsers > 0 ? (chatMessages.length / totalUsers).toFixed(1) : 0;
        const totalMoodLogs = moodLogs.length;
        const crisisStatementsCount = crisisLogs ? crisisLogs.length : 0;

        let validScores = 0
        let sumScores = 0
        const scoreDistribution = {
            minimal: 0,
            mild: 0,
            moderate: 0,
            moderatelySevere: 0,
            severe: 0
        }

        users.forEach(user => {
            if (user.phq9_score !== null && user.phq9_score !== undefined) {
                validScores++
                sumScores += user.phq9_score
                const s = user.phq9_score
                if (s <= 4) scoreDistribution.minimal++
                else if (s <= 9) scoreDistribution.mild++
                else if (s <= 14) scoreDistribution.moderate++
                else if (s <= 19) scoreDistribution.moderatelySevere++
                else scoreDistribution.severe++
            }
        })

        const averagePhq9 = validScores > 0 ? (sumScores / validScores).toFixed(1) : 0

        // Format mood logs for line chart
        const moodTrendCounts = moodLogs.reduce((acc, log) => {
            const date = log.created_at.split('T')[0]
            if (!acc[date]) acc[date] = { great: 0, good: 0, okay: 0, bad: 0, awful: 0 }
            if (acc[date][log.mood] !== undefined) {
                acc[date][log.mood]++
            }
            return acc
        }, {})

        const formattedMoodTrends = Object.keys(moodTrendCounts).map(date => ({
            date,
            ...moodTrendCounts[date]
        })).slice(-30) // Last 30 days for trend chart

        // Mood Summary Table Data
        const moodScoreMap: Record<string, number> = { great: 5, good: 4, okay: 3, bad: 2, awful: 1 }
        const moodSummaryTable = Object.keys(moodTrendCounts).map(date => {
            const counts = moodTrendCounts[date]
            const total = counts.great + counts.good + counts.okay + counts.bad + counts.awful
            const sum = (counts.great * 5) + (counts.good * 4) + (counts.okay * 3) + (counts.bad * 2) + (counts.awful * 1)
            const avg = total > 0 ? (sum / total).toFixed(2) : "0"
            const pos = total > 0 ? (((counts.great + counts.good) / total) * 100).toFixed(1) : "0"
            const neg = total > 0 ? (((counts.bad + counts.awful) / total) * 100).toFixed(1) : "0"
            return { date, average_mood_score: avg, total_entries: total, positive_percentage: pos, negative_percentage: neg }
        }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14)

        // PHQ-9 vs Mood Correlation (Retake Impact)
        const retakeImpact = phq9History.reduce((acc: any[], record: any, idx: number) => {
            // Find previous record for this user to identify a "retake"
            const userHistory = phq9History.filter((h: any) => h.clerk_user_id === record.clerk_user_id && h.created_at < record.created_at)
            if (userHistory.length === 0) return acc

            const prevRecord = userHistory[userHistory.length - 1]
            const retakeDate = new Date(record.created_at)

            // Calc average mood 7 days before and 7 days after
            const beforeStart = new Date(retakeDate)
            beforeStart.setDate(beforeStart.getDate() - 7)
            const afterEnd = new Date(retakeDate)
            afterEnd.setDate(afterEnd.getDate() + 7)

            const moodBefore = moodLogs.filter((l: any) =>
                l.clerk_user_id === record.clerk_user_id &&
                new Date(l.created_at) >= beforeStart &&
                new Date(l.created_at) < retakeDate
            )
            const moodAfter = moodLogs.filter((l: any) =>
                l.clerk_user_id === record.clerk_user_id &&
                new Date(l.created_at) > retakeDate &&
                new Date(l.created_at) <= afterEnd
            )

            const avgMoodBefore = moodBefore.length > 0
                ? (moodBefore.reduce((sum: number, l: any) => sum + moodScoreMap[l.mood], 0) / moodBefore.length).toFixed(2)
                : "N/A"
            const avgMoodAfter = moodAfter.length > 0
                ? (moodAfter.reduce((sum: number, l: any) => sum + moodScoreMap[l.mood], 0) / moodAfter.length).toFixed(2)
                : "N/A"

            acc.push({
                user_id: record.clerk_user_id.substring(0, 8) + '...',
                previous_score: prevRecord.score,
                new_score: record.score,
                score_change: record.score - prevRecord.score,
                average_mood_before: avgMoodBefore,
                average_mood_after: avgMoodAfter,
                retake_date: record.created_at.split('T')[0]
            })
            return acc
        }, [])

        // Daily average mood score for Area Chart
        const moodScoreTrend = Object.keys(moodTrendCounts).map(date => {
            const counts = moodTrendCounts[date]
            const total = counts.great + counts.good + counts.okay + counts.bad + counts.awful
            const sum = (counts.great * 5) + (counts.good * 4) + (counts.okay * 3) + (counts.bad * 2) + (counts.awful * 1)
            return { date, avg: total > 0 ? parseFloat((sum / total).toFixed(2)) : 0 }
        }).sort((a, b) => a.date.localeCompare(b.date)).slice(-30)

        // PHQ-9 scores over time (aggregated avg)
        const phq9Trend = phq9History.reduce((acc: any, h: any) => {
            const date = h.created_at.split('T')[0]
            if (!acc[date]) acc[date] = { sum: 0, count: 0 }
            acc[date].sum += h.score
            acc[date].count++
            return acc
        }, {})

        const formattedPhq9Trend = Object.keys(phq9Trend).map(date => ({
            date,
            avgPhq9: parseFloat((phq9Trend[date].sum / phq9Trend[date].count).toFixed(1))
        })).sort((a, b) => a.date.localeCompare(b.date))

        // Combined data for dual-axis chart
        const phq9VsMood = formattedPhq9Trend.map(p => {
            const m = moodScoreTrend.find(mt => mt.date === p.date)
            return {
                date: p.date,
                phq9: p.avgPhq9,
                mood: m ? m.avg : null
            }
        })

        return new Response(
            JSON.stringify({
                metrics: { totalUsers, averagePhq9, crisisCount, activeUsersCount, averageChatbotUsage, totalMoodLogs, crisisStatementsCount },
                scoreDistribution,
                moodTrends: formattedMoodTrends,
                moodScoreTrend,
                moodSummaryTable,
                retakeImpact,
                phq9VsMood
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Admin Metrics error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
        })
    }
})
