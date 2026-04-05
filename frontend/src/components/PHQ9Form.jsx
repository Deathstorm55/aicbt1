import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '../contexts/PopupContext';
import { useLoading } from '../contexts/LoadingContext';

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
    const { showPopup } = usePopup();
    const { startLoading, stopLoading } = useLoading();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState(Array(9).fill(null));
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

        setSubmitting(true);
        startLoading('Analyzing your assessment...');

        const score = answers.reduce((a, b) => a + b, 0);
        const hasSuicidalIdeation = answers[8] > 0;
        const isCrisis = score >= 21;
        const eligible_for_chatbot = score >= 5 && score <= 20 && !hasSuicidalIdeation;

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
                    has_suicidal_ideation: hasSuicidalIdeation,
                    needs_increased_monitoring: score >= 15 && score <= 20,
                    ai_insights: ai_insights
                })
                .eq('id', userData.id);

            if (updateError) throw updateError;

            // Store assessment in PHQ-9 history for longitudinal tracking
            await supabase.from('phq9_history').insert([{
                clerk_user_id: userData.clerk_user_id || userData.id,
                score: score,
                answers: answers,
                ai_insights: ai_insights
            }]);

            if (isCrisis) {
                showPopup({
                    type: 'error',
                    title: 'Urgent: Professional Help Needed',
                    message: "Your score indicates severe symptoms. We strongly recommend seeking immediate professional help. You still have access to the chatbot, but please prioritize speaking with a healthcare professional.",
                    duration: 15000
                });
            } else if (hasSuicidalIdeation) {
                showPopup({
                    type: 'warning',
                    title: 'Support is available',
                    message: "We noticed your response to question 9. Please know that support is available:\n- SURPIN: 0908 021 7555\n- Mentally Aware Nigeria: 0809 111 6264\n- She Writes Woman: 0800 800 2000\n\nYou can still use the chatbot, and a reminder will appear on your dashboard.",
                    duration: 15000
                });
            } else if (score >= 15) {
                showPopup({
                    type: 'info',
                    title: 'Professional Support Recommended',
                    message: "Your score suggests moderately severe symptoms. You have full chatbot access, but we encourage you to also seek support from a mental health professional.",
                    duration: 10000
                });
            } else if (score <= 4) {
                showPopup({
                    type: 'success',
                    title: 'Assessment Complete',
                    message: "Your symptoms appear minimal.",
                    duration: 5000
                });
            }

            await refreshUserData();
            if (!eligible_for_chatbot) {
                navigate('/', { state: { showEligibilityNotice: true, type: isCrisis || hasSuicidalIdeation ? 'crisis' : 'low' } });
            } else {
                navigate('/');
            }
        } catch (err) {
            setError("Failed to save assessment.");
            console.error(err);
        } finally {
            setSubmitting(false);
            stopLoading();
        }
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
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
}
