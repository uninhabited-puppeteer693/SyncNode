/**
 * Issues Data Hook
 * Centralizes the fetching and state management for workspace issues and users.
 * Utilizes useCallback to memoize the fetch function and prevent infinite render loops.
 */
import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export const useIssues = () => {
    const [issues, setIssues] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkspaceData = useCallback(async () => {
        setLoading(true);
        try {
            // Promise.all ensures both endpoints are fetched concurrently for speed
            const [issuesRes, usersRes] = await Promise.all([
                api.get("/issues/"),
                api.get("/users/")
            ]);
            
            setIssues(issuesRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch workspace data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaceData();
    }, [fetchWorkspaceData]);

    return { issues, users, loading, refetch: fetchWorkspaceData };
};