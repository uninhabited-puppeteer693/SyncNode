/**
 * Global Header & Toolbar
 * Provides context-aware view filtering (Issues vs. Team), global search functionality, 
 * theme toggling, and quick-action triggers for application modals.
 */
export const Header = ({
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    isTeamPage,
    statusFilter,
    setStatusFilter,
    teamRoleFilter,
    setTeamRoleFilter,
    setIsReportModalOpen,
    isDarkMode,
    setIsDarkMode,
    setIsNewIssueModalOpen,
    canCreateUsers,
    setIsCreateUserModalOpen
}) => {
    return (
        <header className="h-16 sticky top-0 z-30 bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between px-6">
            
            {/* --- Left: Sidebar Toggle & Global Search --- */}
            <div className="flex-1 flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="relative w-full max-w-sm">
                    <input 
                        type="text" 
                        placeholder={isTeamPage ? "Search members..." : "Search issues..."} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400" 
                    />
                    <svg className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* --- Center: Context-Aware View Filters --- */}
            <div className="hidden lg:flex flex-1 justify-center">
                <div className="flex space-x-1 bg-slate-100 dark:bg-[#161b22] p-0.5 rounded-md border border-slate-200 dark:border-[#30363d]">
                    {!isTeamPage ? (
                        // Issue View Filters
                        [{ id: 'all', label: 'All Issues' }, { id: 'open', label: 'Open' }, { id: 'in_progress', label: 'In Progress' }, { id: 'done', label: 'Done' }].map((tab) => (
                            <button 
                                key={tab.id} 
                                onClick={() => setStatusFilter(tab.id)} 
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${statusFilter === tab.id ? 'bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-[#30363d]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                {tab.label}
                            </button>
                        ))
                    ) : (
                        // Team View Filters
                        [{ id: 'all', label: 'Everyone' }, { id: 'admin', label: 'Admins' }, { id: 'developer', label: 'Developers' }].map((tab) => (
                            <button 
                                key={tab.id} 
                                onClick={() => setTeamRoleFilter(tab.id)} 
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${teamRoleFilter === tab.id ? 'bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-[#30363d]' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                {tab.label}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* --- Right: Quick Actions & Creation Triggers --- */}
            <div className="flex-1 flex items-center justify-end gap-2">
                
                {/* Bug Report Trigger */}
                <button onClick={() => setIsReportModalOpen(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors" title="Report Bug">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </button>
                
                {/* Theme Toggle */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md transition-colors">
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
                
                <div className="w-px h-5 bg-slate-300 dark:bg-[#30363d] mx-2"></div>
                
                {/* Context-Aware Creation Button */}
                {!isTeamPage ? (
                    <button onClick={() => setIsNewIssueModalOpen(true)} className="px-3 py-1.5 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span>New issue</span>
                    </button>
                ) : (
                    canCreateUsers && (
                        <button onClick={() => setIsCreateUserModalOpen(true)} className="px-3 py-1.5 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            <span>Invite member</span>
                        </button>
                    )
                )}
            </div>
        </header>
    );
};