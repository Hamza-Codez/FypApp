import { useState } from "react";
import { 
    format, 
    isSameDay, 
    isBefore, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    addMonths, 
    subMonths,
    isSameMonth,
    startOfWeek,
    endOfWeek 
} from "date-fns";
import { 
    CalendarDays,
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    Trophy
} from "lucide-react";
import { useSelector } from "react-redux";

const typeColors = {
    BUG: "bg-red-50 text-red-755 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
    FEATURE: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    TASK: "bg-zinc-50 text-zinc-650 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-850",
    IMPROVEMENT: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
    OTHER: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
};

export default function ProjectCalendar({ tasks, project }) {
    const { user } = useSelector((state) => state.auth);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    
    // Filter tasks based on role
    const filteredTasks = user?.role?.toUpperCase() === "HR" 
        ? tasks 
        : tasks.filter(t => t.assigned_to?.includes(user?.id));

    const getTasksForDate = (date) => tasks.filter((task) => isSameDay(new Date(task.due_date), date));

    const isProjectStart = (date) => project?.start_date && isSameDay(new Date(project.start_date), date);
    const isProjectDeadline = (date) => project?.end_date && isSameDay(new Date(project.end_date), date);

    const upcomingTasks = filteredTasks
        .filter((task) => task.due_date && !isBefore(new Date(task.due_date), today) && task.status !== "COMPLETED")
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 4);

    const overdueTasks = filteredTasks.filter((task) => task.due_date && isBefore(new Date(task.due_date), today) && task.status !== "COMPLETED");

    // Grid Calendar calculation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    
    const daysInGrid = eachDayOfInterval({
        start: gridStart,
        end: gridEnd,
    });

    const handleMonthChange = (direction) => {
        setCurrentMonth((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    // Project Health Metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="flex flex-col md:flex-row gap-3.5 items-start justify-start animate-in fade-in duration-300 max-w-5xl mx-auto">
            
            {/* CONTAINER 1: Wide Left Calendar (flex-1) */}
            <div className="flex-1 w-full bg-[#F7F7F5] dark:bg-zinc-900/40 border border-[#E5E5E5] dark:border-zinc-800/60 rounded-md p-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.01)]">
                
                {/* Header Month / Year controls */}
                <div className="flex items-center justify-between gap-1 mb-2.5">
                    <h2 className="font-serif text-sm font-bold text-[#111111] dark:text-white flex items-center gap-1.5 leading-none">
                        <CalendarDays className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Deadlines
                    </h2>
                    
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={handleToday}
                            className="px-1.5 py-0.5 border border-[#E5E5E5] dark:border-zinc-800 text-[#111111] dark:text-white text-[8px] font-sans uppercase font-bold tracking-wider rounded-md hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                        >
                            Today
                        </button>
                        
                        <div className="flex items-center bg-white dark:bg-zinc-800 p-0.5 rounded-md border border-[#E5E5E5] dark:border-zinc-800">
                            <button 
                                onClick={() => handleMonthChange("prev")} 
                                className="p-0.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                <ChevronLeft className="size-3" />
                            </button>
                            <span className="text-[#111111] dark:text-white font-sans font-bold text-[8px] uppercase tracking-wider px-1 min-w-[70px] text-center">
                                {format(currentMonth, "MMM yyyy")}
                            </span>
                            <button 
                                onClick={() => handleMonthChange("next")} 
                                className="p-0.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                <ChevronRight className="size-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Weekdays Labels (Minimal Single-letter Header) */}
                <div className="grid grid-cols-7 text-[8px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-550 mb-1 pb-1 text-center border-b border-[#E5E5E5]/40 dark:border-zinc-800/40">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                        <div key={idx}>{day}</div>
                    ))}
                </div>

                {/* Compact Day Cells Grid (Borderless, Centered, size-10) */}
                <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {daysInGrid.map((day) => {
                        const dayTasks = getTasksForDate(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, today);
                        const currentMonthCheck = isSameMonth(day, currentMonth);
                        
                        const hasDeadlines = dayTasks.length > 0;
                        const isStart = isProjectStart(day);
                        const isEnd = isProjectDeadline(day);
                        const hasOverdue = dayTasks.some((t) => t.status !== "COMPLETED" && isBefore(new Date(t.due_date), today));
                        const allCompleted = dayTasks.length > 0 && dayTasks.every((t) => t.status === "COMPLETED");
                        const hasHighPriority = dayTasks.some((t) => t.priority === "HIGH");

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => currentMonthCheck && setSelectedDate(day)}
                                disabled={!currentMonthCheck}
                                className={`relative size-10 rounded-md flex flex-col items-center justify-center text-xs transition-all font-semibold
                                ${!currentMonthCheck 
                                    ? "bg-transparent text-zinc-200 dark:text-zinc-800 opacity-20 pointer-events-none cursor-default" 
                                    : isSelected 
                                        ? "bg-[#111111] dark:bg-white text-white dark:text-zinc-950 font-bold" 
                                        : isToday 
                                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" 
                                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-150 dark:hover:bg-zinc-800/50"
                                }`}
                            >
                                <span>
                                    {format(day, "d")}
                                </span>
                                
                                {/* Micro Accent Indicator Dot */}
                                {currentMonthCheck && (
                                    <div className="absolute bottom-1 flex gap-0.5 justify-center items-center">
                                        {isStart && (
                                            <span className={`size-1 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                                        )}
                                        {hasDeadlines && (
                                            <span 
                                                className={`size-1 rounded-full ${
                                                    isSelected 
                                                        ? "bg-white" 
                                                        : hasOverdue 
                                                            ? "bg-rose-500" 
                                                            : allCompleted 
                                                                ? "bg-emerald-500" 
                                                                : hasHighPriority 
                                                                    ? "bg-amber-500" 
                                                                    : "bg-zinc-900 dark:bg-zinc-300"
                                                }`} 
                                            />
                                        )}
                                        {isEnd && (
                                            <span className={`size-1 rounded-full ${isSelected ? "bg-white" : "bg-rose-500"}`} />
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {/* Ultra-Minimalist Compact Legend */}
                <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] dark:border-zinc-800/40 flex flex-wrap gap-x-2 gap-y-0.5 justify-center text-[7px] font-sans font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550">
                    <div className="flex items-center gap-1">
                        <span className="size-1 rounded-full bg-emerald-500"></span>
                        <span>Start/Done</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="size-1 rounded-full bg-zinc-900 dark:bg-zinc-300"></span>
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="size-1 rounded-full bg-amber-500"></span>
                        <span>High</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="size-1 rounded-full bg-rose-500"></span>
                        <span>Deadline</span>
                    </div>
                </div>
            </div>

            {/* CONTAINER 2: Compact Right Sidebar Column (w-full md:w-[300px] shrink-0) */}
            <div className="w-full md:w-[300px] shrink-0 space-y-3">
                
                {/* Selected Day's Agenda (Extremely high-density) */}
                <div className="bg-[#F7F7F5] dark:bg-zinc-900/40 rounded-md p-3 border border-[#E5E5E5] dark:border-zinc-800/60 shadow-[0_1px_6px_rgba(0,0,0,0.01)] flex flex-col">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-zinc-800/80 mb-2">
                        <div className="space-y-0.5">
                            <p className="uppercase text-[8px] font-sans tracking-widest text-[#AAAAAA] font-bold">Selected Agenda</p>
                            <h3 className="font-serif text-xs font-bold text-[#111111] dark:text-white leading-none">
                                {format(selectedDate, "MMM dd, yyyy")}
                            </h3>
                        </div>
                        <span className="bg-[#E8F5E3] text-[#2E7D32] dark:bg-emerald-950/20 dark:text-emerald-400 text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-md border border-emerald-100/30">
                            {getTasksForDate(selectedDate).length} Items
                        </span>
                    </div>

                    {getTasksForDate(selectedDate).length === 0 ? (
                        <div className="py-6 flex flex-col items-center justify-center text-center opacity-75">
                            <CheckCircle2 className="size-4.5 text-[#2E7D32] mb-1.5" />
                            <h4 className="font-serif text-[11px] font-semibold text-[#111111] dark:text-white">Clean Schedule</h4>
                            <p className="text-[9px] text-zinc-400 dark:text-zinc-550">
                                No events scheduled on this day.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1 custom-scrollbar">
                            {getTasksForDate(selectedDate).map((task) => (
                                <div
                                    key={task.id}
                                    className="p-2 bg-white dark:bg-zinc-900/60 border border-[#E5E5E5] dark:border-zinc-800 rounded-md"
                                >
                                    <div className="flex justify-between items-start gap-1 mb-1">
                                        <span className={`text-[7px] font-sans font-bold px-1.5 py-0.5 rounded-md border ${typeColors[task.type] || typeColors.TASK}`}>
                                            {task.type?.replace("PROJECT_", "") || "TASK"}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-sans font-bold uppercase tracking-wider ${
                                            task.priority === 'HIGH' 
                                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-900 dark:border-white' 
                                                : 'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                        }`}>
                                            {task.priority || "MEDIUM"}
                                        </span>
                                    </div>
                                    
                                    <h4 className="text-[10px] font-bold text-[#111111] dark:text-white truncate">
                                        {task.title}
                                    </h4>
                                    
                                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#E5E5E5]/40 dark:border-zinc-800/40 text-[7px] text-[#AAAAAA] font-sans font-bold uppercase tracking-widest">
                                        <span className="text-[#2E7D32] dark:text-emerald-400 flex items-center gap-0.5">
                                            <span className="size-1 rounded-full bg-emerald-500 inline-block"></span>
                                            {task.status || "PENDING"}
                                        </span>
                                        <span>ID: {task.id.slice(-4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Performance Progress & Warnings Card (High-density) */}
                <div className="bg-[#F7F7F5] dark:bg-zinc-900/40 rounded-md p-3 border border-[#E5E5E5] dark:border-zinc-800/60 shadow-[0_1px_6px_rgba(0,0,0,0.01)] space-y-3">
                    
                    {/* Completion Meter */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="uppercase text-[8px] font-sans tracking-widest text-[#AAAAAA] font-bold">Progress</span>
                            <span className="font-serif font-bold text-[#111111] dark:text-white">{completionPercent}%</span>
                        </div>
                        
                        {/* Progress Bar (Strictly 1.5 height, rounded-md) */}
                        <div className="h-1.5 w-full bg-[#E5E5E5] dark:bg-zinc-800 rounded-md">
                            <div 
                                className="h-1.5 bg-[#111111] dark:bg-emerald-500 rounded-md transition-all duration-500" 
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                        
                        <div className="flex justify-between text-[7px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
                            <span>{completedTasks} Done</span>
                            <span>{totalTasks - completedTasks} Left</span>
                        </div>
                    </div>

                    {/* Timeline Warnings / Alerts (Compact badge style) */}
                    {overdueTasks.length > 0 ? (
                        <div className="p-2 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/10 rounded-md space-y-1">
                            <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                                <AlertCircle className="size-3.5 shrink-0" />
                                <h4 className="text-[8px] font-bold uppercase tracking-wider font-sans">
                                    Overdue ({overdueTasks.length})
                                </h4>
                            </div>
                            <div className="space-y-1">
                                {overdueTasks.slice(0, 3).map((task) => (
                                    <div key={task.id} className="flex justify-between items-center bg-white/70 dark:bg-zinc-900/30 p-1 rounded-md border border-rose-100/20">
                                        <span className="text-zinc-800 dark:text-zinc-200 text-[9px] truncate max-w-[150px] font-medium">{task.title}</span>
                                        <span className="text-[8px] text-rose-600 dark:text-rose-400 font-bold font-sans">{format(new Date(task.due_date), "MMM d")}</span>
                                    </div>
                                ))}
                            </div>
                            {overdueTasks.length > 3 && (
                                <p className="text-[7px] text-rose-500 text-center font-bold uppercase tracking-widest pt-0.5">
                                    + {overdueTasks.length - 3} More Overdue
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="p-1.5 bg-[#E8F5E3]/20 dark:bg-emerald-950/10 border border-emerald-100/20 rounded-md flex items-center gap-2">
                            <Trophy className="size-3 text-[#2E7D32]" />
                            <h4 className="text-[8px] font-bold uppercase tracking-wider text-[#2E7D32] dark:text-emerald-400 font-sans">Timeline On-Track</h4>
                        </div>
                    )}

                    {/* Upcoming Deadlines */}
                    <div className="pt-2 border-t border-[#E5E5E5] dark:border-zinc-800/80">
                        <div className="flex items-center gap-1 mb-1.5">
                            <Clock className="size-3 text-zinc-400" />
                            <h4 className="uppercase text-[8px] font-sans tracking-widest text-[#AAAAAA] font-bold">Upcoming Milestones</h4>
                        </div>
                        
                        {upcomingTasks.length === 0 ? (
                            <p className="text-[8px] text-zinc-400 dark:text-zinc-550 font-medium">None</p>
                        ) : (
                            <div className="space-y-1">
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between text-[9px] py-0.5 border-b border-dashed border-[#E5E5E5] dark:border-zinc-800/30 last:border-0 pb-1 last:pb-0">
                                        <div className="flex items-center gap-1 min-w-0 flex-1 pr-2">
                                            <span className="size-1 rounded-full bg-emerald-500 shrink-0"></span>
                                            <span className="text-[#6B6B6B] dark:text-zinc-300 font-semibold truncate">{task.title}</span>
                                        </div>
                                        <span className="text-[8px] text-zinc-400 dark:text-zinc-550 font-bold shrink-0">{format(new Date(task.due_date), "MMM d")}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
