import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Building2, ShieldCheck, ShieldAlert, Search, Users, FolderOpen, X, CheckCircle2
} from 'lucide-react';
import { companyApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Companies: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [newCompany, setNewCompany] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchCompanies = async () => {
        try {
            const response = await companyApi.list();
            setCompanies(response.data);
        } catch (err) {
            console.error("Failed to fetch companies", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCompanies(); }, []);

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await companyApi.updateStatus(id, newStatus);
            setFeedback(`Company ${newStatus === 'active' ? 'activated' : 'suspended'} successfully.`);
            setTimeout(() => setFeedback(null), 3000);
            fetchCompanies();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await companyApi.create({ ...newCompany, status: 'active' });
            setFeedback("Company registered successfully!");
            setTimeout(() => setFeedback(null), 3000);
            setShowRegisterModal(false);
            setNewCompany({ name: '', description: '' });
            fetchCompanies();
        } catch (err) {
            alert("Failed to register company.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in relative">
            {feedback && (
                <div className="fixed top-28 right-8 z-50 animate-slide-up">
                    <div className="bg-primary-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20">
                        <CheckCircle2 size={20} />
                        <span className="font-bold">{feedback}</span>
                    </div>
                </div>
            )}

            {/* Register Company Modal — Super Admin only */}
            {showRegisterModal && user?.role === 'super_admin' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="glass-panel w-full max-w-lg p-8 border border-white/10 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[var(--text-main)]">Register New Company</h3>
                            <button onClick={() => setShowRegisterModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                <X size={20} className="text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Company Name</label>
                                <input
                                    required
                                    className="input-field w-full"
                                    placeholder="e.g., Acme Corp"
                                    value={newCompany.name}
                                    onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    className="input-field w-full min-h-[80px]"
                                    placeholder="Brief overview of company focus..."
                                    value={newCompany.description}
                                    onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                                />
                            </div>
                            <div className="flex space-x-4 pt-2">
                                <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 btn-secondary">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                                    {submitting ? 'Registering...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">Company Directory</h2>
                    <p className="text-[var(--text-muted)] mt-1">Manage corporate entities and their access levels.</p>
                </div>
                {/* Only Super Admin sees this button */}
                {user?.role === 'super_admin' && (
                    <button onClick={() => setShowRegisterModal(true)} className="btn-primary flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Register Company</span>
                    </button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                    type="text"
                    placeholder="Search companies..."
                    className="input-field pl-12 py-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-56 glass-panel animate-pulse bg-white/5 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                        <div key={company.id} className="glass-card group hover:border-primary-500/50 transition-all flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary-600/10 rounded-2xl border border-primary-500/20 text-primary-500">
                                    <Building2 size={24} />
                                </div>
                                {/* Status badge — Super Admin can toggle it */}
                                <div
                                    onClick={() => user?.role === 'super_admin' && handleToggleStatus(company.id, company.status)}
                                    title={user?.role === 'super_admin' ? "Click to toggle status" : ""}
                                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
                                        ${user?.role === 'super_admin' ? 'cursor-pointer' : 'cursor-default'}
                                        ${company.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                                >
                                    {company.status === 'active' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                    <span>{company.status}</span>
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-[var(--text-main)] mb-1">{company.name}</h4>
                            <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4 flex-1">{company.description || 'No description provided'}</p>

                            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase italic">ID: #{company.id}</span>
                                {/* Only Super Admin sees Manage Entities */}
                                {user?.role === 'super_admin' && (
                                    <button
                                        onClick={() => navigate(`/companies/${company.id}/manage`)}
                                        className="text-primary-500 hover:text-primary-400 font-bold text-sm flex items-center space-x-1.5 transition-colors"
                                    >
                                        <Users size={14} />
                                        <span>Manage Entities</span>
                                    </button>
                                )}
                                {user?.role === 'company_admin' && (
                                    <button
                                        onClick={() => navigate(`/projects`)}
                                        className="text-primary-500 hover:text-primary-400 font-bold text-sm flex items-center space-x-1.5 transition-colors"
                                    >
                                        <FolderOpen size={14} />
                                        <span>View Projects</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredCompanies.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center glass-panel border-dashed border-2">
                            <Building2 className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" size={48} />
                            <p className="text-[var(--text-muted)] italic">No companies found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Companies;
