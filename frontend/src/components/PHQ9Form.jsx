import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure",
    "Trouble concentrating on things",
    "Moving or speaking slowly or being overly fidgety",
    "Thoughts that you would be better off dead or of hurting yourself"
];

const OPTIONS = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
];

export default function PHQ9Form() {
    const { userData, logout, refreshUserData } = useAuth();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState(Array(9).fill(null));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSelect = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (answers.includes(null)) {
            setError("Please answer all questions before submitting.");
            return;
        }
        setError('');
        setLoading(true);

        const score = answers.reduce((a, b) => a + b, 0);
        const hasSuicidalIdeation = answers[8] > 0;
        const isCrisis = score >= 15 || hasSuicidalIdeation;

        let eligible_for_chatbot = false;
        if (score >= 5 && score <= 14 && !hasSuicidalIdeation) {
            eligible_for_chatbot = true;
        }

        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    phq9_score: score,
                    eligible_for_chatbot: eligible_for_chatbot,
                    last_assessment_date: new Date().toISOString(),
                    needs_crisis_intervention: isCrisis
                })
                .eq('id', userData.id);

            if (updateError) throw updateError;

            if (isCrisis) {
                alert("CRISIS EXCLUSION PROTOCOL TRIGGERED: Please seek immediate professional emergency assistance. Recommended hotlines:\n- SURPIN: 0908 021 7555\n- Mentally Aware Nigeria: 0809 111 6264");
            } else if (score <= 4) {
                alert("Based on your assessment, your symptoms are minimal. The AI therapy chatbot is optimized for mild to moderate symptoms.");
            }

            await refreshUserData();
            navigate('/');
        } catch (err) {
            setError("Failed to save assessment.");
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="text-primary" style={{ marginBottom: '1rem' }}>Patient Health Questionnaire (PHQ-9)</h2>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Over the last 2 weeks, how often have you been bothered by any of the following problems?
                </p>

                {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {PHQ9_QUESTIONS.map((question, index) => (
                        <div key={index} style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                            <p style={{ fontWeight: '500', marginBottom: '1rem' }}>
                                {index + 1}. {question}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                {OPTIONS.map(opt => (
                                    <label
                                        key={opt.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: answers[index] === opt.value ? 'rgba(91, 14, 20, 0.4)' : 'rgba(0,0,0,0.2)',
                                            border: `1px solid ${answers[index] === opt.value ? 'var(--primary)' : 'var(--glass-border)'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`q${index}`}
                                            value={opt.value}
                                            checked={answers[index] === opt.value}
                                            onChange={() => handleSelect(index, opt.value)}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" className="btn-ghost" onClick={logout}>Sign Out</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
