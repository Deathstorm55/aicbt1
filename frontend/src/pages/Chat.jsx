import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';
import { AnimatedAIChat } from '../components/ui/animated-ai-chat';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'my-secret-key-123';
const encrypt = (text) => CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();

export default function Chat() {
    const { currentUser, userData, supabase } = useAuth();
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello. I am here to listen and help you work through what you're feeling using Cognitive Behavioral Therapy principles. How are you doing today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const [moodLogs, setMoodLogs] = useState([]);

    useEffect(() => {
        const fetchMoodLogs = async () => {
            if (!supabase || !currentUser) return;
            try {
                const { data, error } = await supabase
                    .from('mood_logs')
                    .select('mood, created_at')
                    .eq('clerk_user_id', currentUser.id)
                    .order('created_at', { ascending: false })
                    .limit(7);

                if (error) {
                    console.error("Error fetching mood logs:", error);
                } else {
                    setMoodLogs(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch mood logs:", err);
            }
        };
        fetchMoodLogs();
    }, [supabase, currentUser]);

    const handleSendMessage = async (userMessage) => {
        if (!userMessage.trim() || loading || !supabase) return;

        const suicideKeywords = ['suicide', 'kill myself', 'end it', 'die', 'hurt myself'];
        const isCrisis = suicideKeywords.some(kw => userMessage.toLowerCase().includes(kw));

        if (isCrisis) {
            setMessages(prev => [...prev, { role: "user", content: userMessage }, {
                role: "assistant",
                content: "CRISIS EXCLUSION PROTOCOL: It sounds like you are in distress. Please seek immediate help.\n- SURPIN: 0908 021 7555\n- Mentally Aware Nigeria: 0809 111 6264\n- She Writes Woman: 0800 800 2000"
            }]);
            return;
        }

        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const encryptedMessage = encrypt(userMessage);

            const { data, error } = await supabase.functions.invoke('chat', {
                body: {
                    message: userMessage,
                    history: messages,
                    religion: userData?.religion || 'prefer_not_to_say',
                    userName: userData?.name || 'Friend',
                    moodLogs: moodLogs.map(m => ({ mood: m.mood, date: m.created_at }))
                }
            });

            if (error) {
                let errorDetail = error.message;
                try {
                    if (error.context && typeof error.context.json === 'function') {
                        const errorBody = await error.context.json();
                        errorDetail = errorBody?.error || errorDetail;
                    }
                } catch (_) { /* ignore parse errors */ }
                console.error("Edge Function error detail:", errorDetail);
                throw new Error(errorDetail);
            }

            if (data && data.reply) {
                const aiReply = data.reply;
                const encryptedReply = encrypt(aiReply);
                setMessages(prev => [...prev, { role: "assistant", content: aiReply }]);

                if (currentUser?.id) {
                    const { error: insertError } = await supabase.from('chat_messages').insert([{
                        clerk_user_id: currentUser.id,
                        clerk_user_id: currentUser.id,
                        encrypted_message: encryptedMessage,
                        encrypted_response: encryptedReply
                    }]);
                    if (insertError) console.error("Failed to save chat message:", insertError);
                }
            } else if (data && data.error) {
                console.error("Chat function returned error:", data.error);
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: `Sorry, I am having trouble connecting right now. (${error.message || 'Unknown error'})` }]);
        }
        setLoading(false);
    };

    return (
        <div className="container h-[calc(100vh-80px)]" style={{ display: 'flex', flexDirection: 'column', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <AnimatedAIChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={loading}
                userName={userData?.name || 'Friend'}
            />
        </div>
    );
}
