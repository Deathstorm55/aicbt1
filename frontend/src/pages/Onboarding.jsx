import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePopup } from '../contexts/PopupContext';
import { useLoading } from '../contexts/LoadingContext';
import { useUser } from '@clerk/clerk-react';

export default function Onboarding() {
    const [name, setName] = useState('');
    const [religion, setReligion] = useState('');
    const { showPopup } = usePopup();
    const { startLoading, stopLoading } = useLoading();

    const navigate = useNavigate();
    const { user } = useUser();
    const { refreshUserData, supabase } = useAuth();

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !religion) {
            showPopup({ type: 'warning', title: 'Missing Fields', message: 'Please fill out all fields.', duration: 5000 });
            return;
        }

        startLoading('Setting up your profile...');

        try {
            if (!supabase) throw new Error("Authentication not ready. Please try again.");

            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    clerk_user_id: user.id,
                    name: name,
                    email: user.primaryEmailAddress?.emailAddress,
                    religion: religion
                });

            if (insertError) {
                throw new Error(insertError.message || "Failed to save profile.");
            }

            await refreshUserData();
            showPopup({ type: 'success', title: 'Welcome', message: 'Your profile has been created.', duration: 5000 });
            navigate('/');
        } catch (err) {
            console.error("Onboarding error:", err);
            showPopup({ type: 'error', title: 'Setup Failed', message: err.message || 'An error occurred during onboarding.', duration: 6000 });
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '1rem' }}> {/* Added padding for mobile responsiveness */}
            <motion.div
                className="glass-panel"
                style={{ width: '100%', maxWidth: '400px' }}
                variants={containerVariants} // Apply container variants
                initial="hidden"
                animate="visible"
            >
                <motion.h2 variants={itemVariants} className="text-center text-secondary" style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>
                    Welcome to AI Therapist
                </motion.h2>
                <motion.p variants={itemVariants} className="text-center text-muted" style={{ marginBottom: '2rem' }}>
                    Let's set up your profile for personalized support.
                </motion.p>

                <form onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants} className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label">Preferred Name / Alias</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="How should we call you?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="input-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label">Religion / Background</label>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Used for spiritually adapted CBT responses</p>
                        <select
                            className="input-field"
                            value={religion}
                            onChange={(e) => setReligion(e.target.value)}
                            required
                            style={{ backgroundColor: 'var(--glass-bg)', color: 'white' }}
                        >
                            <option value="" disabled>Select your background</option>
                            <option value="christian">Christian</option>
                            <option value="muslim">Muslim</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        Complete Setup
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
