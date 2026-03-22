/**
 * New Issue Creation Modal
 * Provides the form interface for creating new trackable tasks or bugs.
 */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export const NewIssueModal = ({ isOpen, onClose, onSuccess, users = [] }) => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({ 
        title: "", 
        description: "", 
        priority: "medium", 
        type: "bug", 
        status: "open", 
        assignee_id: "", 
        git_url: "" 
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            await api.post("/issues/", { ...formData, assignee_id: formData.assignee_id || null });
            
            // Reset form on success
            setFormData({ title: "", description: "", priority: "medium", type: "bug", status: "open", assignee_id: "", git_url: "" });
            onSuccess();
            onClose();
        } catch (error) { 
            // Fixed the alert bug to actually display the template literal error message!
            alert(`Failed to create issue: ${error.response?.data?.detail || error.message}`); 
        } finally { 
            setIsSaving(false); 
        }
    };

    // RBAC logic to determine if the user has permission to assign tasks to others
    const canAssign = ['owner', 'admin', 'manager', 'superadmin'].includes(user?.role?.toLowerCase());
    
    const inputClasses = "w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100";
    const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

    return (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-[#30363d]">
                
                <div className="p-4 border-b border-slate-200 dark:border-[#30363d] flex justify-between items-center bg-slate-50 dark:bg-[#161b22]">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create New Issue</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <form id="new-issue-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={labelClasses}>Issue Title</label>
                            <input required type="text" placeholder="e.g., Fix login page crashing on mobile" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClasses} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Type</label>
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClasses}>
                                    <option value="bug">Bug</option><option value="task">Task</option><option value="feature">Feature</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Priority</label>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses}>
                                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Initial Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses}>
                                    <option value="open">Open</option><option value="in_progress">In Progress</option><option value="done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Assignee</label>
                                <select value={formData.assignee_id} onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })} className={inputClasses}>
                                    <option value="">Unassigned</option>
                                    {canAssign ? (
                                        users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)
                                    ) : (
                                        <option value={user?.id}>Assign to me</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Git URL (Optional)</label>
                            <input type="url" placeholder="https://github.com/..." value={formData.git_url} onChange={(e) => setFormData({ ...formData, git_url: e.target.value })} className={inputClasses} />
                        </div>

                        <div>
                            <label className={labelClasses}>Description</label>
                            <textarea required rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClasses} resize-none`}></textarea>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-[#30363d] flex justify-end gap-2 bg-slate-50 dark:bg-[#161b22]">
                    <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm font-medium border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#0d1117]">Cancel</button>
                    <button type="submit" form="new-issue-form" disabled={isSaving} className="px-4 py-1.5 bg-[#2da44e] text-white text-sm font-medium rounded-md hover:bg-[#2c974b] shadow-sm disabled:opacity-50">
                        {isSaving ? "Creating..." : "Create Issue"}
                    </button>
                </div>
            </div>
        </div>
    );
};