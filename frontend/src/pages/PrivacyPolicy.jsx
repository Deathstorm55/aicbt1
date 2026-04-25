import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div style={{
            minHeight: 'calc(100vh - 72px)',
            background: 'linear-gradient(135deg, #1A0406, #0A0202)',
        }}>
            <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                        ← Back to Home
                    </Link>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                        Privacy <span style={{ color: '#F6EDB9' }}>Policy</span>
                    </h1>
                    <p className="text-muted" style={{ marginBottom: '3rem', fontSize: '0.875rem' }}>
                        Last updated: April 25, 2026
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <Section title="1. Introduction">
                            <p>Welcome to AwakeSoul ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our AI-powered Cognitive Behavioral Therapy (CBT) companion application.</p>
                            <p>By accessing or using AwakeSoul, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the application.</p>
                        </Section>

                        <Section title="2. Information We Collect">
                            <h4 style={{ color: '#F6EDB9', marginBottom: '0.75rem', fontSize: '1rem' }}>2.1 Information You Provide</h4>
                            <ul>
                                <li><strong>Account Information:</strong> Name, email address, and authentication credentials provided through Clerk (Google or Apple sign-in).</li>
                                <li><strong>Profile Data:</strong> Information submitted during the onboarding process, including your name and preferred settings.</li>
                                <li><strong>Health Assessment Data:</strong> Your responses to the PHQ-9 (Patient Health Questionnaire-9) assessment, which evaluates symptoms of depression.</li>
                                <li><strong>Chat Conversations:</strong> Messages exchanged with the AI chatbot during CBT sessions.</li>
                                <li><strong>Mood Tracking Data:</strong> Daily mood entries and associated notes.</li>
                            </ul>

                            <h4 style={{ color: '#F6EDB9', marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1rem' }}>2.2 Information Collected Automatically</h4>
                            <ul>
                                <li><strong>Usage Data:</strong> Session frequency, feature usage patterns, and interaction timestamps.</li>
                                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                            </ul>
                        </Section>

                        <Section title="3. How We Use Your Information">
                            <p>We use the collected information to:</p>
                            <ul>
                                <li>Provide and personalize the CBT companion experience.</li>
                                <li>Generate AI-driven therapeutic responses tailored to your PHQ-9 score and mood trends.</li>
                                <li>Deliver spiritually-adapted daily verses based on your mood entries.</li>
                                <li>Improve and optimize application performance and user experience.</li>
                                <li>Ensure user safety by identifying crisis indicators and directing users to professional resources.</li>
                                <li>Maintain and administer your account.</li>
                            </ul>
                        </Section>

                        <Section title="4. Data Storage & Security">
                            <p>Your data is stored securely using Supabase, a trusted cloud database platform. We implement industry-standard security measures, including:</p>
                            <ul>
                                <li>Encryption of data in transit (TLS/SSL) and at rest.</li>
                                <li>Row-level security policies to ensure users can only access their own data.</li>
                                <li>Secure authentication through Clerk with OAuth 2.0 providers (Google, Apple).</li>
                            </ul>
                            <p>While we take all reasonable precautions, no method of data transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
                        </Section>

                        <Section title="5. Data Sharing & Disclosure">
                            <p>We do <strong>not</strong> sell, trade, or rent your personal information. We may share data only in the following circumstances:</p>
                            <ul>
                                <li><strong>Service Providers:</strong> With trusted third-party services (Supabase, Clerk, Google AI) that help operate the application, under strict data processing agreements.</li>
                                <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
                                <li><strong>Safety:</strong> If we believe disclosure is necessary to protect the safety of any person or prevent illegal activity.</li>
                            </ul>
                        </Section>

                        <Section title="6. AI & Chatbot Disclaimer">
                            <p>AwakeSoul uses AI-generated content for therapeutic support. Please note:</p>
                            <ul>
                                <li>The AI chatbot is <strong>not</strong> a substitute for professional mental health care.</li>
                                <li>Conversations with the AI are processed through Google's Gemini API to generate responses.</li>
                                <li>We do not use your conversation data to train external AI models.</li>
                                <li>If you are in crisis, please contact a professional immediately. The application may provide crisis resources but is not an emergency service.</li>
                            </ul>
                        </Section>

                        <Section title="7. Your Rights">
                            <p>Depending on your jurisdiction, you may have the right to:</p>
                            <ul>
                                <li>Access the personal information we hold about you.</li>
                                <li>Request correction of inaccurate data.</li>
                                <li>Request deletion of your account and associated data.</li>
                                <li>Withdraw consent for data processing.</li>
                                <li>Export your data in a portable format.</li>
                            </ul>
                            <p>To exercise any of these rights, please contact us at the email below.</p>
                        </Section>

                        <Section title="8. Children's Privacy">
                            <p>AwakeSoul is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us and we will promptly delete it.</p>
                        </Section>

                        <Section title="9. Changes to This Policy">
                            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice within the application. Continued use of AwakeSoul after changes constitutes acceptance of the updated policy.</p>
                        </Section>

                        <Section title="10. Contact Us">
                            <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
                            <div className="glass-panel" style={{ marginTop: '1rem' }}>
                                <p><strong>AwakeSoul</strong></p>
                                <p style={{ color: 'var(--text-muted)' }}>Email: <a href="mailto:ifeadeniyi8@gmail.com" style={{ color: '#F6EDB9', textDecoration: 'none' }}>ifeadeniyi8@gmail.com</a></p>
                            </div>
                        </Section>
                    </div>
                </motion.div>

                <footer style={{ padding: '3rem 0 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', marginTop: '3rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        &copy; {new Date().getFullYear()} AwakeSoul. <Link to="/terms" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Terms of Service</Link> · <Link to="/privacy" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Privacy Policy</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{ lineHeight: 1.7 }}
        >
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{title}</h2>
            <div className="text-muted" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {children}
            </div>
            <style>{`
                .glass-panel ul {
                    padding-left: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .glass-panel li {
                    color: var(--text-muted);
                }
                .glass-panel li strong {
                    color: var(--text-main);
                }
            `}</style>
        </motion.section>
    );
}
