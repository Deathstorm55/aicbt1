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

        const themes = ["peace", "hope", "anxiety relief", "strength", "patience", "comfort", "healing", "trust", "overcoming hardship"];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        let prompt = `Provide a short, unique, and encouraging verse or quote aligned with the user's religion (${religion}) that specifically promotes ${randomTheme} and emotional resilience. 
        
CRITICAL CONTENT RULES:
- MUST relate to mental health, emotional well-being, or resilience.
- STRICTLY FORBIDDEN: War, violence, judgment, fear-based themes, or genealogical passages.
- Do not repeat Jeremiah 29:11.`

        if (religion === 'christian') {
            prompt += ' Use a specific Bible verse. Include the text and the reference.'
        } else if (religion === 'muslim') {
            prompt += ' Use a specific Quran verse. Include the text and the reference.'
        } else {
            prompt += ' Use a secular motivational or philosophical quote.'
        }

        prompt += `
        
SUMMARY RULES:
- Provide a concise 1-2 sentence summary.
- Focus on emotional support and practical meaning for CBT/depression relief.
- Use simple, secular language. Avoid preaching tone or heavy religious jargon.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{"verse": "The verse text here without quotation marks", "summary": "A 1-2 sentence explanation of what this verse means for someone struggling emotionally"}`

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a compassionate AI therapist. You must respond in pure JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 250,
                response_format: { type: "json_object" }
            })
        })

        if (!groqResponse.ok) {
            const errText = await groqResponse.text()
            throw new Error(`Groq API error (${groqResponse.status}): ${errText}`)
        }

        const data = await groqResponse.json()
        const rawContent = data.choices?.[0]?.message?.content || "{}"

        let verse = "Hope is the anchor of the soul."
        let summary = "You are never alone in your journey."

        try {
            const parsed = JSON.parse(rawContent);
            verse = parsed.verse ? parsed.verse.trim() : verse;
            summary = parsed.summary ? parsed.summary.trim() : summary;
        } catch (err) {
            console.error("JSON parsing error for verse:", err);
            // Fallback just in case JSON.parse fails, though json_object format makes this unlikely
            const vMatch = rawContent.match(/"verse"\s*:\s*"([^"]*)"/);
            const sMatch = rawContent.match(/"summary"\s*:\s*"([^"]*)"/);
            if (vMatch) verse = vMatch[1];
            if (sMatch) summary = sMatch[1];
        }

        return new Response(
            JSON.stringify({ verse, summary }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Daily verse function error:', error)
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
