import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'my-secret-key-123';
const decrypt = (encryptedText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "";
    }
};

const PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure",
    "Trouble concentrating on things",
    "Moving or speaking slowly or being overly fidgety",
    "Thoughts that you would be better off dead or of hurting yourself"
];

const OPTIONS = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
];

export default function PHQ9Form() {
    const { userData, logout, refreshUserData, supabase } = useAuth();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState(Array(9).fill(null));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSelect = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (answers.includes(null)) {
            setError("Please answer all questions before submitting.");
            return;
        }
        setError('');
        setLoading(true);

        const score = answers.reduce((a, b) => a + b, 0);
        const hasSuicidalIdeation = answers[8] > 0;
        const isCrisis = score >= 15 || hasSuicidalIdeation;

        let eligible_for_chatbot = false;
        if (score >= 5 && score <= 14 && !hasSuicidalIdeation) {
            eligible_for_chatbot = true;
        }

        try {
            if (!supabase) throw new Error("Authentication not initialized.");

            let ai_insights = null;

            const { data: moodLogs } = await supabase
                .from('mood_logs')
                .select('mood, created_at')
                .eq('clerk_user_id', userData.id)
                .order('created_at', { ascending: false })
                .limit(7);

            const { data: chatHistoryData } = await supabase
                .from('chat_messages')
                .select('encrypted_message, encrypted_response, created_at')
                .eq('clerk_user_id', userData.id)
                .order('created_at', { ascending: false })
                .limit(5);

            const decodedChatHistory = [];
            if (chatHistoryData) {
                chatHistoryData.reverse().forEach(row => {
                    const userMsg = decrypt(row.encrypted_message);
                    const aiMsg = decrypt(row.encrypted_response);
                    if (userMsg) decodedChatHistory.push({ role: 'user', content: userMsg });
                    if (aiMsg) decodedChatHistory.push({ role: 'assistant', content: aiMsg });
                });
            }

            const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-assessment', {
                body: {
                    phq9_score: score,
                    moodLogs: moodLogs?.map(m => ({ mood: m.mood, date: m.created_at })) || [],
                    chatHistory: decodedChatHistory,
                    religion: userData.religion || 'prefer_not_to_say'
                }
            });

            if (!aiError && aiData?.ai_insights) {
                ai_insights = aiData.ai_insights;
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    phq9_score: score,
                    eligible_for_chatbot: eligible_for_chatbot,
                    last_assessment_date: new Date().toISOString(),
                    needs_crisis_intervention: isCrisis,
                    ai_insights: ai_insights
                })
                .eq('id', userData.id);

            if (updateError) throw updateError;

            if (isCrisis) {
                alert("CRISIS EXCLUSION PROTOCOL TRIGGERED: Please seek immediate professional emergency assistance.");
            } else if (score <= 4) {
                alert("Assessment complete. Your symptoms appear minimal.");
            }

            await refreshUserData();
            navigate('/');
        } catch (err) {
            setError("Failed to save assessment.");
            console.error(err);
        }
        setLoading(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            <motion.div
                className="glass-panel"
                style={{ maxWidth: '800px', margin: '0 auto' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h2 variants={itemVariants} className="text-primary" style={{ marginBottom: '1rem' }}>Patient Health Questionnaire (PHQ-9)</motion.h2>
                <motion.p variants={itemVariants} className="text-muted" style={{ marginBottom: '2rem' }}>
                    Over the last 2 weeks, how often have you been bothered by any of the following problems?
                </motion.p>

                {error && <motion.div variants={itemVariants} style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>{error}</motion.div>}

                <form onSubmit={handleSubmit}>
                    {PHQ9_QUESTIONS.map((question, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}
                        >
                            <p style={{ fontWeight: '500', marginBottom: '1rem' }}>
                                {index + 1}. {question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {OPTIONS.map(opt => (
                                    <label
                                        key={opt.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: answers[index] === opt.value ? 'rgba(91, 14, 20, 0.4)' : 'rgba(0,0,0,0.2)',
                                            border: `1px solid ${answers[index] === opt.value ? 'var(--primary)' : 'var(--glass-border)'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`q${index}`}
                                            value={opt.value}
                                            checked={answers[index] === opt.value}
                                            onChange={() => handleSelect(index, opt.value)}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        <span style={{ fontSize: '0.875rem' }}>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                    <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                        <button type="button" className="btn-ghost" onClick={logout}>Sign Out</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
}
