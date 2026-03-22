import React from 'react';
import { usePopup } from '../../contexts/PopupContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ICONS = {
    success: <CheckCircle size={24} className="text-green-400" />,
    error: <AlertCircle size={24} className="text-red-400" />,
    warning: <AlertTriangle size={24} className="text-yellow-400" />,
    info: <Info size={24} className="text-blue-400" />
};

const BORDERS = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30'
};

const BACKGROUNDS = {
    success: 'from-green-900/20 to-green-900/10',
    error: 'from-red-900/20 to-red-900/10',
    warning: 'from-yellow-900/20 to-yellow-900/10',
    info: 'from-blue-900/20 to-blue-900/10'
};

export default function GlobalPopup() {
    const { popups, removePopup } = usePopup();

    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            pointerEvents: 'none', // Let clicks pass through container
            maxWidth: '400px',
            width: 'calc(100% - 2rem)'
        }}>
            <AnimatePresence>
                {popups.map(popup => (
                    <motion.div
                        key={popup.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        style={{
                            pointerEvents: 'auto', // Enable clicks on actual modal
                            background: 'rgba(20, 10, 10, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        className={`bg-gradient-to-br ${BACKGROUNDS[popup.type || 'info']} ${BORDERS[popup.type || 'info']}`}
                    >
                        <button
                            onClick={() => removePopup(popup.id)}
                            style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                            className="hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                                {ICONS[popup.type || 'info']}
                            </div>
                            <div style={{ flex: 1, paddingRight: '1rem' }}>
                                {popup.title && (
                                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                                        {popup.title}
                                    </h4>
                                )}
                                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                    {popup.message}
                                </div>
                                {popup.actionText && popup.onAction && (
                                    <button
                                        onClick={() => {
                                            popup.onAction();
                                            removePopup(popup.id);
                                        }}
                                        className="btn btn-secondary"
                                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        {popup.actionText}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar for auto-dimissing modals */}
                        {popup.duration > 0 && (
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: 0 }}
                                transition={{ duration: popup.duration / 1000, ease: "linear" }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    height: '3px',
                                    background: 'currentColor',
                                    opacity: 0.3
                                }}
                                className={
                                    popup.type === 'error' ? 'text-red-500' :
                                        popup.type === 'success' ? 'text-green-500' :
                                            popup.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                }
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
