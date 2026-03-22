/**
 * Team Data Hook
 * Manages the retrieval of tenant employees and handles administrative 
 * state mutations (like soft-deleting/disabling users).
 */
import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export const useTeam = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTeam = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/users/");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch team members:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const toggleActiveStatus = async (userId) => {
        try {
            await api.put(`/users/${userId}/toggle-active`);
            await fetchTeam(); // Automatically refreshes the team list after a status mutation
        } catch (error) {
            alert(`Failed to change user status: ${error.response?.data?.detail || error.message}`);
        }
    };

    return { users, loading, refetch: fetchTeam, toggleActiveStatus };
};