import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    Clock,
    LogOut,
    Menu,
    Building2,
    BarChart3,
    CheckSquare,
    Sun,
    Moon,
    Search,
    ChevronRight,
    User,
} from 'lucide-react';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
        >
            <div className={`${isActive ? 'text-white' : 'text-dark-400 group-hover:text-white transition-colors'}`}>
                {icon}
            </div>
            <span className="flex-1">{label}</span>
            {isActive && <ChevronRight size={14} className="opacity-60" />}
        </Link>
    );
};

const Layout: React.FC = () => {
    const { user, logout, theme, toggleTheme } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNavItems = () => {
        switch (user?.role) {
            case 'super_admin':
                return [
                    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'System Overview' },
                    { to: '/companies', icon: <Building2 size={20} />, label: 'Companies' },
                    { to: '/employees', icon: <Users size={20} />, label: 'All Users' },
                    { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Global Analytics' },
                ];
            case 'company_admin':
                return [
                    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                    { to: '/projects', icon: <FolderKanban size={20} />, label: 'Projects' },
                    { to: '/employees', icon: <Users size={20} />, label: 'Company Users' },
                    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Task Board' },
                ];
            case 'employee':
                return [
                    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                    { to: '/projects', icon: <FolderKanban size={20} />, label: 'My Projects' },
                    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'My Tasks' },
                    { to: '/time-logs', icon: <Clock size={20} />, label: 'Time Logs' },
                ];
            case 'client':
                return [
                    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                    { to: '/projects', icon: <FolderKanban size={20} />, label: 'My Projects' },
                    { to: '/milestones', icon: <CheckSquare size={20} />, label: 'Milestones' },
                    { to: '/deliverables', icon: <BarChart3 size={20} />, label: 'Deliverables' },
                ];
            default:
                return [
                    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                    { to: '/projects', icon: <FolderKanban size={20} />, label: 'Projects' },
                ];
        }
    };

    return (
        <div className="flex h-screen bg-transparent overflow-hidden">
            {/* Sidebar */}
            <aside className={`bg-[var(--bg-panel)] backdrop-blur-3xl border-r border-[var(--border-color)] flex flex-col transition-all duration-500 z-50 ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 pointer-events-none'}`}>
                <div className="p-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="font-bold text-white text-xl">C</span>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 tracking-tight">CollabHub</span>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar my-4">
                    <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-[0.2em] mb-4 ml-4">Main Menu</div>
                    {getNavItems().map((item) => (
                        <SidebarItem key={item.to} {...item} />
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Top Header */}
                <header className="h-24 px-8 border-b border-[var(--border-color)] flex items-center justify-between z-40 bg-[var(--bg-panel)] backdrop-blur-md">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-white/5 hover:bg-primary-500/10 text-[var(--text-main)] hover:text-primary-500 rounded-2xl transition-all cursor-pointer border border-[var(--border-color)]"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="input-field py-2.5 pl-12 pr-6 w-64 lg:w-96 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-3 bg-white/5 hover:bg-primary-500/10 text-[var(--text-main)] hover:text-primary-500 rounded-2xl transition-all cursor-pointer border border-[var(--border-color)]"
                        >
                            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                        <div className="h-10 w-[1px] bg-[var(--border-color)] mx-2"></div>
                        <div className="relative z-50" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-[var(--text-main)]">{user?.name}</p>
                                    <p className="text-[10px] text-primary-500 font-bold uppercase tracking-tight">{user?.role.replace('_', ' ')}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg shadow-primary-500/20">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-[var(--bg-main)] border border-[var(--border-color)] shadow-2xl rounded-2xl py-2 z-50 animate-fade-in origin-top-right">
                                    <div className="px-5 py-4 border-b border-[var(--border-color)]">
                                        <p className="text-sm font-bold text-[var(--text-main)] truncate">{user?.name}</p>
                                        <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                                        {user?.company_name && (
                                            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mt-1.5 truncate">🏢 {user.company_name}</p>
                                        )}
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-[var(--text-main)] hover:bg-white/5 hover:text-primary-500 rounded-xl transition-colors font-medium"
                                        >
                                            <User size={16} />
                                            <span>My Profile</span>
                                        </Link>
                                    </div>
                                    <div className="p-2 border-t border-[var(--border-color)]">
                                        <button
                                            onClick={() => { setIsProfileOpen(false); logout(); }}
                                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-medium group"
                                        >
                                            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-slide-up">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
