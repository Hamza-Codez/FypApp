import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users, TrendingUp, Target, Zap, Layout } from "lucide-react";
import { useSelector } from "react-redux";
import { format, isBefore } from "date-fns";

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
const SOFT_COLORS = {
    BLUE: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
    EMERALD: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
    PURPLE: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10",
    AMBER: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
    RED: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10",
};

const ProjectAnalytics = ({ project, tasks }) => {
    const { user } = useSelector((state) => state.auth);
    const isHR = user?.role?.toUpperCase() === "HR";
    const today = new Date();

    const analyticsData = useMemo(() => {
        // 1. General Stats
        const total = tasks.length;
        const done = tasks.filter(t => t.status === "COMPLETED").length;
        const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
        const overdue = tasks.filter(t => t.status !== "COMPLETED" && t.due_date && isBefore(new Date(t.due_date), today)).length;
        
        // 2. Status Distribution
        const statusCounts = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
        tasks.forEach(t => statusCounts[t.status]++);

        const statusChart = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        // 3. Priority Distribution
        const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        tasks.forEach(t => priorityCounts[t.priority]++);
        const priorityChart = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

        // 4. Tasks by Type
        const typeCounts = {};
        tasks.forEach(t => {
            typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
        });
        const typeChart = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

        // 5. Project Velocity (Mock for now: tasks per member)
        const velocity = total > 0 ? (done / total).toFixed(2) : 0;

        const personalTasks = tasks.filter(t => t.assigned_to?.includes(user?.id));
        const personalDone = personalTasks.filter(t => t.status === "COMPLETED").length;
        const personalProgress = personalTasks.length > 0 ? Math.round((personalDone / personalTasks.length) * 100) : 0;

        return {
            total, done, inProgress, overdue,
            statusChart, priorityChart, typeChart, velocity,
            personalTasks, personalDone, personalProgress
        };
    }, [tasks, project, user?.id, today]);

    const renderHRView = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Block */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Tasks", value: analyticsData.total, icon: <Layout />, color: SOFT_COLORS.BLUE },
                    { label: "Completion", value: `${Math.round((analyticsData.done/analyticsData.total)*100 || 0)}%`, icon: <CheckCircle />, color: SOFT_COLORS.EMERALD },
                    { label: "Efficiency", value: analyticsData.velocity, icon: <Zap />, color: SOFT_COLORS.PURPLE },
                    { label: "Risk Items", value: analyticsData.overdue, icon: <AlertTriangle />, color: analyticsData.overdue > 0 ? SOFT_COLORS.RED : SOFT_COLORS.AMBER },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 shadow-sm flex flex-col justify-between group hover:border-blue-500/30 transition-all">
                        <div className={`size-8 rounded-lg flex items-center justify-center p-1.5 mb-3 transition-transform group-hover:scale-110 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{stat.label}</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Task Distribution (Pie) */}
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-5 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                        <Zap className="size-3.5 text-blue-500" /> Progress Status
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 items-center">
                        {/* Chart Left */}
                        <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analyticsData.statusChart} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                                        {analyticsData.statusChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-x-0 top-[42%] flex flex-col items-center">
                                <span className="text-xl font-bold dark:text-white leading-none">{analyticsData.total}</span>
                                <span className="text-[8px] uppercase font-black tracking-widest text-zinc-400">Total</span>
                            </div>
                        </div>

                        {/* Text Stats Right */}
                        <div className="space-y-4">
                             <div className="space-y-2.5">
                                {analyticsData.statusChart.map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                            <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">{stat.name.replace('_', ' ')}</span>
                                        </div>
                                        <span className="font-black text-zinc-900 dark:text-white">{stat.value}</span>
                                    </div>
                                ))}
                             </div>
                             <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Efficiency</span>
                                    <span className="text-xs font-bold text-blue-500">{Math.round(analyticsData.velocity * 100)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Node State</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${analyticsData.overdue > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {analyticsData.overdue > 0 ? 'Risk Alert' : 'Healthy'}
                                    </span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Priority & Type Combined Bar */}
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-5 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                        <Target className="size-3.5 text-emerald-500" /> Task Categories
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.typeChart} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 9, fontWeight: 700 }} width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} fill="#3b82f6" opacity={0.8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmployeeView = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Progress Circle */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-8 shadow-sm flex flex-col items-center text-center">
                <div className="relative size-40 mb-6 group cursor-default">
                    <svg className="size-full -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-50 dark:text-zinc-800/50" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * analyticsData.personalProgress) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-zinc-900 dark:text-white leading-none">{analyticsData.personalProgress}%</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-2">Personal Score</span>
                    </div>
                </div>
                <h2 className="text-xl font-bold dark:text-white mb-2">Work Efficiency</h2>
                <p className="text-sm text-zinc-400 font-medium max-w-[240px]">You have maintained a consistency of {analyticsData.personalProgress}% across your assigned tasks.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: "Assigned", value: analyticsData.personalTasks.length, color: SOFT_COLORS.BLUE, icon: <Layout /> },
                    { label: "Finished", value: analyticsData.personalDone, color: SOFT_COLORS.EMERALD, icon: <CheckCircle /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 shadow-sm group transition-all">
                        <div className={`size-7 rounded-md flex items-center justify-center p-1.5 mb-3 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Next Milestone Card */}
            {analyticsData.personalTasks.some(t => t.status !== "COMPLETED") && (
                <div className="bg-zinc-900 dark:bg-blue-600 rounded-md p-5 text-white shadow-xl shadow-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Clock className="size-4" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Upcoming Goal</span>
                    </div>
                    <h3 className="text-sm font-bold mb-1 line-clamp-1">
                        {analyticsData.personalTasks.filter(t => t.status !== "COMPLETED").sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]?.title}
                    </h3>
                    <p className="text-xs font-medium opacity-80 uppercase tracking-widest text-[9px]">
                        Deadline: {format(new Date(analyticsData.personalTasks.filter(t => t.status !== "COMPLETED").sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]?.due_date), "MMMM d")}
                    </p>
                </div>
            )}

        </div>
    );

    return isHR ? renderHRView() : renderEmployeeView();
};

export default ProjectAnalytics;
