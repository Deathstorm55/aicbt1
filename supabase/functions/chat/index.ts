const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { religion, message, history, userName, moodLogs } = await req.json()

        const apiKey = Deno.env.get('LLAMA_API_KEY')
        if (!apiKey) throw new Error('LLAMA_API_KEY secret is not set in Supabase project settings.')

        // Build personalized system prompt — conversational style
        let systemPrompt = `You are a compassionate AI therapist named "AI Therapist" providing spiritually adapted Cognitive Behavioral Therapy (CBT). You are speaking with ${userName || 'a user'}.\n\n`

        // Add religion context
        if (religion === 'christian') {
            systemPrompt += "When appropriate, include a short supportive Bible verse relevant to the user's emotional state.\n\n"
        } else if (religion === 'muslim') {
            systemPrompt += "When appropriate, include a short supportive Quran verse relevant to the user's emotional state.\n\n"
        } else {
            systemPrompt += "Use neutral motivational wisdom without religious references when appropriate.\n\n"
        }

        // Add mood history context if available
        if (moodLogs && moodLogs.length > 0) {
            systemPrompt += "Here is the user's recent mood log history (most recent first). Use this context subtly:\n"
            moodLogs.forEach((log: { mood: string; date: string }) => {
                const date = new Date(log.date).toLocaleDateString()
                systemPrompt += `- ${date}: ${log.mood}\n`
            })
            systemPrompt += "\n"
        }

        systemPrompt += `CRITICAL CONVERSATION RULES — you MUST follow these strictly:
1. Keep every response to 1–3 sentences MAXIMUM. Never write long paragraphs.
2. Ask only ONE follow-up question per message. Wait for the user to respond before continuing.
3. Use progressive disclosure — introduce CBT concepts gradually across multiple exchanges, never all at once.
4. Follow this message structure: a brief empathy statement, then a single follow-up question OR a small CBT suggestion — never both.
5. Never combine multiple therapeutic steps, techniques, or exercises in one message.
6. Address the user by their name (${userName || 'Friend'}) occasionally to build rapport.
7. Do not diagnose. You are for mild to moderate support only.
8. If the user seems in crisis, direct them to professional help immediately.
9. Be warm, human, and conversational — like a real therapist having a gentle dialogue, not giving a lecture.`

        // Build messages array
        const messages = [{ role: 'system', content: systemPrompt }]

        if (history && history.length > 0) {
            history.forEach((msg: { role: string; content: string }) => {
                messages.push({ role: msg.role, content: msg.content })
            })
        }
        messages.push({ role: 'user', content: message })

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.6,
                max_tokens: 200
            })
        })

        if (!groqResponse.ok) {
            const errText = await groqResponse.text()
            throw new Error(`Groq API error (${groqResponse.status}): ${errText}`)
        }

        const data = await groqResponse.json()
        const reply = data.choices?.[0]?.message?.content || "I am here to support you."

        return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Chat function error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
