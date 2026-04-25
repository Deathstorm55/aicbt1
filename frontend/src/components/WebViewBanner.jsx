import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

/**
 * Detects if the current browser is an in-app WebView
 * (Snapchat, Telegram, Instagram, Facebook, TikTok, etc.)
 */
function detectInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || '';

    const webviewSignatures = [
        // Social media in-app browsers
        { name: 'Snapchat', pattern: /snapchat/i },
        { name: 'Instagram', pattern: /instagram/i },
        { name: 'Facebook', pattern: /FBAN|FBAV|FB_IAB/i },
        { name: 'Telegram', pattern: /telegram/i },
        { name: 'TikTok', pattern: /tiktok|musical_ly|bytedance/i },
        { name: 'Twitter/X', pattern: /twitter/i },
        { name: 'LinkedIn', pattern: /linkedinapp/i },
        { name: 'Pinterest', pattern: /pinterest/i },
        { name: 'WhatsApp', pattern: /whatsapp/i },
        { name: 'Line', pattern: /\bline\b/i },
        { name: 'WeChat', pattern: /micromessenger/i },
        // Generic WebView markers
        { name: 'WebView', pattern: /\bwv\b|WebView/i },
    ];

    for (const sig of webviewSignatures) {
        if (sig.pattern.test(ua)) {
            return { isWebView: true, appName: sig.name };
        }
    }

    // iOS WebView detection (not Safari, not Chrome)
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    if (isIOS && !/Safari/.test(ua)) {
        return { isWebView: true, appName: 'an in-app browser' };
    }

    return { isWebView: false, appName: null };
}

export default function WebViewBanner() {
    const [dismissed, setDismissed] = useState(false);
    const detection = useMemo(() => detectInAppBrowser(), []);

    if (!detection.isWebView || dismissed) return null;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                    margin: '0 auto 1.5rem',
                    maxWidth: '440px',
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(126, 21, 30, 0.25), rgba(91, 14, 20, 0.15))',
                    border: '1px solid rgba(246, 237, 185, 0.2)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    position: 'relative',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                {/* Dismiss button */}
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss"
                    style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <X size={16} />
                </button>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    <div style={{
                        background: 'rgba(246, 237, 185, 0.15)',
                        borderRadius: '10px',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <AlertTriangle size={18} color="#F6EDB9" />
                    </div>
                    <span style={{
                        color: '#F6EDB9',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-heading)',
                    }}>
                        Google Sign-In may not work here
                    </span>
                </div>

                {/* Body */}
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.825rem',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                }}>
                    It looks like you're using <strong style={{ color: '#fff' }}>{detection.appName}</strong>'s built-in browser.
                    Google blocks sign-in from in-app browsers for security.
                </p>

                {/* Instructions */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '10px',
                    padding: '0.875rem 1rem',
                    marginBottom: '0.5rem',
                }}>
                    <p style={{
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                    }}>
                        To sign in with Google:
                    </p>
                    <ol style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        lineHeight: 1.7,
                        paddingLeft: '1.25rem',
                        margin: 0,
                    }}>
                        {isIOS ? (
                            <>
                                <li>Tap the <strong style={{ color: '#fff' }}>Share</strong> icon (box with arrow)</li>
                                <li>Select <strong style={{ color: '#fff' }}>"Open in Safari"</strong></li>
                            </>
                        ) : (
                            <>
                                <li>Tap the <strong style={{ color: '#fff' }}>⋮ menu</strong> (three dots)</li>
                                <li>Select <strong style={{ color: '#fff' }}>"Open in Chrome"</strong> or <strong style={{ color: '#fff' }}>"Open in browser"</strong></li>
                            </>
                        )}
                    </ol>
                </div>

                {/* Fallback hint */}
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    marginTop: '0.75rem',
                    fontStyle: 'italic',
                }}>
                    Or sign in with <strong style={{ color: '#F6EDB9' }}>email</strong> below — it works everywhere ✓
                </p>
            </motion.div>
        </AnimatePresence>
    );
}
