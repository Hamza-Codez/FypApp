import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, fetchEmployees } from '../features/workspaceSlice';
import { Plus, Briefcase, Users, Layout, Zap, CheckCircle2, TrendingUp, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateProjectDialog from '../components/CreateProjectDialog';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { projects, employees, loading } = useSelector((state) => state.workspace);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchEmployees());
    }, [dispatch]);

    // Calculate quick stats
    const stats = [
        { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10' },
        { label: 'Open Tasks', value: projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
        { label: 'Productivity', value: '92%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
    ];

    if (user?.role?.toUpperCase() === 'HR') {
        stats.splice(1, 0, { label: 'Team Members', value: employees.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' });
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="relative z-10 space-y-2">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/20 uppercase tracking-widest">
                       <Zap className="size-3" />
                       {user?.role?.toUpperCase() === 'HR' ? 'Admin Dashboard' : 'Member Workspace'}
                   </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Good day, {user?.first_name || 'User'}!
                    </h1>
                    <p className="text-blue-100/80 text-lg font-medium">
                        {user?.role === 'HR' 
                            ? `Your organization is currently handling ${projects.length} projects with high efficiency.`
                            : `You are currently assigned to ${projects.filter(p => p.assigned_to?.includes(user.id)).length} active projects.`}
                    </p>
                </div>
                {user?.role?.toUpperCase() === 'HR' && (
                  <div className="relative z-10 flex gap-4">
                    <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl">
                      <Plus className="size-5" /> New Project
                    </button>
                    <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                  </div>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="size-6" />
                            </div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global</span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black dark:text-white tabular-nums tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Projects Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold dark:text-white">Active Projects</h2>
                        <Link to="/dashboard/projects" className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1 group">
                          View details <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {projects.length > 0 ? (
                            projects.slice(0, 4).map((p) => (
                                <Link key={p.id} to={`/dashboard/projectsDetail?id=${p.id}`} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden" >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="size-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center dark:text-white">
                                          <Briefcase className="size-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-2 py-1 border border-zinc-200 dark:border-zinc-800 rounded-md">
                                          {p.status || 'Active'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-extrabold uppercase text-zinc-400 tracking-tighter">
                                            <span>Progress</span>
                                            <span>{p.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress || 0}%` }}></div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                          <div className="col-span-2 p-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-dashed border-zinc-300 dark:border-zinc-800">
                            <Briefcase className="size-12 mx-auto text-zinc-300 mb-4" />
                            <p className="text-zinc-500 font-medium font-sans">No active projects found.</p>
                          </div>
                        )}
                    </div>
                </div>

                {/* Team & Sidebar Info */}
                {user?.role?.toUpperCase() === 'HR' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold dark:text-white">Recent Team</h2>
                            <Link to="/dashboard/team" className="text-sm font-bold text-blue-600 hover:underline">All members</Link>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] space-y-6 text-zinc-900 dark:text-white">
                            {employees.slice(0, 5).map((e, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                  <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                        <Users className="size-5 text-zinc-500" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold dark:text-white truncate">{e.first_name} {e.last_name}</p>
                                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{e.role || 'Member'}</p>
                                    </div>
                                  </div>
                                  <div className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="size-4 dark:text-white" />
                                  </div>
                                </div>
                            ))}
                        </div>

                        {/* Schedule Snippet */}
                        <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-zinc-800">
                            <CalendarDays className="size-12 text-blue-600 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-bold mb-2">Team Sync-up</h3>
                            <p className="text-zinc-400 text-xs mb-6">Discussing "Global Launch" roadmap and Q4 expansion goals.</p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] bg-blue-600 px-2 py-1 rounded font-black tracking-widest uppercase">Tomorrow, 10 AM</span>
                                <div className="flex -space-x-2">
                                     <div className="size-7 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-900">
                                        <Users className="size-3 text-zinc-400" />
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
