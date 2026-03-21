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
        const { religion } = await req.json()

        const apiKey = Deno.env.get('LLAMA_API_KEY')
        if (!apiKey) throw new Error('LLAMA_API_KEY secret is not set in Supabase project settings.')

        const themes = ["hope", "peace", "strength", "overcoming anxiety", "patience", "forgiveness", "guidance"];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        let prompt = `Provide a short, UNIQUE, and less commonly quoted encouraging verse or quote aligned with the user's religion that promotes ${randomTheme} and emotional resilience. Do not repeat Jeremiah 29:11.`
        if (religion === 'christian') {
            prompt += ' Use a specific Bible verse. Quote the text and the reference.'
        } else if (religion === 'muslim') {
            prompt += ' Use a specific Quran verse. Quote the text and the reference.'
        } else {
            prompt += ' Use a secular motivational or philosophical quote.'
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a compassionate AI therapist.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        })

        if (!groqResponse.ok) {
            const errText = await groqResponse.text()
            throw new Error(`Groq API error (${groqResponse.status}): ${errText}`)
        }

        const data = await groqResponse.json()
        const verseText = data.choices?.[0]?.message?.content || "Hope is the anchor of the soul."

        return new Response(
            JSON.stringify({ verse: verseText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Daily verse function error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
