/**
 * Password Recovery Flow
 * Guides unauthenticated users through a 3-step password reset process 
 * using email verification codes.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const ForgotPassword = () => {
    // Flow State
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form Data
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Feedback State
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setSuccessMsg(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const payload = { email, code, new_password: newPassword };
            const response = await api.post('/auth/reset-password', payload);
            
            setSuccessMsg(response.data.message);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
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
                    {step === 1 ? 'Reset your password' : step === 2 ? 'Check your email' : 'Password updated'}
                </h1>
            </div>

            <div className="bg-white max-w-sm w-full rounded-lg border border-slate-200 shadow-sm p-6">
                {step === 2 && (
                    <p className="text-sm text-slate-600 mb-4 text-center">
                        We sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>
                    </p>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                        {error}
                    </div>
                )}
                
                {successMsg && step === 3 && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md text-center">
                        {successMsg}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors">
                            {isLoading ? 'Sending...' : 'Send password reset email'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-widest text-center font-mono"
                                placeholder="000000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors">
                            {isLoading ? 'Resetting...' : 'Verify code and reset password'}
                        </button>
                        <div className="text-center mt-4">
                            <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:underline">
                                Need to use a different email?
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center mt-2">
                        <Link to="/login" className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors">
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>

            {step !== 3 && (
                <div className="mt-8 px-6 py-4 border border-slate-200 rounded-lg bg-white text-sm text-center max-w-sm w-full shadow-sm">
                    Remembered your password? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
                </div>
            )}
        </div>
    );
};