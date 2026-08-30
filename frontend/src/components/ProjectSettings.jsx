import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Save, Activity, ShieldCheck, AlertCircle, TrendingUp, Calendar, ChevronRight, Trash2, Plus, X, Users } from "lucide-react";
import { isBefore } from "date-fns";
import { updateProject, deleteProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import CustomModal from "./CustomModal";

export default function ProjectSettings({ project, tasks = [] }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { employees } = useSelector((state) => state.workspace);
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
        team_lead_id: "",
        start_date: "",
        end_date: "",
        assigned_to: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
    const [memberSearchQuery, setMemberSearchQuery] = useState("");

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                team_lead_id: project.team_lead_id || "",
                start_date: project.start_date || "",
                end_date: project.end_date || "",
                assigned_to: project.assigned_to || [],
            });
        }
    }, [project]);

    const handleToggleMember = (empId) => {
        setFormData(prev => {
            const isAssigned = prev.assigned_to.includes(empId);
            const newAssigned = isAssigned
                ? prev.assigned_to.filter(id => id !== empId)
                : [...prev.assigned_to, empId];

            // If the team lead is removed, reset team_lead_id
            let newTeamLeadId = prev.team_lead_id;
            if (isAssigned && prev.team_lead_id === empId) {
                newTeamLeadId = "";
            }

            return {
                ...prev,
                assigned_to: newAssigned,
                team_lead_id: newTeamLeadId
            };
        });
    };

    const handleRemoveMember = (empId) => {
        setFormData(prev => {
            const newAssigned = prev.assigned_to.filter(id => id !== empId);
            let newTeamLeadId = prev.team_lead_id;
            if (prev.team_lead_id === empId) {
                newTeamLeadId = "";
            }
            return {
                ...prev,
                assigned_to: newAssigned,
                team_lead_id: newTeamLeadId
            };
        });
    };

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
        const email = (emp.email || '').toLowerCase();
        const search = memberSearchQuery.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Clean up optional fields so they send null instead of empty strings,
        // which prevents Pydantic validation errors.
        const submitData = {
            ...formData,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            team_lead_id: formData.team_lead_id || null,
            description: formData.description || null,
        };

        const resultAction = await dispatch(updateProject({
            id: project.id,
            ...submitData,
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

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        const resultAction = await dispatch(deleteProject(project.id));
        setIsDeleting(false);

        if (deleteProject.fulfilled.match(resultAction)) {
            toast.success("Project dissolved successfully.");
            navigate("/dashboard");
        } else {
            const error = resultAction.payload?.detail || "Failed to dissolve project.";
            toast.error(error);
        }
    };

    if (user?.role?.toUpperCase() !== 'HR') {
        return (
            <div className="p-8 text-center bg-[#F7F7F5] dark:bg-zinc-900/30 rounded-md border border-dashed border-[#E5E5E5] dark:border-zinc-800">
                <p className="text-zinc-500 font-sans font-medium text-xs">Only HR administrators can access project configuration.</p>
            </div>
        );
    }

    const cardClasses = "bg-[#F7F7F5] dark:bg-zinc-900/50 border border-[#E5E5E5] dark:border-zinc-800/50 p-6 rounded-md shadow-sm transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-700";
    const labelClasses = "text-[7.5px] font-black uppercase text-zinc-450 dark:text-zinc-500 tracking-[0.2em] block mb-1.5 font-sans leading-none";
    const inputClasses = "w-full rounded-md bg-white dark:bg-zinc-950 border border-[#E5E5E5] dark:border-zinc-800 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-200 text-xs font-sans focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-100 focus:ring-0 transition-all placeholder:text-zinc-450";

    return (
        <div className="grid lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Project Details */}
            <div className={`${cardClasses} lg:col-span-2 flex flex-col justify-between`}>
                <div>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5E5E5]/60 dark:border-zinc-800/50">
                        <div className="p-1.5 bg-emerald-500/10 rounded-md">
                            <Save className="size-4 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-zinc-450 font-sans leading-none">
                            Project Configuration
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className={labelClasses}>Project Name</label>
                            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} placeholder="Enter project name..." required />
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className={labelClasses}>Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClasses} h-28 resize-none`} placeholder="Detailed project overview..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={labelClasses}>Current Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                    <option value="PLANNING" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Planning</option>
                                    <option value="ACTIVE" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Active</option>
                                    <option value="ON_HOLD" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">On Hold</option>
                                    <option value="COMPLETED" disabled={tasks.length > 0 && doneTasks < totalTasks} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">
                                        {tasks.length > 0 && doneTasks < totalTasks ? "Completed (Pending Tasks)" : "Completed"}
                                    </option>
                                    <option value="CANCELLED" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Cancelled</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClasses}>Resource Priority</label>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                    <option value="LOW" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Low</option>
                                    <option value="MEDIUM" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Medium</option>
                                    <option value="HIGH" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Team Lead Selection */}
                        <div className="space-y-1">
                            <label className={labelClasses}>Designated Team Lead</label>
                            <select
                                value={formData.team_lead_id}
                                onChange={(e) => setFormData({ ...formData, team_lead_id: e.target.value })}
                                className={inputClasses}
                            >
                                <option value="" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">None (Self-Managing Team)</option>
                                {formData.assigned_to?.map(id => {
                                    const emp = employees.find(e => e.id === id);
                                    return (
                                        <option key={id} value={id} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">
                                            {emp ? `${emp.first_name} ${emp.last_name}` : "Unknown User"}
                                        </option>
                                    );
                                })}
                            </select>
                            {formData.assigned_to?.length === 0 && (
                                <p className="text-[8px] text-amber-600 font-bold uppercase tracking-tighter pl-1">Assign members first to select a lead</p>
                            )}
                        </div>

                        {/* Team Assignment Section */}
                        <div className="space-y-2.5 border border-[#E5E5E5] dark:border-zinc-800 rounded-md p-4 bg-white dark:bg-zinc-950/20">
                            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]/60 dark:border-zinc-800/50">
                                <label className={labelClasses + " mb-0"}>Project Team Members</label>
                                <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded leading-none">
                                    {formData.assigned_to?.length || 0} Assigned
                                </span>
                            </div>

                            {/* Selected members list (chips/badges) */}
                            <div className="flex flex-wrap gap-1.5 py-1 min-h-[36px] items-center">
                                {formData.assigned_to?.length === 0 ? (
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans italic self-center my-auto">No team members assigned.</p>
                                ) : (
                                    formData.assigned_to.map(id => {
                                        const emp = employees.find(e => e.id === id);
                                        if (!emp) return null;
                                        const isLead = id === formData.team_lead_id;
                                        return (
                                            <div
                                                key={id}
                                                className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 rounded text-[10px] font-semibold border transition-all ${isLead
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350'
                                                    }`}
                                            >
                                                <span>{emp.first_name} {emp.last_name}</span>
                                                {isLead && (
                                                    <span className="text-[7px] font-black uppercase tracking-wider bg-emerald-600 dark:bg-emerald-500 text-white px-1 py-0.2 rounded leading-none">
                                                        Lead
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(id)}
                                                    className="p-0.5 rounded-full hover:bg-zinc-250 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition-colors"
                                                    title="Remove from project"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Add team member button and searchable panel */}
                            <div className="space-y-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAddMemberDropdown(!showAddMemberDropdown)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                                    
                                >
                                    <Plus className="size-3 stroke-[3]" />
                                    {showAddMemberDropdown ? "Close Add Panel" : "Add Team Members"}
                                </button>

                                {showAddMemberDropdown && (
                                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 overflow-hidden shadow-sm animate-in fade-in duration-200">
                                        <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 gap-2">
                                            <div className="flex items-center gap-1.5 text-zinc-400 flex-1 min-w-0">
                                                <Users className="size-3.5 shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Search employees..."
                                                    value={memberSearchQuery}
                                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                                    className="w-full text-[10px] bg-transparent border-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 font-sans"
                                                />
                                            </div>
                                            {memberSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMemberSearchQuery("")}
                                                    className="text-zinc-400 hover:text-zinc-655 text-[9px] font-bold uppercase tracking-widest shrink-0"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[140px] overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                                            {filteredEmployees.length === 0 ? (
                                                <p className="text-[10px] text-center py-4 text-zinc-400 dark:text-zinc-500 uppercase font-black">No matching employees</p>
                                            ) : (
                                                filteredEmployees.map(emp => {
                                                    const isAssigned = formData.assigned_to.includes(emp.id);
                                                    return (
                                                        <div
                                                            key={emp.id}
                                                            onClick={() => handleToggleMember(emp.id)}
                                                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${isAssigned
                                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-650 dark:text-zinc-400'
                                                                }`}
                                                        >
                                                            <div className="flex-1 min-w-0 pr-2">
                                                                <p className="text-[10px] font-bold truncate leading-snug">{emp.first_name} {emp.last_name}</p>
                                                                <p className="text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold truncate leading-none mt-0.5">{emp.email}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                {isAssigned ? (
                                                                    <>
                                                                        <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-450 tracking-wider">Assigned</span>
                                                                        <div className="size-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[8px] font-black uppercase text-zinc-450 dark:text-zinc-500 tracking-wider">Add Member</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline Row */}
                        <div className="grid grid-cols-2 gap-4">
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
                            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-md font-bold uppercase text-[9px] tracking-[0.2em] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50" >
                                <Save className="size-3.5" /> {isSubmitting ? "Syncing..." : "Update Configuration"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Live Data Report - Sidebar Tiles */}
            <div className="space-y-4">

                {/* Project Health Card */}
                <div className={cardClasses}>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5E5E5]/60 dark:border-zinc-800/50">
                        <div className="p-1.5 bg-emerald-500/10 rounded-md">
                            <Activity className="size-4 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA] dark:text-zinc-450 font-sans leading-none">
                            Project Health
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Live Output (Stripe Layout style) */}
                        <div className="p-3.5 bg-white dark:bg-zinc-950/20 border border-[#E5E5E5] dark:border-zinc-800 rounded-md flex flex-col justify-between h-[80px]">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-sans leading-none">
                                    Live Output
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest leading-none ${riskLevel === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                        riskLevel === 'AT RISK' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                            'bg-red-500/10 text-red-600 dark:text-red-400'
                                    }`}>
                                    {riskLevel}
                                </span>
                            </div>
                            <div className="flex items-baseline mt-1">
                                <p className="text-2xl font-bold font-serif text-zinc-950 dark:text-zinc-100 tracking-tight leading-none">
                                    {progressPercent}%
                                </p>
                            </div>
                        </div>

                        {/* Task Breakdown (Stripe Layout style) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white dark:bg-zinc-950/20 border border-[#E5E5E5] dark:border-zinc-800 rounded-md flex flex-col justify-between h-[80px]">
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <ShieldCheck className="size-3.5 text-zinc-400" />
                                    <span className="text-[7.5px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 leading-none">Finished</span>
                                </div>
                                <div className="flex items-baseline mt-1">
                                    <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                                        {doneTasks} <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-medium">/ {totalTasks}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 bg-white dark:bg-zinc-950/20 border border-[#E5E5E5] dark:border-zinc-800 rounded-md flex flex-col justify-between h-[80px]">
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <AlertCircle className="size-3.5 text-zinc-400" />
                                    <span className="text-[7.5px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 leading-none">Risk Items</span>
                                </div>
                                <div className="flex items-baseline mt-1">
                                    <p className={`text-2xl font-bold font-serif tracking-tight leading-none ${overdueTasks.length > 0 ? 'text-red-650 dark:text-red-400' : 'text-zinc-450 dark:text-zinc-500'}`}>
                                        {overdueTasks.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Efficiency Metric */}
                        <div className="flex items-center justify-between p-3.5 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] rounded-md border border-emerald-500/10 transition-all hover:bg-emerald-500/[0.06] cursor-default group">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 bg-emerald-500/10 rounded-md shrink-0">
                                    <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[7.5px] font-black text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-[0.2em] mb-0.5 leading-none">Timeline Efficiency</p>
                                    <p className="text-[10px] font-bold text-zinc-850 dark:text-zinc-200 truncate">Processing Node {project.id.slice(-4).toUpperCase()}</p>
                                </div>
                            </div>
                            <ChevronRight className="size-3.5 text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Visual Status Tag - Master Switch Deployment Panel */}
                <div className="bg-[#111111] dark:bg-zinc-950 border border-zinc-950 dark:border-zinc-800 rounded-md p-5 text-white shadow-md flex flex-col justify-between h-[120px] transition-all hover:border-zinc-700">
                    <div className="flex justify-between items-start">
                        <div className="bg-emerald-600/20 p-1.5 rounded-md border border-emerald-500/10">
                            <Calendar className="size-4 text-emerald-400" />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[7.5px] uppercase font-black tracking-[0.2em] text-zinc-400">Master Switch</span>
                            <div className="size-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 mt-1.5 animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 leading-none">Deployment Status</p>
                        <h3 className="text-lg font-bold font-serif uppercase tracking-tight text-emerald-400 leading-none">
                            {formData.status.replace('_', ' ')}
                        </h3>
                    </div>
                </div>

                {/* --- Danger Zone Section: Premium Restructure --- */}
                <div className="bg-red-500/[0.01] dark:bg-red-500/[0.02] border border-red-500/10 dark:border-red-950/20 rounded-md p-5 shadow-sm relative group overflow-hidden transition-all duration-300 hover:border-red-500/20">
                    {/* Decorative Accent */}
                    <div className="absolute top-0 left-0 w-[3px] h-full bg-red-500/10 group-hover:bg-red-500/30 transition-all duration-300" />

                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-red-500/10">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-red-500/10 rounded-md">
                                <Trash2 className="size-3.5 text-red-500" />
                            </div>
                            <div>
                                <span className="inline-block text-red-650 dark:text-red-400 text-[7px] font-black uppercase tracking-[0.1em] mb-0.5">
                                    Project Dissolution
                                </span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-white leading-none">
                                    Dissolve Now
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">
                            Purging this project infrastructure will permanently erase all tasks, scopes, and member logs. This action is absolute.
                        </p>

                        <div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="w-fit flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-bold uppercase text-[9px] tracking-[0.2em] shadow-sm transition-all active:scale-[0.98] group/btn"
                            >
                                <Trash2 className="size-3" />
                                Execute Project Purge
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <CustomModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProject}
                title="Critical Confirmation"
                message={`You are about to dissolve "${project.name}". This will permanently remove all member assignments and task architectures. Proceed with caution?`}
                variant="red"
                confirmText={isDeleting ? "Purging..." : "Confirm Purge"}
            />
        </div>
    );
}
