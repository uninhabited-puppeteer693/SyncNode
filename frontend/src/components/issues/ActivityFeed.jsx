/**
 * Activity Feed Component
 * Renders a chronological timeline of audit logs associated with an issue.
 */

// Formatters kept outside the component to prevent recreation on every render
const formatDate = (dateString) => new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const formatActionName = (action) => {
    if (action === "UPDATED_ASSIGNEE_ID") return "assignee";
    return action.replace("UPDATED_", "").toLowerCase().replace("_", " ");
};

export const ActivityFeed = ({ logs, loadingLogs, users }) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const formatValue = (action, val) => {
        if (val === "None" || val === null) return action === "UPDATED_ASSIGNEE_ID" ? "Unassigned" : "None";
        
        if (action === "UPDATED_ASSIGNEE_ID") {
            const foundUser = users.find(u => String(u.id) === String(val));
            return foundUser ? `${foundUser.first_name} ${foundUser.last_name}` : "Unknown User";
        }
        return val;
    };

    return (
        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-[#30363d]">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide">
                Activity
            </h3>
            
            {loadingLogs ? (
                <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400">Loading history...</div>
            ) : sortedLogs.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#161b22] rounded-md border border-slate-100 dark:border-[#30363d]/50">No activity recorded yet.</div>
            ) : (
                <div className="space-y-4">
                    {sortedLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 overflow-hidden">
                                {log.actor?.avatar_url ? <img src={log.actor.avatar_url} alt="User" className="w-full h-full object-cover" /> : log.actor ? log.actor.first_name[0] : "⚙️"}
                            </div>
                            <div className="flex-1 text-sm pt-0.5">
                                <span className="font-semibold text-slate-900 dark:text-slate-200 mr-1.5">
                                    {log.actor ? `${log.actor.first_name} ${log.actor.last_name}` : "System"}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">
                                    {log.action.startsWith("UPDATED_") ? (
                                        <>changed <span className="font-medium text-slate-800 dark:text-slate-300">{formatActionName(log.action)}</span> from <span className="line-through mx-1">{formatValue(log.action, log.old_value)}</span> to <span className="font-medium text-slate-900 dark:text-slate-200 ml-1">{formatValue(log.action, log.new_value)}</span></>
                                    ) : (
                                        <span className="font-medium">{log.action.replace("_", " ").toLowerCase()}</span>
                                    )}
                                </span>
                                <span className="block text-xs text-slate-500 mt-0.5">{formatDate(log.created_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};