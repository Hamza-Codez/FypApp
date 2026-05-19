import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users, TrendingUp, Target, Zap, Layout } from "lucide-react";
import { useSelector } from "react-redux";
import { format, isBefore } from "date-fns";

const SOFT_COLORS = {
    ZINC: "text-zinc-950 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800",
    EMERALD: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
    GRAY: "text-zinc-500 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-900",
    AMBER: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
    RED: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10",
};

// Ultra-minimalist, theme-aware Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 rounded shadow-sm text-[10px] font-sans text-zinc-900 dark:text-white animate-in fade-in duration-200">
                <p className="font-bold uppercase tracking-wider text-[8px] text-[#AAAAAA] dark:text-zinc-500 mb-0.5">{payload[0].name.replace('_', ' ')}</p>
                <p className="font-serif font-bold text-xs">{payload[0].value} Task{payload[0].value !== 1 ? 's' : ''}</p>
            </div>
        );
    }
    return null;
};

const ProjectAnalytics = ({ project, tasks }) => {
    const { user } = useSelector((state) => state.auth);
    const { employees } = useSelector((state) => state.workspace);
    const isHR = user?.role?.toUpperCase() === "HR";
    const today = new Date();

    // Setup active state for dark mode so Recharts dynamically redraws on toggle
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
        
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });
        
        return () => observer.disconnect();
    }, []);

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

        // 5. Project Velocity
        const velocity = total > 0 ? (done / total).toFixed(2) : 0;

        // Personal Stats for non-HR
        const personalTasks = tasks.filter(t => t.assigned_to?.includes(user?.id));
        const personalDone = personalTasks.filter(t => t.status === "COMPLETED").length;
        const personalTodo = personalTasks.filter(t => t.status === "TODO").length;
        const personalInProgress = personalTasks.filter(t => t.status === "IN_PROGRESS").length;
        const personalProgress = personalTasks.length > 0 ? Math.round((personalDone / personalTasks.length) * 100) : 0;
        
        const personalOverdue = personalTasks.filter(t => t.status !== "COMPLETED" && t.due_date && isBefore(new Date(t.due_date), today)).length;

        const personalPriorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        personalTasks.forEach(t => {
            const p = (t.priority || "MEDIUM").toUpperCase();
            if (p in personalPriorityCounts) {
                personalPriorityCounts[p]++;
            } else {
                personalPriorityCounts[p] = 1;
            }
        });

        return {
            total, done, inProgress, overdue,
            statusChart, priorityChart, typeChart, velocity,
            personalTasks, personalDone, personalTodo, personalInProgress, personalProgress, personalOverdue, personalPriorityCounts
        };
    }, [tasks, project, user?.id, today]);

    const getAssigneeNames = (assigneeIds) => {
        if (!assigneeIds || assigneeIds.length === 0) return "Unassigned";
        return assigneeIds.map(id => {
            const emp = employees.find(e => e.id === id);
            return emp ? `${emp.first_name} ${emp.last_name}` : "Member";
        }).join(", ");
    };

    // Semantic colors for status pie cells
    const getStatusColor = (statusName) => {
        if (statusName === "COMPLETED") return isDark ? "#34D399" : "#10B981"; // Emerald
        if (statusName === "IN_PROGRESS") return isDark ? "#A1A1AA" : "#71717A"; // Zinc 400 / Zinc 500
        return isDark ? "#F4F4F5" : "#111111"; // TODO gets Zinc 100 / Black
    };

    const renderHRView = () => {
        const criticalTasks = tasks
            .filter(t => t.priority === "HIGH" && t.status !== "COMPLETED")
            .sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            })
            .slice(0, 3);

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Stats Block */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { 
                            label: "Total Tasks", 
                            value: analyticsData.total, 
                            icon: <Layout className="size-3.5" />, 
                            color: SOFT_COLORS.ZINC,
                            footer: `${analyticsData.inProgress} In Progress • ${analyticsData.total - analyticsData.done - analyticsData.inProgress} To Do`
                        },
                        { 
                            label: "Completion", 
                            value: `${Math.round((analyticsData.done / (analyticsData.total || 1)) * 100)}%`, 
                            icon: <CheckCircle className="size-3.5" />, 
                            color: SOFT_COLORS.EMERALD,
                            footer: `${analyticsData.done} of ${analyticsData.total} Completed`,
                            showProgress: true,
                            progressVal: Math.round((analyticsData.done / (analyticsData.total || 1)) * 100)
                        },
                        { 
                            label: "Avg Efficiency", 
                            value: `${Math.round(analyticsData.velocity * 100)}%`, 
                            icon: <Zap className="size-3.5" />, 
                            color: SOFT_COLORS.GRAY,
                            footer: "Task resolution velocity"
                        },
                        { 
                            label: "Risk Alerts", 
                            value: analyticsData.overdue, 
                            icon: <AlertTriangle className="size-3.5" />, 
                            color: analyticsData.overdue > 0 ? SOFT_COLORS.RED : SOFT_COLORS.AMBER,
                            footer: analyticsData.overdue > 0 ? `${analyticsData.overdue} Tasks Overdue!` : "Operational nodes stable",
                            isAlert: analyticsData.overdue > 0
                        }
                    ].map((stat, i) => (
                        <div key={i} className={`bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-3.5 shadow-sm flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 ${stat.isAlert ? "ring-1 ring-red-500/10 border-red-200/50" : ""}`}>
                            
                            {/* Row 1: Header (Icon & Label) */}
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className={`size-6 rounded-md flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105 ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-zinc-500 font-sans transition-colors group-hover:text-zinc-800 dark:group-hover:text-zinc-300 leading-none">
                                        {stat.label}
                                    </span>
                                </div>
                                {stat.isAlert && (
                                    <span className="flex h-1.5 w-1.5 relative shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                    </span>
                                )}
                            </div>

                            {/* Row 2: Body (Value & Baseline-aligned Details) */}
                            <div className="flex items-baseline justify-between mt-3 w-full gap-2">
                                <p className={`text-2xl font-bold font-serif tracking-tight leading-none ${stat.isAlert && stat.value > 0 ? "text-red-650 dark:text-red-400" : "text-[#111111] dark:text-zinc-100"}`}>
                                    {stat.value}
                                </p>
                                
                                <div className="text-right shrink-0">
                                    {stat.showProgress ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="h-1 w-16 bg-[#E5E5E5] dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" style={{ width: `${stat.progressVal}%` }}></div>
                                            </div>
                                            <p className="text-[7.5px] text-zinc-500 dark:text-zinc-400 font-bold font-sans leading-none uppercase tracking-wider">{stat.footer}</p>
                                        </div>
                                    ) : (
                                        <p className={`text-[7.5px] font-bold uppercase tracking-wider font-sans leading-none ${stat.isAlert && stat.value > 0 ? "text-red-500 dark:text-red-400" : "text-zinc-450 dark:text-zinc-550"}`}>
                                            {stat.footer}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="grid lg:grid-cols-3 gap-4">
                    
                    {/* Left Side: Dynamic Charts (Spans 2 Columns) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            
                            {/* Task Progress Status (Pie Donut Chart) */}
                            <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-5 shadow-sm flex flex-col justify-between h-[310px] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                                <div>
                                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-zinc-400 font-sans mb-4 flex items-center gap-1.5">
                                        <Zap className="size-3.5 text-zinc-950 dark:text-zinc-100" /> Progress Status
                                    </h3>
                                    
                                    <div className="h-36 relative mb-3">
                                        <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                                            <PieChart>
                                                <Pie 
                                                    data={analyticsData.statusChart} 
                                                    innerRadius={40} 
                                                    outerRadius={55} 
                                                    paddingAngle={4} 
                                                    dataKey="value" 
                                                    stroke="none"
                                                >
                                                    {analyticsData.statusChart.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={getStatusColor(entry.name)} 
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-xl font-bold font-serif text-[#111111] dark:text-zinc-100 leading-none">{analyticsData.total}</span>
                                            <span className="text-[7px] uppercase font-black tracking-widest text-[#AAAAAA] dark:text-zinc-400 mt-0.5">Total</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#E5E5E5]/50 dark:border-zinc-800/50">
                                        {analyticsData.statusChart.map((stat, i) => (
                                            <div key={i} className="text-center font-sans">
                                                <span className="font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider text-[7px] block truncate">{stat.name.replace('_', ' ')}</span>
                                                <span className="font-bold text-xs text-[#111111] dark:text-white block mt-0.5">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Task Categories (Bar Chart) */}
                            <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-5 shadow-sm flex flex-col justify-between h-[310px] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                                <div>
                                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-zinc-400 font-sans mb-4 flex items-center gap-1.5">
                                        <Target className="size-3.5 text-emerald-600 dark:text-emerald-500" /> Task Categories
                                    </h3>
                                    
                                    <div className="h-44">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analyticsData.typeChart} layout="vertical" margin={{ left: -20, right: 10, top: 0, bottom: 0 }}>
                                                <XAxis type="number" hide />
                                                <YAxis 
                                                    dataKey="name" 
                                                    type="category" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: isDark ? '#A1A1AA' : '#3F3F46', fontSize: 8, fontWeight: 600 }} 
                                                    width={80} 
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={7} opacity={0.95}>
                                                    {analyticsData.typeChart.map((entry, index) => {
                                                        // Beautiful Ivory Editorial color scheme mapping for different categories
                                                        const colorsList = isDark 
                                                            ? ["#F4F4F5", "#34D399", "#A1A1AA", "#60A5FA", "#F59E0B"] 
                                                            : ["#111111", "#10B981", "#71717A", "#3B82F6", "#F59E0B"];
                                                        return (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={colorsList[index % colorsList.length]} 
                                                            />
                                                        );
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-[#E5E5E5]/50 dark:border-zinc-800/50 text-[9px] font-sans font-semibold text-zinc-400 dark:text-zinc-550 text-center leading-none">
                                    Workload distribution by task types
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Side: Operational Risks & Critical Focus */}
                    <div className="lg:col-span-1">
                        {/* Critical Priorities */}
                        <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-5 shadow-sm flex flex-col justify-between h-[310px] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                            <div>
                                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-zinc-400 font-sans mb-3 flex items-center gap-1.5">
                                    <AlertTriangle className="size-3.5 text-red-500" /> Critical Priorities
                                </h3>
                                
                                {criticalTasks.length > 0 ? (
                                    <div className="space-y-2 overflow-y-auto max-h-[180px] pr-0.5 custom-scrollbar">
                                        {criticalTasks.map((task, index) => {
                                            const isTaskOverdue = task.due_date && isBefore(new Date(task.due_date), today);
                                            return (
                                                <div key={task.id || index} className="p-2.5 rounded-md bg-white dark:bg-zinc-950/20 border border-[#E5E5E5]/50 dark:border-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                                                    <div className="flex justify-between items-start mb-1 min-w-0">
                                                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate pr-2">{task.title}</h4>
                                                        <span className={`text-[7px] font-black shrink-0 px-1 py-0.5 rounded uppercase ${isTaskOverdue ? "bg-red-500/10 text-red-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                                                            {isTaskOverdue ? "Overdue" : "Active"}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center text-[9px] text-zinc-500 dark:text-zinc-400 font-sans">
                                                        <span className="truncate pr-4 max-w-[130px]" title={getAssigneeNames(task.assigned_to)}>
                                                            {getAssigneeNames(task.assigned_to)}
                                                        </span>
                                                        <span className={isTaskOverdue ? "text-red-500 font-bold" : ""}>
                                                            {task.due_date ? format(new Date(task.due_date), "MMM d") : "No date"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                                            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h4 className="font-serif text-xs font-bold text-zinc-950 dark:text-zinc-100">All Clear</h4>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-[140px] mt-0.5">
                                            No pending high priority tasks.
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-2 border-t border-[#E5E5E5] dark:border-zinc-800/80 flex items-center justify-between text-[9px] font-sans font-medium text-zinc-500 dark:text-zinc-400 leading-none">
                                <span>High Priority Pending</span>
                                <span className="font-bold text-zinc-950 dark:text-white">{tasks.filter(t => t.priority === "HIGH" && t.status !== "COMPLETED").length} tasks</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    const renderEmployeeView = () => {
        // Calculate personal performance comments
        let performanceTitle = "Starting Off";
        let performanceComment = "Begin completing your assigned tasks to build momentum.";
        if (analyticsData.personalProgress >= 90) {
            performanceTitle = "Exceptional Pace";
            performanceComment = "You're executing with extreme efficiency. Outstanding work!";
        } else if (analyticsData.personalProgress >= 70) {
            performanceTitle = "High Performance";
            performanceComment = "Consistent delivery. You're maintaining a stellar work pace.";
        } else if (analyticsData.personalProgress >= 40) {
            performanceTitle = "Steady Velocity";
            performanceComment = "Making good progress. Keep pushing to close remaining tasks.";
        } else if (analyticsData.personalProgress > 0) {
            performanceTitle = "Active Progress";
            performanceComment = "You've kickstarted your tasks. Keep up the steady rhythm.";
        }

        // Get personal upcoming tasks (not completed)
        const upcomingTasks = analyticsData.personalTasks
            .filter(t => t.status !== "COMPLETED")
            .sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            })
            .slice(0, 3);

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Top Row: Personal Performance Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Card 1: Performance Gauge & Status */}
                    <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                        <div>
                            <p className="uppercase text-[9px] font-black tracking-[0.25em] text-[#AAAAAA] dark:text-zinc-550 font-sans mb-4">Personal Score</p>
                            <div className="flex items-center gap-6">
                                {/* Sleek Gauge */}
                                <div className="relative size-24 shrink-0">
                                    <svg className="size-full -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-200 dark:text-zinc-800" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * analyticsData.personalProgress) / 100} strokeLinecap="round" className="text-zinc-950 dark:text-zinc-100 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold font-serif text-zinc-950 dark:text-zinc-100">{analyticsData.personalProgress}%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-serif text-base font-bold text-zinc-950 dark:text-zinc-100">{performanceTitle}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{performanceComment}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#E5E5E5] dark:border-zinc-800/80 flex justify-between items-center text-[11px] font-sans text-zinc-500 dark:text-zinc-400">
                            <span>Contribution: {Math.round((analyticsData.personalTasks.length / (analyticsData.total || 1)) * 100)}% of scope</span>
                            <span className="font-bold text-zinc-900 dark:text-white">{analyticsData.personalDone} / {analyticsData.personalTasks.length} Done</span>
                        </div>
                    </div>

                    {/* Card 2: Workload Distribution */}
                    <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                        <div>
                            <p className="uppercase text-[9px] font-black tracking-[0.25em] text-[#AAAAAA] dark:text-zinc-550 font-sans mb-4">Workload Status</p>
                            <div className="space-y-4">
                                {[
                                    { label: "Completed", count: analyticsData.personalDone, total: analyticsData.personalTasks.length, colorClass: "bg-emerald-600 dark:bg-emerald-500" },
                                    { label: "In Progress", count: analyticsData.personalInProgress, total: analyticsData.personalTasks.length, colorClass: "bg-zinc-800 dark:bg-zinc-400" },
                                    { label: "To Do", count: analyticsData.personalTodo, total: analyticsData.personalTasks.length, colorClass: "bg-zinc-400 dark:bg-zinc-650" },
                                ].map((status, index) => {
                                    const percentage = status.total > 0 ? Math.round((status.count / status.total) * 100) : 0;
                                    return (
                                        <div key={index} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-sans font-medium text-zinc-700 dark:text-zinc-300">
                                                <span>{status.label}</span>
                                                <span className="font-bold text-zinc-950 dark:text-white">{status.count} <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">({percentage}%)</span></span>
                                            </div>
                                            <div className="h-1.5 w-full bg-[#E5E5E5] dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${status.colorClass}`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Priority & Risks */}
                    <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                        <div>
                            <p className="uppercase text-[9px] font-black tracking-[0.25em] text-[#AAAAAA] dark:text-zinc-550 font-sans mb-4">Priority & Risks</p>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                    { label: "High", val: analyticsData.personalPriorityCounts.HIGH, color: "text-red-600 dark:text-red-400 bg-red-500/10" },
                                    { label: "Medium", val: analyticsData.personalPriorityCounts.MEDIUM, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
                                    { label: "Low", val: analyticsData.personalPriorityCounts.LOW, color: "text-zinc-650 dark:text-zinc-400 bg-zinc-500/10" },
                                ].map((p, idx) => (
                                    <div key={idx} className="bg-white dark:bg-zinc-950/30 border border-[#E5E5E5]/50 dark:border-zinc-800/80 rounded-md p-2.5 text-center">
                                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 block mb-1">{p.label}</span>
                                        <span className={`text-base font-bold font-serif rounded px-2 py-0.5 block ${p.color}`}>{p.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`p-3 rounded-md border flex items-center gap-3 transition-colors ${
                            analyticsData.personalOverdue > 0 
                                ? "bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 animate-pulse" 
                                : "bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        }`}>
                            <div className="shrink-0">
                                {analyticsData.personalOverdue > 0 ? <AlertTriangle className="size-4" /> : <CheckCircle className="size-4" />}
                            </div>
                            <div className="text-xs font-sans font-medium">
                                {analyticsData.personalOverdue > 0 
                                    ? `Attention required: ${analyticsData.personalOverdue} task${analyticsData.personalOverdue > 1 ? 's' : ''} overdue!`
                                    : "All active tasks within schedule. Keep it up!"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Detailed Context & Milestones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Panel 1: Project Scope Contribution */}
                    <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-6 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                        <p className="uppercase text-[9px] font-black tracking-[0.25em] text-[#AAAAAA] dark:text-zinc-550 font-sans mb-4">Project Contribution</p>
                        
                        <div className="space-y-6">
                            {/* Project Overall stats */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-xs font-sans uppercase font-black tracking-wider text-zinc-450 dark:text-zinc-500">Total Project Progress</h4>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="font-serif text-3xl font-bold text-zinc-950 dark:text-zinc-100">
                                            {Math.round((analyticsData.done / (analyticsData.total || 1)) * 100)}%
                                        </span>
                                        <span className="text-xs font-sans text-zinc-550 dark:text-zinc-400 font-medium">
                                            ({analyticsData.done} / {analyticsData.total} Tasks Completed)
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase bg-emerald-500/10 text-emerald-500 tracking-wider">
                                        {analyticsData.overdue > 0 ? 'Action Needed' : 'Healthy'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Visual ownership distribution */}
                            <div className="space-y-2">
                                <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full flex overflow-hidden">
                                    {/* Personal Done */}
                                    <div className="h-full bg-emerald-600 dark:bg-emerald-500" style={{ width: `${(analyticsData.personalDone / (analyticsData.total || 1)) * 100}%` }} title="Your Completed Tasks"></div>
                                    {/* Personal Incomplete */}
                                    <div className="h-full bg-zinc-900 dark:bg-zinc-250" style={{ width: `${((analyticsData.personalTasks.length - analyticsData.personalDone) / (analyticsData.total || 1)) * 100}%` }} title="Your Pending Tasks"></div>
                                    {/* Rest of Team tasks */}
                                    <div className="h-full bg-[#E5E5E5] dark:bg-zinc-700" style={{ width: `${((analyticsData.total - analyticsData.personalTasks.length) / (analyticsData.total || 1)) * 100}%` }} title="Other Team Tasks"></div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-sans font-medium text-zinc-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></div>
                                        <span>Your Finished ({analyticsData.personalDone})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-2 rounded-full bg-zinc-950 dark:bg-zinc-100"></div>
                                        <span>Your Pending ({analyticsData.personalTasks.length - analyticsData.personalDone})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-2 rounded-full bg-[#E5E5E5] dark:bg-zinc-700"></div>
                                        <span>Team Scope ({analyticsData.total - analyticsData.personalTasks.length})</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                                You own <span className="font-bold text-zinc-950 dark:text-zinc-100">{analyticsData.personalTasks.length}</span> of the <span className="font-bold text-zinc-950 dark:text-zinc-100">{analyticsData.total}</span> project tasks. Finishing your remaining <span className="font-bold text-zinc-950 dark:text-zinc-100">{analyticsData.personalTasks.length - analyticsData.personalDone}</span> items will boost the project completion rate by <span className="font-bold text-zinc-950 dark:text-zinc-100">{Math.round(((analyticsData.personalTasks.length - analyticsData.personalDone) / (analyticsData.total || 1)) * 100)}%</span>.
                            </p>
                        </div>
                    </div>

                    {/* Panel 2: Next Milestones & Upcoming Tasks */}
                    <div className="bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 rounded-md p-6 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <p className="uppercase text-[9px] font-black tracking-[0.25em] text-[#AAAAAA] dark:text-zinc-550 font-sans mb-4">Milestone Focus (Top Pending)</p>
                            
                            {upcomingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingTasks.map((task, index) => {
                                        const isTaskOverdue = task.due_date && isBefore(new Date(task.due_date), today);
                                        return (
                                            <div key={task.id || index} className="flex justify-between items-center p-3 rounded-md bg-white dark:bg-zinc-950/20 border border-[#E5E5E5]/50 dark:border-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`size-2 rounded-full shrink-0 ${
                                                        task.priority === "HIGH" ? "bg-red-500" : task.priority === "MEDIUM" ? "bg-amber-500" : "bg-zinc-400"
                                                    }`} title={`${task.priority} Priority`} />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate pr-2">{task.title}</p>
                                                        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                                                            {task.type || "TASK"} • {task.status?.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`text-[10px] font-sans font-bold block ${
                                                        isTaskOverdue ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"
                                                    }`}>
                                                        {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "No Due Date"}
                                                    </span>
                                                    {isTaskOverdue && (
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Overdue</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                                        <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h4 className="font-serif text-sm font-bold text-zinc-950 dark:text-zinc-100">All Caught Up!</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] mt-1">
                                        You have no pending tasks assigned in this project. Great job!
                                    </p>
                                </div>
                            )}
                        </div>

                        {upcomingTasks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[#E5E5E5] dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-sans font-medium text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    Next due: {upcomingTasks[0].due_date ? format(new Date(upcomingTasks[0].due_date), "MMM d") : "No set date"}
                                </span>
                                <span>{analyticsData.personalTasks.length - analyticsData.personalDone} remaining total</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    return isHR ? renderHRView() : renderEmployeeView();
};

export default ProjectAnalytics;
