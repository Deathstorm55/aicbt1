import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ borderBottom: '1px solid var(--glass-border)', padding: '1rem 0' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0' }}
            >
                <span>{question}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={20} className="text-muted" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p className="text-muted" style={{ paddingTop: '1rem', lineHeight: 1.6 }}>
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Docs() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "PHQ-9 Questionnaire",
            questions: [
                { q: "What is the PHQ-9?", a: "It is a short questionnaire used to understand how you have been feeling over the past two weeks." },
                { q: "Why do I need to take it?", a: "It helps the system understand your current emotional state so it can support you better." },
                { q: "How is my score used?", a: "Your score determines whether the chatbot is suitable for you and helps guide the type of support you receive." }
            ]
        },
        {
            title: "Cognitive Behavioral Therapy (CBT)",
            questions: [
                { q: "What is CBT?", a: "CBT is a method that helps you understand how your thoughts affect your feelings and actions." },
                { q: "How does the chatbot use CBT?", a: "It gently guides you to reflect on your thoughts and develop healthier thinking patterns." },
                { q: "Do I need experience with CBT?", a: "No, the chatbot walks you through everything step by step." }
            ]
        },
        {
            title: "Mood Tracking",
            questions: [
                { q: "Why log my mood daily?", a: "Tracking your mood helps you notice patterns and understand changes over time." },
                { q: "How often should I log?", a: "You’ll be reminded twice daily—morning and evening." }
            ]
        },
        {
            title: "Privacy and Security",
            questions: [
                { q: "Is my data private?", a: "Yes. Your conversations are encrypted and handled securely." },
                { q: "Are my messages stored?", a: "Only necessary data is stored securely to improve your experience." }
            ]
        },
        {
            title: "Safety and Support",
            questions: [
                { q: "What happens if I feel overwhelmed?", a: "The system will guide you to professional help and provide crisis support contacts." }
            ]
        }
    ];

    return (
        <div className="container" style={{ minHeight: 'calc(100vh - 72px)', padding: '4rem 1rem', maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
            <main style={{ flex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <button onClick={() => navigate('/')} className="btn-ghost" style={{ padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        &larr; Back to Home
                    </button>

                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>How It Works</h1>
                    <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '3rem', lineHeight: 1.6 }}>
                        Welcome to AwakeSoul. This guide explains how our platform supports your mental well-being in simple, reassuring terms.
                    </p>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        {sections.map((section, idx) => (
                            <div key={idx} style={{ marginBottom: idx === sections.length - 1 ? 0 : '3rem' }}>
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>{section.title}</h2>
                                <div>
                                    {section.questions.map((item, qIdx) => (
                                        <AccordionItem key={qIdx} question={item.q} answer={item.a} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Ready to get started?</h2>
                        <p className="text-muted" style={{ marginBottom: '2rem' }}>Join now and start your journey towards a healthier mind.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/auth')}>Start Using Chatbot</button>
                    </div>
                </motion.div>
            </main>

            <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--glass-border)', textAlign: 'center', marginTop: '4rem' }}>
                <p className="text-muted">
                    &copy; {new Date().getFullYear()} AwakeSoul. <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</a>
                </p>
            </footer>
        </div>
    );
}
