import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format, isBefore, isToday, parseISO } from "date-fns";
import { Clock, ExternalLink, MessageCircle, FilePlus, ShieldAlert } from "lucide-react";
import { updateTaskStatus } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import CustomModal from "./CustomModal";

const ProjectTasks = ({ tasks }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { employees } = useSelector((state) => state.workspace);
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('id');
    
    // Modal State
    const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", taskId: null, newStatus: null, currentStatus: null, mode: null });

    const [filters, setFilters] = useState({
        status: "",
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status } = filters;
            return !status || task.status === status;
        });
    }, [filters, tasks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
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

    const handleModalConfirm = async (value) => {
        if (modal.mode === "status") {
            try {
                toast.loading("Updating status...");
                const resultAction = await dispatch(updateTaskStatus({ projectId, taskId: modal.taskId, status: modal.newStatus, comment: value }));
                toast.dismiss();
                if (updateTaskStatus.fulfilled.match(resultAction)) {
                    toast.success("Progress shared!");
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
                    toast.success("Report shared with HR!");
                }
            } catch (error) {
                toast.dismiss();
                toast.error("Failed to share report");
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
                variant="blue"
            />

            {user?.role?.toUpperCase() === 'HR' && (
                <div className="flex gap-4">
                    <select name="status" onChange={handleFilterChange} className="border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 px-3 py-1 rounded-md text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" >
                        <option value="">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Done</option>
                    </select>
                </div>
            )}

            <div className="hidden lg:block overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4 text-left">Deadline</th>
                            <th className="px-6 py-4 text-left">Assignee</th>
                            <th className="px-6 py-4 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold dark:text-white uppercase text-xs tracking-tight">{task.title}</div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{task.description}</div>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    {task.due_date ? (
                                        <div className={`flex flex-col items-start gap-0.5 ${ (isBefore(parseISO(task.due_date), new Date()) && !isToday(parseISO(task.due_date)) && task.status !== 'COMPLETED') ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                            <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {format(parseISO(task.due_date), "MMM d, yyyy")}
                                            </div>
                                            {(isBefore(parseISO(task.due_date), new Date()) && !isToday(parseISO(task.due_date)) && task.status !== 'COMPLETED') && (
                                                <span className="text-[9px] font-bold uppercase tracking-tighter">Overdue</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-zinc-400 italic">No Deadline</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex justify-start gap-1 flex-wrap max-w-[150px]">
                                        {task.assigned_to && task.assigned_to.length > 0 ? (
                                            task.assigned_to.map(id => {
                                                const emp = employees.find(e => e.id === id);
                                                return (
                                                    <span key={id} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800/40 uppercase tracking-tight whitespace-nowrap">
                                                        {emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown User"}
                                                    </span>
                                                )
                                            })
                                        ) : (
                                            <span className="text-[10px] text-zinc-400 italic">Unassigned</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex flex-col items-start gap-2">
                                        <select 
                                            value={task.status} 
                                            onChange={(e) => handleStatusChangeClick(task.id, e.target.value, task.status)}
                                            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer dark:text-white outline-none"
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED" disabled={user?.role?.toUpperCase() !== 'HR'}>
                                                {user?.role?.toUpperCase() === 'HR' ? "Approve & Complete" : "Done (Requires HR Approval)"}
                                            </option>
                                        </select>
                                        
                                        {task.status !== 'COMPLETED' && user?.role?.toUpperCase() === 'EMPLOYEE' && task.assigned_to?.includes(user?.id) && (
                                            <button 
                                                onClick={() => handleAttachReportClick(task.id, task.report_link)}
                                                className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                            >
                                                {task.report_link ? <><MessageCircle className="size-2.5" /> Update Report</> : <><FilePlus className="size-2.5" /> Attach Report</>}
                                            </button>
                                        )}
                                        
                                        {task.report_link && (
                                            <a 
                                                href={task.report_link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700"
                                            >
                                                <ExternalLink className="size-2.5" /> View Report
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <div className="lg:hidden space-y-4">
                {filteredTasks.map((task) => (
                    <div key={task.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                        <h3 className="font-bold dark:text-white">{task.title}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 py-1">
                            {task.assigned_to?.map(id => {
                                const emp = employees.find(e => e.id === id);
                                return (
                                    <span key={id} className="text-[9px] bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400 font-bold border border-blue-100/50 dark:border-blue-800/30 uppercase tracking-widest whitespace-nowrap">
                                        {emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown User"}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Deadline</span>
                                {task.due_date ? (
                                    <span className={`text-[10px] font-bold ${isBefore(parseISO(task.due_date), new Date()) && !isToday(parseISO(task.due_date)) && task.status !== 'COMPLETED' ? 'text-red-500' : 'text-zinc-500'}`}>
                                        {format(parseISO(task.due_date), "MMM d")}
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-zinc-400 italic">None</span>
                                )}
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Status</span>
                                <select 
                                    value={task.status} 
                                    onChange={(e) => handleStatusChangeClick(task.id, e.target.value, task.status)}
                                    className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-md px-3 py-1 text-xs font-semibold dark:text-white"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED" disabled={user?.role?.toUpperCase() !== 'HR'}>
                                        {user?.role?.toUpperCase() === 'HR' ? "Done" : "Done (Requires HR)"}
                                    </option>
                                </select>
                             </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectTasks;
