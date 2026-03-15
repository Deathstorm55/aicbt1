import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { religion, message, history } = await req.json()

        const apiKey = Deno.env.get('LLAMA_API_KEY')
        if (!apiKey) throw new Error('LLAMA_API_KEY not found');

        let systemPrompt = "You are a compassionate AI therapist providing spiritually adapted Cognitive Behavioral Therapy. Always align encouragement with the user's religious background when appropriate.\n\n";

        if (religion === 'christian') {
            systemPrompt += "Provide CBT guidance and include supportive Bible verses relevant to the user's emotional state.";
        } else if (religion === 'muslim') {
            systemPrompt += "Provide CBT guidance and include supportive Quran verses relevant to the user's emotional state.";
        } else {
            systemPrompt += "Provide CBT guidance using neutral motivational wisdom without religious references.";
        }

        // Format previous history
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (history && history.length > 0) {
            history.forEach((msg) => {
                messages.push({ role: msg.role, content: msg.content });
            });
        }
        messages.push({ role: 'user', content: message });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: messages,
                temperature: 0.6,
                max_tokens: 500
            })
        })

        const data = await response.json()
        const reply = data.choices[0]?.message?.content || "I am here to support you.";

        return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
