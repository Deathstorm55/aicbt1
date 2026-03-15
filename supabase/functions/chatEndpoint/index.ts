// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end it all", "better off dead",
    "want to die", "hurt myself", "jump", "overdose"
];

const checkForCrisis = (text: string) => {
    const lowercaseText = text.toLowerCase();
    for (let keyword of CRISIS_KEYWORDS) {
        if (lowercaseText.includes(keyword)) {
            return true;
        }
    }
    return false;
};

const formatSystemPrompt = (userReligionContext: string) => {
    let prompt = `You are an AI Therapist Chatbot. You utilize Cognitive Behavioral Therapy (CBT) to help University students manage mild to moderate depression. You are empathetic, concise, and structured. Do not diagnose the user.
Note: You are answering anonymously and staving off geographical and scheduling constraints.

To provide context-aware spiritual support, if appropriate, gracefully include:
`;
    if (userReligionContext === 'christian') {
        prompt += `- Biblical verses (e.g., Psalms, Proverbs) that offer comfort and relate to CBT themes of hope.`;
    } else if (userReligionContext === 'muslim') {
        prompt += `- Quranic verses that offer comfort and relate to patience (Sabr) and hope.`;
    } else {
        prompt += `- Broad spiritual comfort and philosophical thoughts on hope, depending on what the user asks for.`;
    }
    return prompt;
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, history, religion } = await req.json()

        // Create a Supabase client with the Auth context of the logged in user.
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Verify auth
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        if (checkForCrisis(message)) {
            // Log interaction
            await supabaseClient.from('interactions').insert({
                user_id: user.id,
                user_message: message,
                assistant_reply: "Crisis protocol triggered.",
                crisis_detected: true
            })

            return new Response(
                JSON.stringify({
                    reply: "I am detecting that you might be in crisis. Your safety is paramount. Please contact emergency services (911) or a crisis hotline (988) immediately. Help is available.",
                    crisisDetected: true
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const systemPrompt = formatSystemPrompt(religion || 'none');
        const apiMessages = [
            { role: "system", content: systemPrompt },
            ...history.map((msg: any) => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message }
        ];

        // Call Groq API
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get('LLAMA_API_KEY')}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!groqResponse.ok) {
            throw new Error(`Groq API Error: ${groqResponse.status} ${groqResponse.statusText}`);
        }

        const data = await groqResponse.json();
        const reply = data.choices[0].message.content;

        // Save interaction
        await supabaseClient.from('interactions').insert({
            user_id: user.id,
            user_message: message,
            assistant_reply: reply,
            crisis_detected: false
        })

        return new Response(JSON.stringify({ reply, crisisDetected: false }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
