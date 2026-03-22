/**
 * Core Axios API Client
 * Centralizes backend communication and automatically attaches 
 * authentication credentials to outgoing HTTP requests.
 */
import axios from "axios";

const api = axios.create({
    // Dynamically assigns the API URL based on the environment (Local vs Production)
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", 
});

api.interceptors.request.use(
    (config) => {
        // Sequentially checks persistent storage then session storage for active tokens
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;