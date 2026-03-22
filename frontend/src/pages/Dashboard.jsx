/**
 * Main Dashboard View
 * Acts as the primary workspace interface, handling issue filtering, 
 * selection state, and conditionally rendering the side panel detail view.
 */
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import { IssueCard } from "../components/issues/IssueCard";
import { IssueSidePanel } from "../components/issues/IssueSidePanel";
import { NewIssueModal } from "../components/modals/NewIssueModal";
import { useIssues } from "../hooks/useIssues";

export const Dashboard = () => {
    // Layout context & global filters
    const { searchQuery, statusFilter, isNewIssueModalOpen, setIsNewIssueModalOpen } = useOutletContext();

    // Data fetching hooks
    const { issues, users, loading, refetch } = useIssues();

    // Local UI State
    const [selectedIssueId, setSelectedIssueId] = useState(null);

    const { user } = useAuth();
    const handleClaimIssue = async (issueId) => {
        try {
            // Update the backend to assign the issue to the current user
            await api.put(`/issues/${issueId}`, { assignee_id: user.id });
            refetch(); // Refresh the list so it updates instantly!
        } catch (error) {
            console.error("Failed to claim issue:", error);
        }
    };

    // Derived State
    const selectedIssue = issues.find(issue => issue.id === selectedIssueId) || null;

    const filteredIssues = issues.filter((issue) => {
        const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();

        // Construct the viewable ID (e.g., "sys-5fc2")
        const issueKey = `sys-${issue.id.substring(0, 4).toLowerCase()}`;

        const matchesSearch = issue.title.toLowerCase().includes(searchLower) ||
            (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
            issueKey.includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading repository...
                </div>
            </div>
        );
    }

    return (
        <div className="h-full max-w-350 mx-auto flex flex-col lg:flex-row gap-4">
            {/* Master List View */}
            <div className={`w-full lg:w-[45%] xl:w-[40%] flex flex-col h-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg overflow-hidden ${selectedIssue ? 'hidden lg:flex' : 'flex'}`}>
                <div className="px-4 py-3 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22] shrink-0 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Issues</h2>
                    <span className="bg-slate-200 dark:bg-[#30363d] text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full">
                        {filteredIssues.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredIssues.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                            <p className="text-sm text-slate-500 dark:text-slate-400">No issues found matching your filters.</p>
                        </div>
                    ) : (
                        <ul className="flex flex-col">
                            {filteredIssues.map((issue) => (
                                <IssueCard
                                    key={issue.id}
                                    issue={issue}
                                    isSelected={selectedIssueId === issue.id}
                                    onClick={() => setSelectedIssueId(issue.id)}
                                    // Add these two new props:
                                    currentUser={user}
                                    onClaim={handleClaimIssue}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Detail Pane View */}
            <div className={`w-full lg:w-[55%] xl:w-[60%] flex flex-col h-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg overflow-hidden ${!selectedIssue ? 'hidden lg:flex' : 'flex'}`}>
                <IssueSidePanel
                    issue={selectedIssue}
                    onClose={() => setSelectedIssueId(null)}
                    onUpdate={refetch}
                    users={users}
                />
            </div>

            {/* Creation Modal */}
            <NewIssueModal
                isOpen={isNewIssueModalOpen}
                onClose={() => setIsNewIssueModalOpen(false)}
                onSuccess={refetch}
                users={users}
            />
        </div>
    );
};