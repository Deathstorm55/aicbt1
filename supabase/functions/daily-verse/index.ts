import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { religion } = await req.json()

        // Assuming we use Together AI, Groq, or AWS for Llama 3.3-70B.
        // For this demonstration, we'll format a standard OpenAI compatible API call.
        const apiKey = Deno.env.get('LLAMA_API_KEY')
        if (!apiKey) throw new Error('LLAMA_API_KEY not found in environment');

        let prompt = "Generate a short encouraging verse or quote aligned with the user's religion that promotes hope, patience, and emotional resilience.";
        if (religion === 'christian') {
            prompt += ' Use a Bible verse.';
        } else if (religion === 'muslim') {
            prompt += ' Use a Quran verse.';
        } else {
            prompt += ' Use a neutral motivational quote without religious references.';
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192', // Using closest equivalent Llama-3 model if direct Llama 3.3 70B isn't available
                messages: [
                    { role: 'system', content: 'You are a compassionate AI therapist.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        })

        const data = await response.json()
        const verseText = data.choices[0]?.message?.content || "Hope is the anchor of the soul.";

        return new Response(
            JSON.stringify({ verse: verseText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
