import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, Plus } from "lucide-react";
import { format } from "date-fns";
import { updateProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: new Date(),
        end_date: new Date(),
        progress: 0,
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
                start_date: project.start_date ? new Date(project.start_date) : new Date(),
                end_date: project.end_date ? new Date(project.end_date) : new Date(),
                progress: project.progress || 0,
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const resultAction = await dispatch(updateProject({
            id: project.id,
            ...formData,
            start_date: format(formData.start_date, "yyyy-MM-dd"),
            end_date: format(formData.end_date, "yyyy-MM-dd"),
        }));
        setIsSubmitting(false);
        
        if (updateProject.fulfilled.match(resultAction)) {
            toast.success("Project updated successfully!");
        } else {
            toast.error(resultAction.payload?.detail || "Failed to update project");
        }
    };

    if (user?.role?.toUpperCase() !== 'HR') {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
                <p className="text-gray-500 font-medium">Only HR administrators can modify project settings and status.</p>
            </div>
        );
    }

    const cardClasses = "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm";
    const labelClasses = "text-xs font-bold uppercase text-zinc-400 tracking-wider";
    const inputClasses = "w-full rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Project Configuration</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className={labelClasses}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24"} />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClasses}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Start Date</label>
                            <input type="date" value={formData.start_date instanceof Date && !isNaN(formData.start_date) ? format(formData.start_date, "yyyy-MM-dd") : ""} onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value) })} className={inputClasses} />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Deadline</label>
                            <input type="date" value={formData.end_date instanceof Date && !isNaN(formData.end_date) ? format(formData.end_date, "yyyy-MM-dd") : ""} onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value) })} className={inputClasses} />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center">
                            <label className={labelClasses}>Manual Progress Override</label>
                            <span className="text-sm font-bold text-blue-500">{formData.progress}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })} className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50" >
                            <Save className="size-4" /> {isSubmitting ? "Updating..." : "Save Configuration"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Team Members Visualization */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Team Oversight</h2>
                    <div className="space-y-3">
                         {project.assigned_to?.length > 0 ? (
                             project.assigned_to.map((memberId, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 transition-colors">
                                     <div className="flex items-center gap-3">
                                         <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                                             {memberId.substring(0,2)}
                                         </div>
                                         <span className="text-sm font-medium">{memberId}</span>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <div className="text-center py-8">
                                 <p className="text-sm text-zinc-500 italic">No assigned members yet.</p>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
}
