import React from 'react';
import { motion } from 'framer-motion';

export default function DailyReassurance({ verse, summary, isLoading }) {
    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                Generating your daily reassurance...
            </div>
        );
    }

    if (!verse) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{
                background: 'linear-gradient(135deg, rgba(241, 225, 148, 0.1), rgba(91, 14, 20, 0.2))',
                border: '1px solid var(--secondary)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'center'
            }}
        >
            <h3 className="text-secondary" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Daily Reassurance
            </h3>

            <p style={{ fontSize: '1.15rem', fontWeight: '500', lineHeight: '1.6', fontStyle: 'italic', color: 'rgba(255,255,255,0.95)' }}>
                "{verse}"
            </p>

            {summary && (
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 auto 1rem auto' }}></div>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.6)' }}>
                        {summary}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
