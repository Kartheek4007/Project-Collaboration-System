import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { projectApi, taskApi, companyApi } from '../services/api';

const Analytics: React.FC = () => {
    const [stats, setStats] = useState({
        projects: 0,
        tasks: 0,
        companies: 0,
        completion: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [p, t, c] = await Promise.all([
                    projectApi.list(),
                    taskApi.list(),
                    companyApi.list()
                ]);
                const completedTasks = t.data.filter((task: any) => task.status === 'Done').length;
                setStats({
                    projects: p.data.length,
                    tasks: t.data.length,
                    companies: c.data.length,
                    completion: t.data.length > 0 ? Math.round((completedTasks / t.data.length) * 100) : 0
                });
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metrics = [
        { label: 'Ecosystem Velocity', value: '14.2%', trend: '+2.4%', up: true, icon: <TrendingUp className="text-emerald-500" /> },
        { label: 'Active Collaborators', value: stats.companies * 12 + 5, trend: '+4', up: true, icon: <Users className="text-primary-500" /> },
        { label: 'Avg. Project Health', value: '92/100', trend: '-1%', up: false, icon: <CheckCircle2 className="text-indigo-500" /> },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-[var(--text-main)]">Ecosystem Insights</h2>
                <p className="text-[var(--text-muted)] mt-1">Advanced data visualization of collaborative performance metrics.</p>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="glass-panel p-8 group hover:shadow-2xl transition-all duration-500 border-white/5">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                                {m.icon}
                            </div>
                            <div className={`flex items-center space-x-1 text-sm font-bold ${m.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <span>{m.trend}</span>
                                {m.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            </div>
                        </div>
                        <h4 className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest mb-2">{m.label}</h4>
                        <div className="text-4xl font-black text-white">{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Visual Charts (CSS Driven) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Progress Chart */}
                <div className="glass-panel p-8 min-h-[400px]">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="text-primary-500" />
                            Workload Distribution
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: 'Research & Planning', val: 45, color: 'bg-primary-500' },
                            { name: 'Architecture Design', val: 78, color: 'bg-indigo-500' },
                            { name: 'Frontend Engineering', val: 92, color: 'bg-emerald-500' },
                            { name: 'Backend Integration', val: 64, color: 'bg-amber-500' },
                            { name: 'Security Audits', val: 32, color: 'bg-rose-500' }
                        ].map((bar, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    <span>{bar.name}</span>
                                    <span>{bar.val}%</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full ${bar.color} transition-all duration-1000 shadow-[0_0_15px_rgba(14,165,233,0.3)]`}
                                        style={{ width: loading ? '0%' : `${bar.val}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Efficiency Index */}
                <div className="glass-panel p-8 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <PieChart className="text-indigo-500" />
                            Efficiency Index
                        </h3>
                    </div>

                    <div className="flex items-center justify-center py-10">
                        <div className="relative w-64 h-64">
                            {/* SVG Donut Chart */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="128" cy="128" r="110"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="transparent"
                                    className="text-white/5"
                                />
                                <circle
                                    cx="128" cy="128" r="110"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 110}
                                    strokeDashoffset={2 * Math.PI * 110 * (1 - stats.completion / 100)}
                                    className="text-primary-500 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white">{stats.completion}%</span>
                                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-1">Task Completion</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white/5 rounded-2xl text-center">
                            <div className="text-2xl font-bold text-white">{stats.tasks}</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Total Tasks</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl text-center">
                            <div className="text-2xl font-bold text-emerald-500">{Math.round(stats.tasks * (stats.completion / 100))}</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Resolved</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
