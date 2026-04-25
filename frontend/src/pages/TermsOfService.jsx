import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
                        Terms of <span style={{ color: '#F6EDB9' }}>Service</span>
                    </h1>
                    <p className="text-muted" style={{ marginBottom: '3rem', fontSize: '0.875rem' }}>
                        Last updated: April 25, 2026
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <Section title="1. Acceptance of Terms">
                            <p>By accessing or using AwakeSoul ("the Application," "the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must discontinue use of the Application immediately.</p>
                            <p>These Terms constitute a legally binding agreement between you ("User," "you") and AwakeSoul ("we," "our," "us").</p>
                        </Section>

                        <Section title="2. Description of Service">
                            <p>AwakeSoul is an AI-powered Cognitive Behavioral Therapy (CBT) companion application that provides:</p>
                            <ul>
                                <li>A PHQ-9 (Patient Health Questionnaire-9) assessment tool for self-evaluation of depression symptoms.</li>
                                <li>An AI chatbot for guided CBT interactions and spiritual support.</li>
                                <li>Daily mood tracking with spiritually-adapted verse recommendations.</li>
                                <li>A personal dashboard for tracking mental health progress over time.</li>
                            </ul>
                        </Section>

                        <Section title="3. Important Medical Disclaimer">
                            <div style={{
                                background: 'rgba(126, 21, 30, 0.15)',
                                border: '1px solid rgba(126, 21, 30, 0.4)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                marginBottom: '0.5rem'
                            }}>
                                <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.75rem' }}>⚠️ AwakeSoul is NOT a medical service.</p>
                                <ul>
                                    <li>The Application does <strong>not</strong> provide medical advice, diagnosis, or treatment.</li>
                                    <li>The AI chatbot is <strong>not</strong> a licensed therapist, counselor, or healthcare professional.</li>
                                    <li>The PHQ-9 assessment is a self-report screening tool and should <strong>not</strong> be used as a clinical diagnosis.</li>
                                    <li>AwakeSoul is intended as a <strong>supplementary tool</strong> for self-reflection and should not replace professional mental health care.</li>
                                    <li>If you are experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately.</li>
                                </ul>
                            </div>
                        </Section>

                        <Section title="4. Eligibility">
                            <p>To use AwakeSoul, you must:</p>
                            <ul>
                                <li>Be at least <strong>16 years of age</strong>.</li>
                                <li>Have the legal capacity to enter into a binding agreement.</li>
                                <li>Provide accurate and truthful information during registration and assessments.</li>
                            </ul>
                            <p>Users who indicate severe crisis symptoms (including suicidal ideation) through the PHQ-9 assessment may be restricted from accessing the AI chatbot and will be directed to professional crisis resources.</p>
                        </Section>

                        <Section title="5. User Accounts">
                            <p>You are responsible for:</p>
                            <ul>
                                <li>Maintaining the confidentiality of your account credentials.</li>
                                <li>All activities that occur under your account.</li>
                                <li>Notifying us immediately of any unauthorized access to your account.</li>
                            </ul>
                            <p>We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive behavior.</p>
                        </Section>

                        <Section title="6. Acceptable Use">
                            <p>You agree <strong>not</strong> to:</p>
                            <ul>
                                <li>Use the Application for any unlawful purpose.</li>
                                <li>Attempt to manipulate, abuse, or exploit the AI chatbot.</li>
                                <li>Share your account or provide access to unauthorized users.</li>
                                <li>Reverse-engineer, decompile, or attempt to extract the source code of the Application.</li>
                                <li>Use the Application to harm, harass, or target other users.</li>
                                <li>Submit false or misleading information in assessments or profiles.</li>
                                <li>Use automated bots or scripts to interact with the Application.</li>
                            </ul>
                        </Section>

                        <Section title="7. Intellectual Property">
                            <p>All content, design, code, and features of AwakeSoul are the intellectual property of AwakeSoul and its creators. You may not:</p>
                            <ul>
                                <li>Copy, modify, or distribute any part of the Application without prior written consent.</li>
                                <li>Use the AwakeSoul name, logo, or branding without authorization.</li>
                                <li>Claim ownership of any AI-generated content provided by the chatbot.</li>
                            </ul>
                        </Section>

                        <Section title="8. User-Generated Content">
                            <p>By using the Application, you grant AwakeSoul a limited, non-exclusive license to store and process your data (chat messages, mood entries, assessment responses) solely for the purpose of providing and improving the Service.</p>
                            <p>You retain ownership of your personal content. We will not publish, share, or sell your conversations or personal health data.</p>
                        </Section>

                        <Section title="9. Third-Party Services">
                            <p>AwakeSoul integrates with the following third-party services:</p>
                            <ul>
                                <li><strong>Clerk:</strong> Authentication and user management.</li>
                                <li><strong>Supabase:</strong> Database storage and backend services.</li>
                                <li><strong>Google Gemini AI:</strong> AI-powered chatbot responses.</li>
                            </ul>
                            <p>Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the practices of third-party providers.</p>
                        </Section>

                        <Section title="10. Limitation of Liability">
                            <p>To the maximum extent permitted by law:</p>
                            <ul>
                                <li>AwakeSoul is provided on an <strong>"as-is"</strong> and <strong>"as-available"</strong> basis.</li>
                                <li>We make no warranties, express or implied, regarding the accuracy, reliability, or suitability of the Application.</li>
                                <li>We are <strong>not liable</strong> for any direct, indirect, incidental, or consequential damages arising from your use of the Application.</li>
                                <li>We are <strong>not responsible</strong> for any decisions made based on information provided by the AI chatbot or PHQ-9 assessment.</li>
                            </ul>
                        </Section>

                        <Section title="11. Termination">
                            <p>We may terminate or suspend your access to the Application at any time, with or without notice, for any reason, including but not limited to violation of these Terms.</p>
                            <p>You may request account deletion at any time by contacting us. Upon deletion, your personal data will be permanently removed in accordance with our <Link to="/privacy" style={{ color: '#F6EDB9', textDecoration: 'none' }}>Privacy Policy</Link>.</p>
                        </Section>

                        <Section title="12. Changes to Terms">
                            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes through the Application. Your continued use of AwakeSoul after modifications constitutes acceptance of the updated Terms.</p>
                        </Section>

                        <Section title="13. Governing Law">
                            <p>These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.</p>
                        </Section>

                        <Section title="14. Contact Us">
                            <p>If you have questions about these Terms of Service, please contact us at:</p>
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
