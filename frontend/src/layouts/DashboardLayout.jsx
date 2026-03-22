/**
 * Master Application Layout
 * Coordinates global state and composes the primary layout structure (Sidebar, Header, Content).
 */
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { Header } from "../components/layout/Header.jsx";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { ReportBugModal } from "../components/modals/ReportBugModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Context & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [teamRoleFilter, setTeamRoleFilter] = useState("all");

    // UI & Modal State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isPresenceDropdownOpen, setIsPresenceDropdownOpen] = useState(false);
    const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    const presenceOptions = [
        { value: 'online', label: 'Online', color: 'bg-[#2da44e]' },
        { value: 'away', label: 'Away', color: 'bg-amber-500' },
        { value: 'busy', label: 'Busy', color: 'bg-red-500' },
        { value: 'offline', label: 'Offline', color: 'bg-slate-400' }
    ];

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const handleLogout = () => { logout(); navigate("/login"); };

    const handlePresenceSelect = async (value) => {
        setIsPresenceDropdownOpen(false);
        if (value === user?.presence) return;
        try {
            await api.put('/users/profile', { presence: value });
            window.location.reload(); 
        } catch (error) { console.error("Failed to update presence:", error); }
    };

    const handleProfileEdit = () => {
        if (location.pathname === "/profile") navigate("/dashboard");
        else navigate("/profile");
    };

    const isProfilePage = location.pathname === "/profile";
    const isTeamPage = location.pathname === "/team";
    const canCreateUsers = ['admin', 'owner', 'superadmin'].includes(user?.role?.toLowerCase());

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0d1117] font-sans text-slate-800 dark:text-slate-200">
            
            <Sidebar 
                isSidebarOpen={isSidebarOpen}
                user={user}
                presenceOptions={presenceOptions}
                isPresenceDropdownOpen={isPresenceDropdownOpen}
                setIsPresenceDropdownOpen={setIsPresenceDropdownOpen}
                handlePresenceSelect={handlePresenceSelect}
                handleProfileEdit={handleProfileEdit}
                handleLogout={handleLogout}
                isTeamPage={isTeamPage}
                isProfilePage={isProfilePage}
                setSearchQuery={setSearchQuery}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {!isProfilePage && (
                    <Header 
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        isTeamPage={isTeamPage}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        teamRoleFilter={teamRoleFilter}
                        setTeamRoleFilter={setTeamRoleFilter}
                        setIsReportModalOpen={setIsReportModalOpen}
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                        setIsNewIssueModalOpen={setIsNewIssueModalOpen}
                        canCreateUsers={canCreateUsers}
                        setIsCreateUserModalOpen={setIsCreateUserModalOpen}
                    />
                )}

                <main className={`flex-1 overflow-auto ${isProfilePage ? 'p-0' : 'p-6 bg-slate-50 dark:bg-[#0d1117]'}`}>
                    <Outlet context={{ 
                        searchQuery, statusFilter, teamRoleFilter, 
                        isNewIssueModalOpen, setIsNewIssueModalOpen, 
                        isCreateUserModalOpen, setIsCreateUserModalOpen 
                    }} />
                </main>
            </div>

            <ReportBugModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
        </div>
    );
};