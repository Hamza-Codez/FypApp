import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchTaskReports, updateTaskStatus, fetchEmployees, fetchProjects } from "../features/workspaceSlice";
import { format, parseISO } from "date-fns";
import { ExternalLink, CheckCircle, Clock, Filter, Search, User as UserIcon, ArrowLeft, ShieldCheck, HelpCircle, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import CustomModal from "../components/CustomModal";



export default function TaskReports() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { taskReports, employees, projects, loading } = useSelector((state) => state.workspace);
    const { user } = useSelector((state) => state.auth);

    const projectIdParam = searchParams.get("projectId");
    const [selectedProjectId, setSelectedProjectId] = useState(projectIdParam || "");

    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState({ isOpen: false, taskId: null });

    useEffect(() => {
        dispatch(fetchTaskReports());
        if (employees.length === 0) dispatch(fetchEmployees());
        if (projects.length === 0) dispatch(fetchProjects());
    }, [dispatch, employees.length, projects.length]);

    useEffect(() => {
        if (projectIdParam) {
            setSelectedProjectId(projectIdParam);
        } else {
            setSelectedProjectId("");
        }
    }, [projectIdParam]);

    const allowedProjects = useMemo(() => {
        const isHR = user?.role?.toUpperCase() === 'HR';
        if (isHR) return projects;
        return projects.filter(p => p.team_lead_id === user?.id || p.team_lead_id == user?.id);
    }, [projects, user]);

    const selectedProjectName = useMemo(() => {
        const proj = projects.find(p => p.id === selectedProjectId);
        return proj ? proj.name : "";
    }, [projects, selectedProjectId]);

    const handleApproveClick = (taskId) => {
        setModal({
            isOpen: true,
            taskId
        });
    };

    const handleModalConfirm = async () => {
        try {
            toast.loading("Approving task...");
            const resultAction = await dispatch(updateTaskStatus({ taskId: modal.taskId, status: "COMPLETED" }));
            toast.dismiss();
            if (updateTaskStatus.fulfilled.match(resultAction)) {
                toast.success("Task approved and completed!");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Approval failed");
        }
    };


    const filteredReports = useMemo(() => {
        return taskReports.filter((task) => {
            // Filter by selected project
            if (selectedProjectId && task.project_id !== selectedProjectId) {
                return false;
            }

            // For Team Leads, if no specific project is selected, they should still only see tasks for projects they lead
            const isHR = user?.role?.toUpperCase() === 'HR';
            if (!isHR) {
                const proj = projects.find(p => p.id === task.project_id);
                const isLeadOfProj = proj?.team_lead_id === user?.id || proj?.team_lead_id == user?.id;
                if (!isLeadOfProj) return false;
            }

            const matchesStatus = !statusFilter || task.status === statusFilter;
            const matchesSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 task.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Filter out self-reports for non-HR users (TLs can't approve their own tasks)
            const isSelfReport = task.assigned_to?.includes(user?.id);
            const matchesRoleFilter = isHR || !isSelfReport;

            return matchesStatus && matchesSearch && matchesRoleFilter;
        });
    }, [taskReports, selectedProjectId, statusFilter, searchTerm, user, projects]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CustomModal 
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={handleModalConfirm}
                title="Confirm Approval"
                message="Are you sure you want to approve this task and mark it as COMPLETED? This action cannot be undone."
                confirmText="Approve Task"
                variant="emerald"
            />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-start gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="size-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Review Task Reports</h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {selectedProjectName ? `Auditing submissions for ${selectedProjectName}` : "Audit and approve employee submissions"}
                        </p>
                    </div>
                </div>


                <div className="flex flex-wrap gap-3">
                    {/* Project Selector */}
                    <div className="relative group">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                        <select 
                            value={selectedProjectId} 
                            onChange={(e) => {
                                const newProjId = e.target.value;
                                setSelectedProjectId(newProjId);
                                if (newProjId) {
                                    setSearchParams({ projectId: newProjId });
                                } else {
                                    setSearchParams({});
                                }
                            }} 
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 py-2.5 pl-10 pr-6 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer text-zinc-900 dark:text-zinc-150"
                        >
                            <option value="">{user?.role?.toUpperCase() === 'HR' ? "All Projects" : "All My Projects"}</option>
                            {allowedProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                   <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 py-2.5 pl-10 pr-6 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer text-zinc-900 dark:text-zinc-150"
                        >
                            <option value="">All Statuses</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="FIND REPORT..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 py-2.5 pl-10 pr-6 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-150"
                        />
                    </div>
                </div>
            </div>

            {filteredReports.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
                    <p className="text-zinc-500 font-medium">No task reports found based on your filters.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Task Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Deadline</th>
                                <th className="pl-8 py-4">Assignee</th>
                                <th className="px-8 py-4 text-right">File</th>
                                <th className="pr-12 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredReports.map((task) => (
                                <tr key={task.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                                    <td className="px-6 py-5">
                                        {(() => {
                                            const proj = projects.find(p => p.id === task.project_id);
                                            const isLeadReport = task.assigned_to?.includes(proj?.team_lead_id);
                                            return (
                                                <>
                                                    <div className={`font-bold uppercase text-[11px] tracking-tight ${isLeadReport ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                                                        {task.title}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[250px] line-clamp-1">{task.description}</div>
                                                </>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-5">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="pl-4 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                            <Clock className="size-3 text-zinc-400" />
                                            {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy") : "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            {(() => {
                                                const proj = projects.find(p => p.id === task.project_id);
                                                let activeAssignees = task.assigned_to?.filter(id => {
                                                    return proj?.assigned_to?.some(projId => projId == id || projId.toString() === id?.toString()) || (proj?.team_lead_id && (proj.team_lead_id == id || proj.team_lead_id.toString() === id?.toString()));
                                                }) || [];

                                                return activeAssignees.map(id => {
                                                    const emp = employees.find(e => e.id === id || e.id == id);
                                                    const isLead = proj?.team_lead_id && (proj.team_lead_id == id || proj.team_lead_id.toString() === id?.toString());
                                                    return (
                                                        <div key={id} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-tight ${
                                                            isLead 
                                                            ? 'bg-emerald-600 text-white border-emerald-600' 
                                                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30'
                                                        }`}>
                                                            <UserIcon className={`size-2.5 ${isLead ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                                            {emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown"}
                                                            {isLead && <ShieldCheck className="size-2.5 text-white" />}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-2 py-5 text-right">
                                        {(() => {
                                            const proj = projects.find(p => p.id === task.project_id);
                                            const isLeadReport = task.assigned_to?.includes(proj?.team_lead_id);
                                            return (
                                                <a 
                                                    href={task.report_link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1.5 text-[10px] font-black hover:opacity-80 underline underline-offset-4 decoration-current transition-all ${isLeadReport ? 'text-red-500' : 'text-emerald-600 dark:text-white'}`}
                                                >
                                                    VIEW DOC
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button 
                                            disabled={task.status === 'COMPLETED'}
                                            onClick={() => handleApproveClick(task.id)}
                                            className="px-4 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-md text-[10px] font-black uppercase tracking-widest active:scale-[0.95] transition-all disabled:bg-emerald-500/10 disabled:text-emerald-500"
                                        >
                                            {task.status === 'COMPLETED' ? "Approved" : "Approve"}
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
