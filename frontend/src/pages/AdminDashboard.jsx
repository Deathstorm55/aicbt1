import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { currentUser, userData, supabase, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!supabase || !currentUser) return;

            try {
                // We use supabase.functions.invoke to call our secure edge function.
                // It automatically passes the current user's Auth header.
                const { data, error: fnError } = await supabase.functions.invoke('admin-metrics', {
                    method: 'POST'
                });

                if (fnError) {
                    throw new Error(fnError.message || "Failed to fetch metrics.");
                }

                setDashboardData(data);
            } catch (err) {
                console.error("Admin dashboard fetch error:", err);
                setError(err.message || "Unauthorized access.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [supabase, currentUser]);

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p className="text-muted">Loading administrative metrics...</p>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2 style={{ color: '#e53935', marginBottom: '1rem' }}>Access Denied</h2>
                <p className="text-muted">{error}</p>
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const { metrics, scoreDistribution, moodTrends } = dashboardData;

    // Formatting distribution for Recharts
    const distributionData = [
        { name: 'Minimal (0-4)', count: scoreDistribution.minimal, fill: '#81c784' },
        { name: 'Mild (5-9)', count: scoreDistribution.mild, fill: '#dce775' },
        { name: 'Moderate (10-14)', count: scoreDistribution.moderate, fill: '#ffd54f' },
        { name: 'Mod. Severe (15-19)', count: scoreDistribution.moderatelySevere, fill: '#ffb74d' },
        { name: 'Severe (20+)', count: scoreDistribution.severe, fill: '#e57373' },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Admin Portal</h2>
                    <p className="text-muted">Global User Metrics & Analytics</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>User View</button>
                    <button onClick={logout} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>Sign Out</button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel text-center">
                    <h4 className="text-secondary" style={{ marginBottom: '0.5rem' }}>Total Users</h4>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.totalUsers}</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel text-center">
                    <h4 className="text-secondary" style={{ marginBottom: '0.5rem' }}>Avg PHQ-9 Score</h4>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.averagePhq9}</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel text-center" style={{ border: metrics.crisisCount > 0 ? '1px solid #ff6b6b' : undefined }}>
                    <h4 style={{ color: metrics.crisisCount > 0 ? '#ff6b6b' : 'var(--secondary)', marginBottom: '0.5rem' }}>In Crisis</h4>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: metrics.crisisCount > 0 ? '#ff6b6b' : 'inherit' }}>
                        {metrics.crisisCount}
                    </span>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>

                {/* Score Distribution Chart */}
                <div className="glass-panel">
                    <h3 className="text-secondary" style={{ marginBottom: '1.5rem' }}>PHQ-9 Severity Distribution</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Mood Trends Line Chart */}
                <div className="glass-panel">
                    <h3 className="text-secondary" style={{ marginBottom: '1.5rem' }}>Aggregated Mood Trends (Last 14 Days)</h3>
                    {moodTrends && moodTrends.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <LineChart data={moodTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="great" stroke="#81c784" strokeWidth={2} dot={{ r: 4 }} name="Great" />
                                    <Line type="monotone" dataKey="good" stroke="#dce775" strokeWidth={2} dot={{ r: 4 }} name="Good" />
                                    <Line type="monotone" dataKey="okay" stroke="#ffd54f" strokeWidth={2} dot={{ r: 4 }} name="Okay" />
                                    <Line type="monotone" dataKey="bad" stroke="#ffb74d" strokeWidth={2} dot={{ r: 4 }} name="Bad" />
                                    <Line type="monotone" dataKey="awful" stroke="#e57373" strokeWidth={2} dot={{ r: 4 }} name="Awful" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted">Not enough mood log data to display trends.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
