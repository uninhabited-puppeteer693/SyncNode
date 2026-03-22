/**
 * Protected Route Wrapper.
 * Intercepts unauthenticated navigation attempts to protected application views
 * and forcibly redirects the user to the login screen.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};