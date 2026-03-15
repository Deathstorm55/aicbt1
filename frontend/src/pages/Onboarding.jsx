import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-react';

export default function Onboarding() {
    const [name, setName] = useState('');
    const [religion, setReligion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { user } = useUser();
    const { refreshUserData, supabase } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !religion) {
            setError('Please fill out all fields.');
            return;
        }

        setLoading(true);

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
            navigate('/');
        } catch (err) {
            console.error("Onboarding error:", err);
            setError(err.message || 'An error occurred during onboarding.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '100vh' }}>
            <motion.div
                className="glass-panel"
                style={{ width: '100%', maxWidth: '400px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-center text-secondary" style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>
                    Welcome to AI Therapist
                </h2>
                <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>
                    Let's set up your profile for personalized support.
                </p>

                {error && (
                    <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,0,0,0.2)', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label">Preferred Name / Alias</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="How should we call you?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
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
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
