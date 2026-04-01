import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';
import { LayoutDashboard, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
        <div className="min-h-screen flex bg-white dark:bg-zinc-950">
            {/* Left Section - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-24">
                <div className="max-w-md w-full mx-auto space-y-10">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                <LayoutDashboard className="size-5 text-white" />
                            </div>
                            <span className="text-xl font-bold dark:text-white">OfficeOS</span>
                        </Link>
                        <h2 className="text-4xl font-extrabold tracking-tight dark:text-white mb-2">
                           Welcome Back
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Username Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-4 bg-white dark:bg-zinc-950 focus-within:border-blue-500 transition-all shadow-sm">
                                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block mb-1">Username or Email</label>
                                <div className="relative group">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-zinc-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full pl-6 bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-200 outline-none"
                                        placeholder="Enter your username"
                                        value={credentials.username}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-4 bg-white dark:bg-zinc-950 focus-within:border-blue-500 transition-all shadow-sm">
                                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block mb-1">Password Identifier</label>
                                <div className="relative group">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-zinc-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-6 bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-200 outline-none"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 text-xs font-semibold">
                            <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                />
                                <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Show Password</span>
                            </label>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Remember me</span>
                                </label>
                                <a href="#" className="text-blue-600 hover:text-blue-700">Forgot password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[11px] py-4 rounded-md shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign into Workspace'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium pb-8">
                        New on our platform? {" "}
                        <Link to="/signup-hr" className="font-bold text-blue-600 hover:underline">
                            Create an HR account
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Section - Graphic/Mockup */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-zinc-50 dark:bg-zinc-900 m-4 rounded-3xl">
                <div className="absolute inset-x-0 bottom-0 top-1/4 bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
                <div className="relative flex flex-col justify-center p-12 text-zinc-900 dark:text-white space-y-6">
                    <div className="max-w-md">
                        <h2 className="text-4xl font-bold mb-4">Centralized workspace for modern teams.</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Join over 5,000 businesses managed by OfficeOS. Seamlessly automate your HR processes and track project health in real-time.
                        </p>
                        <div className="flex -space-x-3 mb-4">
                            {[1, 2, 3, 4].map(i => (
                                <img key={i} className="size-10 rounded-full border-2 border-white dark:border-zinc-900" src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                            ))}
                            <div className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-zinc-900">+5k</div>
                        </div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Trusted Worldwide</p>
                    </div>
                    {/* Floating Mockup Part */}
                    <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl bg-white dark:bg-zinc-950">
                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" className="w-full h-auto" alt="Mockup" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
