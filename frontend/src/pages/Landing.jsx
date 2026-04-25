import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/serene_bg.png';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: 'calc(100vh - 72px)',
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative'
        }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 2, 2, 0.75)', zIndex: 0 }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                        style={{ maxWidth: '800px', marginBottom: '4rem' }}
                    >
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                            Find Peace with <span style={{ color: '#F6EDB9' }}>AwakeSoul</span>
                        </h1>
                        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            A spiritual CBT companion designed to help you navigate life's challenges with guided self-reflection, compassionate support, and cognitive restructuring.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/auth')}>
                                Get Started
                            </button>
                            <button className="btn btn-ghost" onClick={() => navigate('/docs')}>
                                Learn More
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="glass-panel"
                        style={{ maxWidth: '900px', width: '100%' }}
                    >
                        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>How It Works</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)' }}>PHQ-9 Assessment</h3>
                                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                                    Begin with a clinical-grade questionnaire to help the system understand your current emotional state and personalize your support journey.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)' }}>CBT Interaction</h3>
                                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                                    Engage in meaningful dialogue grounded in Cognitive Behavioral Therapy to identify and reframe negative thought patterns.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Daily Mood Tracking</h3>
                                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                                    Log your mood daily to uncover patterns and receive compassionate, spiritually-adapted daily verses tailored to your feelings.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center', marginTop: 'auto' }}>
                    <p className="text-muted">
                        &copy; {new Date().getFullYear()} AwakeSoul. <a href="/docs" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Documentation</a> · <a href="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</a> · <a href="/terms" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
