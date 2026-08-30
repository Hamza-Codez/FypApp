import { useEffect, useState, useMemo } from 'react';
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

    // Filter projects that the current user is assigned to or leads (restricted for non-HR employees)
    const visibleProjects = useMemo(() => {
        const isHR = user?.role?.toUpperCase() === 'HR';
        if (isHR) return projects;
        return projects.filter(p => 
            p.assigned_to?.some(id => id == user?.id || id.toString() === user?.id?.toString()) ||
            p.team_lead_id == user?.id || p.team_lead_id?.toString() === user?.id?.toString()
        );
    }, [projects, user]);

    // Calculate real metrics
    const { productivityValue, totalOpenTasks, myTasks } = useMemo(() => {
        const allOrgTasks = visibleProjects.flatMap(p => p.tasks || []);
        const completedOrgTasks = allOrgTasks.filter(t => t.status === 'COMPLETED').length;
        const orgProductivity = allOrgTasks.length > 0 ? Math.round((completedOrgTasks / allOrgTasks.length) * 100) : 0;

        const myTasksList = visibleProjects.flatMap(p => (p.tasks || []).filter(t => t.assigned_to?.includes(user?.id)).map(t => ({ ...t, projectId: p.id, projectName: p.name })));
        const completedMyTasks = myTasksList.filter(t => t.status === 'COMPLETED').length;
        const myProductivity = myTasksList.length > 0 ? Math.round((completedMyTasks / myTasksList.length) * 100) : 0;

        const prodVal = user?.role?.toUpperCase() === 'HR' ? orgProductivity : myProductivity;

        const openTasks = user?.role?.toUpperCase() === 'HR' 
            ? allOrgTasks.filter(t => t.status !== 'COMPLETED').length
            : myTasksList.filter(t => t.status !== 'COMPLETED').length;

        return { productivityValue: prodVal, totalOpenTasks: openTasks, myTasks: myTasksList };
    }, [visibleProjects, user]);

    // Calculate quick stats
    const stats = useMemo(() => {
        const baseStats = [
            { label: 'Total Projects', value: visibleProjects.length, icon: Briefcase, color: 'text-zinc-700 dark:text-emerald-400', bg: 'bg-zinc-100 dark:bg-emerald-500/10' },
            { label: 'Open Tasks', value: totalOpenTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
            { label: 'Productivity', value: `${productivityValue}%`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ];

        if (user?.role?.toUpperCase() === 'HR') {
            baseStats.splice(1, 0, { label: 'Team Members', value: employees.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' });
        }
        return baseStats;
    }, [visibleProjects.length, totalOpenTasks, productivityValue, user?.role, employees.length]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                        Workspace
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Welcome back, {user?.first_name}. Here is your workspace overview.
                    </p>
                </div>
                {user?.role?.toUpperCase() === 'HR' && (
                  <div className="flex gap-3">
                    <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md text-xs font-medium hover:opacity-90 transition-all border border-transparent">
                      <Plus className="size-4" /> New Project
                    </button>
                    <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                  </div>
                )}
            </div>

            {/* Quiet Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-8 rounded bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                                <stat.icon className="size-4" />
                            </div>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">{stat.label}</p>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className={`grid ${user?.role?.toUpperCase() === 'HR' ? 'lg:grid-cols-[1.5fr_1fr]' : 'grid-cols-1 lg:grid-cols-2'} gap-10`}>
                
                {/* Tasks Section */}
                {user?.role?.toUpperCase() !== 'HR' && (
                    <div className="space-y-5">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-emerald-500"></div>
                            My Tasks
                        </h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                            {myTasks.length > 0 ? (
                                myTasks.map(task => (
                                    <Link key={task.id} to={`/dashboard/projectsDetail?id=${task.projectId}&tab=tasks`} className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm" >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-[13px] font-medium text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{task.title}</h3>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{task.projectName}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {task.due_date && new Date(task.due_date) < new Date(new Date().setHours(0,0,0,0)) && task.status !== 'COMPLETED' && (
                                                    <div className="text-[10px] font-medium px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900">
                                                        Overdue
                                                    </div>
                                                )}
                                                <div className={`text-[10px] font-medium px-2 py-0.5 rounded border ${task.status === 'COMPLETED' ? 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'}`}>
                                                    {task.status || 'TODO'}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-16 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <p className="text-zinc-500 text-xs font-medium italic">No active tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100"></div>
                            Active Projects
                        </h2>
                        <Link to="/dashboard/projects" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">View All</Link>
                    </div>
                    <div className={`grid ${user?.role?.toUpperCase() === 'HR' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                        {visibleProjects.length > 0 ? (
                            visibleProjects.slice(0, 4).map((p) => {
                                const assignedMembers = p.assigned_to?.map(id => employees.find(e => e.id === id)).filter(Boolean) || [];
                                return (
                                    <Link key={p.id} to={`/dashboard/projectsDetail?id=${p.id}`} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group" >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="size-8 bg-zinc-50 dark:bg-zinc-800 rounded flex items-center justify-center text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700">
                                              <Briefcase className="size-4" />
                                            </div>
                                            <div className="flex gap-2">
                                                {p.is_overdue && p.status !== 'COMPLETED' && (
                                                    <span className="text-[10px] font-medium bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-900 dark:text-red-400 px-2 py-0.5 rounded">
                                                        Overdue
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                                                    {p.status || 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.name}</h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{p.description}</p>
                                        
                                        {/* Team Section */}
                                        <div className="mb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <div className="mb-2">
                                                <span className="text-[9px] font-semibold uppercase tracking-tight text-zinc-400">Team</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                                                {assignedMembers.length === 0 ? (
                                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 italic">No members assigned</span>
                                                ) : (
                                                    assignedMembers.map(emp => {
                                                        const isLead = emp.id === p.team_lead_id;
                                                        return (
                                                            <div 
                                                                key={emp.id}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                                                                    isLead
                                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/5'
                                                                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400'
                                                                }`}
                                                            >
                                                                <span className="size-1.5 rounded-full" style={{ backgroundColor: isLead ? '#10b981' : '#a1a1aa' }}></span>
                                                                <span>{emp.first_name} {emp.last_name}</span>
                                                                {isLead && (
                                                                    <span className="text-[7px] font-black uppercase tracking-wider bg-emerald-600 dark:bg-emerald-500 text-white px-1 py-0.2 rounded leading-none ml-0.5">
                                                                        Lead
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                                                <span>Progress</span>
                                                <span>{p.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                                                <div className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-700" style={{ width: `${p.progress || 0}%` }}></div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                          <div className="col-span-2 py-16 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 text-xs font-medium italic">No active projects</p>
                          </div>
                        )}
                    </div>
                </div>

                {/* Team Section */}
                {user?.role?.toUpperCase() === 'HR' && (
                    <div className="space-y-5">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-zinc-400"></div>
                            Team Members
                        </h2>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {employees.slice(0, 5).map((e, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-400">
                                        <Users className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{e.first_name} {e.last_name}</p>
                                      <p className="text-xs text-zinc-500">{e.designation || e.role || 'Member'}</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="size-3.5 text-zinc-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
