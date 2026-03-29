import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';
import { LayoutDashboard, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resultAction = await dispatch(login(credentials));
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
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all dark:text-white"
                                    placeholder="Username or Email"
                                    value={credentials.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all dark:text-white"
                                    placeholder="Password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold">
                            <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <input type="checkbox" className="size-4 rounded border-zinc-300 accent-blue-600" />
                                Remember me
                            </label>
                            <a href="#" className="text-blue-600 hover:text-blue-700">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="size-5 animate-spin" /> : 'Sign in'}
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
