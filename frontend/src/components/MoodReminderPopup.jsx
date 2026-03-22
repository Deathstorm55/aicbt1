import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MORNING_START = 7;
const MORNING_END = 10;
const EVENING_START = 19;
const EVENING_END = 22;
const SNOOZE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const MOOD_OPTIONS = [
    { value: 'great', emoji: '😊', label: 'Great' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'bad', emoji: '😔', label: 'Bad' },
    { value: 'awful', emoji: '😢', label: 'Awful' },
];

function getTimeWindow() {
    const hour = new Date().getHours();
    if (hour >= MORNING_START && hour < MORNING_END) return 'morning';
    if (hour >= EVENING_START && hour < EVENING_END) return 'evening';
    return null;
}

function getStorageKey(window) {
    const today = new Date().toISOString().split('T')[0];
    return `mood_reminder_${window}_${today}`;
}

function getSnoozeKey(window) {
    const today = new Date().toISOString().split('T')[0];
    return `mood_snooze_${window}_${today}`;
}

export default function MoodReminderPopup({ supabase, currentUser, onMoodLogged }) {
    const [visible, setVisible] = useState(false);
    const [timeWindow, setTimeWindow] = useState(null);
    const [selectedMood, setSelectedMood] = useState(null);
    const [logging, setLogging] = useState(false);
    const [showMoodPicker, setShowMoodPicker] = useState(false);

    const checkShouldShowReminder = useCallback(async () => {
        const window = getTimeWindow();
        if (!window) {
            setVisible(false);
            return;
        }

        // Check if already dismissed for this window today
        const dismissed = localStorage.getItem(getStorageKey(window));
        if (dismissed === 'true') {
            setVisible(false);
            return;
        }

        // Check if snoozed
        const snoozeUntil = localStorage.getItem(getSnoozeKey(window));
        if (snoozeUntil && Date.now() < parseInt(snoozeUntil, 10)) {
            setVisible(false);
            return;
        }

        // Check if mood already logged for this time window in Supabase
        if (supabase && currentUser) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const startOfDay = `${today}T00:00:00.000Z`;
                const endOfDay = `${today}T23:59:59.999Z`;

                const { data, error } = await supabase
                    .from('mood_logs')
                    .select('time_of_day')
                    .eq('clerk_user_id', currentUser.id)
                    .gte('created_at', startOfDay)
                    .lte('created_at', endOfDay)
                    .eq('time_of_day', window);

                if (!error && data && data.length > 0) {
                    // Already logged for this window
                    localStorage.setItem(getStorageKey(window), 'true');
                    setVisible(false);
                    return;
                }
            } catch (err) {
                console.error('Error checking mood logs:', err);
            }
        }

        setTimeWindow(window);
        setVisible(true);
    }, [supabase, currentUser]);

    useEffect(() => {
        checkShouldShowReminder();
        // Re-check every 5 minutes
        const interval = setInterval(checkShouldShowReminder, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkShouldShowReminder]);

    const handleDismiss = () => {
        if (timeWindow) {
            localStorage.setItem(getStorageKey(timeWindow), 'true');
        }
        setVisible(false);
        setShowMoodPicker(false);
        setSelectedMood(null);
    };

    const handleRemindLater = () => {
        if (timeWindow) {
            localStorage.setItem(getSnoozeKey(timeWindow), String(Date.now() + SNOOZE_DURATION_MS));
        }
        setVisible(false);
        setShowMoodPicker(false);
        setSelectedMood(null);
    };

    const handleLogMood = async () => {
        if (!selectedMood || !supabase || !currentUser) return;
        setLogging(true);

        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert([{
                    clerk_user_id: currentUser.id,
                    mood: selectedMood,
                    time_of_day: timeWindow
                }]);

            if (error) throw error;

            localStorage.setItem(getStorageKey(timeWindow), 'true');
            if (onMoodLogged) onMoodLogged();
            setVisible(false);
            setShowMoodPicker(false);
            setSelectedMood(null);
        } catch (err) {
            console.error('Failed to log mood from reminder:', err);
        }
        setLogging(false);
    };

    const getMessage = () => {
        if (timeWindow === 'morning') {
            return 'Good morning! How are you feeling today?';
        }
        return 'Good evening! Take a moment to reflect on your day.';
    };

    const getIcon = () => {
        return timeWindow === 'morning' ? '🌅' : '🌙';
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={handleDismiss}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30, 10, 12, 0.98), rgba(50, 15, 20, 0.95))',
                            border: '1px solid rgba(241, 225, 148, 0.2)',
                            borderRadius: '20px',
                            padding: '2rem',
                            maxWidth: '420px',
                            width: '100%',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(91, 14, 20, 0.15)',
                            textAlign: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                            style={{ fontSize: '3rem', marginBottom: '1rem' }}
                        >
                            {getIcon()}
                        </motion.div>

                        <h3 style={{
                            color: 'var(--secondary)',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontSize: '0.75rem'
                        }}>
                            {timeWindow === 'morning' ? 'Morning Check-in' : 'Evening Reflection'}
                        </h3>

                        <p style={{
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            marginBottom: '1.5rem',
                            lineHeight: '1.5'
                        }}>
                            {getMessage()}
                        </p>

                        <AnimatePresence mode="wait">
                            {showMoodPicker ? (
                                <motion.div
                                    key="picker"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginBottom: '1.5rem' }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {MOOD_OPTIONS.map((opt) => (
                                            <motion.button
                                                key={opt.value}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedMood(opt.value)}
                                                style={{
                                                    background: selectedMood === opt.value
                                                        ? 'rgba(241, 225, 148, 0.2)'
                                                        : 'rgba(255, 255, 255, 0.05)',
                                                    border: `2px solid ${selectedMood === opt.value ? 'var(--secondary)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '12px',
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    minWidth: '60px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>{opt.emoji}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleLogMood}
                                        disabled={!selectedMood || logging}
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            opacity: !selectedMood ? 0.5 : 1,
                                            borderRadius: '12px'
                                        }}
                                    >
                                        {logging ? 'Saving...' : 'Save Mood'}
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="actions"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary"
                                        onClick={() => setShowMoodPicker(true)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px' }}
                                    >
                                        Log Mood
                                    </motion.button>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn-ghost"
                                            onClick={handleRemindLater}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Remind Me Later
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn-ghost"
                                            onClick={handleDismiss}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Dismiss
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
