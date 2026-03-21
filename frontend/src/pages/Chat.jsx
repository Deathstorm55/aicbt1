import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';
import { TextShimmer } from '../components/ui/text-shimmer';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'my-secret-key-123';
const encrypt = (text) => CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();

export default function Chat() {
    const { currentUser, userData, supabase } = useAuth();
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello. I am here to listen and help you work through what you're feeling using Cognitive Behavioral Therapy principles. How are you doing today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [moodLogs, setMoodLogs] = useState([]);
    const scrollRef = useRef(null);

    // Fetch recent mood logs on mount to provide context to the AI
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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !supabase) return;

        const userMessage = input.trim();
        setInput("");

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
        <div className="container" style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h2 className="text-primary">Therapy Session</h2>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>AI CBT Chatbot • Mild/Moderate Support</p>
                </div>

                <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    maxWidth: '80%',
                                    lineHeight: '1.5',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)'
                                }}>
                                {msg.content.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i !== msg.content.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ alignSelf: 'flex-start', paddingLeft: '0.5rem' }}
                        >
                            <TextShimmer
                                duration={1.5}
                                className='text-sm italic font-medium [--base-color:theme(colors.slate.400)] [--base-gradient-color:theme(colors.white)] dark:[--base-color:theme(colors.slate.500)] dark:[--base-gradient-color:theme(colors.white)]'
                            >
                                assistant is typing...
                            </TextShimmer>
                        </motion.div>
                    )}
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        style={{ flex: 1, margin: 0 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
