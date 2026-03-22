import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';
import { AnimatedAIChat } from '../components/ui/animated-ai-chat';
import BarLoader from '../components/ui/bar-loader';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'my-secret-key-123';
const encrypt = (text) => CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();

export default function Chat() {
    const { currentUser, userData, supabase } = useAuth();
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello. I am here to listen and help you work through what you're feeling using Cognitive Behavioral Therapy principles. How are you doing today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const [moodLogs, setMoodLogs] = useState([]);

    // This ref is not used in the original code, but is introduced by the user's instruction.
    // It's typically used to scroll to the end of messages.
    const messagesEndRef = useRef(null);

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
            {userData?.has_suicidal_ideation && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 87, 34, 0.1))',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    fontSize: '0.85rem'
                }}>
                    <span>📞</span>
                    <span style={{ color: '#ffb74d', fontWeight: '600' }}>Crisis Support:</span>
                    <a href="tel:09080217555" style={{ color: '#ffb74d', textDecoration: 'none' }}>SURPIN: 0908 021 7555</a>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                    <a href="tel:08091116264" style={{ color: '#ffb74d', textDecoration: 'none' }}>MANI: 0809 111 6264</a>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                    <a href="tel:08008002000" style={{ color: '#ffb74d', textDecoration: 'none' }}>SWW: 0800 800 2000</a>
                </div>
            )}

            {userData?.needs_increased_monitoring && !userData?.has_suicidal_ideation && (
                <div style={{
                    background: 'rgba(33, 150, 243, 0.08)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '0.75rem',
                    fontSize: '0.85rem',
                    color: '#64b5f6'
                }}>
                    💙 We recommend also seeking support from a mental health professional alongside using this chatbot.
                </div>
            )}

            <AnimatedAIChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={loading}
                userName={userData?.name || 'Friend'}
            />
        </div>
    );
}
