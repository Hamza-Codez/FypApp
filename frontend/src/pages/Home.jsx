import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toggleTheme } from '../features/themeSlice';
import { LayoutGrid, CheckCircle2, Clock, Sun, Moon, ArrowRight, Shield, Calendar, Users, FileBarChart, Activity } from 'lucide-react';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);
    const { theme } = useSelector((state) => state.theme);
    const isDarkMode = theme === 'dark';
    const isEmployee = user?.role?.toUpperCase() === 'EMPLOYEE';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const heroTitle = token && !isEmployee
        ? <>Personalize your <span className="italic text-emerald-500">Office Workflows</span></>
        : <>Your Ultimate <span className="italic text-emerald-500">Project and Task Organizer</span></>;
    
    const heroSubtext = token && !isEmployee
        ? "The all-in-one workspace to track your tasks, visualize upcoming deadlines, and collaborate seamlessly with your team."
        : "The all-in-one workspace for HR automation, project tracking, and team collaboration. Join thousands of high-output teams worldwide.";

    return (
        <div className="bg-white dark:bg-[#0F0F0E] min-h-screen font-sans transition-colors duration-300">
            <style>{`
                @keyframes smooth-wave {
                    0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.2; }
                    50% { transform: translateY(-12px) scaleY(1.05); opacity: 1; }
                }
                .wave-line {
                    animation: smooth-wave 8s ease-in-out infinite;
                    transform-origin: center;
                }
                .float-element {
                    transition: transform 0.3s ease;
                }
                .group:hover .float-element {
                    transform: translateY(-8px);
                }
            `}</style>
            
            {/* Navbar */}
            <nav className="border-b border-[#E5E5E5] dark:border-zinc-800 py-4 px-6 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#0F0F0E]/90 backdrop-blur-md z-500">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#111111] dark:bg-white rounded-lg">
                        <LayoutGrid className="size-5 text-white dark:text-[#111111]" />
                    </div>
                    <span className="text-xl font-bold font-serif text-[#111111] dark:text-white">
                        OfficeOS
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => dispatch(toggleTheme())} 
                        className="p-2 text-[#6B6B6B] dark:text-zinc-400 hover:bg-[#F7F7F5] dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </button>
                    {token ? (
                        <>
                            <button 
                                onClick={handleLogout} 
                                className="text-sm font-medium hover:text-red-600 transition-colors text-[#111111] dark:text-white"
                            >
                                Sign Out
                            </button>
                            <Link 
                                to="/dashboard" 
                                className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-6 py-2.5 rounded-full text-sm font-sans transition-colors hover:bg-black dark:hover:bg-zinc-200"
                            >
                                Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium hover:text-[#2E7D32] transition-colors text-[#111111] dark:text-white">Login</Link>
                            <Link to="/signup-hr" className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-6 py-2.5 rounded-full text-sm font-sans transition-colors hover:bg-black dark:hover:bg-zinc-200">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="w-full mx-auto overflow-hidden">
                {/* Minimalistic Full-Height Hero Section */}
                <section className="relative min-h-[calc(100vh-72px)] text-center flex flex-col items-center justify-center overflow-hidden border-b border-[#E5E5E5] dark:border-zinc-800">
                    {/* Even more subtle wavy pattern */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-60 flex items-center justify-center">
                        <svg viewBox="0 0 1000 600" className="w-[150%] max-w-[1600px] h-[550px]" preserveAspectRatio="none">
                            <g fill="none" stroke="currentColor" strokeWidth="1" className="text-[#111111] dark:text-white">
                                {Array.from({length: 8}).map((_, i) => (
                                    <path 
                                        key={i} 
                                        d={`M-200,${280 + i * 15} C500,${480 - i * 10} 750,${120 + i * 15} 1000,${350 - i * 8} C1250,${600 + i * 10} 1100,${150 - i * 12} 1300,${300 + i * 15}`} 
                                        className="wave-line"
                                        style={{ animationDelay: `${i * 0.4}s` }}
                                    />
                                ))}
                            </g>
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center max-w-4xl px-6">
                        <div className="text-[10px] font-bold text-[#AAAAAA] dark:text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            {isEmployee ? "Personnel Productivity Node" : "Infrastructure for Modern Teams"}
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <h1 className="font-serif text-4xl md:text-7xl font-semibold leading-[1.1] text-[#111111] dark:text-white tracking-tight">
                            {heroTitle}
                        </h1>
                        <p className="font-sans text-sm md:text-lg leading-relaxed text-[#6B6B6B] dark:text-white/60 max-w-xl mt-4">
                            {heroSubtext}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                            <Link to={token ? "/dashboard" : "/signup-hr"} className="bg-[#111111] dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded hover:opacity-90 transition-all flex items-center gap-2 shadow-xl">
                                {token ? "Enter Workspace" : "Get Started"} <ArrowRight className="size-3.5" />
                            </Link>
                            <a href="#features" className="border border-[#E5E5E5] dark:border-zinc-800 text-[#111111] dark:text-white text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded bg-white dark:bg-[#0A0A0A] hover:bg-[#F7F7F5] dark:hover:bg-zinc-900 transition-all">
                                Documentation
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 mx-18 md:py-18 border-t border-[#E5E5E5] dark:border-zinc-800">
                    <div className="mb-34 text-center relative z-10">
                        <p className="uppercase text-xs tracking-widest text-[#AAAAAA] dark:text-zinc-500 font-sans mb-4">Core Infrastructure</p>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-[#111111] dark:text-white ">
                            Everything you need to scale
                        </h2>
                    </div>

                    <div className="space-y-42">
                        {/* Feature 1: Complete Workspace */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div className="flex flex-col items-start mb-16">
                                <span className="bg-[#E8F5E3] text-[#2E7D32] dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-sans px-3 py-1 rounded-full mb-6 inline-block">
                                    HR Automation
                                </span>
                                <h3 className="font-serif text-3xl font-bold leading-tight text-[#111111] dark:text-white mb-4">
                                    The Complete Workspace
                                </h3>
                                <div className="font-sans text-base leading-relaxed text-[#6B6B6B] dark:text-zinc-400 mb-6">
                                    Streamline your entire workforce management. From organizing teams and workflows to seamless project management and task tracking, OfficeOS handles the complex HR tasks effortlessly.

                                    {/* Sub-Features */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Workforce Analytics</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">AI-powered insights for better decisions.</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Automated Workflows</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">Reduce manual tasks with automation.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-[#111111] dark:text-white font-medium">
                                        <CheckCircle2 className="size-4 text-[#2E7D32] dark:text-emerald-400"/> Effortless one-click onboarding
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-[#111111] dark:text-white font-medium">
                                        <CheckCircle2 className="size-4 text-[#2E7D32] dark:text-emerald-400"/> Track employee performance and productivity
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 rounded-xl p-8 border border-[#E5E5E5] dark:border-zinc-800 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none min-h-[350px] flex items-center justify-center relative group cursor-default">
                                {/* New Mini Overlapping Card: Compliance Stats */}
                                <div className="absolute -right-8 -top-12 bg-white dark:bg-zinc-800 p-3.5 rounded-lg shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-30 w-48 float-element hidden lg:block transition-all hover:scale-105">
                                    <div className="flex items-center gap-2.5 mb-2.5 border-b border-[#F0F0F0] dark:border-zinc-800 pb-2">
                                        <div className="size-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Shield className="size-3.5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-[#111111] dark:text-white uppercase tracking-widest">Secured</div>
                                            <div className="text-[8px] text-emerald-500 font-bold">L3 Protocol</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px] text-[#6B6B6B] dark:text-zinc-400">
                                            <span>Active Nodes</span>
                                            <span className="font-bold text-[#111111] dark:text-white">12/12</span>
                                        </div>
                                        <div className="h-1 w-full bg-[#F7F7F5] dark:bg-zinc-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Added: Third Overlapping Badge: Verified Identity */}
                                <div className="absolute -top-2 -left-6 -translate-y-1/2 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-40 float-element hidden xl:flex items-center gap-2 hover:scale-110 transition-transform">
                                    <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                        <Shield className="size-3" />
                                    </div>
                                    <span className="text-[8px] font-bold text-[#111111] dark:text-white uppercase tracking-widest pr-7">Identity Verified</span>
                                </div>

                                <div className="w-full bg-white dark:bg-[#0F0F0E] border border-[#E5E5E5] dark:border-zinc-800 rounded-lg shadow-2xl p-5 relative z-10 transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2">
                                    {/* Ambient background glow inside card */}
                                    <div className="absolute top-0 right-0 size-32 bg-emerald-500/5 dark:bg-emerald-400/5 blur-3xl -z-10 rounded-full"></div>
                                    
                                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-[#E5E5E5] dark:border-zinc-800">
                                        <div className="font-sans text-sm font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                                            <div className="size-2 bg-[#2E7D32] dark:bg-emerald-400 rounded-full animate-pulse"></div>
                                            Directory
                                        </div>
                                        <span className="bg-[#E8F5E3] dark:bg-emerald-900/30 text-[#2E7D32] dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">+4 Active</span>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { name: "Alex Rivera", role: "Senior Developer", status: true },
                                            { name: "Sophia Zhang", role: "Product Designer", status: false },
                                            { name: "Marcus Thorne", role: "HR Manager", status: false }
                                        ].map((person, i) => (
                                            <div key={i} className="flex items-center gap-4 group/row cursor-pointer">
                                                <div className="size-10 rounded-full bg-[#111111] dark:bg-white flex items-center justify-center text-white dark:text-[#111111] text-xs font-bold relative border border-[#E5E5E5] dark:border-zinc-800 transition-transform group-hover/row:scale-110 duration-300">
                                                    {person.name.charAt(0)}
                                                    {person.status && <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0F0F0E]"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <div className="text-xs font-bold text-[#111111] dark:text-white">{person.name}</div>
                                                        <span className={`text-[7px] font-bold uppercase tracking-widest ${person.status ? 'text-emerald-500' : 'text-[#AAAAAA]'}`}>
                                                            {person.status ? 'Active' : 'Offline'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-[#AAAAAA] dark:text-zinc-500 font-medium">{person.role}</div>
                                                </div>
                                                <div className="px-3 py-1 bg-[#F7F7F5] dark:bg-zinc-900 rounded text-[10px] font-bold text-[#AAAAAA] dark:text-zinc-500 border border-transparent hover:border-[#E5E5E5] dark:hover:border-zinc-800 transition-all">View</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Side Vector Elements - Ambient Background */}
                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-20 pointer-events-none">
                                    <div className="size-1 bg-[#111111] dark:bg-white rounded-full"></div>
                                    <div className="w-12 h-px bg-[#111111] dark:bg-white"></div>
                                    <div className="size-1.5 border border-[#111111] dark:bg-white rounded-full"></div>
                                </div>
                                <div className="absolute -right-8 top-1/4 opacity-10 pointer-events-none rotate-12">
                                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                        <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-[#111111] dark:text-white" />
                                    </svg>
                                </div>
                                
                                {/* Overlapping Vector 1: Top Security Badge */}
                                <div className="absolute -top-5 left-29 bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[8px] font-bold px-3 py-1 rounded-full z-80 shadow-xl flex items-center gap-1.5 float-element border border-white/10 dark:border-black/10">
                                    <Shield className="size-2.5 text-emerald-400 dark:text-[#2E7D32]" /> 
                                    <span className="tracking-widest uppercase">Encrypted</span>
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[8px] font-bold px-3 py-3 rounded-full z-30 shadow-xl flex items-center gap-1.5 float-element border border-white/10 dark:border-black/10">
                                    <Clock className="size-2.5 text-emerald-400 dark:text-[#2E7D32]" /> 
                                    <span className="tracking-widest uppercase">Real Time Collaboration</span>
                                </div>

                                {/* Overlapping Vector 2: Left Decorative Node */}
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent via-[#111111] dark:via-white to-transparent z-20 opacity-30">
                                    <div className="absolute -left-1 -top-1 size-2 rounded-full border border-[#111111] dark:border-white animate-pulse"></div>
                                </div>
                                {/* Floating Element for future animation */}
                                <div className="absolute -right-4 -bottom-6 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-20 w-56 float-element hidden md:block">
                                    <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-zinc-800 pb-3 mb-3">
                                        <div className="size-8 rounded-full bg-[#111111] dark:bg-white flex items-center justify-center shadow-lg">
                                            <Users className="size-4 text-white dark:text-[#111111]" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#111111] dark:text-white leading-tight">Team Synergy</div>
                                            <div className="text-[9px] text-[#AAAAAA] dark:text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                                                <div className="size-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                                Capacity Index
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-400">Productivity</div>
                                            <div className="text-[10px] font-bold text-[#2E7D32] dark:text-emerald-400">+12%</div>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#F7F7F5] dark:bg-zinc-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full w-3/4"></div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-400">Engagement</div>
                                            <div className="text-[10px] font-bold text-[#111111] dark:text-white">High</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Real-time Analytics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div className="order-2 md:order-1 bg-[#F7F7F5] dark:bg-zinc-900/50 rounded-xl p-8 border border-[#E5E5E5] dark:border-zinc-800 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none min-h-[350px] flex flex-col items-center justify-center relative group cursor-default">
                                <div className="w-full max-w-sm flex items-end justify-between h-32 gap-3 pb-6 border-b border-[#E5E5E5] dark:border-zinc-800 mb-6 relative z-10 transition-transform duration-500 group-hover:scale-105">
                                    {/* Abstract Line Overlay */}
                                    <svg className="absolute inset-0 w-full h-full pb-6 z-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <path d="M0,80 Q25,40 50,60 T100,20" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500/20 dark:text-emerald-400/10" strokeDasharray="5,5"/>
                                    </svg>
                                    {[40, 70, 45, 90, 65, 100].map((h, i) => (
                                        <div key={i} className="w-12 bg-[#F7F7F5] dark:bg-zinc-800/50 rounded-t-md relative h-full flex items-end z-10">
                                            <div style={{ height: `${h}%` }} className="w-full bg-[#111111] dark:bg-white rounded-t-md relative transition-all duration-300 shadow-sm">
                                                {/* Tooltip for future animation */}
                                                {i === 4 && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[9px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 float-element transition-opacity duration-300 shadow-xl border border-white/10">Peak: 92%</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Extra Card: System Load */}
                                <div className="absolute -left-6 -bottom-6 bg-[#111111] dark:bg-white p-3.5 rounded-lg shadow-2xl z-40 w-40 float-element hidden xl:block border border-white/10 dark:border-black/10">
                                    <div className="text-[8px] font-bold text-white/50 dark:text-black/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        System Load
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-bold text-white dark:text-[#111111]">24.8%</div>
                                        <div className="flex-1 h-1 bg-white/20 dark:bg-black/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 dark:bg-[#2E7D32] w-1/4"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Added: Third Overlapping Badge: Real-time Users */}
                                <div className="absolute -top-0.5 pl-6 right-12 -translate-y-1/2 bg-white dark:bg-zinc-700 py-2 px-3 rounded-full shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-20 float-element hidden xl:flex items-center gap-2 hover:scale-110 transition-transform">
                                    <Users className="size-3 text-[#111111] dark:text-white" />
                                    <span className="text-[9px] font-bold text-[#111111] dark:text-white">1,284 <span className="text-[#AAAAAA] ml-1">Live</span></span>
                                </div>

                                <div className="w-full space-y-3 max-w-sm relative z-10">
                                    <div className="flex justify-between text-[10px] font-sans text-[#6B6B6B] dark:text-zinc-400 uppercase tracking-widest">
                                        <span>System Throughput</span>
                                        <span className="font-bold text-[#111111] dark:text-white">92.4% Optimal</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#E5E5E5] dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-[92%] relative">
                                            <div className="absolute inset-y-0 right-0 bg-white/20 dark:bg-black/20 w-1/4 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Side Vector Elements for Analytics */}
                                <div className="absolute top-10 right-10 flex gap-2 opacity-30 pointer-events-none">
                                    <div className="size-1 bg-emerald-500 rounded-full animate-ping"></div>
                                    <div className="size-1 bg-emerald-500 rounded-full"></div>
                                </div>
                                
                                {/* Floating KPI Card: Revenue */}
                                <div className="absolute -left-6 top-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-20 flex items-center gap-3 float-element hidden md:flex transition-all hover:scale-105">
                                    <div className="size-10 rounded-md bg-[#E8F5E3] dark:bg-emerald-900/30 flex items-center justify-center border border-[#2E7D32]/20 dark:border-emerald-500/20 shadow-sm">
                                        <FileBarChart className="size-4 text-[#2E7D32] dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="text-[#AAAAAA] dark:text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Revenue Growth</div>
                                            <span className="text-[7px] bg-emerald-500/10 text-emerald-500 px-1 rounded font-bold">LIVE</span>
                                        </div>
                                                                              
                                        <div className="text-[#111111] dark:text-white font-bold text-sm">+24.5%</div>
                                    </div>
                                </div>

                                {/* NEW: Overlapping Mini Card: Project Health */}
                                <div className="absolute -right-6 -bottom-4 bg-white dark:bg-zinc-800 p-3.5 rounded-lg shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-30 w-44 float-element hidden lg:block transition-all hover:scale-110">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#F0F0F0] dark:border-zinc-800">
                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <div className="text-[9px] font-bold text-[#111111] dark:text-white uppercase tracking-widest">Project Health</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-emerald-500">Optimal</div>
                                        <div className="text-[9px] text-[#6B6B6B] dark:text-zinc-500">v2.4.0</div>
                                    </div>
                                </div>

                                {/* Overlapping Vector: Top Analytics Label */}
                                <div className="absolute -top-4.5 right-1/4 bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[8px] font-bold px-3 py-2 rounded-full z-30 shadow-xl flex items-center gap-1.5 float-element border border-white/10 dark:border-black/10">
                                    <Clock className="size-2.5 text-emerald-400 dark:text-[#2E7D32]" /> 
                                    <span className="tracking-widest uppercase">Live Metrics</span>
                                </div>
                            </div>
                            <div className="order-1 md:order-2">
                                <span className="bg-[#E8F5E3] text-[#2E7D32] dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-sans px-3 py-1 rounded-full mb-6 inline-block">
                                    Analytics
                                </span>
                                <h3 className="font-serif text-3xl font-bold leading-tight text-[#111111] dark:text-white mb-4">
                                    Real-time Analytics
                                </h3>
                                <div className="font-sans text-base leading-relaxed text-[#6B6B6B] dark:text-zinc-400 mb-6">
                                    Deep analytical tools to understand team capacity, forecast project health, and drive business growth through actionable metrics.

                                    {/* Sub-Features: Analytics Specific */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <FileBarChart className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Predictive Scaling</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">Anticipate growth with AI models.</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Live Heartbeat</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">Real-time status of every node.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Agile Tracking */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div>
                                <span className="bg-[#E8F5E3] text-[#2E7D32] dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-sans px-3 py-1 rounded-full mb-6 inline-block">
                                    Agile
                                </span>
                                <h3 className="font-serif text-3xl font-bold leading-tight text-[#111111] dark:text-white mb-4">
                                    Agile Tracking
                                </h3>
                                <div className="font-sans text-base leading-relaxed text-[#6B6B6B] dark:text-zinc-400 mb-6">
                                    Visualize project progress instantly with interactive workflow boards, timelines, and customizable class states. 
                                    Maintain total operational integrity across every sprint with automated status transitions and real-time backlog health monitoring.

                                    {/* Sub-Features: Agile Specific */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <LayoutGrid className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Sprint Velocity</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">Track team speed and output.</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <Calendar className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Timeline View</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">Gantt-style roadmap planning.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 rounded-xl border border-[#E5E5E5] dark:border-zinc-800 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none min-h-[380px] flex items-center justify-center relative group cursor-default">
                                {/* NEW: Black Heading for Kanban Board - With rounded-t-xl to match parent */}
                                <div className="absolute top-0 left-0 right-0 bg-[#111111] dark:bg-white px-5 py-3 flex items-center justify-between border-b border-white/10 dark:border-black/5 z-30 rounded-t-xl">
                                    <div className="text-[10px] font-bold text-white dark:text-[#111111] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <LayoutGrid className="size-3 text-emerald-400 dark:text-emerald-600" />
                                        Sprint Workspace
                                    </div>
                                    <div className="flex gap-1.5 opacity-40">
                                        <div className="size-1.5 rounded-full bg-white dark:bg-black"></div>
                                        <div className="size-1.5 rounded-full bg-white dark:bg-black"></div>
                                        <div className="size-1.5 rounded-full bg-white dark:bg-black"></div>
                                    </div>
                                </div>

                                {/* Refined Overlapping Card: Backlog Health */}
                                <div className="absolute -left-6 -bottom-4 bg-white dark:bg-[#0F0F0E] rounded-lg shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-180 w-44 float-element hidden lg:block transition-all hover:scale-105 overflow-hidden">
                                    <div className="bg-[#111111] dark:bg-white px-3 py-2 flex items-center justify-between">
                                        <div className="text-[9px] font-bold text-white dark:text-[#111111] uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="size-3 text-emerald-400 dark:text-emerald-600" />
                                            Velocity
                                        </div>
                                        <div className="text-[9px] font-bold text-emerald-400 dark:text-emerald-600">84%</div>
                                    </div>
                                    <div className="p-3 dark:bg-zinc-800">
                                        <div className="h-1.5 w-full bg-[#F7F7F5] dark:bg-zinc-300 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-emerald-500 rounded-full w-[84%]"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Added: Third Overlapping Badge: Sprint Status */}
                                <div className="absolute top-22 -left-8 -translate-y-1/2 bg-black dark:bg-white py-2 px-4 rounded-full shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-50 float-element hidden xl:flex items-center gap-2 hover:scale-110 transition-transform">
                                    <div className="size-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    <span className="text-[8px] font-bold text-white dark:text-black uppercase tracking-[0.2em]">Active Sprint</span>
                                </div>

                                <div className="flex gap-4 w-full h-full relative z-10 p-8 pt-16">
                                    {[
                                        { title: 'To Do', items: ['Market Research', 'UX Audit'], color: 'bg-rose-500' },
                                        { title: 'In Progress', items: ['Auth Module'], color: 'bg-amber-500' },
                                        { title: 'Done', items: ['Design System'], color: 'bg-emerald-500' }
                                    ].map((col, colIndex) => (
                                        <div key={colIndex} className="flex-1 bg-white dark:bg-[#0F0F0E] border border-[#E5E5E5] dark:border-zinc-800 rounded-lg p-3 flex flex-col gap-3 shadow-sm relative overflow-hidden group/col">
                                            {/* Subtitle Accent Line */}
                                            <div className={`absolute top-0 left-0 w-full h-0.5 ${col.color} opacity-20`}></div>
                                            
                                            <div className="flex justify-between items-center px-1 mb-1">
                                                <div className="text-[9px] font-bold text-[#AAAAAA] dark:text-zinc-500 uppercase tracking-widest">{col.title}</div>
                                                <div className={`size-2.5 ${col.color} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                                            </div>
                                            {col.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="bg-[#F7F7F5] dark:bg-zinc-900 p-2.5 rounded-md border border-[#E5E5E5] dark:border-zinc-800 space-y-2.5 float-element transition-transform duration-300 group/task hover:border-emerald-500/30">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="text-[10px] font-bold text-[#111111] dark:text-white leading-tight flex-1">{item}</div>
                                                        <div className="size-5 rounded-full bg-[#111111] dark:bg-white flex items-center justify-center text-white dark:text-[#111111] text-[8px] font-bold shrink-0 shadow-sm transition-transform group-hover/task:scale-110">
                                                            {item.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-1">
                                                            <div className="h-1 w-6 bg-[#E8F5E3] dark:bg-emerald-500/30 rounded"></div>
                                                            <div className="h-1 w-4 bg-[#E5E5E5] dark:bg-zinc-700 rounded"></div>
                                                        </div>
                                                        {item === 'UX Audit' && <span className="text-[7px] font-bold text-rose-500 bg-rose-500/10 px-1 rounded uppercase tracking-tighter">High</span>}
                                                    </div>
                                                </div>
                                            ))}
                                            {colIndex === 1 && (
                                                <div className="mt-auto pt-2 opacity-50">
                                                    <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* Ambient Background Elements for Agile */}
                                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
                                    <svg width="100%" height="100%">
                                        <defs>
                                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#111111] dark:text-white" />
                                            </pattern>
                                        </defs> patternUnits="userSpaceOnUse"
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                    </svg>
                                </div>
                                {/* Refined Overlapping Toast: Task Status */}
                                <div className="absolute -bottom-8 -right-8 bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-3 px-5 rounded-lg shadow-2xl border border-[#222222] dark:border-[#E5E5E5] z-50 flex items-center gap-3 float-element hidden md:flex transition-all hover:scale-110">
                                    <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                        <CheckCircle2 className="size-3.5 text-white" />
                                    </div>
                                    <div className="text-xs font-semibold font-sans tracking-tight">Task Moved to QA</div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4: Seamless Integrations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div className="order-2 md:order-1 bg-[#F7F7F5] dark:bg-zinc-900/50 rounded-xl border border-[#E5E5E5] dark:border-zinc-800 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none min-h-[400px] flex items-center justify-center relative group cursor-default">
                                {/* NEW: Black Heading for Integration Hub */}
                                <div className="absolute top-0 left-0 right-0 bg-[#111111] dark:bg-white px-5 py-3 flex items-center justify-between border-b border-white/10 dark:border-black/5 z-30 rounded-t-xl">
                                    <div className="text-[10px] font-bold text-white dark:text-[#111111] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        Network Operations
                                    </div>
                                    <div className="text-[9px] font-bold text-emerald-400 dark:text-emerald-600 tracking-tighter">SECURE.SYNC</div>
                                </div>

                                {/* Refined Overlapping Pill: Integration Status */}
                                <div className="absolute -left-4 top-16 bg-white dark:bg-zinc-700 px-4 py-2 rounded-full shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-30 flex items-center gap-2 float-element hidden md:flex transition-all hover:scale-110">
                                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-[#111111] dark:text-white uppercase tracking-[0.2em]">System Synced</span>
                                </div>

                                {/* NEW: Overlapping Card: Data Stream */}
                                <div className="absolute -right-6 -bottom-6 bg-[#111111] dark:bg-white p-3.5 rounded-lg shadow-2xl z-40 w-44 float-element hidden lg:block border border-white/10 dark:border-black/10">
                                    <div className="text-[8px] font-bold text-white/50 dark:text-black/50 uppercase tracking-widest mb-2">Live Data Feed</div>
                                    <div className="space-y-1.5">
                                        <div className="h-1 w-full bg-white/10 dark:bg-black/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 w-3/4 animate-pulse"></div>
                                        </div>
                                        <div className="h-1 w-2/3 bg-white/10 dark:bg-black/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 w-1/2 delay-75 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Added: Third Overlapping Badge: Latency Status */}
                                <div className="absolute bottom-10 -left-4 -translate-y-1/2 bg-white dark:bg-zinc-700 py-2 px-4 rounded-full shadow-2xl border border-[#E5E5E5] dark:border-zinc-800 z-50 float-element hidden xl:flex items-center gap-2 hover:scale-110 transition-transform">
                                    <Activity className="size-3 text-emerald-500" />
                                    <span className="text-[9px] font-bold text-[#111111] dark:text-white uppercase tracking-[0.2em]">14ms Latency</span>
                                </div>

                                <div className="relative flex items-center justify-center w-full h-full z-10">
                                    {/* Central Node */}
                                    <div className="absolute size-24 rounded-full bg-[#111111] dark:bg-white flex flex-col items-center justify-center text-white dark:text-[#111111] z-30 float-element border border-[#222222] dark:border-[#E5E5E5] shadow-2xl transition-all group-hover:scale-110">
                                        <LayoutGrid className="size-8 mb-1" />
                                        
                                        {/* Pulse effect rings */}
                                        <div className="absolute inset-0 border border-[#111111] dark:border-white rounded-full opacity-20 scale-[1.3] animate-pulse"></div>
                                        <div className="absolute inset-0 border border-[#111111] dark:border-white rounded-full opacity-10 scale-[1.6]"></div>
                                    </div>
                                    
                                    {/* Orbit 1 */}
                                    <div className="absolute size-[220px] rounded-full border border-dashed border-[#AAAAAA] dark:border-zinc-700/50 z-10 transition-transform duration-[20s] linear animate-[spin_20s_linear_infinite]"></div>
                                    {/* Orbit 2 */}
                                    <div className="absolute size-[340px] rounded-full border border-[#E5E5E5] dark:border-zinc-800/50 z-0 animate-[spin_30s_linear_infinite_reverse]"></div>

                                    {/* Orbiting nodes */}
                                    <div className="absolute inset-0 z-20 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                                        <div className="absolute -top-4 left-12 size-14 bg-white dark:bg-[#0F0F0E] border border-[#E5E5E5] dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col items-center justify-center float-element transition-all hover:border-emerald-500/40 group/node">
                                            <div className="absolute -top-1 -right-1 size-5 bg-[#111111] dark:bg-emerald-500 rounded-full flex items-center justify-center text-white dark:text-[#111111] text-[8px] font-bold border border-white/20">R</div>
                                            <Users className="size-5 text-[#111111] dark:text-white mb-0.5" />
                                            <div className="text-[7px] font-bold uppercase">Role base</div>
                                        </div>
                                        <div className="absolute -top-26 right-17 size-14 bg-white dark:bg-[#0F0F0E] border border-[#E5E5E5] dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col items-center justify-center float-element transition-all hover:border-emerald-500/40 group/node">
                                            <div className="absolute -top-1 -right-1 size-5 bg-[#111111] dark:bg-emerald-500 rounded-full flex items-center justify-center text-white dark:text-[#111111] text-[8px] font-bold border border-white/20">T</div>
                                            <FileBarChart className="size-5 text-[#111111] dark:text-white mb-0.5" />
                                            <div className="text-[7px] font-bold uppercase">Tracking</div>
                                        </div>
                                        <div className="absolute top-18 right-22 size-12 bg-white dark:bg-[#0F0F0E] border border-[#E5E5E5] dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col items-center justify-center float-element transition-all hover:border-emerald-500/40 group/node">
                                            <div className="absolute -top-1 -right-1 size-4 bg-[#111111] dark:bg-emerald-500 rounded-full flex items-center justify-center text-white dark:text-[#111111] text-[7px] font-bold border border-white/20">C</div>
                                            <Calendar className="size-4 text-[#111111] dark:text-white mb-0.5" />
                                            <div className="text-[7px] font-bold uppercase">Calender</div>
                                        </div>
                                        <div className="absolute top-36 left-45 size-12 bg-[#E8F5E3] dark:bg-emerald-900/30 border border-[#2E7D32] dark:border-emerald-500 rounded-2xl shadow-xl flex flex-col items-center justify-center float-element transition-all group/node">
                                            <div className="absolute -top-1 -right-1 size-4 bg-[#2E7D32] dark:bg-emerald-400 rounded-full flex items-center justify-center text-white dark:text-[#111111] text-[7px] font-bold border border-white/20">O</div>
                                            <Shield className="size-4 text-[#2E7D32] dark:text-emerald-400 mb-0.5" />
                                            <div className="text-[7px] font-bold uppercase">OAuth</div>
                                        </div>
                                    </div>
                                    
                                    {/* Side Vector Elements for Integrations */}
                                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                                        <div className="absolute top-1/4 left-1/4 size-20 border border-[#111111] dark:border-white rounded-full rotate-45"></div>
                                        <div className="absolute bottom-1/4 right-1/4 size-32 border border-[#111111] dark:border-white rounded-full -rotate-12"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 md:order-2">
                                <span className="bg-[#E8F5E3] text-[#2E7D32] dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-sans px-3 py-1 rounded-full mb-6 inline-block">
                                    Integrations
                                </span>
                                <h3 className="font-serif text-3xl font-bold leading-tight text-[#111111] dark:text-white mb-4">
                                    Seamless Integrations
                                </h3>
                                <div className="font-sans text-base leading-relaxed text-[#6B6B6B] dark:text-zinc-400 mb-6">
                                    Invite your new team members and get started instantly. Supervised Team collaborations and calendar synced deadlines made the work easy to handle the mess alone.

                                    {/* Sub-Features: Integration Specific */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <Users className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Active Sync</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">Zero-latency data exchange.</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                                                <Shield className="size-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-[#111111] dark:text-white">Unified Auth</div>
                                                <div className="text-[10px] text-[#6B6B6B] dark:text-zinc-500">SSO for all connected tools.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Utilities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-32 mt-32 border-t border-[#E5E5E5] dark:border-zinc-800">
                        {[
                            { icon: Shield, title: "Performance Tracking", desc: "Monitor employee performance with real-time metrics and analytics.", tag: "Verified", stat: "98.4% Efficiency" },
                            { icon: Calendar, title: "Deadline Tracking", desc: "Monitor project milestones and keep your team in sync to deadlines.", tag: "Live", stat: "12 Deadlines" },
                            { icon: Users, title: "Capacity Planning", desc: "Predict team bandwidth and balance workloads efficiently.", tag: "Active", stat: "48 Nodes" },
                            { icon: FileBarChart, title: "Detailed Reports", desc: "Allows you to review detailed project reports in real-time.", tag: "Ready", stat: "Daily Export" },
                        ].map((item, i) => (
                            <div key={i} className="bg-[#F7F7F5] dark:bg-zinc-900 rounded-xl p-8 border border-[#E5E5E5] dark:border-zinc-800 shadow-[0_2px_16px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-2xl transition-all duration-500 relative group cursor-default hover:-translate-y-2">
                                {/* Overlapping Tag */}
                                <div className="absolute -top-3 -left-3 bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] z-20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {item.tag}
                                </div>
                                
                                {/* Decorative Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/5 transition-colors duration-500 pointer-events-none"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="size-12 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center text-white dark:text-[#111111] shadow-lg group-hover:scale-110 transition-transform duration-500">
                                        <item.icon className="size-5" />
                                    </div>
                                    <div className="flex gap-1.5 h-8 items-end">
                                        {[1,2,3,4].map(bar => (
                                            <div key={bar} className="w-1.5 bg-[#111111] dark:bg-emerald-500 rounded-full transition-all duration-500" style={{ height: `${20 + (bar * 20)}%`, opacity: 0.1 + (bar * 0.1) }}></div>
                                        ))}
                                    </div>
                                </div>
                                
                                <h4 className="font-sans font-bold text-lg text-[#111111] dark:text-white mb-3 relative z-10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-[#6B6B6B] dark:text-zinc-400 leading-relaxed mb-6 relative z-10">
                                    {item.desc}
                                </p>
                                
                                {/* Secondary Metric */}
                                <div className="flex items-center gap-2 relative z-10 border-t border-[#E5E5E5] dark:border-zinc-800 pt-4">
                                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-[#111111] dark:text-white uppercase tracking-widest opacity-60">{item.stat}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Minimalistic Dark Footer */}
            <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] py-16 relative overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 pb-12 border-b border-[#1A1A1A]">
                        <div>
                            <h2 className="text-xl font-serif text-white font-bold mb-3">
                                Ready to upgrade your workflow?
                            </h2>
                            <p className="text-white/60 font-sans text-sm max-w-sm">
                                Join modern teams leveraging OfficeOS to bring order to their organizational chaos.
                            </p>
                        </div>
                        <div className="flex justify-start md:justify-end">
                            <Link to="/signup-hr" className="bg-white text-black px-6 py-2.5 rounded text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#E5E5E5] transition-all">
                                Get started
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="size-6 bg-white rounded flex items-center justify-center">
                                    <LayoutGrid className="size-3.5 text-black" />
                                </div>
                                <span className="text-sm font-bold font-serif text-white tracking-tight">OfficeOS</span>
                            </div>
                            <div className="h-4 w-[1px] bg-[#222222] hidden md:block"></div>
                            <nav className="flex gap-4">
                                {['Product', 'Company', 'Support'].map(link => (
                                    <a key={link} href="#" className="text-[10px] font-bold text-[#444444] hover:text-white uppercase tracking-widest transition-colors">{link}</a>
                                ))}
                            </nav>
                        </div>
                        <p className="text-[10px] text-white/60 font-medium tracking-tight">
                            © 2024 OfficeOS. Academic Project. Batch 2022 — FYP.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
