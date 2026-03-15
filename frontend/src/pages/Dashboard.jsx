import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { currentUser, userData, logout, supabase } = useAuth();
    const navigate = useNavigate();
    const [mood, setMood] = useState('');
    const [logging, setLogging] = useState(false);
    const [dailyVerse, setDailyVerse] = useState('');
    const [loadingVerse, setLoadingVerse] = useState(false);

    useEffect(() => {
        const fetchDailyVerse = async () => {
            if (!userData || !userData.eligible_for_chatbot || !supabase) return;

            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('daily_verses')
                .select('*')
                .eq('user_id', userData.id)
                .eq('date_served', today)
                .single();

            if (error && error.code !== 'PGRST116') console.error("Error fetching daily verse:", error);

            if (data) {
                setDailyVerse(data.verse_text);
            } else {
                setLoadingVerse(true);
                try {
                    const res = await supabase.functions.invoke('daily-verse', {
                        body: { religion: userData.religion || 'prefer_not_to_say' }
                    });

                    if (res.error) throw res.error;
                    const verse = res.data.verse;

                    await supabase.from('daily_verses').insert([{
                        user_id: userData.id,
                        verse_text: verse,
                        religion: userData.religion || 'prefer_not_to_say',
                        date_served: today
                    }]);

                    setDailyVerse(verse);
                } catch (err) {
                    console.error("Failed to fetch daily verse:", err);
                    setDailyVerse("Every day is a new beginning. Take a deep breath and start again.");
                }
                setLoadingVerse(false);
            }
        };

        fetchDailyVerse();
    }, [userData, currentUser, supabase]);

    const getSeverity = (score) => {
        if (score <= 4) return "Minimal Depression";
        if (score <= 9) return "Mild Depression";
        if (score <= 14) return "Moderate Depression";
        if (score <= 19) return "Moderately Severe Depression";
        return "Severe Depression";
    };

    const handleMoodSubmit = async (e) => {
        e.preventDefault();
        if (!mood || !supabase || !currentUser) return;
        setLogging(true);
        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert([{ clerk_user_id: currentUser.id, mood: mood }]);

            if (error) throw error;

            alert('Mood logged successfully!');
            setMood('');
        } catch (err) {
            console.error(err);
            alert('Failed to log mood.');
        }
        setLogging(false);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Your Dashboard</h2>
                <button onClick={logout} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>Sign Out</button>
            </div>

            {userData?.needs_crisis_intervention && (
                <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid #ff6b6b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h3 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Important Notice</h3>
                    <p style={{ color: '#fff' }}>Your recent assessment indicates you may need more intensive support than this chatbot can provide. Please contact a professional healthcare provider or reach out to emergency services.</p>
                </div>
            )}

            {dailyVerse && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ background: 'linear-gradient(135deg, rgba(241, 225, 148, 0.1), rgba(91, 14, 20, 0.2))', border: '1px solid var(--secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}
                >
                    <h3 className="text-secondary" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Reassurance</h3>
                    <p style={{ fontSize: '1.25rem', fontStyle: 'italic', fontWeight: '500' }}>"{dailyVerse}"</p>
                </motion.div>
            )}

            {loadingVerse && (
                <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>Generating your daily reassurance...</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Assessment Card */}
                <div className="glass-panel">
                    <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>Latest Assessment</h3>
                    {userData?.phq9_score !== undefined && userData?.phq9_score !== null ? (
                        <>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {userData.phq9_score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 27</span>
                            </div>
                            <p style={{ marginTop: '0.5rem', fontWeight: '500' }}>
                                {getSeverity(userData.phq9_score)}
                            </p>
                            {userData.last_assessment_date && (
                                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                                    Last assessed: {new Date(userData.last_assessment_date).toLocaleDateString()}
                                </p>
                            )}
                        </>
                    ) : (
                        <p>No assessment recorded.</p>
                    )}
                </div>

                {/* Therapy Session Card */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>CBT Session</h3>
                        <p className="text-muted">Engage in an AI-powered Cognitive Behavioral Therapy session integrated with spiritual support to help manage your symptoms.</p>
                    </div>
                    <button onClick={() => navigate('/chat')} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        Start Chat Session
                    </button>
                </div>

                {/* Mood Log Card */}
                <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
                    <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>Daily Mood Tracker</h3>
                    <p className="text-muted" style={{ marginBottom: '1rem' }}>Log your mood daily to help track your cognitive restructuring progress.</p>
                    <form onSubmit={handleMoodSubmit} style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            className="input-field"
                            value={mood}
                            onChange={e => setMood(e.target.value)}
                            style={{ flex: 1, margin: 0 }}
                            required
                        >
                            <option value="" disabled>Select how you're feeling...</option>
                            <option value="great">Great</option>
                            <option value="good">Good</option>
                            <option value="okay">Okay</option>
                            <option value="bad">Bad</option>
                            <option value="awful">Awful</option>
                        </select>
                        <button type="submit" className="btn btn-secondary" disabled={logging || !mood}>
                            {logging ? 'Saving...' : 'Log Mood'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
