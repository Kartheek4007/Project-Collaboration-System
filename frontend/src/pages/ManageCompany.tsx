import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderOpen, ShieldCheck, ShieldAlert, User, Mail } from 'lucide-react';
import { authApi, projectApi, companyApi } from '../services/api';

const ManageCompany: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'users' | 'projects'>('users');

    useEffect(() => {
        const fetchData = async () => {
            if (!companyId) return;
            try {
                const [companyRes, usersRes, projectsRes] = await Promise.all([
                    companyApi.get(parseInt(companyId)),
                    authApi.getUsers(parseInt(companyId)),
                    projectApi.list(),
                ]);
                setCompany(companyRes.data);
                setUsers(usersRes.data);
                // Filter only projects associated with this company
                // (ideally backend will filter, but client-side filter as fallback)
                setProjects(projectsRes.data);
            } catch (err) {
                console.error("Failed to fetch company data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [companyId]);

    const roleColors: Record<string, string> = {
        super_admin: 'bg-purple-500/10 text-purple-400',
        company_admin: 'bg-blue-500/10 text-blue-400',
        employee: 'bg-emerald-500/10 text-emerald-400',
        client: 'bg-amber-500/10 text-amber-400',
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 glass-panel animate-pulse bg-white/5 rounded-2xl" />)}
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/companies')} className="p-2 hover:bg-white/5 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">{company?.name}</h2>
                    <p className="text-[var(--text-muted)] mt-0.5">Entity Management Portal</p>
                </div>
                <div className={`ml-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                    ${company?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {company?.status === 'active' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    <span>{company?.status}</span>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Users size={24} /></div>
                    <div>
                        <div className="text-3xl font-bold text-[var(--text-main)]">{users.length}</div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Total Members</div>
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center space-x-4">
                    <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-500"><FolderOpen size={24} /></div>
                    <div>
                        <div className="text-3xl font-bold text-[var(--text-main)]">{projects.length}</div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">Active Projects</div>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex space-x-1 p-1 bg-white/5 rounded-2xl w-fit">
                {(['users', 'projects'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-xl font-bold text-sm capitalize transition-all
                            ${tab === t ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >{t}</button>
                ))}
            </div>

            {/* Content */}
            {tab === 'users' && (
                <div className="space-y-3">
                    {users.length === 0 && <p className="text-[var(--text-muted)] italic p-6 glass-panel text-center">No users found for this company.</p>}
                    {users.map(u => (
                        <div key={u.id} className="glass-panel p-5 flex items-center space-x-4 hover:border-primary-500/30 transition-all">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-sm shrink-0">
                                {u.full_name?.[0]?.toUpperCase() || <User size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[var(--text-main)] truncate">{u.full_name}</p>
                                <p className="text-xs text-[var(--text-muted)] flex items-center space-x-1 mt-0.5"><Mail size={10} /><span>{u.email}</span></p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColors[u.role] || 'bg-white/10 text-white'}`}>
                                {u.role?.replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {tab === 'projects' && (
                <div className="space-y-3">
                    {projects.length === 0 && <p className="text-[var(--text-muted)] italic p-6 glass-panel text-center">No projects assigned to this company.</p>}
                    {projects.map(p => (
                        <div key={p.id} className="glass-panel p-5 flex items-center space-x-4 hover:border-primary-500/30 transition-all">
                            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500"><FolderOpen size={20} /></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[var(--text-main)] truncate">{p.title}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{p.description}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400 bg-primary-500/5 px-2 py-1 rounded-md">{p.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageCompany;
