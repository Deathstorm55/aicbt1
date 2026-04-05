import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EligibilityModal({ isOpen, onClose, type }) {
    if (!isOpen) return null;

    const isCrisis = type === 'crisis';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="glass-panel"
                    style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2.5rem',
                        position: 'relative',
                        border: `1px solid ${isCrisis ? 'rgba(255, 87, 34, 0.4)' : 'var(--glass-border)'}`
                    }}
                >
                    <h2 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1rem',
                        color: isCrisis ? '#ffb74d' : 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {isCrisis ? '🚨 Access Restricted' : 'ℹ️ Access Notice'}
                    </h2>

                    <div style={{ marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {isCrisis ? (
                            <>
                                <p style={{ marginBottom: '1rem' }}>
                                    It seems you may be going through a very difficult time. This tool may not be enough to support you right now.
                                </p>
                                <p style={{ marginBottom: '1.5rem' }}>
                                    We strongly encourage reaching out to a professional or a trusted support line immediately. You are not alone.
                                </p>
                                <div style={{
                                    background: 'rgba(255, 152, 0, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <h4 style={{ color: '#ffb74d', margin: '0 0 0.5rem 0' }}>Nigerian Crisis Hotlines:</h4>
                                    <a href="tel:09080217555" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>📞 SURPIN: 0908 021 7555</a>
                                    <a href="tel:08091116264" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>📞 Mentally Aware Nigeria: 0809 111 6264</a>
                                    <a href="tel:08008002000" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>📞 She Writes Woman: 0800 800 2000</a>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>
                                This support tool is designed for individuals experiencing mild to moderate emotional distress. Based on your responses, you may not need this level of support right now, or you might benefit more from other forms of wellness activities.
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            onClick={onClose}
                            className="btn btn-primary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: isCrisis ? 'var(--glass-bg)' : 'var(--primary)',
                                border: `1px solid ${isCrisis ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                                color: isCrisis ? '#fff' : 'inherit'
                            }}
                        >
                            {isCrisis ? 'Close' : 'I Understand'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
