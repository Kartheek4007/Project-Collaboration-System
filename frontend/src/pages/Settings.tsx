import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    Settings as SettingsIcon,
    Lock,
    LogOut,
    CheckCircle2,
    Building2,
    Palette
} from 'lucide-react';

const Settings: React.FC = () => {
    const { user, theme, toggleTheme, logout } = useAuth();
    const [showFeedback, setShowFeedback] = useState(false);

    const handleSave = () => {
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in relative">
            {showFeedback && (
                <div className="fixed top-28 right-8 z-50 animate-slide-up">
                    <div className="bg-primary-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20">
                        <CheckCircle2 size={20} />
                        <span className="font-bold">Preferences saved successfully!</span>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-3xl font-bold text-[var(--text-main)]">System Settings</h2>
                <p className="text-[var(--text-muted)] mt-1">Configure your personal experience and security parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-panel p-8 text-center border-white/5">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center border-4 border-[var(--bg-main)] shadow-2xl">
                                <span className="text-4xl font-black text-white">{user?.name.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-primary-500 rounded-xl border-4 border-[var(--bg-main)] text-white shadow-xl">
                                <SettingsIcon size={14} />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold text-white">{user?.name}</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{user?.email}</p>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                                <Shield size={12} />
                                <span>{user?.role.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                <Building2 size={12} />
                                <span>CID-#{user?.company_id}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold transition-all border border-rose-500/20 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Terminate Session</span>
                    </button>
                </div>

                {/* Configuration Sections */}
                <div className="md:col-span-2 space-y-6">
                    {/* Appearance */}
                    <div className="glass-panel p-8 space-y-8 border-white/5">
                        <div className="flex items-center space-x-3 text-white">
                            <Palette className="text-primary-500" />
                            <h3 className="text-lg font-bold">Preferences</h3>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <h4 className="font-bold text-white">Visual Environment</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1 italic">Current: {theme === 'dark' ? 'Onyx Dark' : 'Crystal Light'}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="px-6 py-2 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-primary-500/20"
                            >
                                Switch Mode
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <h4 className="font-bold text-white">System Notifications</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1 italic">Real-time alerts & task updates</p>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative cursor-pointer border border-emerald-500/30">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass-panel p-8 space-y-8 border-white/5">
                        <div className="flex items-center space-x-3 text-white">
                            <Lock className="text-indigo-500" />
                            <h3 className="text-lg font-bold">Privacy & Access</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Update Primary Email</label>
                                <input className="input-field py-3" defaultValue={user?.email} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">New Security Passphrase</label>
                                <input type="password" placeholder="••••••••••••" className="input-field py-3" />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full btn-primary py-4 text-base shadow-xl shadow-primary-500/10"
                        >
                            Persist Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
