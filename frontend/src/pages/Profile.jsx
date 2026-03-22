/**
 * User Profile Settings
 * Allows the authenticated user to manage their personal information and avatar.
 */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export const Profile = () => {
    const { user } = useAuth();

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form State
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        avatar_url: ""
    });

    // Populate form data when user state initializes
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                phone: user.phone || "",
                avatar_url: user.avatar_url || ""
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await api.put("/users/profile", formData);
            setMessage({ type: "success", text: "Profile updated successfully! Refreshing..." });

            // Allow user to see the success message before reloading state
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Shared styling constants
    const inputStyles = "w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100";
    const labelStyles = "block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1.5";

    return (
        <div className="max-w-3xl mx-auto py-8 px-6">
            <div className="mb-6">
                <h1 className="text-2xl font-light tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account details and preferences.</p>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg overflow-hidden">
                <div className="p-6">
                    {message.text && (
                        <div className={`mb-6 p-3 rounded-md text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-[#30363d]">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#0d1117] text-slate-600 flex items-center justify-center text-xl font-medium border border-slate-200 dark:border-[#30363d] shrink-0 overflow-hidden">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    formData.first_name?.charAt(0) || "U"
                                )}
                            </div>
                            <div className="flex-1 max-w-sm">
                                <label className={labelStyles}>Avatar URL</label>
                                <input type="url" placeholder="https://..." value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })} className={inputStyles} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelStyles}>First Name</label>
                                <input required type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputStyles} />
                            </div>
                            <div>
                                <label className={labelStyles}>Last Name</label>
                                <input required type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputStyles} />
                            </div>
                        </div>

                        <div className="max-w-sm">
                            <label className={labelStyles}>Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputStyles} />
                        </div>

                        <div className="pt-4 flex justify-end border-t border-slate-200 dark:border-[#30363d] mt-6">
                            <button type="submit" disabled={isSaving} className="px-4 py-1.5 bg-[#2da44e] hover:bg-[#2c974b] text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 transition-colors">
                                {isSaving ? "Saving..." : "Save settings"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};