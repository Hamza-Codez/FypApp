import { useState } from "react";
import { format, isSameDay, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

const typeColors = {
    BUG: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    FEATURE: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    TASK: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    IMPROVEMENT: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    OTHER: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
};

const priorityBorders = {
    LOW: "border-zinc-300 dark:border-zinc-600",
    MEDIUM: "border-amber-300 dark:border-amber-500",
    HIGH: "border-orange-300 dark:border-orange-500",
};

const ProjectCalendar = ({ tasks }) => {
    const { user } = useSelector((state) => state.auth);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    
    // Filter tasks based on role for the sidebar and main lists
    const filteredTasks = user?.role?.toUpperCase() === "HR" 
        ? tasks 
        : tasks.filter(t => t.assigned_to?.includes(user?.id));

    const getTasksForDate = (date) => tasks.filter((task) => isSameDay(new Date(task.due_date), date));

    const upcomingTasks = filteredTasks
        .filter((task) => task.due_date && !isBefore(new Date(task.due_date), today) && task.status !== "COMPLETED")
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 10);

    const overdueTasks = filteredTasks.filter((task) => task.due_date && isBefore(new Date(task.due_date), today) && task.status !== "COMPLETED");

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const handleMonthChange = (direction) => {
        setCurrentMonth((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
    };

    return (
        <div className="grid lg:grid-cols-3 gap-5 animate-in fade-in duration-500 auto-rows-min">
            {/* 1. Calendar View - Primary Block */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 shadow-sm h-full">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-zinc-900 dark:text-white text-xs font-bold flex gap-2 items-center">
                            <CalendarIcon className="size-4 text-blue-600" /> Deadlines
                        </h2>
                        <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                            <button onClick={() => handleMonthChange("prev")} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition-all shadow-sm">
                                <ChevronLeft className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <span className="text-zinc-900 dark:text-white font-bold text-[9px] uppercase tracking-widest min-w-[90px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
                            <button onClick={() => handleMonthChange("next")} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition-all shadow-sm">
                                <ChevronRight className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 text-[9px] uppercase font-black tracking-[0.2em] text-zinc-400 mb-3 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                        {daysInMonth.map((day) => {
                            const dayTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const hasOverdue = dayTasks.some((t) => t.status !== "COMPLETED" && isBefore(new Date(t.due_date), today));
                            const hasDeadlines = dayTasks.length > 0;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(day)}
                                    className={`relative size-10 rounded-full flex flex-col items-center justify-center text-xs transition-all font-bold group
                                    ${isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 z-10" : "bg-transparent text-zinc-900 dark:text-zinc-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"}
                                    ${hasOverdue && !isSelected ? "ring-2 ring-red-500/50 ring-offset-2 dark:ring-offset-zinc-900" : ""}
                                    ${hasDeadlines && !isSelected && !hasOverdue ? "ring-1 ring-blue-500/20" : ""}`}
                                >
                                    <span className="relative z-10">{format(day, "d")}</span>
                                    {hasDeadlines && (
                                        <div className={`absolute bottom-1.5 size-1 rounded-full transition-all ${isSelected ? 'bg-white scale-125' : 'bg-blue-600 group-hover:scale-150'}`}></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. Task List - Sidebar Tall Block */}
            <div className="lg:row-span-2">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 shadow-sm h-full flex flex-col">
                    <h3 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-4 opacity-60">
                        <Clock className="size-3.5 text-blue-600" /> Task List
                    </h3>
                    
                    {upcomingTasks.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center py-10 opacity-40">
                            <Clock className="size-8 mb-4 stroke-1" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">No Activity</p>
                        </div>
                    ) : (
                        <div className="space-y-2 overflow-y-auto pr-1 flex-grow">
                            {upcomingTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-zinc-50/80 dark:bg-zinc-800/40 p-3 rounded-xl transition-all border border-transparent hover:border-blue-500/30 hover:bg-white dark:hover:bg-zinc-800 group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm ${typeColors[task.type]}`}>
                                            {task.type}
                                        </span>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{format(new Date(task.due_date), "MMM d")}</p>
                                    </div>
                                    <span className="text-zinc-900 dark:text-zinc-100 font-bold text-xs leading-tight block group-hover:text-blue-600 transition-colors mb-1 truncate">{task.title}</span>
                                    {task.description && (
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight line-clamp-1 opacity-60">{task.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Selected Day Tasks - Bento Tile */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 shadow-sm min-h-[160px] h-full">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-zinc-900 dark:text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                            {format(selectedDate, "MMM d")}
                        </h3>
                        <span className="text-[9px] font-black tracking-widest text-zinc-400">
                            {getTasksForDate(selectedDate).length} ITEMS
                        </span>
                    </div>

                    {getTasksForDate(selectedDate).length === 0 ? (
                        <div className="h-24 flex items-center justify-center opacity-30">
                            <p className="text-[10px] font-black uppercase tracking-widest">No plans</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {getTasksForDate(selectedDate).map((task) => (
                                <div
                                    key={task.id}
                                    className={`relative bg-zinc-50/50 dark:bg-zinc-800/20 p-3 rounded-xl border-l-[4px] transition-all hover:bg-white dark:hover:bg-zinc-800/40 ${priorityBorders[task.priority]}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-tight truncate pr-2">{task.title}</h4>
                                        <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm ${typeColors[task.type]}`}>
                                            {task.type}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                        <span className={task.priority === 'HIGH' ? 'text-red-500' : ''}>{task.priority} Priority</span>
                                        <span className="opacity-50 italic lowercase font-medium tracking-normal">id: {task.id.slice(-4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Overdue Block - Final Bento Tile */}
            <div className={`${overdueTasks.length > 0 ? 'bg-red-500/5 dark:bg-red-950/20 border-red-500/20' : 'bg-zinc-900 text-white border-zinc-800'} border rounded-md p-4 shadow-sm flex flex-col justify-between h-full`}>
                {overdueTasks.length > 0 ? (
                    <>
                        <div>
                            <h3 className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                                <Clock className="size-3.5" /> Overdue ({overdueTasks.length})
                            </h3>
                            <div className="space-y-2">
                                {overdueTasks.slice(0, 2).map((task) => (
                                    <div key={task.id} className="flex justify-between items-center bg-white/40 dark:bg-black/10 p-2 rounded-lg border border-red-500/10">
                                        <span className="text-zinc-700 dark:text-zinc-300 text-[10px] font-bold truncate max-w-[100px]">{task.title}</span>
                                        <span className="text-[9px] text-red-600 font-black whitespace-nowrap">{format(new Date(task.due_date), "MMM d")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {overdueTasks.length > 2 && (
                            <p className="text-[9px] text-zinc-400 text-center font-bold uppercase tracking-widest mt-4">
                                + {overdueTasks.length - 2} More
                            </p>
                        )}
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-4">
                        <div className="size-7 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                            <Clock className="size-3.5 text-white" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 leading-relaxed">Timeline<br/>Clear</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCalendar;
