import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAILS = ['ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com']

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

        // Fetch mood logs (for trends)
        const { data: moodLogs, error: moodLogsError } = await adminClient
            .from('mood_logs')
            .select('mood, created_at')
            .order('created_at', { ascending: true })

        if (moodLogsError) throw moodLogsError

        // Aggregate metrics securely on the server
        const totalUsers = users.length
        const crisisCount = users.filter(u => u.needs_crisis_intervention).length

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
        })).slice(-14) // Last 14 days

        return new Response(
            JSON.stringify({
                metrics: { totalUsers, averagePhq9, crisisCount },
                scoreDistribution,
                moodTrends: formattedMoodTrends
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
