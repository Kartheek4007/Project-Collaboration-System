import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Flag,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import { collabApi, projectApi } from '../services/api';

const Milestones: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newMilestone, setNewMilestone] = useState({
        title: '',
        description: '',
        due_date: '',
        status: 'pending'
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectApi.list();
                setProjects(response.data);
                if (response.data.length > 0) {
                    setSelectedProjectId(response.data[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            const fetchMilestones = async () => {
                try {
                    const response = await collabApi.listMilestones(selectedProjectId);
                    setMilestones(response.data);
                } catch (err) {
                    console.error("Failed to fetch milestones", err);
                }
            }
            fetchMilestones();
        }
    }, [selectedProjectId]);

    const handleCreateMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) return;
        try {
            await collabApi.createMilestone({
                ...newMilestone,
                project_id: selectedProjectId,
                due_date: new Date(newMilestone.due_date).toISOString()
            });
            setShowCreateModal(false);
            const response = await collabApi.listMilestones(selectedProjectId);
            setMilestones(response.data);
        } catch (err) {
            console.error("Error creating milestone", err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)]">Project Milestones</h2>
                    <p className="text-[var(--text-muted)] mt-1">Track high-level progress and critical achievement deadlines.</p>
                </div>
                {user?.role !== 'client' && selectedProjectId && (
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Add Milestone</span>
                    </button>
                )}
            </div>

            {/* Selection Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-2 block">Active Project</label>
                    <select
                        className="input-field py-3"
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                    <div className="glass-panel w-full max-w-lg p-8 border border-white/10 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white font-outfit">Define New Milestone</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-dark-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateMilestone} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Milestone Title</label>
                                <input
                                    className="input-field py-3"
                                    placeholder="e.g., MVP Beta Launch"
                                    required
                                    value={newMilestone.title}
                                    onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Target Date</label>
                                <input
                                    type="date"
                                    className="input-field py-3"
                                    required
                                    value={newMilestone.due_date}
                                    onChange={e => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    className="input-field py-3"
                                    placeholder="Summarize the achievement criteria..."
                                    required
                                    value={newMilestone.description}
                                    onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary text-base">Cancel</button>
                                <button type="submit" className="flex-[2] btn-primary text-base">Set Milestone</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 glass-panel animate-pulse bg-white/5"></div>)}
                </div>
            ) : (
                <div className="relative border-l-2 border-primary-500/20 ml-6 pl-8 space-y-12 py-4">
                    {milestones.length > 0 ? milestones.map((milestone) => (
                        <div key={milestone.id} className="relative group">
                            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-[var(--bg-main)] shadow-[0_0_15px_rgba(14,165,233,0.5)] z-10"></div>
                            <div className="glass-panel p-6 group-hover:border-primary-500/50 transition-all cursor-default">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">
                                            <Calendar size={12} />
                                            <span>Deadline: {new Date(milestone.due_date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-[var(--text-main)]">{milestone.title}</h4>
                                    </div>
                                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${milestone.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'}`}>
                                        {milestone.status === 'completed' ? <CheckCircle2 size={12} /> : <Flag size={12} />}
                                        <span>{milestone.status}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">{milestone.description}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center glass-panel border-dashed border-2 ml-[-32px]">
                            <Flag className="mx-auto mb-4 text-primary-500 opacity-20" size={48} />
                            <p className="text-[var(--text-muted)]">No milestones defined for this project yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Milestones;
