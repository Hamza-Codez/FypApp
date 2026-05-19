import React, { useState, useEffect } from "react";
import { X, Users, AlertTriangle } from "lucide-react";

const ReassignLeadDialog = ({ isOpen, onClose, projects = [], employees = [], employeeId, employeeName, onConfirm }) => {
    const [assignments, setAssignments] = useState({});

    // Reset assignments when modal opens or projects list changes
    useEffect(() => {
        if (isOpen && projects.length > 0) {
            const initialAssignments = {};
            projects.forEach(p => {
                const candidates = p.assigned_to?.filter(id => id !== employeeId) || [];
                // If there are candidates, select the first one by default, otherwise leave empty
                initialAssignments[p.id] = candidates.length > 0 ? candidates[0] : "";
            });
            setAssignments(initialAssignments);
        }
    }, [isOpen, projects, employeeId]);

    if (!isOpen || projects.length === 0) return null;

    const handleSelectLead = (projectId, leadId) => {
        setAssignments(prev => ({
            ...prev,
            [projectId]: leadId
        }));
    };

    const isAllAssigned = projects.every(p => {
        // A valid assignment is required for each project
        const selected = assignments[p.id];
        // If there's at least one other workspace employee, they must choose one
        const hasOtherEmployees = employees.some(e => e.id !== employeeId);
        return !hasOtherEmployees || (selected !== undefined && selected !== "");
    });

    const handleConfirm = () => {
        onConfirm(assignments);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 w-full h-full bg-zinc-900/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Dialog Container */}
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                    <X className="size-4" />
                </button>

                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
                        <AlertTriangle className="size-5 shrink-0" />
                        <h2 className="text-base font-black uppercase tracking-wider font-sans">Reassign Leadership Required</h2>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-455 leading-relaxed font-sans">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{employeeName}</span> is currently designated as the Team Lead for <span className="font-bold text-zinc-800 dark:text-zinc-200">{projects.length} project(s)</span>. Before removing this account, you must designate a new Team Lead for each of the following projects:
                    </p>
                </div>

                {/* Projects List Scrollable Area */}
                <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4 custom-scrollbar">
                    {projects.map(project => {
                        // Project members excluding the deleted lead
                        const projectCandidates = project.assigned_to?.filter(id => id !== employeeId) || [];
                        const hasProjectCandidates = projectCandidates.length > 0;
                        
                        // If no other members in the project, fallback to other organization employees
                        const fallbackCandidates = employees.filter(e => e.id !== employeeId);
                        const candidates = hasProjectCandidates ? projectCandidates : fallbackCandidates.map(e => e.id);

                        return (
                            <div key={project.id} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[280px]">
                                            {project.name}
                                        </h3>
                                        <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mt-0.5 leading-none">
                                            Project Leadership
                                        </p>
                                    </div>
                                    {!hasProjectCandidates && (
                                        <span className="px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 rounded">
                                            No Project Members
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[7.5px] font-black uppercase text-zinc-400 tracking-widest pl-0.5">
                                        Select New Team Lead
                                    </label>
                                    <select
                                        value={assignments[project.id] || ""}
                                        onChange={(e) => handleSelectLead(project.id, e.target.value)}
                                        className="w-full rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-sans text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-450 dark:focus:border-zinc-700 transition-all appearance-none"
                                        required
                                    >
                                        <option value="" disabled>Choose a replacement Lead...</option>
                                        {candidates.map(id => {
                                            const emp = employees.find(e => e.id === id);
                                            if (!emp) return null;
                                            return (
                                                <option key={id} value={id}>
                                                    {emp.first_name} {emp.last_name} ({emp.role || 'Employee'})
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {!hasProjectCandidates && fallbackCandidates.length > 0 && (
                                        <p className="text-[8px] font-medium text-amber-600 dark:text-amber-500 pl-0.5">
                                            Showing all other workspace employees as candidates.
                                        </p>
                                    )}
                                    {fallbackCandidates.length === 0 && (
                                        <p className="text-[8px] font-medium text-red-500 pl-0.5">
                                            No other active employees available in directory to take over.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isAllAssigned}
                        className="flex-1 px-4 py-2.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 rounded-lg transition-all active:scale-[0.98] uppercase tracking-widest"
                    >
                        Confirm & Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReassignLeadDialog;
