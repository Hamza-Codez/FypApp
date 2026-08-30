import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon, CalendarIcon, FileStackIcon, ZapIcon } from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";
import { fetchProjects, fetchEmployees } from "../features/workspaceSlice";

export default function ProjectDetail() {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const { projects } = useSelector((state) => state.workspace);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    useEffect(() => {
        if (projects.length === 0) {
            dispatch(fetchProjects());
        }
        dispatch(fetchEmployees());
    }, [dispatch, projects.length]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    const statusColors = {
        PLANNING: "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300",
        ACTIVE: "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950",
        ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500",
        COMPLETED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500",
        CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-500",
    };

    const { user } = useSelector((state) => state.auth);

    if (!project) {
        return (
            <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
                <p className="text-3xl md:text-5xl mt-40 mb-10">Project not found</p>
                <button onClick={() => navigate('/projects')} className="mt-4 px-4 py-2 rounded bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600" >
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between max-w-6xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{project.name}</h1>
                        {project.is_overdue && project.status !== 'COMPLETED' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Overdue
                            </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${statusColors[project.status] || statusColors.ACTIVE}`} >
                            {project.status?.replace("_", " ") || 'Active'}
                        </span>
                    </div>
                </div>
                {(user?.role?.toUpperCase() === 'HR' || project.team_lead_id === user?.id) && (
                    <button 
                        onClick={() => setShowCreateTask(true)} 
                        className="flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 shadow-xl shadow-zinc-500/10 active:scale-[0.98] transition-all" 
                    >
                        <PlusIcon className="size-3.5 stroke-[4]" />
                        New Task
                    </button>
                )}
            </div>

            {/* Info Cards - Bento Grid Style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                    { label: "Total Tasks", value: tasks.length, icon: FileStackIcon, color: "text-zinc-900 dark:text-white" },
                    { label: "Completed", value: tasks.filter((t) => t.status === "COMPLETED").length, color: "text-emerald-500" },
                    { label: "Priority", value: project.priority || 'Medium', color: "text-amber-500" },
                    { label: "Team", value: project.assigned_to?.length || 0, color: "text-emerald-500" },
                    { label: "Start Date", value: project.start_date || 'N/A', color: "text-zinc-500" },
                    { label: "Deadline", value: project.end_date || 'N/A', color: "text-red-500" },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white/50 dark:bg-zinc-950/40 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/50 px-4 py-3 rounded-md shadow-sm hover:shadow-xl hover:shadow-zinc-500/5 transition-all duration-500 group">
                        <div className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2 transition-colors group-hover:text-zinc-950 dark:group-hover:text-zinc-100">{card.label}</div>
                        <div className={`text-base font-bold truncate tracking-tight ${card.color}`}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="pb-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 overflow-x-auto no-scrollbar">
                <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-md gap-1 shrink-0 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/50">
                    {[
                        { key: "tasks", label: "Tasks", icon: FileStackIcon },
                        { key: "calendar", label: "Calendar", icon: CalendarIcon },
                        { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                        { key: "settings", label: "Settings", icon: SettingsIcon },
                    ].filter(tabItem => tabItem.key !== 'settings' || user?.role?.toUpperCase() === 'HR').map((tabItem) => (
                        <button 
                            key={tabItem.key} 
                            onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id: id, tab: tabItem.key }) }} 
                            className={`flex items-center gap-2.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all duration-300 ${activeTab === tabItem.key ? "bg-white dark:bg-zinc-800 shadow-xl shadow-zinc-950/10 text-zinc-950 dark:text-zinc-100 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`} 
                        >
                            <tabItem.icon className="size-3.5 stroke-[2.5]" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 shrink-0">
                    {/* My Tasks Button - Visible for all employees (including TL) */}
                    {user?.role?.toUpperCase() !== 'HR' && (
                        <button 
                            onClick={() => navigate('/dashboard/my-tasks')}
                            className="flex items-center gap-2.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md bg-white dark:bg-white text-zinc-900 dark:text-black border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-100/90 transform active:scale-95 transition-all shadow-sm"
                        >
                            <ZapIcon className="size-3.5 fill-current" />
                            My Tasks
                        </button>
                    )}

                    {/* Task Reports Button - Visible for HR and TL */}
                    {(user?.role?.toUpperCase() === 'HR' || project.team_lead_id === user?.id) && (
                        <button 
                            onClick={() => navigate(`/dashboard/task-reports?projectId=${project.id}`)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transform active:scale-95 transition-all shadow-xl shadow-zinc-950/20 dark:shadow-white/5"
                        >
                            <ZapIcon className="size-3.5 fill-current" />
                            Task Reports
                        </button>
                    )}
                </div>
            </div>


                <div className="mt-8 transition-all animate-in fade-in duration-300">
                    {activeTab === "tasks" && (
                        <div className="max-w-6xl">
                            <ProjectTasks tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === "analytics" && (
                        <div className="max-w-6xl">
                            <ProjectAnalytics tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === "calendar" && (
                        <div className="max-w-6xl">
                            <ProjectCalendar tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className="max-w-6xl">
                            <ProjectSettings project={project} tasks={tasks} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />}
        </div>
    );
}
