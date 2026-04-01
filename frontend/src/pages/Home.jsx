import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { LayoutGrid, Users, Briefcase, Zap, Shield, BarChart3, ChevronRight, CheckCircle2, Sparkles, MessageSquare, Sun, Moon, TrendingUp, PieChart, Activity, Clock } from 'lucide-react';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);
    const isEmployee = user?.role?.toUpperCase() === 'EMPLOYEE';
    const isHR = user?.role?.toUpperCase() === 'HR';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const elements = document.querySelectorAll('.icon-animate');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // -- Role-Based Hero Content --
    const heroTitle = isEmployee 
        ? <>Master your <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">Personal Workflow</span> <br /> in one powerful platform.</>
        : <>Streamline your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Office Ecosystem</span> <br /> in one powerful platform.</>;
    
    const heroSubtext = isEmployee
        ? "The all-in-one workspace to track your tasks, visualize upcoming deadlines, and collaborate seamlessly with your team. Built for high-performance individuals."
        : "The all-in-one workspace for HR automation, project tracking, and team collaboration. Join thousands of high-output teams worldwide.";

    const ctaPrimary = isEmployee ? "Manage Tasks" : isHR ? "Evaluate Talent" : "Start for Free";
    const ctaIcon = isEmployee ? <Clock className="size-5" /> : isHR ? <Users className="size-5" /> : <ChevronRight className="size-5" />;

    return (
        <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen">
            {/* ... styles ... */}
            <style>{`
                .icon-animate {
                    opacity: 0;
                    transform: scale(0.2) rotate(-5deg);
                    transition: all 0.7s cubic-bezier(0.34, 0.56, 0.64, 0.1);
                }
                .icon-animate.is-visible {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
                @keyframes smooth-wave {
                    0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.2; }
                    50% { transform: translateY(-12px) scaleY(1.05); opacity: 1; }
                }
                .wave-line {
                    animation: smooth-wave 8s ease-in-out infinite;
                    transform-origin: center;
                }
                @keyframes float-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float-subtle {
                    animation: float-subtle 6s ease-in-out infinite;
                }
                .animate-float-subtle-delayed {
                    animation: float-subtle 6s ease-in-out infinite 3s;
                }
            `}</style>
            
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-black dark:bg-white rounded-lg">
                                <LayoutGrid className="size-5 text-white dark:text-black" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                OfficeOS
                            </span>
                        </div>
                       
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsDarkMode(!isDarkMode)} 
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
                            </button>
                            {token ? (
                                <>
                                    <button 
                                        onClick={handleLogout} 
                                        className="text-sm font-medium hover:text-red-600 transition-colors text-zinc-900 dark:text-white"
                                    >
                                        Sign Out
                                    </button>
                                    <Link 
                                        to="/dashboard" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium hover:text-blue-600 transition-colors text-zinc-900 dark:text-white">Login</Link>
                                    <Link to="/signup-hr" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Abstract Minimalist Wavy Background Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-90 dark:opacity-90 flex items-center justify-center">
                    <svg viewBox="0 0 1000 600" className="w-[150%] max-w-[1600px] h-[550px]" preserveAspectRatio="none">
                        <g fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-700 dark:text-white">
                            {Array.from({length: 12}).map((_, i) => (
                                <path 
                                    key={i} 
                                    d={`M-200,${280 + i * 12} C500,${480 - i * 8} 750,${120 + i * 12} 1000,${350 - i * 6} C1250,${600 + i * 8} 1100,${150 - i * 10} 1300,${300 + i * 12}`} 
                                    className="wave-line"
                                    style={{ animationDelay: `${i * 0.3}s` }}
                                />
                            ))}
                        </g>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent border border-blue-200 dark:border-white text-black dark:text-white text-sm font-medium mb-6">
                        <span>{isEmployee ? "Your Personal Productivity Node" : "The Future of Workspace Management"}</span>
                    </div>
                    <h4 className="text-5xl md:text-7xl font-semibold leading-[1.1]">
                        {heroTitle}
                    </h4>
                    <p className="text-xl md:text-md text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mt-4">
                        {heroSubtext}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-6">
                        <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-2.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-900/10 dark:shadow-white/10 uppercase text-[11px] tracking-widest">
                            Explore Features <LayoutGrid className="size-4" />
                        </a>
                        <Link to={token ? "/dashboard" : "/login"} className="w-full sm:w-auto px-8 py-2.5 rounded-full font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center text-[11px] uppercase tracking-widest">
                            Explore Workspace
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="pt-14 pb-18 mx-12 bg-[#fafaf8] dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need to scale</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-base max-w-2xl mx-auto">
                            Discover a powerful suite of tools completely designed to manage modern organizations and supercharge remote-first teams. OfficeOS is the definitive all-in-one infrastructure.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* AI-Powered HR Automation (8 Cols) */}
                        <div className="group col-span-1 lg:col-span-8 bg-[#f4f5fa] dark:bg-zinc-900/50 rounded-2xl p-6 flex flex-col md:flex-row relative overflow-hidden h-auto min-h-[380px] border border-transparent dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)]">
                            <div className="md:w-[55%] flex flex-col justify-center relative z-10 pr-0 md:pr-4">
                                <div className="icon-animate p-2.5 bg-blue-600 rounded-md w-fit text-white mb-5 shadow-[0_8px_30px_rgb(37,99,235,0.3)] flex-shrink-0">
                                    <Users className="size-5" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">AI-Powered HR Automation</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-5 max-w-[95%]">
                                    Streamline your entire workforce management. From automated onboarding workflows to seamless payroll processing and benefits administration, OfficeOS handles the complex HR tasks effortlessly.
                                </p>
                                <ul className="space-y-2.5">
                                    <li className="flex items-center gap-3 text-sm text-zinc-800 dark:text-zinc-200 font-medium"><CheckCircle2 className="size-4 text-blue-500"/> Effortless one-click payroll</li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-800 dark:text-zinc-200 font-medium"><CheckCircle2 className="size-4 text-blue-500"/> Automated 10-step onboarding</li>
                                </ul>
                            </div>
                            
                            <div className="md:w-[45%] absolute md:relative -bottom-24 md:-bottom-8 -right-8 md:-right-4 mt-10 md:mt-16 flex items-center justify-end z-0">
                                {/* Visual Mockup */}
                                <div className="animate-float-subtle bg-white dark:bg-zinc-950 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800 p-4 w-[320px] group-hover:-translate-x-4 transition-transform duration-700 group-hover:rotate-1">
                                    <div className="text-[11px] font-semibold mb-4 text-zinc-800 dark:text-zinc-200 flex justify-between items-center">
                                        <span>Employee Directory</span>
                                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] px-2 py-0.5 rounded-full">+4 New</span>
                                    </div>
                                    <div className="flex text-[10px] text-zinc-400 font-medium mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <div className="flex-1">Name</div>
                                        <div className="w-16">Role</div>
                                        <div className="w-16 text-right">Status</div>
                                    </div>
                                    {[ 
                                        { name: "John Doe", role: "Engineer", status: "Active" },
                                        { name: "Jane Smith", role: "Designer", status: "Active" },
                                        { name: "Alex Jones", role: "Product", status: "Review" },
                                        { name: "Sam Wilson", role: "Sales", status: "Active" },
                                    ].map((row, i) => (
                                        <div key={i} className="flex text-[11px] text-zinc-600 dark:text-zinc-300 mb-3 items-center">
                                            <div className="flex-1 font-medium">{row.name}</div>
                                            <div className="w-16"><div className="bg-zinc-50 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded text-[8px] border border-zinc-100 dark:border-zinc-700 w-fit">{row.role}</div></div>
                                            <div className="w-16 flex justify-end">
                                                <div className={`${row.status === 'Active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'} px-2 flex items-center h-4 rounded-full text-[9px] font-medium`}>{row.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Real-time Analytics (4 Cols) */}
                        <div className="group col-span-1 lg:col-span-4 bg-[#f4f5fa] dark:bg-zinc-900/50 rounded-2xl p-6 flex flex-col relative overflow-hidden h-[380px] md:h-auto border border-transparent dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)]">
                            <div className="icon-animate p-2.5 bg-indigo-600 rounded-md w-fit text-white mb-5 shadow-[0_8px_30px_rgb(79,70,229,0.3)] flex-shrink-0 relative z-10">
                                <BarChart3 className="size-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Real-time Analytics</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed relative z-10">
                                Deep analytical tools to understand team capacity, forecast project health, and drive business growth through actionable metrics.
                            </p>
                            {/* Visual Mockup */}
                            <div className="animate-float-subtle-delayed absolute -bottom-12 -right-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-5 w-[260px] z-0 group-hover:-translate-y-6 transition-transform duration-700 origin-bottom-right group-hover:-rotate-2">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative size-14 rounded-full border-[4px] border-zinc-100 dark:border-zinc-800 border-t-indigo-600 border-r-indigo-600">
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">82%</div>
                                    </div>
                                    <div className="flex-1 space-y-2.5">
                                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded">
                                            <div className="h-full w-3/4 bg-indigo-600 rounded"></div>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded">
                                            <div className="h-full w-1/2 bg-purple-500 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-end gap-[3px] h-12 w-full pt-1">
                                    {[40, 60, 45, 80, 55, 95, 75, 100, 85].map((h, i) => (
                                        <div key={i} className="flex-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-t-sm relative h-full">
                                            <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-400 dark:group-hover:bg-indigo-400 transition-colors duration-700"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Agile Tracking (4 Cols) */}
                        <div className="group col-span-1 lg:col-span-4 bg-[#f4f5fa] dark:bg-zinc-900/50 rounded-2xl p-6 flex flex-col relative overflow-hidden h-[380px] md:h-auto border border-transparent dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)]">
                            <div className="absolute top-6 right-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-zinc-100 dark:border-zinc-700 z-20 group-hover:scale-110 transition-transform">
                                <div className="size-1.5 rounded-full bg-fuchsia-500 animate-pulse"></div>
                                <span className="text-[8px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">Live Sync</span>
                            </div>
                            <div className="icon-animate p-2.5 bg-fuchsia-600 rounded-md w-fit text-white mb-5 shadow-[0_8px_30px_rgb(192,38,211,0.3)] flex-shrink-0 relative z-10">
                                <Briefcase className="size-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">Agile Tracking</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed relative z-10 pr-2">
                                Visualize project progress instantly with interactive workflow boards, timelines, and customizable Kanban states.
                            </p>
                            {/* Visual Mockup */}
                            <div className="animate-float-subtle absolute -bottom-8 -left-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-xl p-4 flex gap-2.5 w-[120%] z-0 group-hover:-translate-y-6 transition-transform duration-700 border border-white dark:border-zinc-800 shadow-xl group-hover:rotate-1">
                                {['Planning', 'In Progress', 'Quality Assurance'].map((col, i) => (
                                    <div key={col} className="bg-zinc-50 dark:bg-zinc-900 w-1/3 rounded-lg p-2.5 flex flex-col gap-2.5 border border-zinc-100 dark:border-zinc-800 text-left">
                                        <div className="text-[8px] font-bold text-zinc-500 uppercase px-1">{col}</div>
                                        <div className="bg-white dark:bg-zinc-950 rounded p-2 shadow-sm border border-zinc-100 dark:border-zinc-800 h-[40px] group-hover:border-fuchsia-200 dark:group-hover:border-fuchsia-900/50 transition-colors duration-500 delay-100">
                                            <div className="h-1 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5"></div>
                                            <div className="h-1 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                                        </div>
                                        {i < 1 && (
                                            <div className="bg-white dark:bg-zinc-950 rounded p-2 shadow-sm border border-zinc-100 dark:border-zinc-800 h-[56px] group-hover:border-fuchsia-200 dark:group-hover:border-fuchsia-900/50 transition-colors duration-500 delay-300">
                                                <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-1.5"></div>
                                                <div className="h-1 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                                                <div className="flex gap-1"><div className="size-3 bg-fuchsia-100 dark:bg-fuchsia-900/50 rounded-full"></div></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Integration Hub (8 Cols) */}
                        <div className="group col-span-1 lg:col-span-8 bg-[#f4f5fa] dark:bg-zinc-900/50 rounded-2xl p-6 flex flex-col md:flex-row-reverse relative overflow-hidden h-auto min-h-[380px] border border-transparent dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)]">
                            <div className="absolute invisible -z-10 md:visible left-0 bottom-0 text-zinc-200/50 dark:text-zinc-800/50 opacity-50 scale-[2.5] -translate-x-1/4 translate-y-1/4 pointer-events-none group-hover:rotate-12 group-hover:scale-[3] transition-transform duration-1000">
                                <Sparkles className="size-64" />
                            </div>
                            
                            <div className="md:w-[45%] flex flex-col justify-center relative z-30 pl-0 md:pl-6">
                                <div className="icon-animate p-2.5 bg-emerald-600 rounded-md w-fit text-white mb-5 shadow-[0_8px_30px_rgb(5,150,105,0.3)] flex-shrink-0">
                                    <LayoutGrid className="size-5" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Seamless Integrations</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-5">
                                    Connect OfficeOS securely into your existing workflow. Enjoy native data integrations with hundreds of tools right out of the box. No manual entry required.
                                </p>
                                <button className="flex items-center gap-2 text-[13px] font-bold text-emerald-600 dark:text-emerald-500 hover:opacity-80 transition-opacity w-fit group-hover:translate-x-2 duration-300">
                                    Explore all 200+ integrations <ChevronRight className="size-4"/>
                                </button>
                            </div>

                            <div className="md:w-[55%] relative w-full h-full flex items-center justify-center mt-10 md:mt-0 min-h-[180px] z-10">
                                {/* Visual floating icons */}
                                <div className="relative size-full flex items-center justify-center z-10">
                                    {/* Central Hub */}
                                    <div className="absolute size-16 rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-500/30 flex items-center justify-center text-white z-20 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="size-6 group-hover:animate-pulse" />
                                    </div>
                                    
                                    {/* Spinning Orbit Container */}
                                    <div className="absolute inset-0 z-10 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                                        {/* Orbiting Icons */}
                                        <div className="absolute -top-1 sm:-top-4 left-6 sm:left-10 size-12 rounded-md bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-blue-500">
                                            <div className="animate-[spin_20s_linear_infinite_reverse] size-full flex items-center justify-center"><div className="w-5 h-4 border-y-[3px] border-current border-solid rotate-45 rounded-[2px]" /></div>
                                        </div>
                                        
                                        <div className="absolute bottom-4 sm:bottom-0 right-4 sm:right-6 size-12 rounded-md bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-rose-500">
                                            <div className="animate-[spin_20s_linear_infinite_reverse] size-full flex items-center justify-center"><div className="size-5 rounded-full border-[3px] border-current" /></div>
                                        </div>
                                        
                                        <div className="absolute top-8 right-2 sm:-right-4 size-10 rounded-md bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-amber-500">
                                            <div className="animate-[spin_20s_linear_infinite_reverse] size-full flex items-center justify-center"><div className="size-4 border-[3px] border-current rounded-md" /></div>
                                        </div>
                                        
                                        <div className="absolute -bottom-4 left-4 sm:left-8 size-10 rounded-md bg-white dark:bg-zinc-800 shadow-lg border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-indigo-500">
                                            <div className="animate-[spin_20s_linear_infinite_reverse] size-full flex items-center justify-center"><Activity className="size-5" /></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Dashed circular orbit lines */}
                                <div className="absolute size-[220px] sm:size-[260px] rounded-full border-[1.5px] border-dashed border-zinc-300 dark:border-zinc-700 pointer-events-none group-hover:scale-105 transition-transform duration-1000"></div>
                            </div>
                        </div>

                        {/* 4 Small Utility Cards (3 cols each) */}
                        {[
                            { icon: Shield, title: "Performance AI", desc: "Automate quarterly reviews with deeply integrated AI insights.", bgIcon: "bg-teal-600", shadow: "shadow-teal-500/30", dot: "bg-teal-400 text-teal-400", visual: <TrendingUp className="size-36" /> },
                            { icon: Zap, title: "Expense Tracking", desc: "Receipt scanning and auto-categorization for fast approvals.", bgIcon: "bg-amber-500", shadow: "shadow-amber-500/30", dot: "bg-amber-400 text-amber-400", visual: <Activity className="size-36" /> },
                            { icon: Users, title: "Capacity Planning", desc: "Predict team bandwidth and balance workloads efficiently.", bgIcon: "bg-purple-600", shadow: "shadow-purple-500/30", dot: "bg-purple-400 text-purple-400", visual: <PieChart className="size-36" /> },
                            { icon: MessageSquare, title: "Unified Team Chat", desc: "Collaborate contextually in real-time across all active projects.", bgIcon: "bg-sky-500", shadow: "shadow-sky-500/30", dot: "bg-sky-400 text-sky-400", visual: <Clock className="size-36" /> },
                        ].map((item, i) => (
                            <div key={i} className="col-span-1 lg:col-span-3 bg-[#f4f5fa] dark:bg-zinc-900/50 rounded-xl p-5 flex flex-col justify-between relative group overflow-hidden transition-all duration-500 border border-transparent dark:border-zinc-800 hover:shadow-xl dark:hover:shadow-zinc-900/50">
                                <div className={`absolute -right-6 -bottom-6 text-zinc-900/[0.04] dark:text-white/[0.04] group-hover:scale-110 group-hover:-rotate-6 group-hover:text-zinc-900/[0.06] dark:group-hover:text-white/[0.08] transition-all duration-700 z-0 pointer-events-none`}>
                                    {item.visual}
                                </div>
                                <div className="flex justify-between items-start relative z-10 mb-6 mt-1">
                                    <div className={`icon-animate p-2.5 ${item.bgIcon} rounded-md text-white shadow-md ${item.shadow}`}>
                                        <item.icon className="size-4" />
                                    </div>
                                    <div className="absolute top-0 right-0">
                                         <span className="text-[8px] font-bold bg-white/60 dark:bg-zinc-800/60 backdrop-blur text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 tracking-wider uppercase shadow-sm">New</span>
                                    </div>
                                </div>
                                <div className="relative z-10 mt-auto">
                                    <h4 className="font-semibold tracking-tight text-sm mb-1.5 flex items-center gap-2 group-hover:ml-1 transition-all duration-300">
                                        <div className={`size-1.5 rounded-full ${item.dot} shadow-[0_0_8px_currentColor] animate-pulse`}></div>
                                        {item.title}
                                    </h4>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[90%]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-16 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden mt-auto">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-8 hover:scale-105 transition-transform duration-300">
                        <div className="p-1.5 bg-blue-600/10 dark:bg-blue-500/10 rounded-md flex items-center justify-center">
                            <LayoutGrid className="size-5 text-blue-600 dark:text-blue-500" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mt-0.5">OfficeOS</span>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                        <p className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400">
                            Built under supervision of <span className="text-zinc-900 dark:text-white font-semibold flex items-center justify-center gap-2 mt-2"><Shield className="size-4 text-blue-500" /> Professor Dr. Azam Zia</span>
                        </p>
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-500 font-medium tracking-wide">
                            Only intended to be the FYP — <span className="text-zinc-700 dark:text-zinc-300 font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-md">Batch 2022</span>
                        </p>
                    </div>

                    <div className="w-12 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full mb-8"></div>
                    
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-semibold flex items-center gap-1.5 justify-center">
                        <Sparkles className="size-3" />
                        Designed & Engineered for Academic Excellence
                    </p>
                </div>
                
                {/* Subtle base glow to anchor the footer gracefully */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 max-w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            </footer>
        </div>
    );
};

export default Home;
