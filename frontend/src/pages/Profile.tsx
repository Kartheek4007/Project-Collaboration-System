import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Building2, Shield, Mail, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { authApi } from '../services/api';

const Profile: React.FC = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: user?.role || 'employee',
        company_name: user?.company_name || '',
        employee_id: user?.employee_id || '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

    // Sync form when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                role: user.role,
                company_name: user.company_name || '',
                employee_id: user.employee_id || '',
            });
        }
    }, [user]);

    const showMsg = (msg: string, ok = true) => {
        setFeedback({ msg, ok });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                role: formData.role,
                company_name: formData.company_name || null,
                employee_id: formData.employee_id || null, // send null if empty string
            };
            const res = await authApi.updateProfile(payload);
            const token = localStorage.getItem('token') || '';
            // Login function in context enriches the user with company_name again
            login(token, res.data);
            setIsEditing(false);
            showMsg("Profile updated successfully!");
        } catch {
            showMsg("Failed to update profile.", false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
            {feedback && (
                <div className="fixed top-28 right-8 z-50 animate-slide-up">
                    <div className={`text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20 ${feedback.ok ? 'bg-primary-600' : 'bg-red-600'}`}>
                        {feedback.ok ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        <span className="font-bold">{feedback.msg}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">My Profile</h2>
                    <p className="text-[var(--text-muted)] mt-1">Manage your account settings and personal details.</p>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-primary">
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Display */}
                <div className="lg:col-span-1 glass-panel p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-primary-600 to-primary-400 flex flex-center items-center justify-center shadow-xl shadow-primary-500/20 text-5xl font-bold text-white border-4 border-[var(--bg-main)]">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-main)]">{user?.name}</h3>
                    <div className="flex items-center justify-center space-x-1.5 mt-2 text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                        <Shield size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{user?.role.replace('_', ' ')}</span>
                    </div>

                    <div className="w-full h-px bg-[var(--border-color)] my-6"></div>

                    <div className="w-full space-y-4 text-left">
                        <div className="flex items-center space-x-3 text-[var(--text-muted)] group">
                            <Mail size={16} className="group-hover:text-primary-500 transition-colors" />
                            <span className="text-sm truncate font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-[var(--text-muted)] group">
                            <Building2 size={16} className="group-hover:text-primary-500 transition-colors" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.company_name || 'No Company'}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 text-[var(--text-muted)] group">
                            <Key size={16} className="group-hover:text-primary-500 transition-colors" />
                            <span className="text-sm truncate font-medium">Sys ID: {user?.id}</span>
                        </div>
                        {user?.employee_id && (
                            <div className="flex items-center space-x-3 text-[var(--text-muted)] group">
                                <UserIcon size={16} className="group-hover:text-primary-500 transition-colors" />
                                <span className="text-sm truncate font-medium">Employee ID: {user.employee_id}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Edit Form */}
                <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden">
                    {!isEditing ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-[var(--text-muted)] py-12">
                            <UserIcon size={48} className="opacity-20" />
                            <p className="text-lg">Your profile is currently in view-only mode.</p>
                            <p className="text-sm max-w-sm">Click "Edit Profile" above to update your personal information, role, or company affiliation.</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-[var(--text-main)] border-l-4 border-primary-500 pl-3">Edit Details</h3>
                            </div>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                                    <input
                                        className="input-field py-3 text-lg font-medium"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Account Role</label>
                                        <select
                                            className="input-field py-3"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="company_admin">Company Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="client">Client</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Company Name</label>
                                        <input
                                            type="text"
                                            className="input-field py-3"
                                            placeholder="Optional (Creates/Renames)"
                                            value={formData.company_name}
                                            onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Employee ID</label>
                                        <input
                                            type="text"
                                            className="input-field py-3"
                                            placeholder="Optional"
                                            value={formData.employee_id}
                                            onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-[var(--border-color)] flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] btn-primary shadow-lg shadow-primary-500/20"
                                    >
                                        {submitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
