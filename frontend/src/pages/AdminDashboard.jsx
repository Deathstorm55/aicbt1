import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '../contexts/PopupContext';
import BarLoader from '../components/ui/bar-loader';

export default function AdminDashboard() {
    const { currentUser, userData, supabase, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const { showPopup } = usePopup();

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!supabase || !currentUser) return;

            try {
                const { data, error: fnError } = await supabase.functions.invoke('admin-metrics', {
                    method: 'POST'
                });

                if (fnError) {
                    throw new Error(fnError.message || "Failed to fetch metrics.");
                }

                setDashboardData(data);
            } catch (err) {
                console.error("Admin dashboard fetch error:", err);
                showPopup({
                    type: 'error',
                    title: 'Access Denied',
                    message: err.message || "Unauthorized access.",
                    duration: 5000
                });
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [supabase, currentUser, navigate, showPopup]);

    if (loading || !dashboardData) {
        return (
            <div className="container" style={{ padding: '8rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarLoader message="Loading administrative metrics..." />
            </div>
        );
    }

    const { metrics, scoreDistribution, moodTrends } = dashboardData;

    const distributionData = [
        { name: 'Minimal (0-4)', count: scoreDistribution.minimal, fill: '#81c784' },
        { name: 'Mild (5-9)', count: scoreDistribution.mild, fill: '#dce775' },
        { name: 'Moderate (10-14)', count: scoreDistribution.moderate, fill: '#ffd54f' },
        { name: 'Mod. Severe (15-19)', count: scoreDistribution.moderatelySevere, fill: '#ffb74d' },
        { name: 'Severe (20+)', count: scoreDistribution.severe, fill: '#e57373' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Admin Portal</h2>
                    <p className="text-muted text-sm">Global User Metrics & Analytics</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/')} className="btn-ghost px-4 py-2">User View</button>
                    <button onClick={logout} className="btn-ghost px-4 py-2">Sign Out</button>
                </div>
            </div>

            {/* KPIs */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12"
            >
                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Total Users</h4>
                    <span className="text-4xl font-bold">{metrics.totalUsers}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Active Users (7d)</h4>
                    <span className="text-4xl font-bold text-primary">{metrics.activeUsersCount}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Avg Messages/User</h4>
                    <span className="text-4xl font-bold">{metrics.averageChatbotUsage}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Avg PHQ-9</h4>
                    <span className="text-4xl font-bold">{metrics.averagePhq9}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel text-center" style={{ border: metrics.crisisCount > 0 ? '1px solid #ff6b6b' : undefined }}>
                    <h4 className="text-sm mb-2" style={{ color: metrics.crisisCount > 0 ? '#ff6b6b' : 'var(--secondary)' }}>In Crisis</h4>
                    <span className="text-4xl font-bold" style={{ color: metrics.crisisCount > 0 ? '#ff6b6b' : 'inherit' }}>
                        {metrics.crisisCount}
                    </span>
                </motion.div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-8">
                {/* Score Distribution Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel">
                    <h3 className="text-secondary text-lg font-semibold mb-6">PHQ-9 Severity Distribution</h3>
                    <div className="w-full h-[350px]">
                        <ResponsiveContainer>
                            <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                <YAxis stroke="var(--text-muted)" allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Mood Trends Line Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel">
                    <h3 className="text-secondary text-lg font-semibold mb-6">Aggregated Mood Trends (Last 14 Days)</h3>
                    {moodTrends && moodTrends.length > 0 ? (
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer>
                                <LineChart data={moodTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                    <YAxis stroke="var(--text-muted)" allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
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
                        <p className="text-muted text-center py-20 italic text-sm">Not enough mood log data to display trends.</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
