import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Zap, Shield, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
    return (
        <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white min-h-screen">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <LayoutDashboard className="size-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                                OfficeOS
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
                            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium hover:text-blue-600 transition-colors">Login</Link>
                            <Link to="/signup-hr" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
                        <Zap className="size-3" />
                        <span>The Future of Workspace Management</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                        Streamline your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500">Office Ecosystem</span> <br />
                        in one powerful platform.
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        The all-in-one workspace for HR automation, project tracking, and team collaboration. Join thousands of high-output teams worldwide.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/signup-hr" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl">
                            Start for Free <ChevronRight className="size-5" />
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                            View Demo
                        </button>
                    </div>

                    {/* Dashboard Preview Overlay */}
                    <div className="relative mt-20 max-w-5xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25"></div>
                        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
                            <img 
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                                alt="Dashboard Preview" 
                                className="w-full h-auto brightness-90 dark:brightness-100"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to scale</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Tools designed for modern organizations and remote-first teams.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: "HR Automation", desc: "Effortless onboarding, employee records, and payroll management." },
                            { icon: Briefcase, title: "Project Tracking", desc: "Visualize progress with Kanban boards and real-time analytics." },
                            { icon: BarChart3, title: "Data Insights", desc: "Understand team capacity and project health with deep analytics." },
                            { icon: Zap, title: "Fast Workflow", desc: "Blazing fast performance with sub-second page loads." },
                            { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and role-based access controls." },
                            { icon: CheckCircle2, title: "Task Success", desc: "Built-in accountability with task assignment and notifications." },
                        ].map((f, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 transition-all group">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    <f.icon className="size-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="size-5 text-blue-600" />
                        <span className="text-xl font-bold">OfficeOS</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        © 2026 OfficeOS Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
