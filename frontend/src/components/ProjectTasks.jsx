import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format, isBefore, parseISO } from "date-fns";
import { Clock, ExternalLink, MessageCircle, FilePlus, Activity, ChevronRight, History, X, ChevronDown, Trash2 } from "lucide-react";
import { updateTaskStatus, deleteTask } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import CustomModal from "./CustomModal";

const statusStyles = {
    TODO: "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700",
    IN_PROGRESS: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

// -- Custom Filter Dropdown Select --
const FilterDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { value: "", label: "All Tasks" },
        { value: "TODO", label: "To Do" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "COMPLETED", label: "Completed" }
    ];

    const currentOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight dark:text-zinc-400 hover:border-emerald-500/30 transition-all cursor-pointer"
            >
                <span>{currentOption.label}</span>
                <ChevronDown className={`size-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-1 w-32 bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="py-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-450 cursor-pointer transition-all"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// -- Custom Task Status Controller Dropdown Select --
const StatusDropdown = ({ task, project, user, handleStatusChangeClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isHR = user?.role?.toUpperCase() === 'HR';
    const isTL = project?.team_lead_id === user?.id;
    const isAssignee = task.assigned_to?.includes(user?.id);
    const canApprove = isHR || (isTL && !isAssignee);

    const options = [
        { value: "TODO", label: "To Do" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "COMPLETED", label: canApprove ? "Complete" : "Awaiting Review", disabled: !canApprove }
    ];

    const currentOption = options.find(opt => opt.value === task.status) || options[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:border-zinc-950 dark:hover:border-zinc-150 transition-all cursor-pointer rounded"
            >
                <span>{currentOption.label}</span>
                <ChevronDown className={`size-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full mt-1 left-0 w-full bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="py-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={opt.disabled}
                                onClick={() => {
                                    if (!opt.disabled) {
                                        handleStatusChangeClick(task.id, opt.value, task.status);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`w-full text-left px-2.5 py-1.5 text-[8.5px] font-bold uppercase tracking-widest transition-all ${
                                    opt.disabled 
                                        ? "text-zinc-300 dark:text-zinc-650 cursor-not-allowed bg-zinc-50/50 dark:bg-zinc-900/30" 
                                        : "text-zinc-650 dark:text-zinc-350 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectTasks = ({ tasks, project }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { employees } = useSelector((state) => state.workspace);
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('id');
    const today = new Date();

    const empIdIsLead = (id) => {
        if (!project || !project.team_lead_id) return false;
        return project.team_lead_id == id || project.team_lead_id.toString() === id?.toString();
    };
    
    // Modal States
    const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", taskId: null, newStatus: null, currentStatus: null, mode: null });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, task: null });

    const [filters, setFilters] = useState({
        status: "",
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status } = filters;
            return !status || task.status === status;
        });
    }, [filters, tasks]);

    const handleFilterChange = (val) => {
        setFilters((prev) => ({ ...prev, status: val }));
    };

    const handleStatusChangeClick = (taskId, newStatus, currentStatus) => {
        if (newStatus === currentStatus) return;
        setModal({
            isOpen: true,
            type: "prompt",
            title: "Update Progress",
            message: "Enter a brief comment about your progress on this task.",
            placeholder: "Progress details...",
            confirmText: "Share Progress",
            taskId,
            newStatus,
            currentStatus,
            mode: "status"
        });
    };

    const handleAttachReportClick = (taskId, reportLink) => {
        setModal({
            isOpen: true,
            type: "prompt",
            title: "Attach Report",
            message: "Paste your Google Doc link for the task report.",
            defaultValue: reportLink || "",
            placeholder: "https://docs.google.com/...",
            confirmText: "Share Link",
            taskId,
            mode: "report"
        });
    };

    const handleDeleteTaskClick = (taskId, taskTitle) => {
        setModal({
            isOpen: true,
            type: "confirm",
            title: "Delete Task",
            message: `Are you sure you want to permanently delete the task "${taskTitle}"? This action cannot be undone.`,
            confirmText: "Delete Task",
            taskId,
            mode: "delete"
        });
    };

    const handleModalConfirm = async (value) => {
        if (modal.mode === "status") {
            try {
                toast.loading("Updating status...");
                const resultAction = await dispatch(updateTaskStatus({ projectId, taskId: modal.taskId, status: modal.newStatus, comment: value }));
                toast.dismiss();
                if (updateTaskStatus.fulfilled.match(resultAction)) {
                    toast.success("Progress shared!");
                    setModal({ ...modal, isOpen: false });
                }
            } catch (error) {
                toast.dismiss();
                toast.error("Update failed");
            }
        } else if (modal.mode === "report") {
            if (!value.startsWith("http")) {
                toast.error("Please enter a valid URL");
                return;
            }
            try {
                toast.loading("Sharing report...");
                const resultAction = await dispatch(updateTaskStatus({ taskId: modal.taskId, status: "IN_PROGRESS", report_link: value }));
                toast.dismiss();
                if (updateTaskStatus.fulfilled.match(resultAction)) {
                    toast.success("Report Submitted!");
                    setModal({ ...modal, isOpen: false });
                }
            } catch (error) {
                toast.dismiss();
                toast.error("Failed to submit report");
            }
        } else if (modal.mode === "delete") {
            try {
                toast.loading("Deleting task...");
                const resultAction = await dispatch(deleteTask(modal.taskId));
                toast.dismiss();
                if (deleteTask.fulfilled.match(resultAction)) {
                    toast.success("Task deleted successfully!");
                    setModal({ ...modal, isOpen: false });
                } else {
                    toast.error("Failed to delete task");
                }
            } catch (error) {
                toast.dismiss();
                toast.error("Deletion failed");
            }
        }
    };

    return (
        <div className="space-y-4">
            <CustomModal 
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={handleModalConfirm}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                defaultValue={modal.defaultValue}
                placeholder={modal.placeholder}
                confirmText={modal.confirmText}
                variant="dark"
            />

            {/* Task Details Modal (Popup) */}
            {detailsModal.isOpen && detailsModal.task && (() => {
                const task = detailsModal.task;
                const isOverdue = task.due_date && isBefore(parseISO(task.due_date), today) && task.status !== "COMPLETED";
                const currentStatusStyle = statusStyles[task.status] || statusStyles.TODO;
                const hasComments = Array.isArray(task.comments) && task.comments.length > 0;
                
                return (
                    <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#F7F7F5] dark:bg-zinc-950 border border-[#E5E5E5] dark:border-zinc-800 w-full max-w-lg rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative animate-in zoom-in-95 duration-300">
                            
                            {/* Modal Header */}
                            <div className="bg-[#111111] dark:bg-zinc-900 px-5 py-4 flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-white/10 rounded">
                                        <Activity className="size-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#AAAAAA]">Task Details</h3>
                                        <p className="text-[10px] font-bold text-white truncate max-w-[250px] font-sans mt-0.5">{task.title}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setDetailsModal({ isOpen: false, task: null })}
                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                >
                                    <X className="size-4 text-zinc-400 hover:text-white" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-white dark:bg-zinc-950">
                                
                                {/* Status & Timeline */}
                                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#E5E5E5] dark:border-zinc-800/50">
                                    <div>
                                        <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-550 block mb-1">Status</span>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] border ${currentStatusStyle}`}>
                                            {task.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-550 block mb-1">Due Date</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            <Clock className="size-3.5" />
                                            {task.due_date ? format(parseISO(task.due_date), "MMMM dd, yyyy") : "No set date"}
                                            {isOverdue && <span className="text-[7.5px] font-black text-red-500 bg-red-500/10 px-1 rounded uppercase tracking-[0.15em]">Overdue</span>}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-550 block mb-1">Description</span>
                                    <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-sans bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded border border-zinc-150 dark:border-zinc-800/50">
                                        {task.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Assignees */}
                                <div>
                                    <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-550 block mb-2">Assigned Members</span>
                                    <div className="space-y-1.5">
                                        {(() => {
                                            let modalAssignees = task.assigned_to?.filter(id => {
                                                return project?.assigned_to?.some(projId => projId == id || projId.toString() === id?.toString()) || empIdIsLead(id);
                                            }) || [];
                                            return modalAssignees.map((id) => {
                                                const emp = employees.find(e => e.id === id || e.id == id);
                                                const isLead = empIdIsLead(id) || (emp && empIdIsLead(emp.id));
                                                return (
                                                    <div key={id} className="flex items-center justify-between p-2 rounded bg-[#F7F7F5] dark:bg-zinc-900/40 border border-[#E5E5E5] dark:border-zinc-800/50">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`size-6 rounded-full flex items-center justify-center text-[8.5px] font-semibold uppercase shrink-0 leading-none ${isLead ? 'bg-emerald-600 dark:bg-emerald-500 text-white' : 'bg-[#111111] dark:bg-white text-white dark:text-zinc-950'}`}>
                                                                {emp?.first_name?.charAt(0)}
                                                            </div>
                                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                                                                {emp?.first_name} {emp?.last_name} {isLead && <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 ml-1.5">(Project Lead)</span>}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isLead ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                                            {isLead ? 'LEAD' : 'MEMBER'}
                                                        </span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Activity / Comments Thread */}
                                <div>
                                    <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-550 block mb-3">Task Comments ({task.comments?.length || 0})</span>
                                    {hasComments ? (
                                        <div className="space-y-4 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                            {task.comments.slice().reverse().map((comment, idx) => (
                                                <div key={idx} className="relative pl-4 border-l border-zinc-200 dark:border-zinc-800">
                                                    <div className="absolute -left-[4.5px] top-0 size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between text-[9px]">
                                                            <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">@{comment.author}</span>
                                                            <span className="font-medium text-zinc-400">
                                                                {comment.timestamp ? format(parseISO(comment.timestamp), "MMM dd, HH:mm") : "TBD"}
                                                            </span>
                                                        </div>
                                                        <div className="bg-[#F7F7F5] dark:bg-zinc-900/20 p-2.5 rounded border border-[#E5E5E5] dark:border-zinc-850">
                                                            <p className="text-[10px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans">
                                                                {comment.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 flex flex-col items-center justify-center text-center opacity-40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded">
                                            <History className="size-6 mb-2 text-zinc-550" />
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em]">No comments yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Report & Artifact Links */}
                                {task.report_link && (
                                    <div className="p-3 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] border border-emerald-500/10 rounded flex items-center justify-between">
                                        <div className="min-w-0">
                                            <span className="text-[7.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-0.5 block">Shared Report</span>
                                            <p className="text-[9px] font-bold text-zinc-700 dark:text-zinc-200 truncate pr-4">{task.report_link}</p>
                                        </div>
                                        <a 
                                            href={task.report_link} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded bg-[#111111] dark:bg-white text-white dark:text-zinc-950 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                                        >
                                            View <ExternalLink className="size-2.5" />
                                        </a>
                                    </div>
                                )}

                            </div>

                            {/* Modal Footer */}
                            <div className="px-5 py-3.5 bg-[#F7F7F5] dark:bg-zinc-900/50 border-t border-[#E5E5E5] dark:border-zinc-800 flex justify-end">
                                <button 
                                    onClick={() => setDetailsModal({ isOpen: false, task: null })}
                                    className="px-3.5 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Filters & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider font-serif">Project Tasks</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.15em] opacity-60">Total Tasks: {filteredTasks.length}</p>
                </div>
                
                {(user?.role?.toUpperCase() === 'HR' || project?.team_lead_id === user?.id) && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Filter</span>
                            <FilterDropdown value={filters.status} onChange={handleFilterChange} />
                        </div>
                    </div>
                )}
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-[#F7F7F5] dark:bg-zinc-900/30 rounded-md border border-dashed border-[#E5E5E5] dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-450 uppercase tracking-[0.3em]">No active tasks found</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const isOverdue = task.due_date && isBefore(parseISO(task.due_date), today) && task.status !== "COMPLETED";
                        const currentStatusStyle = statusStyles[task.status] || statusStyles.TODO;
                        const hasComments = Array.isArray(task.comments) && task.comments.length > 0;
                        // Filter assignees to only currently active project members
                        let activeAssignees = task.assigned_to?.filter(id => {
                            return project?.assigned_to?.some(projId => projId == id || projId.toString() === id?.toString()) || empIdIsLead(id);
                        }) || [];

                        return (
                            <div 
                                key={task.id} 
                                className="group relative bg-[#F7F7F5]/40 dark:bg-zinc-900/10 border border-[#E5E5E5] dark:border-zinc-800/80 rounded-md p-5 transition-all duration-300 hover:border-zinc-450 dark:hover:border-zinc-700 flex flex-col h-full hover:shadow-sm"
                            >
                                {/* Task Status Indicator (Top Bar) */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] border ${currentStatusStyle}`}>
                                        {task.status.replace("_", " ")}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className={`size-3 ${isOverdue ? 'text-rose-500' : 'text-zinc-400'}`} />
                                        <span className={`text-[8.5px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-500' : 'text-zinc-400'}`}>
                                            {task.due_date ? format(parseISO(task.due_date), "MMM dd") : "TBD"}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight font-sans tracking-tight">
                                            {task.title}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {hasComments && (
                                                <div 
                                                    className="flex items-center gap-1 text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 hover:text-emerald-500 transition-colors cursor-pointer" 
                                                    onClick={() => setDetailsModal({ isOpen: true, task })}
                                                    title="View Thread"
                                                >
                                                    <MessageCircle className="size-3" />
                                                    <span>{task.comments.length}</span>
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => setDetailsModal({ isOpen: true, task })}
                                                className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded hover:border-zinc-950 dark:hover:border-zinc-100 transition-colors cursor-pointer"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2 font-sans">
                                        {task.description}
                                    </p>
                                </div>

                                {/* Assigned Team Section */}
                                <div className="mb-4 pt-3 border-t border-zinc-150 dark:border-zinc-800/50 font-sans">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-semibold uppercase tracking-tight text-zinc-400">Assigned Team</span>
                                        {activeAssignees.some(id => empIdIsLead(id)) ? (
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
                                        {activeAssignees.length === 0 ? (
                                            <span className="text-[9px] text-zinc-400 dark:text-zinc-550 italic">No members assigned</span>
                                        ) : (
                                            activeAssignees.map(id => {
                                                const emp = employees.find(e => e.id === id || e.id == id);
                                                if (!emp) return null;
                                                const isLead = empIdIsLead(id) || empIdIsLead(emp.id);
                                                return (
                                                    <div 
                                                        key={emp.id}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-semibold border transition-all ${
                                                            isLead
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/5'
                                                            : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-655 dark:text-zinc-400'
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

                                {/* Action Row */}
                                <div className="flex items-center justify-between gap-2.5 pt-3.5 mt-auto border-t border-[#E5E5E5] dark:border-zinc-800/80">
                                    {/* Status Control */}
                                    <div className="flex-1">
                                        <StatusDropdown 
                                            task={task} 
                                            project={project} 
                                            user={user} 
                                            handleStatusChangeClick={handleStatusChangeClick} 
                                        />
                                    </div>

                                    {/* Utilities */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {task.status !== 'COMPLETED' && user?.role?.toUpperCase() !== 'HR' && task.assigned_to?.includes(user?.id) && (
                                            <button 
                                                onClick={() => handleAttachReportClick(task.id, task.report_link)}
                                                className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                                                title="Sync Report"
                                            >
                                                {task.report_link ? <MessageCircle className="size-3" /> : <FilePlus className="size-3" />}
                                            </button>
                                        )}
                                        
                                        {task.report_link && (
                                            <a 
                                                href={task.report_link} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-1.5 rounded bg-[#111111] dark:bg-white text-white dark:text-zinc-950 border border-zinc-900 dark:border-zinc-200 transition-all hover:opacity-80"
                                                title="View Report"
                                            >
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}

                                        {(user?.role?.toUpperCase() === 'HR' || project?.team_lead_id === user?.id) && (
                                            <button 
                                                onClick={() => handleDeleteTaskClick(task.id, task.title)}
                                                className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500/30 hover:text-red-700 dark:hover:text-red-300 transition-all cursor-pointer"
                                                title="Delete Task"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProjectTasks;
