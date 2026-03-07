import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    CheckCircle2,
    Clock,
    Flame,
    Tag,
    Calendar,
    MessageSquare,
    History,
    Paperclip
} from 'lucide-react';
import { taskApi, projectApi, collabApi } from '../services/api';

const Tasks: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'company_admin' || user?.role === 'super_admin';
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [showFeedback, setShowFeedback] = useState<string | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        project_id: 0,
        priority: 'Medium',
        due_date: '',
        estimated_hours: 0,
        assigned_company_id: user?.company_id || 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, projectsRes] = await Promise.all([
                    taskApi.list(),
                    projectApi.list()
                ]);
                setTasks(tasksRes.data);
                setProjects(projectsRes.data);
                if (projectsRes.data.length > 0) {
                    setNewTask(prev => ({ ...prev, project_id: projectsRes.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch tasks/projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.company_id]);

    useEffect(() => {
        if (selectedTask) {
            const fetchComments = async () => {
                const res = await collabApi.listComments(selectedTask.id);
                setComments(res.data);
            };
            fetchComments();
        }
    }, [selectedTask]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await taskApi.create({
                ...newTask,
                due_date: new Date(newTask.due_date).toISOString(),
                status: 'Todo'
            });
            setShowFeedback("Task created successfully!");
            setShowCreateModal(false);
            const response = await taskApi.list();
            setTasks(response.data);
        } catch (err) {
            setShowFeedback("Error creating task.");
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await taskApi.updateStatus(id, status);
            const response = await taskApi.list();
            setTasks(response.data);
            if (selectedTask?.id === id) {
                setSelectedTask({ ...selectedTask, status });
            }
            setShowFeedback(`Status updated to ${status}`);
        } catch (err) {
            setShowFeedback("Failed to update status.");
        }
    };

    const handleUpdateProgress = async (id: number, progress: number) => {
        try {
            await taskApi.updateProgress(id, progress);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, progress } : t));
            if (selectedTask?.id === id) setSelectedTask((prev: any) => ({ ...prev, progress }));
            setShowFeedback(`Progress updated to ${progress}%`);
            setTimeout(() => setShowFeedback(null), 2000);
        } catch (err) {
            setShowFeedback("Failed to update progress.");
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;
        try {
            await collabApi.addComment({
                task_id: selectedTask.id,
                message: newComment
            });
            setNewComment('');
            const res = await collabApi.listComments(selectedTask.id);
            setComments(res.data);
        } catch (err) {
            console.error("Error adding comment", err);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {showFeedback && (
                <div className="fixed top-28 right-8 z-50 animate-slide-up">
                    <div className="bg-primary-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20">
                        <CheckCircle2 size={20} />
                        <span className="font-bold">{showFeedback}</span>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                    <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10 shadow-2xl animate-scale-in">
                        <div className="p-8 border-b border-white/5 flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(selectedTask.priority)}`}>
                                        {selectedTask.priority}
                                    </span>
                                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">OBJ-#{selectedTask.id}</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white font-outfit">{selectedTask.title}</h3>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                <Plus size={24} className="rotate-45 text-dark-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-8">
                                <section className="space-y-3">
                                    <h4 className="text-xs font-bold text-primary-500 uppercase tracking-widest">Objective Details</h4>
                                    <p className="text-dark-300 leading-relaxed italic">{selectedTask.description || 'No detailed description provided for this objective.'}</p>
                                </section>

                                <section className="space-y-4 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-primary-500 uppercase tracking-widest">Artifacts & Enclosures</h4>
                                        <button className="text-xs font-bold text-dark-400 hover:text-primary-500 flex items-center space-x-1.5 transition-colors">
                                            <Paperclip size={14} />
                                            <span>Attach Material</span>
                                        </button>
                                    </div>
                                    <div className="glass-panel p-6 text-center border-dashed border">
                                        <p className="text-dark-400 text-xs italic">Secure file uplink ready. No attachments detected.</p>
                                    </div>
                                </section>

                                {/* Progress Tracker — visible to Employees & Admins */}
                                {user?.role !== 'client' && (
                                    <section className="space-y-4 pt-6 border-t border-white/5">
                                        <h4 className="text-xs font-bold text-primary-500 uppercase tracking-widest">Task Progress</h4>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={selectedTask.progress ?? 0}
                                                onChange={e => setSelectedTask((prev: any) => ({ ...prev, progress: parseInt(e.target.value) }))}
                                                onMouseUp={e => handleUpdateProgress(selectedTask.id, parseInt((e.target as HTMLInputElement).value))}
                                                onTouchEnd={e => handleUpdateProgress(selectedTask.id, parseInt((e.target as HTMLInputElement).value))}
                                                className="flex-1 h-2 cursor-pointer accent-primary-500"
                                            />
                                            <span className="w-12 text-right text-sm font-bold text-primary-400">{selectedTask.progress ?? 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
                                                style={{ width: `${selectedTask.progress ?? 0}%` }}
                                            />
                                        </div>
                                    </section>
                                )}

                                <section className="space-y-4 pt-8 border-t border-white/5">
                                    <h4 className="text-xs font-bold text-primary-500 uppercase tracking-widest">Collaborative Discussion</h4>
                                    <div className="space-y-4">
                                        {comments.map((c, i) => (
                                            <div key={i} className="flex space-x-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="w-10 h-10 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">U{c.user_id}</div>
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-xs font-bold text-white">UserID #{c.user_id}</span>
                                                        <span className="text-[10px] text-dark-500">{new Date(c.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p className="text-sm text-dark-300">{c.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <form onSubmit={handleAddComment} className="relative mt-6">
                                            <input
                                                className="input-field py-4 pr-16 text-sm"
                                                placeholder="Contribute to this discussion..."
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                            />
                                            <button className="absolute right-2 top-2 p-2 bg-primary-500 text-white rounded-xl hover:scale-105 transition-all">
                                                <MessageSquare size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8 bg-white/5 p-6 rounded-3xl border border-white/5 h-fit">
                                <section>
                                    <h4 className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-4">Lifecycle Status</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Todo', 'In Progress', 'Testing', 'Done'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdateStatus(selectedTask.id, s)}
                                                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${selectedTask.status === s ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20' : 'bg-white/5 text-dark-400 border-white/5 hover:bg-white/10'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section className="pt-6 border-t border-white/10 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-dark-400">Timeline Impact</span>
                                        <span className="text-white font-bold">{selectedTask.estimated_hours}h</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-dark-400">Target Date</span>
                                        <span className="text-white font-bold">{new Date(selectedTask.due_date).toLocaleDateString()}</span>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="glass-panel w-full max-w-xl p-8 border border-white/10 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white font-outfit">New Objective</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-dark-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Target Project</label>
                                <select
                                    className="input-field py-3"
                                    value={newTask.project_id}
                                    onChange={e => setNewTask({ ...newTask, project_id: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value={0} disabled>— Select Project —</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Task Title</label>
                                <input
                                    className="input-field py-3"
                                    placeholder="e.g., Database Migration Phase 1"
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Priority</label>
                                    <select
                                        className="input-field py-3"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Due Date</label>
                                    <input
                                        type="date"
                                        className="input-field py-3"
                                        required
                                        value={newTask.due_date}
                                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary text-base">Cancel</button>
                                <button type="submit" disabled={!newTask.project_id} className="flex-[2] btn-primary text-base disabled:opacity-50 disabled:cursor-not-allowed">
                                    {projects.length === 0 ? 'No Projects Available' : 'Deploy Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">Task Management</h2>
                    <p className="text-[var(--text-muted)] mt-1">Track and update collaborative task progress.</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Create Task</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 glass-panel animate-pulse bg-white/5 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="glass-panel group p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-500/50 transition-all cursor-pointer"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                        ID: #TK-{task.id}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-[var(--text-main)] group-hover:text-primary-500 transition-colors">
                                    {task.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                                    <div className="flex items-center space-x-1.5">
                                        <Tag size={12} className="text-primary-500" />
                                        <span>Proj #{task.project_id}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Calendar size={12} className="text-primary-500" />
                                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Clock size={12} className="text-primary-500" />
                                        <span>{task.estimated_hours}h est.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right hidden md:block">
                                    <div className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-1">{task.status}</div>
                                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-500"
                                            style={{ width: task.status === 'Done' ? '100%' : task.status === 'Testing' ? '75%' : task.status === 'In Progress' ? '40%' : '10%' }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button title="Log Time" className="p-3 bg-white/5 hover:bg-primary-500/10 text-[var(--text-muted)] hover:text-primary-500 rounded-xl transition-all border border-[var(--border-color)]">
                                        <History size={18} />
                                    </button>
                                    <button title="Discussion" className="p-3 bg-white/5 hover:bg-indigo-500/10 text-[var(--text-muted)] hover:text-indigo-500 rounded-xl transition-all border border-[var(--border-color)]">
                                        <MessageSquare size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task.id, 'Done'); }}
                                        title="Mark Complete"
                                        className={`p-3 rounded-xl transition-all border border-[var(--border-color)] ${task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-500'}`}
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {tasks.length === 0 && (
                        <div className="py-20 text-center glass-panel border-dashed border-2">
                            <Flame className="mx-auto mb-4 text-orange-500 opacity-30" size={48} />
                            <p className="text-[var(--text-muted)] font-medium">Workspace is clear. No active tasks assigned to your company.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tasks;
