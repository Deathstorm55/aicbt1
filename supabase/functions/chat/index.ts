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

        // Build personalized system prompt
        let systemPrompt = `You are a compassionate AI therapist named "AI Therapist" providing spiritually adapted Cognitive Behavioral Therapy (CBT). You are speaking with ${userName || 'a user'}.\n\n`

        // Add religion context
        if (religion === 'christian') {
            systemPrompt += "Provide CBT guidance and include supportive Bible verses relevant to the user's emotional state.\n\n"
        } else if (religion === 'muslim') {
            systemPrompt += "Provide CBT guidance and include supportive Quran verses relevant to the user's emotional state.\n\n"
        } else {
            systemPrompt += "Provide CBT guidance using neutral motivational wisdom without religious references.\n\n"
        }

        // Add mood history context if available
        if (moodLogs && moodLogs.length > 0) {
            systemPrompt += "Here is the user's recent mood log history (most recent first). Use this to understand their emotional patterns and tailor your CBT approach:\n"
            moodLogs.forEach((log: { mood: string; date: string }) => {
                const date = new Date(log.date).toLocaleDateString()
                systemPrompt += `- ${date}: ${log.mood}\n`
            })
            systemPrompt += "\nUse these mood patterns to identify cognitive distortions, suggest relevant CBT techniques, and track their progress.\n\n"
        }

        systemPrompt += `Guidelines:
- Address the user by their name (${userName || 'Friend'}) occasionally to build rapport.
- Use CBT techniques like cognitive restructuring, thought records, and behavioral activation.
- Be empathetic, concise, and structured.
- Do not diagnose the user. You are for mild to moderate support only.
- If the user seems to be in crisis, direct them to professional help.`

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
                max_tokens: 500
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
