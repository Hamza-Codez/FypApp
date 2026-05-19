import { Link } from "react-router-dom";
import { Briefcase, Clock, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

const statusStyles = {
    PLANNING: "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    ON_HOLD: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    CANCELLED: "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 line-through",
};

const ProjectCard = ({ project }) => {
    const { employees } = useSelector((state) => state.workspace);
    let assignedMembers = project.assigned_to?.map(id => employees.find(e => e.id === id || e.id == id)).filter(Boolean) || [];
    if (project.team_lead_id) {
        const leadEmp = employees.find(e => e.id === project.team_lead_id || e.id == project.team_lead_id);
        if (leadEmp && !assignedMembers.some(emp => emp.id == leadEmp.id || emp.id?.toString() === leadEmp.id?.toString())) {
            assignedMembers.unshift(leadEmp);
        }
    }

    return (
        <Link 
            to={`/dashboard/projectsDetail?id=${project.id}&tab=tasks`} 
            className="group block bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-md hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300"
        >
            {/* Header Area - More Compact */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700/50 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                        <Briefcase className="size-3.5" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[150px]">
                            {project.name}
                        </h3>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-tight ${statusStyles[project.status] || statusStyles.ACTIVE}`}>
                    {project.status?.replace("_", " ") || 'Active'}
                </div>
            </div>

            {/* Combined Info Line */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                    <Clock className="size-3 text-zinc-400" />
                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-tight">
                        {project.end_date || "No deadline"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`size-1 rounded-full ${project.priority === 'HIGH' ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                    <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-tight">
                        {project.priority || 'Medium'}
                    </span>
                </div>
            </div>

            {/* Team Section */}
            <div className="mb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold uppercase tracking-tight text-zinc-400">Team</span>
                    {project.team_lead_id ? (
                        <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-1.5 py-0.5 rounded leading-none">
                            Lead Assigned
                        </span>
                    ) : (
                        <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded leading-none">
                            Lead Unassigned
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                    {assignedMembers.length === 0 ? (
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 italic">No members assigned</span>
                    ) : (
                        assignedMembers.map(emp => {
                            const isLead = emp.id == project.team_lead_id || (emp.id && project.team_lead_id && emp.id.toString() === project.team_lead_id.toString());
                            return (
                                <div 
                                    key={emp.id}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                                        isLead
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/5'
                                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400'
                                    }`}
                                >
                                    <span className="size-1.5 rounded-full" style={{ backgroundColor: isLead ? '#10b981' : '#a1a1aa' }}></span>
                                    <span>{emp.first_name} {emp.last_name}</span>
                                    {isLead && (
                                        <span className="text-[7px] font-black uppercase tracking-wider bg-emerald-600 dark:bg-emerald-500 text-white px-1 py-0.2 rounded leading-none ml-0.5">
                                            Lead
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Compact Progress */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-tight text-zinc-400">
                    <span>Maturity</span>
                    <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800/30 h-1 rounded-full overflow-hidden">
                    <div 
                        className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${project.progress || 0}%` }} 
                    />
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
