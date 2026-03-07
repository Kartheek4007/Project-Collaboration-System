import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    UserPlus, Mail, Shield, Search, CheckCircle2, X,
    UserCheck, UserX, AlertTriangle
} from 'lucide-react';
import { authApi } from '../services/api';

const Employees: React.FC = () => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'company_admin' || currentUser?.role === 'super_admin';
    const isSuperAdmin = currentUser?.role === 'super_admin';

    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [feedback, setFeedback] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const [newEmp, setNewEmp] = useState({
        name: '', email: '', password: 'Password123!',
        role: 'employee' as any,
        company_id: currentUser?.company_id || 0
    });

    const showMsg = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setFeedback({ msg, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    const fetchEmployees = async () => {
        try {
            const res = await authApi.getUsers(isSuperAdmin ? undefined : currentUser?.company_id || undefined);
            setEmployees(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [currentUser?.company_id]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authApi.register(newEmp);
            showMsg("Member registered and added successfully!");
            setShowInviteModal(false);
            setNewEmp({ ...newEmp, name: '', email: '' });
            fetchEmployees();
        } catch {
            showMsg("Error: Email might already be taken.", 'err');
        }
    };

    const handleToggleStatus = async (userId: number, isActive: boolean) => {
        try {
            await authApi.toggleUserStatus(userId);
            showMsg(`User ${isActive ? 'suspended' : 'activated'} successfully.`);
            fetchEmployees();
        } catch {
            showMsg("Failed to update user status.", 'err');
        }
    };

    const roleColors: Record<string, string> = {
        super_admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        company_admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        employee: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        client: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    const filtered = employees.filter(e =>
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Toast */}
            {feedback && (
                <div className="fixed top-28 right-8 z-50 animate-slide-up">
                    <div className={`text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20 ${feedback.type === 'ok' ? 'bg-primary-600' : 'bg-red-600'}`}>
                        {feedback.type === 'ok' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        <span className="font-bold">{feedback.msg}</span>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && isAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="glass-panel w-full max-w-lg p-8 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[var(--text-main)]">Add Team Member</h3>
                            <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><X size={20} className="text-[var(--text-muted)]" /></button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Full Name</label>
                                <input required className="input-field" placeholder="Jane Smith" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Email</label>
                                <input required type="email" className="input-field" placeholder="jane@company.com" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Password (temporary)</label>
                                <input required type="password" className="input-field" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Role</label>
                                <select className="input-field" value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}>
                                    <option value="employee">Employee</option>
                                    <option value="company_admin">Company Admin</option>
                                    <option value="client">Client</option>
                                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                </select>
                            </div>
                            {isSuperAdmin && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Company ID</label>
                                    <input type="number" className="input-field" value={newEmp.company_id} onChange={e => setNewEmp({ ...newEmp, company_id: parseInt(e.target.value) })} />
                                </div>
                            )}
                            <div className="flex space-x-3 pt-2">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 btn-secondary">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary">Add Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">
                        {isSuperAdmin ? 'All Users' : 'Team Directory'}
                    </h2>
                    <p className="text-[var(--text-muted)] mt-1">
                        {isSuperAdmin ? 'Manage and oversee all user accounts across the platform.' : 'Collaborate with your workspace team members.'}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowInviteModal(true)} className="btn-primary flex items-center space-x-2">
                        <UserPlus size={18} /><span>Add Member</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input type="text" placeholder="Search by name, email, or role..." className="input-field pl-12 py-3" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            {/* User Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-56 glass-panel animate-pulse bg-white/5 rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((emp) => (
                        <div key={emp.id} className={`glass-panel p-6 flex flex-col text-center transition-all hover:border-primary-500/30 ${emp.is_active === false ? 'opacity-50 grayscale' : ''}`}>
                            <div className="relative mx-auto w-20 h-20 mb-4">
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center border-4 border-[var(--bg-main)] shadow-lg text-2xl font-bold text-white">
                                    {emp.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className={`absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-[var(--bg-main)] ${emp.is_active === false ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            </div>

                            <h4 className="text-base font-bold text-[var(--text-main)] truncate">{emp.name}</h4>
                            <div className="flex items-center justify-center space-x-1 mt-1 mb-3">
                                <Shield size={10} className="text-primary-500" />
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleColors[emp.role] || 'bg-white/10 text-white'}`}>
                                    {emp.role?.replace('_', ' ')}
                                </span>
                            </div>

                            <a href={`mailto:${emp.email}`} className="flex items-center justify-center space-x-1.5 text-xs text-[var(--text-muted)] hover:text-primary-400 transition-colors mb-4 truncate">
                                <Mail size={12} /><span className="truncate">{emp.email}</span>
                            </a>

                            {/* Super Admin can disable/enable users */}
                            {isSuperAdmin && emp.id !== currentUser?.id && (
                                <button
                                    onClick={() => handleToggleStatus(emp.id, emp.is_active !== false)}
                                    className={`w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all mt-auto
                                        ${emp.is_active === false
                                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                >
                                    {emp.is_active === false ? <UserCheck size={14} /> : <UserX size={14} />}
                                    <span>{emp.is_active === false ? 'Activate Account' : 'Suspend Account'}</span>
                                </button>
                            )}
                            {!isSuperAdmin && (
                                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-[var(--text-main)] transition-all mt-auto">
                                    View Profile
                                </button>
                            )}
                        </div>
                    ))}
                    {filtered.length === 0 && !loading && (
                        <div className="col-span-full py-16 text-center glass-panel border-dashed border-2">
                            <p className="text-[var(--text-muted)] italic">No members found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Employees;
