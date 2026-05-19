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
        team_lead_id: "",
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
            setFormData({ name: "", description: "", assigned_to: [], team_lead_id: "", priority: "MEDIUM", status: "PLANNING", start_date: "", end_date: "" });
        } else {
            toast.error(resultAction.payload?.detail || "Failed to create project");
        }
    };

    const toggleEmployee = (id) => {
        setFormData(prev => {
            const newAssigned = prev.assigned_to.includes(id)
                ? prev.assigned_to.filter(empId => empId !== id)
                : [...prev.assigned_to, id];
            
            // If the current team lead is removed from assigned members, clear team_lead_id
            const newTeamLeadId = newAssigned.includes(prev.team_lead_id) ? prev.team_lead_id : "";
            
            return {
                ...prev,
                assigned_to: newAssigned,
                team_lead_id: newTeamLeadId
            };
        });
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-5 w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-5 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Project</h2>
                        <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest mt-0.5">Project Initialization</p>
                    </div>
                    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={() => setIsDialogOpen(false)} >
                        <XIcon className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-5">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Project Identity Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-4 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-emerald-500 transition-all">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-1">Project Identity</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Type project name..."
                                    className="w-full bg-transparent text-lg font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none p-0"
                                />
                            </div>

                            {/* Priority Level Toggles */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Priority Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p })}
                                            className={`py-2 text-[10px] font-bold rounded-md border transition-all uppercase tracking-widest ${
                                                formData.priority === p 
                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-900'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Operational Status Toggles */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Operational Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['PLANNING', 'ACTIVE', 'ON_HOLD'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: s })}
                                            className={`py-2 text-[10px] font-bold rounded-md border transition-all uppercase tracking-widest ${
                                                formData.status === s 
                                                ? 'bg-slate-900 dark:bg-white dark:text-zinc-900 text-white border-slate-900' 
                                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-900'
                                            }`}
                                        >
                                            {s.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Team Lead Selection */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest pl-1">Designate Team Lead</label>
                                <select 
                                    value={formData.team_lead_id}
                                    onChange={(e) => setFormData({ ...formData, team_lead_id: e.target.value })}
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-2 text-[10px] font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 transition-all appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select from assigned members...</option>
                                    {formData.assigned_to.map(id => {
                                        const emp = employees.find(e => e.id === id);
                                        return (
                                            <option key={id} value={id}>
                                                {emp ? `${emp.first_name} ${emp.last_name}` : "Unknown User"}
                                            </option>
                                        );
                                    })}
                                </select>
                                {formData.assigned_to.length === 0 && (
                                    <p className="text-[8px] text-amber-600 font-bold uppercase tracking-tighter pl-1">Assign members first to select a lead</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Project Overview Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-3.5 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-emerald-500 transition-all">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-1">Project Overview</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Briefly describe project goals..."
                                    className="w-full bg-transparent text-xs text-zinc-600 dark:text-zinc-400 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none p-0 min-h-[60px] resize-none leading-relaxed"
                                />
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900 focus-within:border-emerald-500 transition-all">
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-transparent text-[10px] font-bold text-zinc-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900 focus-within:border-emerald-500 transition-all">
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Target Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-transparent text-[10px] font-bold text-zinc-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            {/* Assign Team Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                                <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                        <Users className="size-3" /> Assign Team Members
                                    </label>
                                    <span className="text-[9px] font-bold text-emerald-600">
                                        {formData.assigned_to.length} Selected
                                    </span>
                                </div>
                                <div className="max-h-[100px] overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                                    {employees.length === 0 ? (
                                        <p className="text-[10px] text-center py-4 text-zinc-400 uppercase font-black">No employees available</p>
                                    ) : employees.map(emp => (
                                        <div 
                                            key={emp.id} 
                                            onClick={() => toggleEmployee(emp.id)}
                                            className={`flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-all ${
                                                formData.assigned_to.includes(emp.id) 
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold truncate">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-[8px] uppercase tracking-wider text-zinc-400 font-medium truncate">{emp.role || 'Employee'}</p>
                                            </div>
                                            {formData.assigned_to.includes(emp.id) && <div className="size-1 bg-emerald-600 rounded-full" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                        <button 
                            type="button" 
                            onClick={() => setIsDialogOpen(false)} 
                            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 uppercase font-black text-[9px] py-2 px-5 rounded-md tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] py-2 px-7 rounded-md shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Processing..." : "Confirm & Launch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;