/**
 * Issue Edit Form Component
 * Provides a UI for updating issue attributes. Dynamically restricts assignee 
 * selection based on the authenticated user's Role-Based Access Control (RBAC) weight.
 */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ROLE_WEIGHTS = { superadmin: 100, owner: 100, it: 90, admin: 80, manager: 50, developer: 10 };

export const IssueEditForm = ({ issue, onSave, onCancel, isSaving, users }) => {
    const { user } = useAuth();

    // Form State mapped from existing issue
    const [formData, setFormData] = useState({
        title: issue.title,
        description: issue.description || "",
        status: issue.status,
        priority: issue.priority,
        type: issue.type,
        git_url: issue.git_url || "",
        assignee_id: issue.assignee_id || ""
    });

    // RBAC: Filter assignable users based on current user's authority level
    const currentUserWeight = ROLE_WEIGHTS[user?.role?.toLowerCase()] || 0;
    const assignableUsers = users.filter(u => {
        const targetWeight = ROLE_WEIGHTS[u.role?.toLowerCase()] || 0;
        return String(u.id) === String(user.id) || (currentUserWeight >= 50 && targetWeight < currentUserWeight);
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean up the payload before sending it to the backend
        const payload = { ...formData };

        // Convert the empty string from the dropdown into a proper database 'null'
        if (payload.assignee_id === "") {
            payload.assignee_id = null;
        }

        onSave(payload);
    };

    // Shared Styling
    const inputClasses = "w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100";
    const labelClasses = "block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1";

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className={labelClasses}>Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClasses} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses}>
                        <option value="open">Open</option><option value="in_progress">In Progress</option><option value="done">Done</option>
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Assignee</label>
                    <select value={formData.assignee_id} onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })} className={inputClasses}>
                        <option value="">Unassigned</option>
                        {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses}>
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Type</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputClasses}>
                        <option value="bug">Bug</option><option value="task">Task</option><option value="feature">Feature</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClasses}>Git URL</label>
                <input type="url" value={formData.git_url} onChange={(e) => setFormData({ ...formData, git_url: e.target.value })} className={inputClasses} />
            </div>

            <div>
                <label className={labelClasses}>Description</label>
                <textarea required rows="6" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClasses} resize-none`}></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#30363d]">
                <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#30363d] rounded-md hover:bg-slate-100 dark:hover:bg-[#161b22] transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-1.5 bg-[#2da44e] text-white text-sm font-medium rounded-md hover:bg-[#2c974b] transition-colors shadow-sm disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
};