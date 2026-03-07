import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Timer, CheckCircle2, Briefcase, Users, Coins, BarChart3,
    Plus, Building2, FolderOpen, ClipboardList, TrendingUp,
    AlertCircle, Clock, CheckSquare
} from 'lucide-react';
import { projectApi, taskApi, authApi, companyApi } from '../services/api';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any[]>([]);
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.role === 'super_admin') {
                    const [companies, projects, users] = await Promise.all([
                        companyApi.list(),
                        projectApi.list(),
                        authApi.getUsers(),
                    ]);
                    setStats([
                        { label: 'Total Companies', value: companies.data.length, icon: <Building2 className="text-primary-400" />, color: 'primary' },
                        { label: 'Active Projects', value: projects.data.length, icon: <Briefcase className="text-emerald-400" />, color: 'emerald' },
                        { label: 'Total Users', value: users.data.length, icon: <Users className="text-amber-400" />, color: 'amber' },
                        { label: 'Pending Approvals', value: companies.data.filter((c: any) => c.status === 'pending').length, icon: <AlertCircle className="text-red-400" />, color: 'red' },
                    ]);
                    setRecentProjects(projects.data.slice(0, 5));
                } else if (user?.role === 'company_admin') {
                    const [projects, tasks, users] = await Promise.all([
                        projectApi.list(),
                        taskApi.list(),
                        authApi.getUsers(user.company_id ?? undefined),
                    ]);
                    const done = tasks.data.filter((t: any) => t.status === 'Done').length;
                    const completion = tasks.data.length > 0 ? Math.round((done / tasks.data.length) * 100) : 0;
                    setStats([
                        { label: 'Active Projects', value: projects.data.length, icon: <Briefcase className="text-primary-400" />, color: 'primary' },
                        { label: 'Team Members', value: users.data.length, icon: <Users className="text-emerald-400" />, color: 'emerald' },
                        { label: 'Total Tasks', value: tasks.data.length, icon: <ClipboardList className="text-amber-400" />, color: 'amber' },
                        { label: 'Completion Rate', value: `${completion}%`, icon: <TrendingUp className="text-indigo-400" />, color: 'indigo' },
                    ]);
                    setRecentProjects(projects.data.slice(0, 4));
                    setPendingTasks(tasks.data.filter((t: any) => t.status !== 'Done').slice(0, 5));
                } else if (user?.role === 'employee') {
                    const [projects, tasks] = await Promise.all([
                        projectApi.list(),
                        taskApi.list(),
                    ]);
                    const myTasks = tasks.data;
                    const done = myTasks.filter((t: any) => t.status === 'Done').length;
                    const progress = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;
                    setStats([
                        { label: 'Assigned Projects', value: projects.data.length, icon: <FolderOpen className="text-primary-400" />, color: 'primary' },
                        { label: 'My Tasks', value: myTasks.length, icon: <CheckSquare className="text-emerald-400" />, color: 'emerald' },
                        { label: 'Completed', value: done, icon: <CheckCircle2 className="text-amber-400" />, color: 'amber' },
                        { label: 'Progress', value: `${progress}%`, icon: <TrendingUp className="text-indigo-400" />, color: 'indigo' },
                    ]);
                    setPendingTasks(myTasks.filter((t: any) => t.status !== 'Done').slice(0, 6));
                } else if (user?.role === 'client') {
                    const [projects, tasks] = await Promise.all([
                        projectApi.list(),
                        taskApi.list(),
                    ]);
                    setStats([
                        { label: 'My Projects', value: projects.data.length, icon: <Briefcase className="text-primary-400" />, color: 'primary' },
                        { label: 'Tasks in Progress', value: tasks.data.filter((t: any) => t.status !== 'Done').length, icon: <Clock className="text-emerald-400" />, color: 'emerald' },
                        { label: 'Completed Tasks', value: tasks.data.filter((t: any) => t.status === 'Done').length, icon: <CheckCircle2 className="text-amber-400" />, color: 'amber' },
                        { label: 'Budget Used', value: '$12.4K', icon: <Coins className="text-indigo-400" />, color: 'indigo' },
                    ]);
                    setRecentProjects(projects.data.slice(0, 4));
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const colorMap: Record<string, string> = {
        primary: 'bg-primary-500/10 border-primary-500/20',
        emerald: 'bg-emerald-500/10 border-emerald-500/20',
        amber: 'bg-amber-500/10 border-amber-500/20',
        indigo: 'bg-indigo-500/10 border-indigo-500/20',
        red: 'bg-red-500/10 border-red-500/20',
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">{greeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-[var(--text-muted)] mt-1">
                        <span className="text-primary-500 font-bold capitalize">{user?.role?.replace('_', ' ')}</span> • Here's your workspace overview.
                    </p>
                </div>
                {/* Role-specific quick actions */}
                {user?.role === 'super_admin' && (
                    <div className="flex space-x-3">
                        <button onClick={() => navigate('/companies')} className="btn-secondary flex items-center space-x-2"><Building2 size={16} /><span>Companies</span></button>
                        <button onClick={() => navigate('/analytics')} className="btn-primary flex items-center space-x-2"><BarChart3 size={16} /><span>Analytics</span></button>
                    </div>
                )}
                {user?.role === 'company_admin' && (
                    <div className="flex space-x-3">
                        <button onClick={() => navigate('/employees')} className="btn-secondary flex items-center space-x-2"><Users size={16} /><span>Company Users</span></button>
                        <button onClick={() => navigate('/projects')} className="btn-primary flex items-center space-x-2"><Plus size={16} /><span>New Project</span></button>
                    </div>
                )}
                {user?.role === 'employee' && (
                    <div className="flex space-x-3">
                        <button onClick={() => navigate('/time-logs')} className="btn-secondary flex items-center space-x-2"><Timer size={16} /><span>Log Hours</span></button>
                        <button onClick={() => navigate('/tasks')} className="btn-primary flex items-center space-x-2"><CheckSquare size={16} /><span>My Tasks</span></button>
                    </div>
                )}
                {user?.role === 'client' && (
                    <div className="flex space-x-3">
                        <button onClick={() => navigate('/milestones')} className="btn-secondary flex items-center space-x-2"><CheckCircle2 size={16} /><span>Milestones</span></button>
                        <button onClick={() => navigate('/deliverables')} className="btn-primary flex items-center space-x-2"><ClipboardList size={16} /><span>Deliverables</span></button>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-panel animate-pulse bg-white/5 rounded-2xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card p-6 h-36 flex flex-col justify-between">
                            <div className={`w-10 h-10 rounded-xl ${colorMap[stat.color]} border flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lower Content — Role Specific */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recent Projects / Tasks */}
                <div className="lg:col-span-3 glass-panel p-6">
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-5">
                        {user?.role === 'employee' ? 'Pending Tasks' : 'Recent Projects'}
                    </h3>
                    {user?.role === 'employee' || user?.role === 'company_admin' ? (
                        <div className="space-y-3">
                            {pendingTasks.length === 0 && <p className="text-[var(--text-muted)] text-sm italic">All tasks complete! 🎉</p>}
                            {pendingTasks.map((task: any) => (
                                <div key={task.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate('/tasks')}>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'Critical' ? 'bg-red-500' : task.priority === 'High' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[var(--text-main)] truncate">{task.title}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{task.status} • {task.priority}</p>
                                    </div>
                                    <div className="text-xs font-bold text-primary-400">{task.progress ?? 0}%</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentProjects.length === 0 && <p className="text-[var(--text-muted)] text-sm italic">No projects yet.</p>}
                            {recentProjects.map((project: any) => (
                                <div key={project.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate('/projects')}>
                                    <div className="p-2 bg-primary-500/10 rounded-lg"><FolderOpen size={16} className="text-primary-400" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[var(--text-main)] truncate">{project.title}</p>
                                        <p className="text-xs text-[var(--text-muted)]">Due {new Date(project.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary-400 uppercase bg-primary-500/5 px-2 py-1 rounded-md">{project.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions Panel */}
                <div className="lg:col-span-2 glass-panel p-6">
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-5">Quick Actions</h3>
                    <div className="space-y-3">
                        {user?.role === 'super_admin' && [
                            { label: 'Manage Companies', icon: <Building2 size={16} />, path: '/companies' },
                            { label: 'Global Analytics', icon: <BarChart3 size={16} />, path: '/analytics' },
                            { label: 'Manage Users', icon: <Users size={16} />, path: '/employees' },
                        ].map(a => (
                            <button key={a.label} onClick={() => navigate(a.path)} className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-primary-500/10 hover:text-primary-400 rounded-xl transition-all text-left text-sm font-medium text-[var(--text-muted)]">
                                {a.icon}<span>{a.label}</span>
                            </button>
                        ))}
                        {user?.role === 'company_admin' && [
                            { label: 'Create Project', icon: <Plus size={16} />, path: '/projects' },
                            { label: 'Manage Team', icon: <Users size={16} />, path: '/employees' },
                            { label: 'View Analytics', icon: <BarChart3 size={16} />, path: '/analytics' },
                            { label: 'Assign Tasks', icon: <ClipboardList size={16} />, path: '/tasks' },
                        ].map(a => (
                            <button key={a.label} onClick={() => navigate(a.path)} className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-primary-500/10 hover:text-primary-400 rounded-xl transition-all text-left text-sm font-medium text-[var(--text-muted)]">
                                {a.icon}<span>{a.label}</span>
                            </button>
                        ))}
                        {user?.role === 'employee' && [
                            { label: 'View Projects', icon: <FolderOpen size={16} />, path: '/projects' },
                            { label: 'Log Work Hours', icon: <Clock size={16} />, path: '/time-logs' },
                            { label: 'Task Pipeline', icon: <CheckSquare size={16} />, path: '/tasks' },
                        ].map(a => (
                            <button key={a.label} onClick={() => navigate(a.path)} className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-primary-500/10 hover:text-primary-400 rounded-xl transition-all text-left text-sm font-medium text-[var(--text-muted)]">
                                {a.icon}<span>{a.label}</span>
                            </button>
                        ))}
                        {user?.role === 'client' && [
                            { label: 'Track Milestones', icon: <CheckCircle2 size={16} />, path: '/milestones' },
                            { label: 'Review Deliverables', icon: <ClipboardList size={16} />, path: '/deliverables' },
                            { label: 'Project Overview', icon: <FolderOpen size={16} />, path: '/projects' },
                        ].map(a => (
                            <button key={a.label} onClick={() => navigate(a.path)} className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-primary-500/10 hover:text-primary-400 rounded-xl transition-all text-left text-sm font-medium text-[var(--text-muted)]">
                                {a.icon}<span>{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
