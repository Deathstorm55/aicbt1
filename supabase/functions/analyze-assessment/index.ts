import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { phq9_score, moodLogs, chatHistory, religion } = await req.json()

        const apiKey = Deno.env.get('LLAMA_API_KEY')
        if (!apiKey) throw new Error('LLAMA_API_KEY secret is not set in Supabase project settings.')

        let systemPrompt = `You are an expert AI Psychological Assessor. Your job is to analyze the user's recent PHQ-9 score, their recent mood logs, and a summary of their recent chat history to provide a short, compassionate, and highly accurate analysis of their current emotional state.\n\n`

        if (religion === 'christian') {
            systemPrompt += "You may include a very brief, gentle Christian perspective or Bible reference if appropriate.\n"
        } else if (religion === 'muslim') {
            systemPrompt += "You may include a very brief, gentle Islamic perspective or Quran reference if appropriate.\n"
        } else {
            systemPrompt += "Provide a strictly secular, clinical yet empathetic perspective.\n"
        }

        let userPrompt = `The user just completed a PHQ-9 assessment and scored ${phq9_score} out of 27.\n\n`

        if (moodLogs && moodLogs.length > 0) {
            userPrompt += `Recent Mood Logs (Most recent first):\n`
            moodLogs.forEach((log: any) => {
                const date = new Date(log.date).toLocaleDateString()
                userPrompt += `- ${date}: ${log.mood}\n`
            })
            userPrompt += `\n`
        } else {
            userPrompt += `No recent mood logs available.\n\n`
        }

        if (chatHistory && chatHistory.length > 0) {
            userPrompt += `Recent Chat Excerpts:\n`
            chatHistory.forEach((msg: any) => {
                userPrompt += `- ${msg.role}: ${msg.content}\n`
            })
            userPrompt += `\n`
        }

        userPrompt += `Based on this data, write a 2-3 sentence personalized insight summarizing their emotional trend. Make it encouraging but honest. Do not give medical advice.`

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.6,
                max_tokens: 200
            })
        })

        if (!groqResponse.ok) {
            const errText = await groqResponse.text()
            throw new Error(`Groq API error (${groqResponse.status}): ${errText}`)
        }

        const data = await groqResponse.json()
        const ai_insights = data.choices?.[0]?.message?.content || "Thank you for completing the assessment. We are here to support you."

        return new Response(
            JSON.stringify({ ai_insights }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Analyze assessment function error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
