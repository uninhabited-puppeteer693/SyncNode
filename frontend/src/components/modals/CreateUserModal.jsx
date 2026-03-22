/**
 * Create User Modal
 * Allows authorized users to provision new accounts within their tenant workspace.
 */
import { useState } from "react";
import api from "../../services/api";

export const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ 
        email: "", 
        password: "", 
        first_name: "", 
        last_name: "", 
        role: "developer" 
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            await api.post("/users/", { ...formData, presence: "online", is_active: true });
            
            // Reset form on success
            setFormData({ email: "", password: "", first_name: "", last_name: "", role: "developer" });
            onSuccess();
            onClose();
        } catch (error) {
            // Precise error formatting
            alert(`Backend Validation Error: ${error.response?.data?.detail ? JSON.stringify(error.response.data.detail) : error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Shared styling
    const inputClasses = "w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100";
    const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

    return (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-[#30363d]">
                
                <div className="p-4 border-b border-slate-200 dark:border-[#30363d] flex justify-between items-center bg-slate-50 dark:bg-[#161b22]">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Invite New Team Member</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto max-h-[70vh]">
                    <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>First Name</label>
                                <input required type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Last Name</label>
                                <input required type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputClasses} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Email Address</label>
                            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Temporary Password</label>
                            <input required type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Role</label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClasses}>
                                <option value="developer">Developer</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-[#30363d] flex justify-end gap-2 bg-slate-50 dark:bg-[#161b22]">
                    <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm font-medium border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#161b22]">Cancel</button>
                    <button type="submit" form="create-user-form" disabled={isSaving} className="px-4 py-1.5 bg-[#2da44e] text-white text-sm font-medium rounded-md hover:bg-[#2c974b] shadow-sm disabled:opacity-50">
                        {isSaving ? "Creating..." : "Create User"}
                    </button>
                </div>
            </div>
        </div>
    );
};