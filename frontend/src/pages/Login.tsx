import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn, Shield, Users, Briefcase, UserCircle, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Registration extra fields
    const [name, setName] = useState('');
    const [role, setRole] = useState<'employee' | 'company_admin' | 'super_admin' | 'client'>('employee');
    const [employeeId, setEmployeeId] = useState('');
    const [companyName, setCompanyName] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (mode === 'register') {
                // Register User
                await api.post('/auth/register/', {
                    name,
                    email,
                    password,
                    role,
                    employee_id: employeeId === '' ? null : employeeId,
                    company_name: companyName === '' ? null : companyName
                });

                // Immediately log them in after successful registration
                const params = new URLSearchParams();
                params.append('username', email);
                params.append('password', password);
                const response = await api.post('/auth/login', params);

                login(response.data.access_token, {
                    id: 0, // Gets enriched in AuthContext anyway
                    name,
                    email,
                    role,
                    company_id: null,
                    employee_id: employeeId === '' ? null : employeeId,
                    company_name: companyName === '' ? undefined : companyName
                });

            } else {
                // Login User
                const params = new URLSearchParams();
                params.append('username', email);
                params.append('password', password);
                const response = await api.post('/auth/login', params);

                // Fetching proper user details handled by AuthContext token restoration next tick,
                // but we feed placeholder first 
                const mockRole = email.includes('admin') ? 'super_admin' :
                    email.includes('company') ? 'company_admin' :
                        email.includes('employee') ? 'employee' : 'client';

                login(response.data.access_token, {
                    id: 1,
                    name: email.split('@')[0].replace('.', ' '),
                    email: email,
                    role: mockRole as any,
                    company_id: 1
                });
            }
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                (mode === 'login' ? 'Invalid credentials.' : 'Registration failed. Email might be in use.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-dark-950 overflow-hidden font-['Outfit']">
            {/* Visual Side */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary-600 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 p-12 text-white max-w-xl animate-blur-in">
                    <h1 className="text-6xl font-bold mb-6 tracking-tight">
                        Seamlessly <br /><span className="text-primary-200">Collaborate.</span>
                    </h1>
                    <p className="text-xl text-primary-100 leading-relaxed opacity-80">
                        The multi-company ecosystem for transparent project management, task tracking, and milestone approvals.
                    </p>

                    <div className="grid grid-cols-2 gap-6 mt-12">
                        {[
                            { icon: <Shield size={24} />, label: "Secure Multi-Tenancy" },
                            { icon: <Users size={24} />, label: "Company Synergy" },
                            { icon: <Briefcase size={24} />, label: "Task Transparency" },
                            { icon: <UserCircle size={24} />, label: "Client Lifecycle" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="text-primary-200">{item.icon}</div>
                                <span className="font-medium text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full"></div>

                <div className={`w-full max-w-md ${mode === 'register' ? 'animate-fade-in' : 'animate-slide-up'} my-8`}>
                    <div className="mb-10 lg:hidden">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                                <span className="font-bold text-white">C</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-[var(--text-main)]">CollabHub</span>
                        </div>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-4xl font-bold text-[var(--text-main)] mb-3 tracking-tight">
                            {mode === 'login' ? 'Welcome back' : 'Create Account'}
                        </h2>
                        <p className="text-[var(--text-muted)]">
                            {mode === 'login'
                                ? 'Enter your workspace credentials to continue'
                                : 'Join the collaboration ecosystem'}
                        </p>
                    </div>

                    {/* Mode Toggle Slider */}
                    <div className="relative flex p-1 bg-white/5 border border-[var(--border-color)] rounded-xl mb-8">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary-500 rounded-lg shadow-lg transition-transform duration-300 ease-out`}
                            style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
                        />
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(''); }}
                            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${mode === 'login' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('register'); setError(''); }}
                            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${mode === 'register' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm animate-fade-in flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0"></div>
                            <span>{error}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-sm animate-fade-in flex items-center space-x-3">
                            <Shield size={16} className="shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <div className="animate-fade-in space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field py-3 text-lg"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Jane Doe"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Role</label>
                                        <select
                                            className="input-field py-3"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as any)}
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="company_admin">Company Admin</option>
                                            <option value="client">Client</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Company Name</label>
                                        <input
                                            type="text"
                                            className="input-field py-3"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Optional (Creates new)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Employee ID</label>
                                        <input
                                            type="text"
                                            className="input-field py-3"
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Work Email</label>
                                <input
                                    type="email"
                                    className="input-field py-3 text-lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Password</label>
                                    {mode === 'login' && (
                                        <a href="#" className="text-xs text-primary-500 hover:text-primary-400 font-bold transition-colors">Forgot password?</a>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    className="input-field py-3 text-lg"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Sign in to Workspace' : 'Create Free Account'}</span>
                                    {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
