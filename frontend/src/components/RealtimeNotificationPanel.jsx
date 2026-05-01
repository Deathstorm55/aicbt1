import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdminRealtime from '../hooks/useAdminRealtime';
import { usePopup } from '../contexts/PopupContext';

const SEVERITY_STYLES = {
    info: { border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.08)', dot: '#60a5fa' },
    warning: { border: 'rgba(251,191,36,0.4)', bg: 'rgba(251,191,36,0.1)', dot: '#fbbf24' },
    critical: { border: 'rgba(248,113,113,0.5)', bg: 'rgba(248,113,113,0.12)', dot: '#f87171' },
};

function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
}

export default function RealtimeNotificationPanel() {
    const { notifications, unreadCount, isConnected, markAllRead, clearAll } = useAdminRealtime();
    const [isOpen, setIsOpen] = useState(false);
    const [, setTick] = useState(0);
    const panelRef = useRef(null);
    const { showPopup } = usePopup();
    const prevCountRef = useRef(0);

    // Refresh relative timestamps every 30s
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Show toast popup for critical and new_user events
    useEffect(() => {
        if (notifications.length > prevCountRef.current && notifications.length > 0) {
            const latest = notifications[0];
            if (latest.type === 'crisis' || latest.type === 'new_user') {
                showPopup({
                    type: latest.severity === 'critical' ? 'error' : latest.type === 'new_user' ? 'success' : 'info',
                    title: latest.title,
                    message: latest.message,
                    duration: latest.severity === 'critical' ? 10000 : 6000,
                });
            }
        }
        prevCountRef.current = notifications.length;
    }, [notifications, showPopup]);

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            {/* Bell Button */}
            <button
                onClick={() => { setIsOpen(prev => !prev); if (!isOpen) markAllRead(); }}
                style={{
                    position: 'relative', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '0.55rem 0.7rem', cursor: 'pointer', color: 'white',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                title="Realtime Notifications"
            >
                🔔
                {/* Connection indicator */}
                <span style={{
                    width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                    background: isConnected ? '#4ade80' : '#f87171',
                    boxShadow: isConnected ? '0 0 6px #4ade80' : '0 0 6px #f87171',
                }} />
                {/* Unread badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            style={{
                                position: 'absolute', top: -6, right: -6, background: '#ef4444',
                                color: 'white', fontSize: '0.65rem', fontWeight: '700', borderRadius: '50%',
                                minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0 4px', boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0,
                            width: '380px', maxHeight: '480px', overflowY: 'auto',
                            background: 'rgba(12, 8, 20, 0.97)', backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 100,
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '0.9rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            position: 'sticky', top: 0, background: 'rgba(12, 8, 20, 0.97)', zIndex: 1,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>Live Activity</span>
                                <span style={{
                                    fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                                    color: isConnected ? '#4ade80' : '#f87171', fontWeight: '600',
                                }}>
                                    {isConnected ? '● Connected' : '● Disconnected'}
                                </span>
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    style={{
                                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                                        cursor: 'pointer', fontSize: '0.75rem', padding: '2px 6px',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        {notifications.length === 0 ? (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</div>
                                <p style={{ fontSize: '0.85rem', margin: 0 }}>Listening for live events...</p>
                                <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.2)' }}>
                                    New registrations, mood logs, and alerts will appear here in real time.
                                </p>
                            </div>
                        ) : (
                            <div style={{ padding: '0.4rem 0' }}>
                                <AnimatePresence initial={false}>
                                    {notifications.map((n) => {
                                        const style = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
                                        return (
                                            <motion.div
                                                key={n.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{
                                                    padding: '0.75rem 1rem', margin: '0 0.5rem 0.35rem',
                                                    borderRadius: '10px', borderLeft: `3px solid ${style.dot}`,
                                                    background: style.bg, cursor: 'default',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                                onMouseLeave={e => e.currentTarget.style.background = style.bg}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                                    <span style={{ fontSize: '1.15rem', flexShrink: 0, marginTop: '1px' }}>{n.icon}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'white' }}>{n.title}</span>
                                                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: '0.5rem' }}>
                                                                {timeAgo(n.timestamp)}
                                                            </span>
                                                        </div>
                                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
