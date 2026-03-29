import { useState } from "react";
import { XIcon, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const { employees } = useSelector((state) => state.workspace);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        assigned_to: [],
        priority: "MEDIUM",
        status: "PLANNING",
        start_date: "",
        end_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.assigned_to.length === 0) {
            toast.error("Please assign at least one employee");
            return;
        }
        setIsSubmitting(true);
        const resultAction = await dispatch(createProject(formData));
        setIsSubmitting(false);
        if (createProject.fulfilled.match(resultAction)) {
            toast.success("Project created successfully!");
            setIsDialogOpen(false);
            setFormData({ name: "", description: "", assigned_to: [], priority: "MEDIUM", status: "PLANNING", start_date: "", end_date: "" });
        } else {
            toast.error(resultAction.payload?.detail || "Failed to create project");
        }
    };

    const toggleEmployee = (id) => {
        setFormData(prev => ({
            ...prev,
            assigned_to: prev.assigned_to.includes(id)
                ? prev.assigned_to.filter(empId => empId !== id)
                : [...prev.assigned_to, id]
        }));
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)} >
                    <XIcon className="size-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Project</h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Fill in the details to launch a new project.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Project Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Q2 Marketing Campaign"
                            className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 dark:text-white text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Deadline</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 dark:text-white text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                <Users className="size-3" /> Assign Team
                            </label>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-100 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                                {formData.assigned_to.length} Selected
                            </span>
                        </div>
                        <div className="max-h-36 overflow-y-auto border border-zinc-100 dark:border-zinc-800 rounded-2xl p-2.5 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/30 custom-scrollbar">
                            {employees.length === 0 ? (
                                <p className="text-[10px] text-center py-4 text-zinc-400 uppercase font-black">No employees available</p>
                            ) : employees.map(emp => (
                                <div 
                                    key={emp.id} 
                                    onClick={() => toggleEmployee(emp.id)}
                                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border ${
                                        formData.assigned_to.includes(emp.id) 
                                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' 
                                        : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800'
                                    }`}
                                >
                                    <div className={`size-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                                        formData.assigned_to.includes(emp.id) ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}>
                                        {emp.first_name[0]}{emp.last_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{emp.first_name} {emp.last_name}</p>
                                    </div>
                                    <div className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                                        formData.assigned_to.includes(emp.id) ? 'bg-blue-600 border-blue-600' : 'border-zinc-200 dark:border-zinc-800'
                                    }`}>
                                        {formData.assigned_to.includes(emp.id) && <div className="size-1.5 bg-white rounded-full" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe project goals..."
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white h-16 resize-none text-xs leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-end pt-2 gap-4">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-[11px]"
                        >
                            {isSubmitting ? "Processing..." : "Launch Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;