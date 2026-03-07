import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Clock,
    Calendar,
    History,
    Timer,
    Plus,
    User
} from 'lucide-react';
import { collabApi, taskApi } from '../services/api';

const TimeLogs: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [timeLogs, setTimeLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [newLog, setNewLog] = useState({
        hours: 1,
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await taskApi.list();
                setTasks(response.data);
                if (response.data.length > 0) {
                    setSelectedTaskId(response.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch tasks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        if (selectedTaskId) {
            const fetchLogs = async () => {
                try {
                    const response = await collabApi.listTimeLogs(selectedTaskId);
                    setTimeLogs(response.data);
                } catch (err) {
                    console.error("Failed to fetch time logs", err);
                }
            }
            fetchLogs();
        }
    }, [selectedTaskId]);

    const handleLogTime = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTaskId) return;
        try {
            await collabApi.logTime({
                ...newLog,
                task_id: selectedTaskId,
                date: new Date(newLog.date).toISOString()
            });
            setShowLogModal(false);
            const response = await collabApi.listTimeLogs(selectedTaskId);
            setTimeLogs(response.data);
        } catch (err) {
            console.error("Error logging time", err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">Workload Logging</h2>
                    <p className="text-[var(--text-muted)] mt-1">Monitor and record time dedicated to ecosystem tasks.</p>
                </div>
                {selectedTaskId && (
                    <button onClick={() => setShowLogModal(true)} className="btn-primary flex items-center space-x-2">
                        <Timer size={18} />
                        <span>Log Worked Hours</span>
                    </button>
                )}
            </div>

            {/* Selection Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-2 block">Active Task Target</label>
                    <select
                        className="input-field py-3 text-sm"
                        value={selectedTaskId || ''}
                        onChange={(e) => setSelectedTaskId(parseInt(e.target.value))}
                    >
                        {tasks.map(t => (
                            <option key={t.id} value={t.id}>{t.title} (#TK-{t.id})</option>
                        ))}
                    </select>
                </div>
            </div>

            {showLogModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="glass-panel w-full max-w-lg p-8 border border-white/10 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white font-outfit">Log Working Time</h3>
                            <button onClick={() => setShowLogModal(false)} className="text-dark-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleLogTime} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Hours Worked</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="input-field py-3"
                                        required
                                        value={newLog.hours}
                                        onChange={e => setNewLog({ ...newLog, hours: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        className="input-field py-3"
                                        required
                                        value={newLog.date}
                                        onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Work Description</label>
                                <textarea
                                    className="input-field py-3"
                                    placeholder="Briefly explain what you accomplished..."
                                    required
                                    value={newLog.description}
                                    onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 btn-secondary text-base">Cancel</button>
                                <button type="submit" className="flex-[2] btn-primary text-base">Commit Log</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 glass-panel animate-pulse bg-white/5 rounded-2xl"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {timeLogs.length > 0 ? timeLogs.map((log) => (
                        <div key={log.id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group">
                            <div className="flex items-center space-x-6">
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 group-hover:scale-110 transition-transform">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className="text-lg font-bold text-[var(--text-main)]">{log.hours} Hours</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Verified</span>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] italic max-w-sm line-clamp-1">{log.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 text-right">
                                <div className="hidden md:block">
                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-end space-x-1 mb-1">
                                        <Calendar size={10} />
                                        <span>Logged Date</span>
                                    </div>
                                    <div className="text-sm font-bold text-[var(--text-main)]">{new Date(log.date).toLocaleDateString()}</div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-end space-x-1 mb-1">
                                        <User size={10} />
                                        <span>Collaborator</span>
                                    </div>
                                    <div className="text-sm font-bold text-primary-500 font-mono italic">UID-#{log.user_id}</div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center glass-panel border-dashed border-2 bg-white/[0.02]">
                            <History className="mx-auto mb-4 text-dark-500 opacity-20" size={48} />
                            <p className="text-[var(--text-muted)] font-medium">No activity history for this task.</p>
                            <p className="text-[10px] text-dark-500 uppercase mt-2 italic font-bold">Waiting for workload input...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimeLogs;
