/**
 * Application Feedback Modal
 * Special form that automatically generates an internal "report" type issue 
 * directly to the Superadmin's global dashboard.
 */
import { useState } from "react";
import api from "../../services/api";

export const ReportBugModal = ({ isOpen, onClose }) => {
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Automatically tags the payload as a "report" type with high priority
            await api.post("/issues/", { 
                title: "App Feedback / Bug Report", 
                description: description, 
                type: "report", 
                priority: "high", 
                status: "open", 
                assignee_id: null 
            });
            
            alert("Thank you! Your report has been submitted to the Admin.");
            setDescription("");
            onClose();
        } catch (error) { 
            // Fixed the alert bug to actually display the error!
            alert(`Failed to submit report: ${error.response?.data?.detail || error.message}`); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0d1117] rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-[#30363d]">
                
                <div className="p-4 border-b border-slate-200 dark:border-[#30363d] flex justify-between items-center bg-slate-50 dark:bg-[#161b22]">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Report an Issue</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Help us improve the application.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col">
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-2">What happened?</label>
                    <textarea
                        required
                        rows="4"
                        placeholder="I tried to click the save button but it..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none mb-5"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm font-medium border border-slate-300 dark:border-[#30363d] dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-[#161b22]">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#2da44e] text-white text-sm font-medium rounded-md hover:bg-[#2c974b] transition-colors shadow-sm disabled:opacity-50">
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};