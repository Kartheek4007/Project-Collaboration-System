import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText, CheckCircle2, XCircle, Clock, Plus, ExternalLink, MessageSquare, ArrowLeft
} from 'lucide-react';
import { deliverableApi, projectApi } from '../services/api';

const Deliverables: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deliverables, setDeliverables] = useState<any[]>([]);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDeliverable, setNewDeliverable] = useState({ title: '', description: '', file_path: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (projectId) {
                    // Project-scoped view
                    const [delRes, projRes] = await Promise.all([
                        deliverableApi.list(parseInt(projectId)),
                        projectApi.get(parseInt(projectId))
                    ]);
                    setDeliverables(delRes.data);
                    setProject(projRes.data);
                } else {
                    // Standalone view — load all projects then all their deliverables
                    const projRes = await projectApi.list();
                    setProject(null);
                    const all: any[] = [];
                    await Promise.all(
                        projRes.data.map(async (p: any) => {
                            try {
                                const delRes = await deliverableApi.list(p.id);
                                delRes.data.forEach((d: any) => all.push({ ...d, projectTitle: p.title }));
                            } catch { }
                        })
                    );
                    setDeliverables(all);
                }
            } catch (err) {
                console.error("Failed to fetch deliverables", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await deliverableApi.create({
                ...newDeliverable,
                project_id: parseInt(projectId!)
            });
            setDeliverables([...deliverables, response.data]);
            setShowModal(false);
            setNewDeliverable({ title: '', description: '', file_path: '' });
        } catch (err) {
            alert("Failed to create deliverable");
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            const response = await deliverableApi.updateStatus(id, status);
            setDeliverables(deliverables.map(d => d.id === id ? response.data : d));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-[var(--text-muted)]">Loading deliverables flow...</div>;

    const canSubmit = user?.role !== 'client';
    const canApprove = user?.role === 'client' || user?.role === 'super_admin';

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    {projectId && (
                        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/5 rounded-xl transition-all text-[var(--text-muted)]">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-main)]">
                            {project ? 'Project Deliverables' : 'All Deliverables'}
                        </h2>
                        <p className="text-[var(--text-muted)] mt-1">
                            {project ? `Submit and review work packages for "${project.title}".` : 'All deliverables across your assigned projects.'}
                        </p>
                    </div>
                </div>
                {canSubmit && projectId && (
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
                        <Plus size={18} /><span>Submit Deliverable</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {deliverables.length === 0 ? (
                    <div className="glass-panel p-12 text-center border-dashed border-2">
                        <FileText className="mx-auto text-[var(--text-muted)] opacity-20 mb-4" size={48} />
                        <p className="text-[var(--text-muted)] italic">No deliverables have been submitted for this project yet.</p>
                    </div>
                ) : (
                    deliverables.map((del) => (
                        <div key={del.id} className="glass-card flex flex-col md:flex-row md:items-center gap-6 p-8 group hover:border-primary-500/30 transition-all">
                            <div className="w-16 h-16 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-500 shrink-0">
                                <FileText size={32} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-1">
                                    <h4 className="text-xl font-bold text-[var(--text-main)] truncate">{del.title}</h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${del.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                        del.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                            'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {del.status}
                                    </span>
                                </div>
                                <p className="text-[var(--text-muted)] text-sm line-clamp-2">{del.description}</p>
                                <div className="flex items-center space-x-4 mt-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                    <span className="flex items-center space-x-1"><Clock size={12} /> <span>{new Date(del.submitted_at).toLocaleDateString()}</span></span>
                                    {del.projectTitle && <span className="text-primary-500">{del.projectTitle}</span>}
                                    {del.file_path && <a href={del.file_path} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-primary-500 hover:text-primary-400"><ExternalLink size={12} /> <span>View Artifact</span></a>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {canApprove && del.status === 'Pending Approval' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(del.id, 'Approved')}
                                            className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                            title="Approve"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(del.id, 'Rejected')}
                                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                            title="Reject"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </>
                                )}
                                <button className="p-3 bg-white/5 text-[var(--text-muted)] hover:text-primary-500 rounded-xl transition-all">
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Submit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative glass-panel w-full max-w-lg p-8 shadow-2xl animate-slide-up">
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mb-6">Submit Project Deliverable</h3>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Package Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field w-full"
                                    placeholder="e.g., Q1 Performance Audit Report"
                                    value={newDeliverable.title}
                                    onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Executive Summary</label>
                                <textarea
                                    className="input-field w-full h-32"
                                    required
                                    placeholder="Describe the contents and results..."
                                    value={newDeliverable.description}
                                    onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Artifact Link (PDF/Zip)</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="https://cloud.storage/path/to/file"
                                    value={newDeliverable.file_path}
                                    onChange={(e) => setNewDeliverable({ ...newDeliverable, file_path: e.target.value })}
                                />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-3">Submit for Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deliverables;
