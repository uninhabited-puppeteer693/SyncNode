/**
 * Global Authentication Context
 * Manages JWT tokens, user session state, and multi-tab synchronization.
 * Interfaces directly with the Axios API instance for automatic token injection.
 */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // --- State Initialization ---
    // Attempts to rehydrate the session from either persistent or session storage.
    const [token, setToken] = useState(
        localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
    );
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    // --- Core Operations ---

    const login = async (newToken, rememberMe) => {
        /*
        Persists the authentication token based on the user's explicit 'Remember Me' preference,
        ensuring strict segregation between persistent and temporary browser storage.
        */
        if (rememberMe) {
            localStorage.setItem("access_token", newToken);
            sessionStorage.removeItem("access_token");
        } else {
            sessionStorage.setItem("access_token", newToken);
            localStorage.removeItem("access_token");
        }
        setToken(newToken);
    };

    const logout = () => {
        /*
        Terminates the local session by purging all token storage and resetting application state.
        */
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    };

    // --- Side Effects & Synchronization ---

    useEffect(() => {
        /*
        Multi-Tab Synchronization Listener.
        Monitors the browser's Storage API to automatically log a user in or out 
        across multiple open tabs within the same browser session.
        */
        const handleStorageChange = (e) => {
            if (e.key === "access_token") {
                if (e.newValue === null) {
                    setToken(null);
                    setUser(null);
                } else {
                    setToken(e.newValue);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);


    useEffect(() => {
        /*
        Profile Rehydration.
        Automatically fetches the authenticated user's profile data whenever the JWT token changes.
        */
        const fetchUserProfile = async () => {
            try {
                const response = await api.get("/users/profile");
                setUser(response.data);
            } catch (error) {
                console.error("Authentication check failed:", error);
                logout(); 
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, [token]);


    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {/* Prevent children from rendering until the initial auth check resolves */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);