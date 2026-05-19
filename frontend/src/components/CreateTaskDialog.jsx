import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { createTask, fetchEmployees } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const { projects, employees } = useSelector((state) => state.workspace);
    const { user } = useSelector((state) => state.auth);
    const project = projects.find((p) => p.id === projectId);
    
    useEffect(() => {
        if (employees.length === 0) {
            dispatch(fetchEmployees());
        }
    }, [dispatch, employees.length]);

    // Get full employee objects for assigned project members
    // If project has no assigned members, show all organizational employees as fall-back
    const projectMembers = employees.filter(emp => project?.assigned_to?.includes(emp.id));
    const teamMembers = projectMembers.length > 0 ? projectMembers : employees;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        assigned_to: user?.role?.toUpperCase() === 'EMPLOYEE' ? [user.id] : [],
        due_date: format(new Date(), "yyyy-MM-dd"),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Ensure assigned_to is sent as a list for backend compatibility
        const payload = {
            ...formData,
            project_id: projectId,
            status: "TODO",
            assigned_to: Array.isArray(formData.assigned_to) 
                ? formData.assigned_to 
                : formData.assigned_to ? [formData.assigned_to] : []
        };

        const resultAction = await dispatch(createTask(payload));
        setIsSubmitting(false);
        
        if (createTask.fulfilled.match(resultAction)) {
            toast.success("Task created successfully!");
            setShowCreateTask(false);
            setFormData({ 
                title: "", 
                description: "", 
                type: "TASK", 
                priority: "MEDIUM", 
                assigned_to: user?.role?.toUpperCase() === 'EMPLOYEE' ? [user.id] : [], 
                due_date: format(new Date(), "yyyy-MM-dd") 
            });
        } else {
            const errorData = resultAction.payload;
            const errorMessage = Array.isArray(errorData?.detail) 
                ? errorData.detail[0]?.msg || "Validation error"
                : errorData?.detail || "Failed to create task";
            toast.error(errorMessage);
        }

    };

    if (!showCreateTask) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 dark:bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl p-8 text-zinc-900 dark:text-white relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" 
                    onClick={() => setShowCreateTask(false)}
                >
                    <X className="size-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-8">
                    <div className="size-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <CalendarIcon className="size-4 stroke-[3]" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Create New Task</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-5 flex flex-col">
                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Task Title</label>
                                <input 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                    placeholder="e.g. Design user interface" 
                                    className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                                    required 
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1 flex-grow">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Description</label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                    placeholder="Provide detailed instructions for the task..." 
                                    className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-200 text-sm font-semibold h-32 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none" 
                                />
                            </div>

                            {/* Moved Action Buttons Here */}
                            <div className="flex items-center gap-3 pt-4 mt-auto">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="px-10 py-2.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Syncing..." : "Publish Task"}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateTask(false)} 
                                    className="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>

                        {/* Metadata Column */}
                        <div className="space-y-5 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                            {/* Type & Priority Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Type</label>
                                    <select 
                                        value={formData.type} 
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                                        className="w-full rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-2 text-zinc-900 dark:text-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                                    >
                                        <option value="BUG">Bug</option>
                                        <option value="FEATURE">Feature</option>
                                        <option value="TASK">Task</option>
                                        <option value="IMPROVEMENT">Improvement</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Priority</label>
                                    <select 
                                        value={formData.priority} 
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })} 
                                        className="w-full rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-2 text-zinc-900 dark:text-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Due Date</label>
                                <input 
                                    type="date" 
                                    value={formData.due_date} 
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
                                    min={new Date().toISOString().split('T')[0]} 
                                    className="w-full rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" 
                                />
                            </div>

                            {/* Assign To Selection */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-0.5">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">Assign Team</label>
                                    {user?.role?.toUpperCase() === 'HR' && (
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, assigned_to: teamMembers.map(m => m.id) }))}
                                            className="text-[9px] text-emerald-600 font-black tracking-widest uppercase hover:underline"
                                        >
                                            All
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 p-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 max-h-40 overflow-y-auto custom-scrollbar">
                                    {teamMembers.map((emp) => {
                                        const isLead = emp.id == project?.team_lead_id || (emp.id && project?.team_lead_id && emp.id.toString() === project.team_lead_id.toString());
                                        return (
                                            <label 
                                                key={emp.id} 
                                                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg border shadow-sm cursor-pointer transition-all group ${
                                                    isLead 
                                                    ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' 
                                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-50/10 dark:hover:bg-emerald-900/10'
                                                }`}
                                            >
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.assigned_to === emp.id || (Array.isArray(formData.assigned_to) && formData.assigned_to.includes(emp.id))}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setFormData(prev => {
                                                            const current = Array.isArray(prev.assigned_to) ? prev.assigned_to : prev.assigned_to ? [prev.assigned_to] : [];
                                                            if (isChecked) {
                                                                return { ...prev, assigned_to: [...current, emp.id] };
                                                            } else {
                                                                return { ...prev, assigned_to: current.filter(id => id !== emp.id) };
                                                            }
                                                        });
                                                    }}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-tight truncate">{emp.first_name} {emp.last_name}</span>
                                                        {isLead && (
                                                            <span className="text-[6.5px] font-black uppercase tracking-wider bg-emerald-600 dark:bg-emerald-500 text-white px-1.5 py-0.5 rounded leading-none">
                                                                Lead
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[8px] font-medium text-zinc-400 uppercase tracking-widest truncate">{emp.role}</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
