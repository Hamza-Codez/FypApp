import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, Plus, Target, Activity, ShieldCheck, AlertCircle, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { format, isBefore } from "date-fns";
import { updateProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function ProjectSettings({ project, tasks = [] }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const today = new Date();

    // -- Live Metrics Calculation --
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === "COMPLETED").length;
    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    
    // Overdue items that are still active
    const overdueTasks = tasks.filter(t => t.status !== "COMPLETED" && t.due_date && isBefore(new Date(t.due_date), today));

    const riskLevel = overdueTasks.length === 0 ? "HEALTHY" : overdueTasks.length <= 2 ? "AT RISK" : "CRITICAL";
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                start_date: project.start_date || "",
                end_date: project.end_date || "",
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const resultAction = await dispatch(updateProject({
            id: project.id,
            ...formData,
        }));
        setIsSubmitting(false);
        
        if (updateProject.fulfilled.match(resultAction)) {
            toast.success("Project updated successfully!");
        } else {
            const errorData = resultAction.payload;
            const errorMessage = Array.isArray(errorData?.detail) 
                ? errorData.detail[0]?.msg || "Validation error"
                : errorData?.detail || "Failed to update project";
            toast.error(errorMessage);
        }

    };

    if (user?.role?.toUpperCase() !== 'HR') {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-zinc-900/40 rounded-md border border-dashed border-gray-300 dark:border-zinc-800">
                <p className="text-gray-500 font-medium">Only HR administrators can access project configuration.</p>
            </div>
        );
    }

    const cardClasses = "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-md shadow-sm";
    const labelClasses = "text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] block mb-1.5";
    const inputClasses = "w-full rounded-md dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-500";

    return (
        <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Project Details */}
            <div className={`${cardClasses} lg:col-span-2`}>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2 bg-blue-500/10 rounded-md">
                        <Save className="size-4 text-blue-500" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Project Configuration</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className={labelClasses}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} placeholder="Enter project name..." required />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClasses} h-32 resize-none`} placeholder="Detailed project overview..." />
                    </div>

                    {/* Meta Row: Status & Priority */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>Current Status</label>
                            <div className="relative">
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${inputClasses} appearance-none`} >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClasses}>Resource Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline Row */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClasses}>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputClasses} />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Final Deadline</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputClasses} />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 flex justify-start">
                        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50" >
                            <Save className="size-3.5" /> {isSubmitting ? "Syncing..." : "Update Configuration"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Live Data Report - Sidebar Tile */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div className="p-2 bg-emerald-500/10 rounded-md">
                            <Activity className="size-4 text-emerald-500" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Project Health</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Progress Sphere */}
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-md border border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Live Output</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{progressPercent}%</p>
                            </div>
                            <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm ${riskLevel === 'HEALTHY' ? 'bg-emerald-500 text-white' : riskLevel === 'AT RISK' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                                {riskLevel}
                            </div>
                        </div>

                        {/* Task Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-md border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <ShieldCheck className="size-3.5" />
                                    <span className="text-[9px] font-black uppercase">Finished</span>
                                </div>
                                <p className="text-lg font-bold text-emerald-500">{doneTasks} <span className="text-xs text-zinc-500 font-medium">/ {totalTasks}</span></p>
                            </div>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-md border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <AlertCircle className="size-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-tight">Risk Items</span>
                                </div>
                                <p className={`text-lg font-bold ${overdueTasks.length > 0 ? 'text-red-500' : 'text-zinc-400'}`}>{overdueTasks.length}</p>
                            </div>
                        </div>

                        {/* Efficiency Metric */}
                        <div className="flex items-center gap-3 p-4 bg-blue-500/5 dark:bg-blue-600/5 rounded-md border border-blue-500/10 transition-all hover:bg-blue-500/10 cursor-default group">
                            <div className="p-2 bg-blue-500/10 rounded-md">
                                <TrendingUp className="size-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-0.5">Timeline Efficiency</p>
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Processing Node {project.id.slice(-4).toUpperCase()}</p>
                            </div>
                            <ChevronRight className="size-3.5 text-blue-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
                
                {/* Visual Status Tag - Quick Summary */}
                <div className="bg-gradient-to-br from-black to-slate-600 dark:bg-white border border-zinc-200 dark:border-zinc-100 rounded-md p-5 text-white dark:text-zinc-900 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-600 p-2 rounded-md">
                            <Calendar className="size-4 text-white" />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase font-black tracking-widest opacity-60">Master Switch</span>
                            <div className="size-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 mt-1 animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Deployment Status</p>
                    <h3 className="text-xl font-bold uppercase tracking-tighter text-blue-500">
                        {formData.status.replace('_', ' ')}
                    </h3>
                </div>
            </div>
        </div>
    );
}
