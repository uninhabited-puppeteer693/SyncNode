/**
 * Issue List Item Card
 * Displays high-level issue metrics in the master list view.
 */

// UI Color Mapping Helpers
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

export const IssueCard = ({ issue, isSelected, onClick, currentUser, onClaim }) => {
    const isUnassigned = !issue.assignee_id;

    return (
        <li
            onClick={onClick}
            className={`cursor-pointer border-b last:border-b-0 border-slate-200 dark:border-[#30363d] p-4 transition-colors relative ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-[#161b22]'}`}
        >
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-md"></div>}

            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-sm font-semibold line-clamp-2 leading-tight ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-200'}`}>
                        <span className="text-slate-400 font-normal mr-1.5">SYS-{issue.id.substring(0, 4).toUpperCase()}</span>
                        {issue.title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-1">
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusColor(issue.status)}`}>
                        {issue.status.replace("_", " ")}
                    </span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                    </span>

                    {/* Type Badge - Now fully colored! */}
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getTypeColor(issue.type)}`}>
                        {issue.type}
                    </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {issue.description}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-[#30363d]/50">

                    {/* Updated Assignee Block with Claim Button */}
                    <div className="flex items-center">
                        {isUnassigned ? (
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-dashed border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Unassigned
                                </span>

                                {/* Quick Action Claim Button */}
                                {currentUser && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();   // Prevent default link/button behavior
                                            e.nativeEvent.stopImmediatePropagation(); // Force stop React event bubbling
                                            e.stopPropagation();  // Standard stop
                                            onClaim(issue.id);
                                        }}
                                        className="relative z-10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:border-indigo-800/50 rounded-md transition-colors"
                                    >
                                        Claim
                                    </button>
                                )}
                            </div>
                        ) : (
                            <span className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 text-xs font-medium shadow-sm">
                                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-[#30363d] overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-500">
                                    {issue.assignee?.avatar_url ? <img src={issue.assignee.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : issue.assignee?.first_name[0]}
                                </div>
                                {issue.assignee.first_name} {issue.assignee.last_name}
                            </span>
                        )}
                    </div>

                    {/* Git Link Icon */}
                    {issue.git_url && <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                </div>
            </div>
        </li>
    );
};