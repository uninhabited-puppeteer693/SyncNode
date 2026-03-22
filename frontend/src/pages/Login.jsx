/**
 * Unified Authentication Interface
 * Handles user login, tenant registration, and mandatory initial password resets 
 * forced by IT administrators.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export const Login = () => {
    // --- UI State ---
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- Security Check State ---
    const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);

    // --- Form Data State ---
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // --- Password Visibility State ---
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // --- Handlers ---

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const response = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            // Intercept standard login flow if admin required a password reset
            if (response.data.status === "requires_password_change") {
                setTempUserId(response.data.user_id);
                setNeedsPasswordChange(true);
                setSuccessMsg("Please set a new, secure password to continue.");
                setIsLoading(false);
                return;
            }

            await login(response.data.access_token, rememberMe);
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || "Invalid credentials or account locked.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = { user_id: tempUserId, new_password: newPassword };
            const response = await api.put("/auth/set-initial-password", payload);
            await login(response.data.access_token, rememberMe);
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.detail || "Failed to update password. Ensure it meets complexity requirements.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload = {
                company_name: companyName,
                subscription_plan: "free",
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                password: password
            };

            await api.post("/companies/register", payload);
            setSuccessMsg("Workspace created successfully! Please log in.");
            setIsLogin(true);
            setPassword("");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Registration failed. Email might be taken.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        alert(`${provider} SSO coming soon!`);
    };

    // Shared UI Constants
    const inputStyles = "w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    const labelStyles = "block text-sm font-medium text-slate-900 mb-1.5";
    const btnStyles = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2da44e] hover:bg-[#2c974b] focus:outline-none disabled:opacity-50 transition-colors mt-4";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            {/* Outer Header */}
            <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                </div>
                <h1 className="text-2xl font-light tracking-tight text-slate-900">
                    {needsPasswordChange ? "Secure Your Account" : (isLogin ? "Sign in to SyncNode" : "Create your workspace")}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    {needsPasswordChange ? "Your admin provided a temporary password. You must change it now." : (isLogin ? "Welcome back" : "Start managing your issues today")}
                </p>
            </div>

            {/* Main Card Container */}
            <div className="bg-white max-w-md w-full rounded-lg border border-slate-200 shadow-sm p-6">
                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>}
                {successMsg && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md">{successMsg}</div>}

                {needsPasswordChange ? (
                    <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                        <div>
                            <label className={labelStyles}>New Password</label>
                            <div className="relative">
                                <input type={showNewPassword ? "text" : "password"} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputStyles} pr-10`} />
                                <EyeIconButton show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Must contain an uppercase, lowercase, number, and special character.</p>
                        </div>
                        <div>
                            <label className={labelStyles}>Confirm New Password</label>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputStyles} pr-10`} />
                                <EyeIconButton show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className={btnStyles}>
                            {isLoading ? "Updating..." : "Update Password & Login"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className={labelStyles}>First Name</label>
                                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputStyles} />
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelStyles}>Last Name</label>
                                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputStyles} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelStyles}>Company Name</label>
                                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputStyles} />
                                </div>
                                <div>
                                    <label className={labelStyles}>Phone Number</label>
                                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyles} />
                                </div>
                            </>
                        )}

                        <div>
                            <label className={labelStyles}>Email address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-900">Password</label>
                                {isLogin && (
                                    <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline" tabIndex="-1">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputStyles} pr-10`} />
                                <EyeIconButton show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center text-sm pt-2">
                                <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                <label htmlFor="rememberMe" className="ml-2 block text-slate-900 cursor-pointer">
                                    Keep me logged in
                                </label>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className={btnStyles}>
                            {isLoading ? "Processing..." : (isLogin ? "Sign in" : "Create account")}
                        </button>
                    </form>
                )}

                {!needsPasswordChange && (
                    <>
                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-slate-500">Or continue with</span></div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => handleSocialLogin("Google")} className="w-full flex items-center justify-center py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                            <button type="button" onClick={() => handleSocialLogin("LinkedIn")} className="w-full flex items-center justify-center py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                                <svg className="w-5 h-5 mr-2 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                LinkedIn
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Toggle */}
            {!needsPasswordChange && (
                <div className="mt-8 px-6 py-4 border border-slate-200 rounded-lg bg-white text-sm text-center max-w-md w-full shadow-sm">
                    {isLogin ? "New to SyncNode? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }} className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        {isLogin ? "Create an account" : "Sign in"}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Reusable SVG Icon Component ---
const EyeIconButton = ({ show, toggle }) => (
    <button
        type="button"
        onClick={toggle}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
    >
        {show ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
        )}
    </button>
);