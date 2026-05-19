import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';
import { LayoutGrid, User, Lock, ArrowRight, Loader2, ShieldCheck, Clock, UserPlus, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="group space-y-2 flex-1 min-w-[200px]">
        <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-[0.2em] block pl-1 transition-colors group-focus-within:text-emerald-500">
            {label}
        </label>
        <div className="relative flex items-center">
            <div className="absolute left-0 h-full w-10 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 transition-colors group-focus-within:border-emerald-500/50">
                <Icon className="size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input 
                {...props}
                className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-lg py-3 pl-14 pr-4 text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-[#111111] dark:text-white"
            />
        </div>
    </div>
);

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resultAction = await dispatch(login({ ...credentials, rememberMe }));
        if (login.fulfilled.match(resultAction)) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(resultAction.payload?.detail || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-500">
            {/* Background Decorative Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#111_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
            </div>

            <div className="w-full max-w-[1200px] h-[min(700px,85vh)] bg-white dark:bg-[#0F0F0E] rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-zinc-200 dark:border-zinc-800 flex overflow-hidden relative z-10 transition-all">
                
                {/* Left Column: Mission Briefing Sidebar */}
                <div className="w-[320px] bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
                    <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="size-10 bg-[#111111] dark:bg-white rounded-lg flex items-center justify-center transition-transform shadow-lg shadow-black/10">
                                <LayoutGrid className="size-5 text-white dark:text-black" />
                            </div>
                            <div>
                                <span className="text-xl font-bold font-serif text-[#111111] dark:text-white tracking-tight block">OfficeOS</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Command Center</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="size-5 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Fingerprint className="size-3 text-emerald-500" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#111111] dark:text-white/40">Access Protocol</span>
                            </div>
                            
                            <div className="bg-[#111111] dark:bg-black p-6 rounded-xl border border-white/5 shadow-2xl relative group mb-8">
                                <h4 className="text-[12px] font-bold text-white mb-3 tracking-tight border-l-2 border-emerald-500 pl-4 uppercase tracking-wider">
                                    Security Brief
                                </h4>
                                <p className="text-[10px] leading-relaxed text-zinc-400 pl-4 mb-4">
                                    Join over 5,000 global operators managing organizational infrastructure with OfficeOS.
                                </p>
                                <div className="flex -space-x-2 pl-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <img key={i} className="size-6 rounded-full border border-black" src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                    ))}
                                    <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold border border-black">+5k</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-6 mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-black/20">
                        <Link to="/signup-hr" className="flex items-center justify-between group p-3 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-black transition-all hover:scale-[1.02] shadow-xl">
                            <div className="flex items-center gap-3">
                                <UserPlus className="size-4 opacity-70 group-hover:rotate-12 transition-transform" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Initialize Account</span>
                                    <span className="text-[8px] opacity-50 uppercase font-medium mt-1 tracking-tighter">New Organizations</span>
                                </div>
                            </div>
                            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>

                {/* Right Column: Tactical Login Form */}
                <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-50/20 dark:bg-transparent">
                    <div className="flex-1 flex flex-col justify-center max-w-[540px] mx-auto w-full px-10">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-serif font-bold text-[#111111] dark:text-white tracking-tight mb-2">
                                Welcome Back <span className="text-zinc-300 dark:text-zinc-700 mx-1">/</span> <span className="text-zinc-400 dark:text-zinc-600 font-medium">Operator Login</span>
                            </h2>
                            <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto"></div>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-6">
                                <InputField 
                                    label="Username or Email" 
                                    icon={User} 
                                    name="username" 
                                    required 
                                    value={credentials.username} 
                                    onChange={handleChange} 
                                    placeholder="e.g. alex_rivera" 
                                />

                                <InputField 
                                    label="Security Key" 
                                    icon={Lock} 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    required 
                                    value={credentials.password} 
                                    onChange={handleChange} 
                                    placeholder="••••••••" 
                                />
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={showPassword}
                                            onChange={(e) => setShowPassword(e.target.checked)}
                                            className="accent-emerald-500 size-4 rounded bg-zinc-800 border-none outline-none ring-0"
                                        />
                                        <span className="group-hover:text-emerald-500 transition-colors">Reveal Key</span>
                                    </label>
                                    <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="accent-emerald-500 size-4 rounded bg-zinc-800 border-none outline-none ring-0"
                                        />
                                        <span className="group-hover:text-emerald-500 transition-colors">Keep me logged in</span>
                                    </label>
                                </div>
                                <a href="#" className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors">
                                    Forgot Key?
                                </a>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-600/90 text-white font-bold uppercase tracking-[0.2em] text-[10px] py-3 rounded-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="size-4 animate-spin" /> : 'Login your account'}
                                    {!loading && <ArrowRight className="size-4" />}
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-4">
                            <ShieldCheck className="size-5 text-emerald-500" />
                            <p className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-relaxed">
                                Secure end-to-end encrypted session active. Unauthorized access attempts are logged.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
