import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePopup } from '../contexts/PopupContext';
import MoodReminderPopup from '../components/MoodReminderPopup';

export default function Dashboard() {
    const { currentUser, userData, logout, supabase } = useAuth();
    const navigate = useNavigate();
    const { showPopup } = usePopup();
    const [mood, setMood] = useState('');
    const [logging, setLogging] = useState(false);
    const [dailyVerse, setDailyVerse] = useState('');
    const [verseSummary, setVerseSummary] = useState('');
    const [loadingVerse, setLoadingVerse] = useState(false);
    const [logsTodayCount, setLogsTodayCount] = useState(0);

    useEffect(() => {
        const fetchDailyVerse = async () => {
            if (!userData || !userData.eligible_for_chatbot || !supabase) return;

            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('daily_verses')
                .select('*')
                .eq('clerk_user_id', currentUser.id)
                .eq('date_served', today)
                .single();

            if (error && error.code !== 'PGRST116') console.error("Error fetching daily verse:", error);

            if (data) {
                const text = data.verse_text || '';
                // Defensive check: if verse_text looks like JSON or technical format, parse it
                if (text.trim().startsWith('{') || text.includes('"verse":')) {
                    try {
                        const parsed = JSON.parse(text);
                        setDailyVerse(parsed.verse || text);
                        setVerseSummary(parsed.summary || data.verse_summary || '');
                    } catch (e) {
                        // Fallback string-based extraction if JSON.parse fails
                        let v = text;
                        let s = data.verse_summary || '';

                        if (text.includes('"verse":')) {
                            const vPart = text.split('"verse":')[1]?.split('"summary":')[0];
                            if (vPart) v = vPart.replace(/^[\s:"']+|[\s,"']+$/g, '').trim();
                        }
                        if (text.includes('"summary":')) {
                            const sPart = text.split('"summary":')[1];
                            if (sPart) s = sPart.replace(/^[\s:"']+|[\s}"']+$/g, '').trim();
                        }

                        setDailyVerse(v);
                        setVerseSummary(s);
                    }
                } else {
                    setDailyVerse(data.verse_text);
                    setVerseSummary(data.verse_summary || '');
                }
            } else {
                setLoadingVerse(true);
                try {
                    const res = await supabase.functions.invoke('daily-verse', {
                        body: { religion: userData.religion || 'prefer_not_to_say' }
                    });

                    if (res.error) throw res.error;
                    const verse = res.data.verse;
                    const summary = res.data.summary || '';

                    await supabase.from('daily_verses').insert([{
                        clerk_user_id: currentUser.id,
                        verse_text: verse,
                        verse_summary: summary,
                        religion: userData.religion || 'prefer_not_to_say',
                        date_served: today
                    }]);

                    setDailyVerse(verse);
                    setVerseSummary(summary);
                } catch (err) {
                    console.error("Failed to fetch daily verse:", err);
                    setDailyVerse("Every day is a new beginning. Take a deep breath and start again.");
                }
                setLoadingVerse(false);
            }
        };

        fetchDailyVerse();
    }, [userData, currentUser, supabase]);

    useEffect(() => {
        const fetchMoodLogsCount = async () => {
            if (!supabase || !currentUser) return;
            const today = new Date().toISOString().split('T')[0];
            const startOfDay = `${today}T00:00:00.000Z`;
            const endOfDay = `${today}T23:59:59.999Z`;

            const { count, error } = await supabase
                .from('mood_logs')
                .select('*', { count: 'exact', head: true })
                .eq('clerk_user_id', currentUser.id)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay);

            if (!error && count !== null) {
                setLogsTodayCount(count);
            }
        };
        fetchMoodLogsCount();
    }, [supabase, currentUser]);

    const refreshMoodCount = useCallback(async () => {
        if (!supabase || !currentUser) return;
        const today = new Date().toISOString().split('T')[0];
        const startOfDay = `${today}T00:00:00.000Z`;
        const endOfDay = `${today}T23:59:59.999Z`;
        const { count, error } = await supabase
            .from('mood_logs')
            .select('*', { count: 'exact', head: true })
            .eq('clerk_user_id', currentUser.id)
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay);
        if (!error && count !== null) setLogsTodayCount(count);
    }, [supabase, currentUser]);

    const getSeverity = (score) => {
        if (score <= 4) return "Minimal Depression";
        if (score <= 9) return "Mild Depression";
        if (score <= 14) return "Moderate Depression";
        if (score <= 19) return "Moderately Severe Depression";
        return "Severe Depression";
    };

    const getSeverityColor = (score) => {
        if (score <= 4) return "#81c784"; // Light Green
        if (score <= 9) return "#dce775"; // Yellow-Green
        if (score <= 14) return "#ffd54f"; // Soft Gold/Yellow
        if (score <= 19) return "#ffb74d"; // Orange
        return "#e57373"; // Soft Red
    };

    const handleMoodSubmit = async (e) => {
        e.preventDefault();
        if (!mood || !supabase || !currentUser) return;

        if (logsTodayCount >= 2) {
            showPopup({ title: 'Daily Limit Reached', message: 'You have already logged your mood twice today (Morning & Evening).', type: 'warning' });
            return;
        }

        // Optimistic UI: update immediately before API response
        const previousCount = logsTodayCount;
        const submittedMood = mood;
        setLogsTodayCount(prev => prev + 1);
        setMood('');
        showPopup({ title: 'Success', message: 'Mood logged successfully!', type: 'success' });

        setLogging(true);
        try {
            const hour = new Date().getHours();
            let timeOfDay = null;
            if (hour >= 7 && hour < 10) timeOfDay = 'morning';
            else if (hour >= 19 && hour < 22) timeOfDay = 'evening';

            const { error } = await supabase
                .from('mood_logs')
                .insert([{ clerk_user_id: currentUser.id, mood: submittedMood, time_of_day: timeOfDay }]);

            if (error) throw error;
        } catch (err) {
            // Revert optimistic update on failure
            console.error(err);
            setLogsTodayCount(previousCount);
            showPopup({ title: 'Error', message: 'Failed to log mood. Please try again.', type: 'error' });
        }
        setLogging(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Your Dashboard</h2>
                <button onClick={logout} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>Sign Out</button>
            </div>

            {userData?.needs_crisis_intervention && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid #ff6b6b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h3 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Important Notice</h3>
                    <p style={{ color: '#fff' }}>Your recent assessment indicates you may need more intensive support than this chatbot can provide. Please contact a professional healthcare provider or reach out to emergency services.</p>
                </motion.div>
            )}

            {userData?.has_suicidal_ideation && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 87, 34, 0.1))',
                        border: '1px solid rgba(255, 152, 0, 0.4)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem'
                    }}
                >
                    <h3 style={{ color: '#ffb74d', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📞</span> Crisis Support Available
                    </h3>
                    <p style={{ color: '#fff', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                        Based on your recent assessment, we want to make sure you know help is always available. Please don't hesitate to reach out:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <a href="tel:09080217555" style={{ color: '#ffb74d', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>• SURPIN: 0908 021 7555</a>
                        <a href="tel:08091116264" style={{ color: '#ffb74d', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>• Mentally Aware Nigeria: 0809 111 6264</a>
                        <a href="tel:08008002000" style={{ color: '#ffb74d', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>• She Writes Woman: 0800 800 2000</a>
                    </div>
                </motion.div>
            )}

            {userData?.needs_increased_monitoring && !userData?.has_suicidal_ideation && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(30, 136, 229, 0.08))',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem'
                    }}
                >
                    <h3 style={{ color: '#64b5f6', marginBottom: '0.5rem' }}>💙 Professional Support Recommended</h3>
                    <p style={{ color: '#fff', lineHeight: '1.6' }}>
                        Your assessment suggests moderately severe symptoms. While you have full access to the chatbot, we encourage you to also consider speaking with a mental health professional for additional support.
                    </p>
                </motion.div>
            )}

            {dailyVerse && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ background: 'linear-gradient(135deg, rgba(241, 225, 148, 0.1), rgba(91, 14, 20, 0.2))', border: '1px solid var(--secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}
                >
                    <h3 className="text-secondary" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Reassurance</h3>
                    <p style={{ fontSize: '1.15rem', fontWeight: '500', lineHeight: '1.6' }}>{dailyVerse}</p>
                    {verseSummary && (
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: '1.5', fontStyle: 'italic' }}>{verseSummary}</p>
                    )}
                </motion.div>
            )}

            {loadingVerse && (
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>Generating your daily reassurance...</div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            >
                {/* Assessment Card */}
                <motion.div variants={itemVariants} className="glass-panel">
                    <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>Latest Assessment</h3>
                    {userData?.phq9_score !== undefined && userData?.phq9_score !== null ? (
                        <>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: getSeverityColor(userData.phq9_score) }}>
                                {userData.phq9_score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 27</span>
                            </div>
                            <p style={{ marginTop: '0.5rem', fontWeight: '500', color: getSeverityColor(userData.phq9_score) }}>
                                {getSeverity(userData.phq9_score)}
                            </p>
                            {userData?.ai_insights && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.875rem', borderLeft: `3px solid ${getSeverityColor(userData.phq9_score)}` }}>
                                    <i>{userData.ai_insights}</i>
                                </div>
                            )}
                            {userData.last_assessment_date && (
                                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                                    Last assessed: {new Date(userData.last_assessment_date).toLocaleDateString()}
                                </p>
                            )}
                            {(() => {
                                const lastDate = userData.last_assessment_date ? new Date(userData.last_assessment_date) : null;
                                const now = new Date();
                                const daysSince = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
                                const canRetake = daysSince >= 7;
                                const daysRemaining = 7 - daysSince;
                                return (
                                    <button
                                        onClick={() => navigate('/assessment?retake=true')}
                                        className={canRetake ? 'btn btn-secondary' : 'btn-ghost'}
                                        disabled={!canRetake}
                                        style={{ marginTop: '1rem', width: '100%', opacity: canRetake ? 1 : 0.5 }}
                                    >
                                        {canRetake ? '🔄 Retake PHQ-9 Assessment' : `Retake available in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}
                                    </button>
                                );
                            })()}
                        </>
                    ) : (
                        <p>No assessment recorded.</p>
                    )}
                </motion.div>

                {/* Therapy Session Card */}
                <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>CBT Session</h3>
                        <p className="text-muted">Engage in an AI-powered Cognitive Behavioral Therapy session integrated with spiritual support to help manage your symptoms.</p>
                    </div>
                    <button onClick={() => navigate('/chat')} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        Start Chat Session
                    </button>
                </motion.div>

                {/* Mood Log Card */}
                <motion.div variants={itemVariants} className="glass-panel md:col-span-2">
                    <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>Daily Mood Tracker</h3>
                    <p className="text-muted" style={{ marginBottom: '1rem' }}>Log your mood daily to help track your cognitive restructuring progress.</p>
                    <form onSubmit={handleMoodSubmit} className="flex flex-col sm:flex-row gap-4">
                        <select
                            className="input-field flex-1"
                            value={mood}
                            onChange={e => setMood(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select how you're feeling...</option>
                            <option value="great">Great</option>
                            <option value="good">Good</option>
                            <option value="okay">Okay</option>
                            <option value="bad">Bad</option>
                            <option value="awful">Awful</option>
                        </select>
                        <button type="submit" className="btn btn-secondary whitespace-nowrap" disabled={logging || !mood || logsTodayCount >= 2}>
                            {logsTodayCount >= 2 ? 'Daily Limit Reached' : (logging ? 'Saving...' : 'Log Mood')}
                        </button>
                    </form>
                </motion.div>
            </motion.div>

            <MoodReminderPopup
                supabase={supabase}
                currentUser={currentUser}
                onMoodLogged={refreshMoodCount}
            />
        </div>
    );
}
