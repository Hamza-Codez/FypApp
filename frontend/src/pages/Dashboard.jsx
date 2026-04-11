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

    // Modal State
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchEmployees());
    }, [dispatch]);

    // Calculate real metrics
    const allOrgTasks = projects.flatMap(p => p.tasks || []);
    const completedOrgTasks = allOrgTasks.filter(t => t.status === 'COMPLETED').length;
    const orgProductivity = allOrgTasks.length > 0 ? Math.round((completedOrgTasks / allOrgTasks.length) * 100) : 0;

    const myTasks = projects.flatMap(p => (p.tasks || []).filter(t => t.assigned_to?.includes(user?.id)));
    const completedMyTasks = myTasks.filter(t => t.status === 'COMPLETED').length;
    const myProductivity = myTasks.length > 0 ? Math.round((completedMyTasks / myTasks.length) * 100) : 0;

    const productivityValue = user?.role?.toUpperCase() === 'HR' ? orgProductivity : myProductivity;

    const totalOpenTasks = user?.role?.toUpperCase() === 'HR' 
        ? allOrgTasks.filter(t => t.status !== 'COMPLETED').length
        : myTasks.filter(t => t.status !== 'COMPLETED').length;

    // Calculate quick stats
    const stats = [
        { label: 'Total Projects', value: projects.length, icon: Briefcase, color: 'text-zinc-700 dark:text-blue-400', bg: 'bg-zinc-100 dark:bg-blue-500/10' },
        { label: 'Open Tasks', value: totalOpenTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
        { label: 'Productivity', value: `${productivityValue}%`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    ];


    if (user?.role?.toUpperCase() === 'HR') {
        stats.splice(1, 0, { label: 'Team Members', value: employees.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' });
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                        Welcome back, {user?.first_name || 'User'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-tight">
                        {user?.role?.toUpperCase() === 'HR' 
                            ? `Monitor your organization's performance and core metrics.`
                            : `Review your active assignments and track your productivity.`}
                    </p>
                </div>
                {user?.role?.toUpperCase() === 'HR' && (
                  <div className="flex gap-3">
                    <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-black uppercase tracking-widest transition-all text-[10px] shadow-lg shadow-blue-500/20 active:scale-95">
                      <Plus className="size-4" /> New Project
                    </button>
                    <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-md hover:border-blue-400/50 dark:hover:border-blue-500/30 transition-all cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-md ${stat.bg} ${stat.color} border border-transparent dark:border-blue-500/10`}>
                                <stat.icon className="size-5" />
                            </div>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className={`grid ${user?.role?.toUpperCase() === 'HR' ? 'lg:grid-cols-[1.618fr_1fr]' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
                
                {/* Employee Specific: My Tasks */}
                {user?.role?.toUpperCase() !== 'HR' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">Your Assigned Tasks</h2>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                            {myTasks.length > 0 ? (
                                myTasks.map(task => (
                                    <Link key={task.id} to={`/dashboard/projectsDetail?id=${task.projectId}&tab=tasks`} className="group block bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-md hover:border-blue-500/30 dark:hover:bg-blue-500/5 transition-all shadow-sm" >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <h3 className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</h3>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-tight">Project: <span className="text-blue-600/80 dark:text-blue-400/80">{task.projectName}</span></p>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md inline-block ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                                                    {task.status || 'TODO'}
                                                </div>
                                                {task.due_date && (
                                                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1 justify-end">
                                                        <Clock className="size-3" /> {task.due_date}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))

                            ) : (
                                <div className="p-10 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <CheckCircle2 className="size-10 mx-auto text-zinc-300 mb-2" />
                                    <p className="text-zinc-500 text-sm">No tasks assigned to you yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Recent Projects Summary */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Active Projects</h2>
                        <Link to="/dashboard/projects" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:hover:text-white hover:text-zinc-900 flex items-center gap-1">
                          View all <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className={`grid ${user?.role?.toUpperCase() === 'HR' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                        {projects.length > 0 ? (
                            projects.slice(0, 4).map((p) => (
                                <Link key={p.id} to={`/dashboard/projectsDetail?id=${p.id}`} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group" >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="size-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-100 dark:border-zinc-700 dark:text-white text-zinc-600">
                                          <Briefcase className="size-5" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/85 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-400 px-2 py-0.5 rounded-md">
                                                {p.status || 'Active'}
                                            </span>
                                            {p.end_date && (
                                                <p className="text-[9px] text-black dark:text-zinc-500 font-black mt-1.5 uppercase tracking-tight flex items-center justify-end gap-1">
                                                    <Clock className="size-2.5" /> {p.end_date}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                    <h3 className="text-md font-semibold text-zinc-900 dark:text-white mb-1 line-clamp-1">{p.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 line-clamp-2">{p.description}</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                            <span>Progress</span>
                                            <span>{p.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-slate-700 dark:bg-slate-300 h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress || 0}%` }}></div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                          <div className="col-span-2 p-10 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800">
                            <Briefcase className="size-10 mx-auto text-zinc-300 mb-2" />
                            <p className="text-zinc-500 text-sm">No active projects found.</p>
                          </div>
                        )}
                    </div>
                </div>

                {/* Team & Sidebar Info */}
                {user?.role?.toUpperCase() === 'HR' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Team</h2>
                            <Link to="/dashboard/team" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:hover:text-white hover:text-zinc-900">All members</Link>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-md space-y-4">
                            {employees.slice(0, 5).map((e, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                        <Users className="size-4 text-zinc-500" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{e.first_name} {e.last_name}</p>
                                      <p className="text-xs text-zinc-500">{e.role || 'Member'}</p>
                                    </div>
                                  </div>
                                  <div className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="size-4 dark:text-white" />
                                  </div>
                                </div>
                            ))}
                        </div>

                        {/* Schedule Snippet */}
                        {/* <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarDays className="size-5 text-blue-600" />
                                <h3 className="text-md font-semibold text-zinc-900 dark:text-white">Team Sync-up</h3>
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Discussing "Global Launch" roadmap and Q4 goals.</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">Tomorrow, 10 AM</span>
                                <div className="flex -space-x-2">
                                     <div className="size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-white dark:border-zinc-900">
                                        <Users className="size-3 text-zinc-400" />
                                     </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
