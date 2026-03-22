/**
 * Issue Side Panel Container
 * Acts as the detailed view for a selected issue. Conditionally renders 
 * either the Read-Only view (with Activity Feed) or the Edit Form.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { ActivityFeed } from "./ActivityFeed";
import { IssueEditForm } from "./IssueEditForm";

// --- Sub-components ---

/**
 * Empty State View
 * Displayed when no issue is actively selected from the master list.
 */
const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-[#0d1117]">
        <div className="w-16 h-16 bg-white dark:bg-[#161b22] shadow-sm border border-slate-200 dark:border-[#30363d] rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">No issue selected</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">Select an issue from the list to view its details, update its status, or view its history.</p>
    </div>
);


// UI Color Mapping Helpers
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10';
        case 'medium': return 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10';
        case 'low': return 'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-900/10';
        default: return 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'done': return 'text-[#2da44e] border-[#2da44e]/30 bg-[#2da44e]/10';
        case 'in_progress': return 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/10';
        case 'open': return 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10';
        default: return 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]';
    }
};

const getTypeColor = (type) => {
    switch (type) {
        case 'bug': return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10';
        case 'feature': return 'text-[#2da44e] border-[#2da44e]/30 bg-[#2da44e]/10';
        case 'task': return 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/10';
        default: return 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]';
    }
};

// --- Main Component ---

export const IssueSidePanel = ({ issue, onClose, onUpdate, users }) => {
    const { user } = useAuth();

    // Panel View State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Audit Trail State
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // --- Side Effects & Data Fetching ---

    /**
     * Memoized Fetch Logs Function
     * Wrapped in useCallback so it's only recreated when the selected issue ID changes.
     * Prevents infinite loops when used inside the useEffect dependency array.
     */
    const fetchLogs = useCallback(async () => {
        if (!issue?.id) return;
        setLoadingLogs(true);
        try {
            const response = await api.get(`/issues/${issue.id}/logs`);
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    }, [issue?.id]);

    /**
     * Issue Selection Listener
     * Resets the view to read-only and fetches the relevant audit trail
     * whenever the user clicks a new issue in the master list.
     */
    useEffect(() => {
        setIsEditing(false);
        if (issue) {
            fetchLogs();
        }
    }, [issue, fetchLogs]);

    // --- Action Handlers ---

    const handleSave = async (updatedData) => {
        setIsSaving(true);
        try {
            await api.put(`/issues/${issue.id}`, updatedData);
            await onUpdate(); // Refresh the master list
            setIsEditing(false); // Return to view mode
            fetchLogs(); // Refresh the activity feed
        } catch (error) {
            alert(`Failed to update issue: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this issue permanently?")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/issues/${issue.id}`);
            onClose(); // Hide the panel entirely
            onUpdate(); // Refresh the master list to remove the deleted issue
        } catch (error) {
            alert(`Failed to delete issue: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Render Logic ---

    if (!issue) return <EmptyState />;

    return (
        <>
            {/* Header Area: Contains Issue ID and Primary Actions */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between bg-white dark:bg-[#0d1117] shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">SYS-{issue.id.substring(0, 4).toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                    {!isEditing && (
                        <>
                            {['manager', 'admin', 'owner', 'superadmin'].includes(user?.role?.toLowerCase()) && (
                                <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete Issue">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            )}
                            <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors" title="Edit Issue">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </>
                    )}
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors lg:hidden" title="Close Panel">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Scrollable Content Area: Conditionally renders Edit Form or Details View */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0d1117]">
                {isEditing ? (
                    <IssueEditForm issue={issue} onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving} users={users} />
                ) : (
                    <div className="p-6">

                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border text-slate-600 border-slate-200 dark:text-slate-400 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]">{issue.type}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">{issue.title}</h2>

                        {/* Quick Data Grid */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-8 p-4 bg-slate-50 dark:bg-[#161b22] rounded-lg border border-slate-100 dark:border-[#30363d]/50 mb-8">
                            {/* Assignee */}
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Assignee</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#30363d] overflow-hidden flex items-center justify-center text-xs text-slate-500">
                                        {issue.assignee?.avatar_url ? <img src={issue.assignee.avatar_url} className="w-full h-full object-cover" /> : issue.assignee?.first_name[0] || "❓"}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{issue.assignee ? `${issue.assignee.first_name} ${issue.assignee.last_name}` : "Unassigned"}</span>
                                </div>
                            </div>

                            {/* Creator - Added previous fix here too */}
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Creator</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#30363d] overflow-hidden flex items-center justify-center text-xs text-slate-500">
                                        {issue.creator?.avatar_url ? <img src={issue.creator.avatar_url} className="w-full h-full object-cover" /> : issue.creator?.first_name[0] || "⚙️"}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{issue.creator ? `${issue.creator.first_name} ${issue.creator.last_name}` : "System"}</span>
                                </div>
                            </div>

                            {/* Type - NOW COLORED! */}
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</span>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getTypeColor(issue.type)}`}>
                                    {issue.type}
                                </span>
                            </div>

                            {/* Status - NOW COLORED! */}
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</span>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(issue.status)}`}>
                                    {issue.status.replace("_", " ")}
                                </span>
                            </div>

                            {/* Priority - NOW COLORED! */}
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority</span>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getPriorityColor(issue.priority)}`}>
                                    {issue.priority}
                                </span>
                            </div>

                            {/* Git Link */}
                            <div>
                                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Repository</span>
                                {issue.git_url ? (
                                    <a href={issue.git_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" /></svg>
                                        View Commit/PR
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-600 italic">No link connected</span>
                                )}
                            </div>
                        </div>

                        {/* Full Description */}
                        <div>
                            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</span>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {issue.description ? issue.description : <span className="text-slate-400 italic">No description provided.</span>}
                            </div>
                        </div>

                        {/* Audit Log Timeline */}
                        <ActivityFeed logs={logs} loadingLogs={loadingLogs} users={users} />
                    </div>
                )}
            </div>
        </>
    );
};