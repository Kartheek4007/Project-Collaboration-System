import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Clock, FileText, Search, Building2, X, CheckCircle2, Layers
} from 'lucide-react';
import { projectApi, companyApi, authApi } from '../services/api';

const STATUS_COLORS: Record<string, string> = {
    'Planning': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Review': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Archived': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const CARD_GRADIENTS = [
    'from-primary-600/20 to-blue-900/10',
    'from-purple-600/20 to-pink-900/10',
    'from-emerald-600/20 to-teal-900/10',
    'from-amber-600/20 to-orange-900/10',
    'from-rose-600/20 to-red-900/10',
    'from-indigo-600/20 to-violet-900/10',
];

const Projects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isCompanyAdmin = user?.role === 'company_admin';

    const [projects, setProjects] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [allCompanies, setAllCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '', description: '', deadline: '', budget: 0,
        client_id: 0, company_ids: [] as number[]
    });
    const [submitting, setSubmitting] = useState(false);

    const showMsg = (msg: string, ok = true) => {
        setFeedback({ msg, ok });
        setTimeout(() => setFeedback(null), 3000);
    };

    const fetchProjects = async () => {
        try {
            const res = await projectApi.list();
            setProjects(res.data);
        } catch { console.error("Failed to fetch projects"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProjects();
        // Fetch client users for the create modal
        if (isCompanyAdmin) {
            authApi.getUsers(user?.company_id ?? undefined).then(r => {
                setClients(r.data.filter((u: any) => u.role === 'client'));
            }).catch(() => { });
            companyApi.list().then(r => setAllCompanies(r.data)).catch(() => { });
        }
    }, [isCompanyAdmin, user?.company_id]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                ...newProject,
                deadline: new Date(newProject.deadline).toISOString(),
                status: 'Planning'
            };
            if (payload.client_id === 0) payload.client_id = null;

            // Ensure creator's company is always included
            if (!payload.company_ids.includes(user?.company_id) && user?.company_id) {
                payload.company_ids = [...payload.company_ids, user.company_id];
            }

            await projectApi.create(payload);
            showMsg("Project created successfully!");
            setShowCreateModal(false);
            setNewProject({ title: '', description: '', deadline: '', budget: 0, client_id: 0, company_ids: [] });
            fetchProjects();
        } catch {
            showMsg("Failed to create project.", false);
        } finally {
            setSubmitting(false);
        }
    };

    const statuses = ['All', 'Planning', 'In Progress', 'Review', 'Completed', 'Archived'];

    const filtered = projects.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'In Progress').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        planning: projects.filter(p => p.status === 'Planning').length,
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Toast */}
            {feedback && (
                <div className="fixed top-28 right-8 z-50 animate-slide-up">
                    <div className={`text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20 ${feedback.ok ? 'bg-primary-600' : 'bg-red-600'}`}>
                        <CheckCircle2 size={20} />
                        <span className="font-bold">{feedback.msg}</span>
                    </div>
                </div>
            )}

            {/* Create modal */}
            {showCreateModal && isCompanyAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-xl p-8 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--text-main)]">Launch New Project</h3>
                                {user?.company_name && (
                                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center space-x-1">
                                        <Building2 size={11} /><span>Under: <span className="text-primary-400 font-bold">{user.company_name}</span></span>
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/5 rounded-xl">
                                <X size={20} className="text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Project Title</label>
                                <input required className="input-field text-lg" placeholder="e.g., Quantum Leap Platform"
                                    value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Description</label>
                                <textarea required className="input-field min-h-[80px]" placeholder="What are the goals of this project?"
                                    value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Deadline</label>
                                    <input required type="date" className="input-field"
                                        value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Budget ($)</label>
                                    <input required type="number" min="0" className="input-field"
                                        value={newProject.budget} onChange={e => setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })} />
                                </div>
                            </div>
                            {clients.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Assign Client</label>
                                    <select className="input-field" value={newProject.client_id}
                                        onChange={e => setNewProject({ ...newProject, client_id: parseInt(e.target.value) })}>
                                        <option value={0}>— No client —</option>
                                        {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                    </select>
                                </div>
                            )}

                            {allCompanies.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Collaborating Companies</label>
                                    <div className="max-h-32 overflow-y-auto custom-scrollbar bg-black/10 rounded-xl p-2 border border-[var(--border-color)] space-y-1">
                                        {allCompanies.map(c => (
                                            <label key={c.id} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-[var(--border-color)] bg-transparent text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                                                    checked={newProject.company_ids.includes(c.id) || c.id === user?.company_id}
                                                    disabled={c.id === user?.company_id}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewProject({ ...newProject, company_ids: [...newProject.company_ids, c.id] });
                                                        } else {
                                                            setNewProject({ ...newProject, company_ids: newProject.company_ids.filter(id => id !== c.id) });
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm text-[var(--text-main)] font-medium">
                                                    {c.name} {c.id === user?.company_id && <span className="text-primary-500 text-xs ml-1">(Your Company)</span>}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex space-x-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-[2] btn-primary">
                                    {submitting ? 'Creating...' : 'Initialize Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">Projects</h2>
                    <p className="text-[var(--text-muted)] mt-1">
                        {user?.company_name
                            ? <>Projects under <span className="text-primary-400 font-bold">{user.company_name}</span></>
                            : 'All projects across the platform.'}
                    </p>
                </div>
                {isCompanyAdmin && (
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center space-x-2 shrink-0">
                        <Plus size={18} /><span>New Project</span>
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-[var(--text-main)]' },
                    { label: 'In Progress', value: stats.active, color: 'text-blue-400' },
                    { label: 'Planning', value: stats.planning, color: 'text-amber-400' },
                    { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
                ].map(s => (
                    <div key={s.label} className="glass-panel p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input type="text" placeholder="Search projects..." className="input-field pl-12 py-3"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                    {statuses.map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border
                                ${statusFilter === s
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                    : 'bg-white/5 text-[var(--text-muted)] border-white/10 hover:border-primary-500/30 hover:text-[var(--text-main)]'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 glass-panel animate-pulse bg-white/5 rounded-2xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 glass-panel text-center border-dashed border-2">
                    <Layers className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" size={48} />
                    <p className="text-[var(--text-muted)] italic">
                        {search || statusFilter !== 'All' ? 'No projects match your filter.' : 'No projects yet.'}
                    </p>
                    {isCompanyAdmin && !search && statusFilter === 'All' && (
                        <button onClick={() => setShowCreateModal(true)} className="mt-4 btn-primary inline-flex items-center space-x-2">
                            <Plus size={16} /><span>Create First Project</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((project, idx) => (
                        <div key={project.id} className="group glass-card p-0 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                            {/* Card Header Banner */}
                            <div className={`h-28 bg-gradient-to-tr ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} p-5 flex flex-col justify-between relative`}>
                                <div className="flex items-start justify-between">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[project.status] || STATUS_COLORS['Planning']}`}>
                                        {project.status || 'Planning'}
                                    </span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase"># {project.id}</span>
                                </div>
                                <h4 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors leading-tight">
                                    {project.title}
                                </h4>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex flex-col flex-1">
                                <p className="text-sm text-[var(--text-muted)] line-clamp-2 flex-1">{project.description}</p>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center space-x-1.5 text-[var(--text-muted)]">
                                            <Clock size={12} className="text-primary-400" />
                                            <span>Due {new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </span>
                                        <span className="font-bold text-emerald-400">${project.budget?.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => navigate(`/projects/${project.id}/deliverables`)}
                                        className="flex items-center space-x-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        <FileText size={13} /><span>Deliverables</span>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/tasks?project=${project.id}`)}
                                        className="flex items-center space-x-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                    >
                                        <Layers size={13} /><span>Tasks</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
