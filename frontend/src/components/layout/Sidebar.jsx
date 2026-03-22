/**
 * Application Sidebar Navigation
 * Handles primary routing, user presence state management, and account actions.
 * Dynamically collapses to maximize screen real estate when toggled.
 */
import { Link } from "react-router-dom";

export const Sidebar = ({
    isSidebarOpen,
    user,
    presenceOptions,
    isPresenceDropdownOpen,
    setIsPresenceDropdownOpen,
    handlePresenceSelect,
    handleProfileEdit,
    handleLogout,
    isTeamPage,
    isProfilePage,
    setSearchQuery
}) => {
    return (
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-50 dark:bg-[#0d1117] border-r border-slate-200 dark:border-[#30363d] flex flex-col transition-all duration-300 shrink-0 z-20`}>
            
            {/* --- App Branding / Logo --- */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-[#30363d] whitespace-nowrap">
                <span className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 hidden'}`}>
                        Sync<span className="text-indigo-600 dark:text-indigo-500">Node</span>
                    </span>
                </span>
            </div>

            {/* --- Primary Navigation Links --- */}
            <nav className="flex-1 px-3 py-4 space-y-1 mt-2">
                <Link 
                    to="/dashboard" 
                    onClick={() => setSearchQuery("")} 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${!isTeamPage && !isProfilePage ? 'bg-slate-200/50 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <span className={`${!isSidebarOpen && 'hidden'}`}>Dashboard</span>
                </Link>
                
                <Link 
                    to="/team" 
                    onClick={() => setSearchQuery("")} 
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isTeamPage ? 'bg-slate-200/50 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span className={`${!isSidebarOpen && 'hidden'}`}>Team</span>
                </Link>
            </nav>

            {/* --- User Controls (Footer) --- */}
            <div className="p-3 border-t border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
                
                {/* Presence Toggle */}
                <div className="mb-2 w-full relative flex justify-center">
                    <button 
                        onClick={() => setIsPresenceDropdownOpen(!isPresenceDropdownOpen)} 
                        className={isSidebarOpen ? "w-full flex items-center justify-between px-2 py-1.5 font-semibold text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#30363d] rounded-md hover:bg-white dark:hover:bg-[#161b22] transition-colors bg-white dark:bg-[#0d1117]" : "w-8 h-8 flex items-center justify-center bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${presenceOptions.find(o => o.value === (user?.presence || 'online'))?.color}`}></div>
                            {isSidebarOpen && <span className="capitalize">{user?.presence || 'online'}</span>}
                        </div>
                    </button>

                    {isPresenceDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsPresenceDropdownOpen(false)}></div>
                            <div className={`absolute bottom-full mb-1 z-50 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-md shadow-lg overflow-hidden py-1 ${isSidebarOpen ? 'w-full left-0' : 'w-24 left-1/2 -translate-x-1/2'}`}>
                                {presenceOptions.map(option => (
                                    <button 
                                        key={option.value} 
                                        onClick={() => handlePresenceSelect(option.value)} 
                                        className={`w-full text-xs font-medium transition-colors flex items-center px-3 py-1.5 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300`}
                                    >
                                        <div className={`rounded-full w-2 h-2 ${option.color}`}></div>
                                        <span>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Shortcut */}
                <button onClick={handleProfileEdit} className="flex items-center gap-2 w-full text-left p-1.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold shrink-0 border border-slate-300 dark:border-slate-700 text-xs overflow-hidden">
                        {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : user?.first_name?.charAt(0) || "U"}
                    </div>
                    {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.first_name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
                        </div>
                    )}
                </button>
                
                {/* Logout Action */}
                <button onClick={handleLogout} className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors ${!isSidebarOpen && 'px-0 py-2'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className={`${!isSidebarOpen && 'hidden'}`}>Sign out</span>
                </button>

                {/* System Version */}
                <div className={`mt-5 w-full text-center font-extrabold tracking-widest transition-all ${isSidebarOpen ? 'text-[10px]' : 'text-[8px]'}`}>
                    <span className="bg-linear-to-r from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500 bg-clip-text text-transparent opacity-80 hover:opacity-100 transition-opacity cursor-default">
                        {isSidebarOpen ? "SYNCNODE v1.0.0" : "v1.0"}
                    </span>
                </div>
            </div>
        </aside>
    );
};