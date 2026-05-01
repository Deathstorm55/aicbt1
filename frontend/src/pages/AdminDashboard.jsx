import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, Legend, AreaChart, Area, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopup } from '../contexts/PopupContext';
import BarLoader from '../components/ui/bar-loader';
import RealtimeNotificationPanel from '../components/RealtimeNotificationPanel';

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

    const { metrics, scoreDistribution, moodTrends, moodScoreTrend, moodSummaryTable, retakeImpact, phq9VsMood } = dashboardData;

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
                <div className="flex gap-3" style={{ alignItems: 'center' }}>
                    <RealtimeNotificationPanel />
                    <button onClick={() => navigate('/')} className="btn-ghost px-4 py-2">User View</button>
                    <button onClick={logout} className="btn-ghost px-4 py-2">Sign Out</button>
                </div>
            </div>

            {/* KPIs */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            >
                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Total Users</h4>
                    <span className="text-4xl font-bold">{metrics.totalUsers}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Active Users (7d)</h4>
                    <span className="text-4xl font-bold" style={{ color: '#F6EDB9' }}>{metrics.activeUsersCount}</span>
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

                <motion.div variants={itemVariants} className="glass-panel text-center">
                    <h4 className="text-secondary text-sm mb-2">Total Mood Logs</h4>
                    <span className="text-4xl font-bold">{metrics.totalMoodLogs}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel text-center" style={{ border: metrics.crisisStatementsCount > 0 ? '1px solid #ff9800' : undefined }}>
                    <h4 className="text-sm mb-2" style={{ color: metrics.crisisStatementsCount > 0 ? '#ff9800' : 'var(--secondary)' }}>Crisis Statements</h4>
                    <span className="text-4xl font-bold" style={{ color: metrics.crisisStatementsCount > 0 ? '#ff9800' : 'inherit' }}>
                        {metrics.crisisStatementsCount}
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

                {/* Aggregated Mood Score Trend (Area Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-panel">
                    <h3 className="text-secondary text-lg font-semibold mb-6">Daily Average Mood Score (Last 30 Days)</h3>
                    {moodScoreTrend && moodScoreTrend.length > 0 ? (
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer>
                                <AreaChart data={moodScoreTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#81c784" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#81c784" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                    <YAxis domain={[1, 5]} stroke="var(--text-muted)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                    <Area type="monotone" dataKey="avg" stroke="#81c784" fillOpacity={1} fill="url(#colorMood)" name="Avg Mood Score" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted text-center py-20 italic text-sm">Waiting for more mood data...</p>
                    )}
                </motion.div>

                {/* PHQ-9 vs Mood Combined Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-panel">
                    <h3 className="text-secondary text-lg font-semibold mb-6">PHQ-9 vs Mood Trend After Retakes</h3>
                    {phq9VsMood && phq9VsMood.length > 0 ? (
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer>
                                <ComposedChart data={phq9VsMood} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                    <YAxis yAxisId="left" stroke="#ffb74d" label={{ value: 'PHQ-9 Score', angle: -90, position: 'insideLeft', fill: '#ffb74d', fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#81c784" label={{ value: 'Mood Score', angle: 90, position: 'insideRight', fill: '#81c784', fontSize: 12 }} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="phq9" barSize={20} fill="#ffb74d" name="Avg PHQ-9" opacity={0.6} />
                                    <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#81c784" strokeWidth={3} dot={{ r: 6 }} name="Avg Mood" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-muted text-center py-20 italic text-sm">PHQ-9 history data will appear here after users retake assessments.</p>
                    )}
                </motion.div>

                {/* Mood Trend Summary Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-panel overflow-hidden">
                    <h3 className="text-secondary text-lg font-semibold mb-6">Mood Trend Summary (Last 14 Days)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-muted uppercase text-[10px] tracking-wider">
                                    <th className="pb-3 px-2">Date</th>
                                    <th className="pb-3 px-2">Avg Score</th>
                                    <th className="pb-3 px-2">Total Logs</th>
                                    <th className="pb-3 px-2 text-green-400">Positive %</th>
                                    <th className="pb-3 px-2 text-red-400">Negative %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {moodSummaryTable?.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-2 font-medium">{row.date}</td>
                                        <td className="py-3 px-2">{row.average_mood_score}</td>
                                        <td className="py-3 px-2">{row.total_entries}</td>
                                        <td className="py-3 px-2 text-green-400/80">{row.positive_percentage}%</td>
                                        <td className="py-3 px-2 text-red-400/80">{row.negative_percentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* PHQ-9 Retake Impact Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="glass-panel overflow-hidden">
                    <h3 className="text-secondary text-lg font-semibold mb-6">PHQ-9 Retake Analysis (Clinical Progress)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-muted uppercase text-[10px] tracking-wider">
                                    <th className="pb-3 px-2">User (Obf)</th>
                                    <th className="pb-3 px-2">Prev Score</th>
                                    <th className="pb-3 px-2">New Score</th>
                                    <th className="pb-3 px-2">Change</th>
                                    <th className="pb-3 px-2">Mood (Before)</th>
                                    <th className="pb-3 px-2">Mood (After)</th>
                                    <th className="pb-3 px-2">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {retakeImpact?.length > 0 ? retakeImpact.map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-2 text-xs font-mono">{row.user_id}</td>
                                        <td className="py-3 px-2 text-center">{row.previous_score}</td>
                                        <td className="py-3 px-2 text-center font-bold">{row.new_score}</td>
                                        <td className={`py-3 px-2 text-center font-bold ${row.score_change <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {row.score_change > 0 ? `+${row.score_change}` : row.score_change}
                                        </td>
                                        <td className="py-3 px-2 text-center">{row.average_mood_before}</td>
                                        <td className="py-3 px-2 text-center">{row.average_mood_after}</td>
                                        <td className="py-3 px-2">{row.retake_date}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-muted italic">No retake impact data available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
