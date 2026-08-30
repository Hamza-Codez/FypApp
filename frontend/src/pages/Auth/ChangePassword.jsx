import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { changePassword } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const InputField = ({ label, name, type, icon: Icon, required, autoComplete, value, onChange }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 group-focus-within:border-emerald-500/50 group-focus-within:bg-emerald-50/50 dark:group-focus-within:bg-emerald-900/20 transition-all">
                <Icon className="size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                placeholder={`••••••••`}
            />
        </div>
    </div>
);

const ChangePassword = () => {
    const { loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [showPasswords, setShowPasswords] = useState(false);

    const handleChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return toast.error("New passwords do not match");
        }
        
        const res = await dispatch(changePassword({
            old_password: passwordData.old_password,
            new_password: passwordData.new_password
        }));

        if (changePassword.fulfilled.match(res)) {
            toast.success("Password updated successfully! Welcome to the workspace.");
            navigate('/dashboard');
        } else {
            toast.error(res.payload?.detail || "Update failed. Check your current password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
            <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-emerald-600 rounded-md flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="size-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Security Update</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Please set a new secure password for your account</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={showPasswords}
                                onChange={(e) => setShowPasswords(e.target.checked)}
                                className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors uppercase tracking-widest text-[9px]">Show Passwords</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-2xl overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <InputField 
                                    label="Current Temporary Password" 
                                    name="old_password" 
                                    type={showPasswords ? "text" : "password"} 
                                    icon={KeyRound} 
                                    required 
                                    autoComplete="current-password"
                                    value={passwordData.old_password}
                                    onChange={handleChange}
                                />
                                
                                <InputField 
                                    label="New Password" 
                                    name="new_password" 
                                    type={showPasswords ? "text" : "password"} 
                                    icon={Lock} 
                                    required 
                                    autoComplete="new-password"
                                    value={passwordData.new_password}
                                    onChange={handleChange}
                                />
                                
                                <InputField 
                                    label="Confirm New Password" 
                                    name="confirm_password" 
                                    type={showPasswords ? "text" : "password"} 
                                    icon={Lock} 
                                    required 
                                    autoComplete="new-password"
                                    value={passwordData.confirm_password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex gap-4 flex-1">
                                    <div className="size-10 bg-amber-50 dark:bg-amber-900/20 rounded-md flex items-center justify-center flex-shrink-0 border border-amber-100 dark:border-amber-900/30">
                                        <ShieldCheck className="size-5 text-amber-600 dark:text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-0.5">Security Tip</p>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Use 8+ characters with mixed cases and symbols.</p>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-8 rounded-md font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Updating Security...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Update & Access Workspace</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <p className="text-center mt-8 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.2em]">
                    FypApp Enterprise Security Suite
                </p>
            </div>
        </div>
    );
};

export default ChangePassword;
