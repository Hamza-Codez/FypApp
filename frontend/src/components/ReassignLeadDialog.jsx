import { useState, useEffect } from "react";
import { X, Users, AlertTriangle, Check, Calendar, Flag, BarChart2 } from "lucide-react";

const ReassignLeadDialog = ({ isOpen, onClose, projects = [], offboardProjects = [], employees = [], employeeId, employeeName, onConfirm }) => {
    const [projectUpdates, setProjectUpdates] = useState({});
    const [activeProjectId, setActiveProjectId] = useState("");
    const [globalReplacementId, setGlobalReplacementId] = useState("");

    const activeEmployees = employees.filter(e => e.status === 'ACTIVE' && e.id !== employeeId);
    const offboardProjectIds = offboardProjects.map(p => p.id);

    // Initialize state when dialog opens
    useEffect(() => {
        if (isOpen && offboardProjects.length > 0) {
            const initialUpdates = {};
            offboardProjects.forEach(p => {
                initialUpdates[p.id] = {
                    name: p.name || "",
                    description: p.description || "",
                    assigned_to: p.assigned_to ? p.assigned_to.filter(id => id !== employeeId) : [],
                    team_lead_id: p.team_lead_id === employeeId ? "" : (p.team_lead_id || ""),
                    priority: p.priority || "MEDIUM",
                    status: p.status || "PLANNING",
                    start_date: p.start_date ? p.start_date.split('T')[0] : "",
                    end_date: p.end_date ? p.end_date.split('T')[0] : "",
                };
            });
            setProjectUpdates(initialUpdates);
            setActiveProjectId(offboardProjects[0]?.id || "");
            setGlobalReplacementId("");
        }
    }, [isOpen, offboardProjects, employeeId]);

    if (!isOpen || offboardProjects.length === 0 || !activeProjectId || Object.keys(projectUpdates).length === 0) return null;

    const currentProj = projectUpdates[activeProjectId];

    // Real-time Membership Load Tracker (Static active projects + locally modified active projects)
    const getRealtimeMembershipCount = (empId) => {
        const unmodifiedCount = projects.filter(p => 
            p.status !== 'COMPLETED' && 
            !offboardProjectIds.includes(p.id) && 
            p.assigned_to?.includes(empId)
        ).length;

        let modifiedCount = 0;
        Object.entries(projectUpdates).forEach(([projId, projData]) => {
            if (projData.status !== 'COMPLETED' && projData.assigned_to?.includes(empId)) {
                modifiedCount++;
            }
        });

        return unmodifiedCount + modifiedCount;
    };

    // Real-time Leadership Load Tracker (Static active projects + locally modified active projects)
    const getRealtimeLeadershipCount = (empId) => {
        const unmodifiedCount = projects.filter(p => 
            p.status !== 'COMPLETED' && 
            !offboardProjectIds.includes(p.id) && 
            p.team_lead_id === empId
        ).length;

        let modifiedCount = 0;
        Object.entries(projectUpdates).forEach(([projId, projData]) => {
            if (projData.status !== 'COMPLETED' && projData.team_lead_id === empId) {
                modifiedCount++;
            }
        });

        return unmodifiedCount + modifiedCount;
    };

    // Pre-validates if an employee has enough workload headroom to be designated as the global backup
    const canBeGlobalBackup = (empId) => {
        // Count active offboard projects where they are not currently in the assigned list
        let newAssignmentsCount = 0;
        Object.entries(projectUpdates).forEach(([projId, projData]) => {
            if (projData.status !== 'COMPLETED' && !projData.assigned_to.includes(empId)) {
                newAssignmentsCount++;
            }
        });

        if (getRealtimeMembershipCount(empId) + newAssignmentsCount > 5) return false;

        // Count active offboard projects where the deleted employee was lead and backup is not currently lead
        let newLeadsCount = 0;
        offboardProjects.forEach(p => {
            if (p.status !== 'COMPLETED' && p.team_lead_id === employeeId) {
                const localData = projectUpdates[p.id];
                if (localData && localData.team_lead_id !== empId) {
                    newLeadsCount++;
                }
            }
        });

        if (getRealtimeLeadershipCount(empId) + newLeadsCount > 2) return false;

        return true;
    };

    const updateActiveProjectField = (field, value) => {
        setProjectUpdates(prev => ({
            ...prev,
            [activeProjectId]: {
                ...prev[activeProjectId],
                [field]: value
            }
        }));
    };

    const toggleEmployee = (empId) => {
        setProjectUpdates(prev => {
            const proj = prev[activeProjectId];
            if (!proj) return prev;
            
            const newAssigned = proj.assigned_to.includes(empId)
                ? proj.assigned_to.filter(id => id !== empId)
                : [...proj.assigned_to, empId];
            
            // If the current team lead is removed from assigned members, clear team_lead_id
            const newLead = newAssigned.includes(proj.team_lead_id) ? proj.team_lead_id : "";
            
            return {
                ...prev,
                [activeProjectId]: {
                    ...proj,
                    assigned_to: newAssigned,
                    team_lead_id: newLead
                }
            };
        });
    };

    const handleGlobalReplacementChange = (replacementId) => {
        setGlobalReplacementId(replacementId);
        if (!replacementId) return;

        setProjectUpdates(prev => {
            const updated = { ...prev };
            offboardProjects.forEach(p => {
                const proj = updated[p.id];
                if (proj) {
                    // Remove deleted user, add replacement if not already there
                    const newAssigned = proj.assigned_to.filter(id => id !== employeeId);
                    if (!newAssigned.includes(replacementId)) {
                        newAssigned.push(replacementId);
                    }
                    
                    // If deleted employee was team lead of this project, make replacement the team lead
                    let newLead = proj.team_lead_id;
                    if (p.team_lead_id === employeeId) {
                        newLead = replacementId;
                    }
                    
                    updated[p.id] = {
                        ...proj,
                        assigned_to: newAssigned,
                        team_lead_id: newLead
                    };
                }
            });
            return updated;
        });
    };

    const isProjectValid = (proj) => {
        if (!proj) return false;
        if (!proj.name.trim()) return false;
        if (proj.assigned_to.length === 0) return false;
        if (proj.team_lead_id && !proj.assigned_to.includes(proj.team_lead_id)) return false;
        return true;
    };

    const isAllValid = Object.values(projectUpdates).every(isProjectValid);

    const handleConfirm = () => {
        if (isAllValid) {
            onConfirm(projectUpdates, globalReplacementId);
        }
    };

    // Filter member checklist: Keep if already checked OR if they are under the 5-project limit
    const filteredEmployeesForChecklist = activeEmployees.filter(emp => {
        const isCurrentMember = currentProj.assigned_to.includes(emp.id);
        const isUnderLimit = getRealtimeMembershipCount(emp.id) < 5;
        return isCurrentMember || isUnderLimit;
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 w-full h-full bg-zinc-900/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Dialog Container - Constrained, scroll-free sizing */}
            <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 p-5 gap-3.5 select-none overflow-hidden">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors z-10"
                >
                    <X className="size-4" />
                </button>

                {/* Header Block: Ultra clean, left-aligned alert */}
                <div className="flex items-start gap-3 shrink-0">
                    <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-900/20 shrink-0">
                        <AlertTriangle className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider leading-tight">Reassign Responsibilities Required</h2>
                        <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-normal mt-0.5">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-250">{employeeName}</span> is currently involved in <span className="font-semibold text-zinc-800 dark:text-zinc-250">{offboardProjects.length} active project(s)</span>. Before deleting this account, designate backups to complete offboarding.
                        </p>
                    </div>
                </div>

                {/* Global Backup Section: Highly compact card with load verification */}
                <div className="flex flex-row items-center justify-between gap-3 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Designate global replacement (Recommended)</span>
                    </div>
                    <div className="relative min-w-[220px]">
                        <select
                            value={globalReplacementId}
                            onChange={(e) => handleGlobalReplacementChange(e.target.value)}
                            className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-[11px] font-bold text-zinc-900 dark:text-zinc-200 outline-none focus:border-emerald-500 dark:focus:border-emerald-600 transition-all appearance-none pr-8 cursor-pointer"
                        >
                            <option value="">Select global backup...</option>
                            {activeEmployees.map(emp => {
                                // Filter candidates who would exceed active caps if chosen globally
                                if (!canBeGlobalBackup(emp.id)) return null;
                                return (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                );
                            })}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            <Users className="size-3" />
                        </div>
                    </div>
                </div>

                {/* Project Horizontal Tab Row - Switch Active Selection (Removed bottom border line) */}
                <div className="flex items-center gap-1.5 pb-0.5 shrink-0 overflow-x-auto scrollbar-none">
                    {offboardProjects.map(p => {
                        const isSelected = p.id === activeProjectId;
                        const projData = projectUpdates[p.id];
                        const isProjValid = isProjectValid(projData);
                        const isLead = p.team_lead_id === employeeId;

                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setActiveProjectId(p.id)}
                                className={`relative flex items-center gap-2 px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all shrink-0 ${
                                    isSelected
                                    ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-350 dark:border-zinc-755 text-zinc-900 dark:text-white shadow-sm border-l-2 border-l-emerald-600 font-extrabold'
                                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-700'
                                }`}
                            >
                                <span>{projData?.name || p.name}</span>
                                <span className={`px-1 py-0.5 text-[6.5px] font-black uppercase tracking-wider rounded ${
                                    isLead
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-455'
                                    : 'bg-zinc-100 text-zinc-660 dark:bg-zinc-850 dark:text-zinc-400'
                                }`}>
                                    {isLead ? 'Lead' : 'Member'}
                                </span>
                                {!isProjValid && (
                                    <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Compact Consolidated Dual-Column Form Editor - Completely Scroll-Free, borders removed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 shrink-0">
                    
                    {/* Left Form Column */}
                    <div className="space-y-2.5">
                        
                        {/* Project Name */}
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2.5 bg-white dark:bg-zinc-900/50 shadow-sm focus-within:border-emerald-500 transition-all">
                            <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Project Name</label>
                            <input
                                type="text"
                                required
                                value={currentProj.name}
                                onChange={(e) => updateActiveProjectField("name", e.target.value)}
                                placeholder="Project name..."
                                className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 outline-none p-0"
                            />
                        </div>
                        
                        {/* Priority & Status Dropdowns */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900/50 focus-within:border-emerald-500 transition-all">
                                <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Priority</label>
                                <select
                                    value={currentProj.priority}
                                    onChange={(e) => updateActiveProjectField("priority", e.target.value)}
                                    className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900/50 focus-within:border-emerald-500 transition-all">
                                <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Status</label>
                                <select
                                    value={currentProj.status}
                                    onChange={(e) => updateActiveProjectField("status", e.target.value)}
                                    className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="PLANNING">PLANNING</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="ON_HOLD">ON HOLD</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                </select>
                            </div>
                        </div>

                        {/* Start & End Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900/50 focus-within:border-emerald-500 transition-all">
                                <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Start Date</label>
                                <input
                                    type="date"
                                    value={currentProj.start_date}
                                    onChange={(e) => updateActiveProjectField("start_date", e.target.value)}
                                    className="w-full bg-transparent text-[10px] font-bold text-zinc-900 dark:text-white outline-none"
                                />
                            </div>
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900/50 focus-within:border-emerald-500 transition-all">
                                <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Target Deadline</label>
                                <input
                                    type="date"
                                    value={currentProj.end_date}
                                    onChange={(e) => updateActiveProjectField("end_date", e.target.value)}
                                    className="w-full bg-transparent text-[10px] font-bold text-zinc-900 dark:text-white outline-none"
                                />
                            </div>
                        </div>

                        {/* Action Buttons: Shifted to the left and styled smaller side-by-side */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md transition-all uppercase tracking-widest text-center shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!isAllValid}
                                className="px-3 py-1.5 text-[9px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 rounded-md transition-all active:scale-[0.98] uppercase tracking-widest text-center"
                            >
                                Confirm & Delete
                            </button>
                        </div>
                    </div>

                    {/* Right Form Column */}
                    <div className="space-y-2.5">
                        
                        {/* Description & Team Lead */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Description */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900/50 shadow-sm focus-within:border-emerald-500 transition-all h-[76px] flex flex-col">
                                <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Description</label>
                                <textarea
                                    value={currentProj.description}
                                    onChange={(e) => updateActiveProjectField("description", e.target.value)}
                                    placeholder="Describe goals..."
                                    className="w-full bg-transparent text-[10px] text-zinc-650 dark:text-zinc-400 placeholder:text-zinc-300 outline-none p-0 resize-none leading-relaxed flex-1 custom-scrollbar"
                                />
                            </div>
                            {/* Team Lead Select */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-white dark:bg-zinc-900/50 shadow-sm focus-within:border-emerald-500 transition-all h-[76px] flex flex-col justify-between">
                                <div className="w-full">
                                    <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest block mb-0.5">Team Lead</label>
                                    <select 
                                        value={currentProj.team_lead_id}
                                        onChange={(e) => updateActiveProjectField("team_lead_id", e.target.value)}
                                        className="w-full bg-transparent text-xs font-bold text-zinc-900 dark:text-white outline-none cursor-pointer pr-4 truncate"
                                    >
                                        <option value="">None (Self-Managing)</option>
                                        {currentProj.assigned_to.map(id => {
                                            const emp = employees.find(e => e.id === id);
                                            if (!emp) return null;

                                            // Load constraint: Limit active leads to max 2 projects
                                            const isCurrentLead = currentProj.team_lead_id === id;
                                            const isUnderLeadLimit = getRealtimeLeadershipCount(id) < 2;

                                            if (!isCurrentLead && !isUnderLeadLimit) return null;

                                            return (
                                                <option key={id} value={id}>
                                                    {emp.first_name} {emp.last_name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <span className="text-[7.5px] uppercase font-bold tracking-wider text-zinc-450 leading-none block pb-0.5">Assign members first</span>
                            </div>
                        </div>

                        {/* Expanded Assigned Team Checklist - Occupies the entire bottom-right space */}
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900/30 overflow-hidden shadow-sm flex flex-col h-[130px]">
                            <div className="p-1.5 border-b border-zinc-150 dark:border-zinc-850 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0">
                                <label className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-1">
                                    <Users className="size-3 text-zinc-400" /> Assigned Team
                                </label>
                                <span className="text-[7.5px] font-bold text-emerald-600 bg-emerald-500/10 px-1 py-0.5 rounded leading-none shrink-0">
                                    {currentProj.assigned_to.length} Checked
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-1 space-y-0.5 custom-scrollbar min-h-0">
                                {filteredEmployeesForChecklist.map(emp => {
                                    const isSelected = currentProj.assigned_to.includes(emp.id);
                                    return (
                                        <div 
                                            key={emp.id} 
                                            onClick={() => toggleEmployee(emp.id)}
                                            className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${
                                                isSelected 
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold' 
                                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-450'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                                <span className="text-[10px] font-bold truncate">{emp.first_name} {emp.last_name}</span>
                                                <span className="text-[7px] uppercase tracking-wider text-zinc-450 font-bold truncate leading-none">{emp.designation || emp.role || 'Employee'}</span>
                                            </div>
                                            {isSelected && <Check className="size-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReassignLeadDialog;
