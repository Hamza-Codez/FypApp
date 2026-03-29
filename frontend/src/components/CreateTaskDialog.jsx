import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { createTask } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const { projects, employees } = useSelector((state) => state.workspace);
    const { user } = useSelector((state) => state.auth);
    const project = projects.find((p) => p.id === projectId);
    
    // Get full employee objects for assigned project members
    const teamMembers = employees.filter(emp => project?.assigned_to?.includes(emp.id));

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
            toast.error(resultAction.payload?.detail || "Failed to create task");
        }
    };

    if (!showCreateTask) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 text-zinc-900 dark:text-white relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" 
                    onClick={() => setShowCreateTask(false)}
                >
                    <X className="size-5" />
                </button>
                <h2 className="text-xl font-bold mb-6">Create New Task</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Title</label>
                        <input 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                            placeholder="Task title" 
                            className="w-full rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                            placeholder="Describe the task" 
                            className="w-full rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Type</label>
                            <select 
                                value={formData.type} 
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                                className="w-full rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Priority</label>
                            <select 
                                value={formData.priority} 
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })} 
                                className="w-full rounded-xl dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium">Assign To</label>
                                {user?.role?.toUpperCase() === 'HR' && (
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, assigned_to: teamMembers.map(m => m.id) }))}
                                        className="text-[10px] text-blue-600 font-bold hover:underline"
                                    >
                                        Assign All Member
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-32 overflow-y-auto">
                                {teamMembers.map((emp) => (
                                    <label key={emp.id} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-medium">{emp.first_name} {emp.last_name || emp.email.split('@')[0]}</span>
                                    </label>
                                ))}
                                {user?.role?.toUpperCase() === 'EMPLOYEE' && !project?.assigned_to?.includes(user?.id) && (
                                     <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={formData.assigned_to === user.id || (Array.isArray(formData.assigned_to) && formData.assigned_to.includes(user.id))}
                                            onChange={() => {}} // Forced for self in some cases or just allow checking
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-medium">{user.email} (You)</span>
                                     </label>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Due Date</label>
                            <input 
                                type="date" 
                                value={formData.due_date} 
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} 
                                min={new Date().toISOString().split('T')[0]} 
                                className="w-full rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button 
                            type="button" 
                            onClick={() => setShowCreateTask(false)} 
                            className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
