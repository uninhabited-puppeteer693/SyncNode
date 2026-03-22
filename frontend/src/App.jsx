/**
 * Core Application Routing & Context Root.
 * Defines the React Router DOM structure, protected route boundaries, 
 * and global state providers (Auth).
 */
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Global Providers
import { AuthProvider } from "./context/AuthContext";

// Layouts & Route Security
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./routes/ProtectionRoute";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Team } from "./pages/Team";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Core Application Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Index redirection to the default dashboard view */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Nested Layout Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="team" element={<Team />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;