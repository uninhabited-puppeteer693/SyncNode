/**
 * Team Directory and Access Control Panel
 * Displays tenant employees and allows high-level users (Admins/IT) 
 * to modify roles, unlock accounts, and force password resets.
 */
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import { CreateUserModal } from "../components/modals/CreateUserModal";
import { useAuth } from "../context/AuthContext";
import { useTeam } from "../hooks/useTeam";
import api from "../services/api";

// Role hierarchy configuration
const ROLE_WEIGHTS = { superadmin: 100, owner: 100, IT: 90, admin: 80, manager: 50, developer: 10 };

const normalizeRole = (role) => {
    if (!role) return "";
    return role.toUpperCase() === "IT" ? "IT" : role.toLowerCase();
};

export const Team = () => {
    const { user } = useAuth();
    const { searchQuery, teamRoleFilter, isCreateUserModalOpen, setIsCreateUserModalOpen } = useOutletContext();
    const { users, loading, refetch } = useTeam();

    // Modal State - Reset Password
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState(null);
    const [tempPasswordInput, setTempPasswordInput] = useState("");

    // Modal State - Unlock User
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
    const [userToUnlock, setUserToUnlock] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    // RBAC Identifiers
    const currentUserWeight = ROLE_WEIGHTS[normalizeRole(user?.role)] || 0;
    const hasSecurityPowers = ['IT', 'superadmin'].includes(normalizeRole(user?.role));

    // Client-side filtering
    const filteredUsers = users.filter((member) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower);

        let matchesRole = true;
        const normalizedMemberRole = normalizeRole(member.role);

        if (teamRoleFilter === 'admin') {
            matchesRole = ['admin', 'manager', 'owner', 'superadmin', 'IT'].includes(normalizedMemberRole);
        } else if (teamRoleFilter === 'developer') {
            matchesRole = normalizedMemberRole === 'developer';
        }

        return matchesSearch && matchesRole;
    });

    // --- Action Handlers ---

    const handleChangeRole = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            refetch();
        } catch (error) {
            alert(`Failed to change user role: ${error.response?.data?.detail || error.message}`);
        }
    };

    const submitUnlockUser = async () => {
        if (!userToUnlock) return;
        setIsUnlocking(true);
        try {
            await api.put(`/users/${userToUnlock.id}/unlock`);
            setIsUnlockModalOpen(false);
            setUserToUnlock(null);
            refetch(); // Refresh the list!
        } catch (error) {
            alert(`Failed to unlock user: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsUnlocking(false);
        }
    };

    const submitForceReset = async (e) => {
        e.preventDefault();
        if (!tempPasswordInput) return;

        try {
            await api.put(`/users/${userToReset.id}/force-reset`, { new_password: tempPasswordInput });
            alert(`Password reset successful! Provide "${tempPasswordInput}" to ${userToReset.first_name}.`);

            // Clean up state
            setIsResetModalOpen(false);
            setTempPasswordInput("");
            setUserToReset(null);
        } catch (error) {
            alert(`Failed to reset password: ${error.response?.data?.detail || error.message}`);
        }
    };

    // Role Colors...
    const getRoleBadgeColor = (role) => {
        switch (normalizeRole(role)) {
            case 'superadmin':
                return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
            case 'owner':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'admin':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
            case 'IT':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
            case 'manager':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            default:
                // Developer / Default
                return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#21262d] dark:text-slate-300 dark:border-[#30363d]';
        }
    };

    return (
        <div className="max-w-350 mx-auto h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">Team Directory</h1>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center text-sm items-center text-slate-500">Loading team...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                    {filteredUsers.map((member) => {
                        const memberWeight = ROLE_WEIGHTS[normalizeRole(member.role)] || 0;
                        const canEditRole = currentUserWeight >= 80 && memberWeight < currentUserWeight;

                        return (
                            <div key={member.id} className={`bg-white dark:bg-[#0d1117] rounded-lg border border-slate-200 dark:border-[#30363d] p-5 flex flex-col items-center text-center shadow-sm ${!member.is_active ? 'opacity-60' : ''}`}>
                                <div className="w-16 h-16 mb-4 rounded-full border border-slate-200 dark:border-[#30363d] bg-slate-100 dark:bg-[#161b22] text-slate-600 dark:text-slate-400 flex items-center justify-center text-xl font-medium overflow-hidden">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        member.first_name?.charAt(0) || "U"
                                    )}
                                </div>

                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                                    {member.first_name} {member.last_name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{member.email}</p>

                                <div className="mb-4 w-full">
                                    {canEditRole ? (
                                        <select
                                            value={normalizeRole(member.role)}
                                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                                            className={`w-full px-2 py-1 text-xs font-medium rounded-md border outline-none dark:bg-[#161b22] ${getRoleBadgeColor(member.role)}`}
                                        >
                                            <option value="developer">Developer</option>
                                            <option value="manager">Manager</option>
                                            {currentUserWeight >= 80 && (
                                                <>
                                                    <option value="admin">Admin</option>
                                                    <option value="IT">IT</option>
                                                </>
                                            )}
                                        </select>
                                    ) : (
                                        <span className={`block px-2 py-1 text-xs font-medium rounded-md border ${getRoleBadgeColor(member.role)}`}>
                                            {normalizeRole(member.role) || "Developer"}
                                        </span>
                                    )}
                                </div>

                                {hasSecurityPowers && member.id !== user?.id && memberWeight < currentUserWeight && (
                                    <div className="w-full flex gap-2 mb-2 mt-auto">
                                        <button onClick={() => { setUserToUnlock(member); setIsUnlockModalOpen(true); }} className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#161b22] transition-colors">
                                            Unlock User
                                        </button>
                                        <button onClick={() => { setUserToReset(member); setIsResetModalOpen(true); }} className="flex-1 px-2 py-1 text-xs border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#161b22] transition-colors">
                                            Reset Password
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <CreateUserModal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} onSuccess={refetch} />

            {/* Password Reset Modal */}
            {isResetModalOpen && userToReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-xl border border-slate-200 dark:border-[#30363d] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Force Password Reset</h3>
                        </div>
                        <form onSubmit={submitForceReset} className="p-5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Temporary Password</label>
                            <input
                                type="text"
                                required
                                value={tempPasswordInput}
                                onChange={(e) => setTempPasswordInput(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                            <div className="flex justify-end gap-2 mt-5">
                                <button type="button" onClick={() => setIsResetModalOpen(false)} className="px-3 py-1.5 text-sm font-medium border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#161b22]">
                                    Cancel
                                </button>
                                <button type="submit" className="px-3 py-1.5 text-sm font-medium bg-[#2da44e] text-white rounded-md hover:bg-[#2c974b]">
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Unlock User Modal */}
            {isUnlockModalOpen && userToUnlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-xl border border-slate-200 dark:border-[#30363d] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Unlock User Account</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to unlock <strong>{userToUnlock.first_name} {userToUnlock.last_name}</strong>? This will instantly restore their access to the workspace.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsUnlockModalOpen(false)}
                                    disabled={isUnlocking}
                                    className="px-3 py-1.5 text-sm font-medium border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#161b22] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitUnlockUser}
                                    disabled={isUnlocking}
                                    className="px-3 py-1.5 text-sm font-medium bg-[#2da44e] text-white rounded-md hover:bg-[#2c974b] disabled:opacity-50"
                                >
                                    {isUnlocking ? "Unlocking..." : "Confirm Unlock"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};