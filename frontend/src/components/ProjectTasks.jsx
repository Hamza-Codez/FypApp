import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { format, isBefore, isToday, parseISO } from "date-fns";
import { Clock } from "lucide-react";
import { updateTaskStatus } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const ProjectTasks = ({ tasks }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { employees } = useSelector((state) => state.workspace);
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('id');
    const [selectedTasks, setSelectedTasks] = useState([]);

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

    const handleStatusChange = async (taskId, newStatus, currentStatus) => {
        if (newStatus === currentStatus) return;
        
        const comment = window.prompt("Enter a comment about your progress:");
        if (comment === null) return;

        try {
            toast.loading("Updating status...");
            const resultAction = await dispatch(updateTaskStatus({ projectId, taskId, status: newStatus, comment }));
            toast.dismiss();
            
            if (updateTaskStatus.fulfilled.match(resultAction)) {
                toast.success("Progress shared!");
            } else {
                const errorData = resultAction.payload;
                const errorMessage = Array.isArray(errorData?.detail) 
                    ? errorData.detail[0]?.msg || "Validation error"
                    : errorData?.detail || "Update failed";
                toast.error(errorMessage);
            }

        } catch (error) {
            toast.dismiss();
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="space-y-4">
            {user?.role?.toUpperCase() === 'HR' && (
                <div className="flex gap-4">
                    <select name="status" onChange={handleFilterChange} className="border bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 px-3 py-1 rounded text-sm dark:text-white" >
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
                            <th className="px-6 py-4 text-right">Deadline</th>
                            <th className="px-6 py-4 text-right">Assignee</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold dark:text-white uppercase text-xs tracking-tight">{task.title}</div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{task.description}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {task.due_date ? (
                                        <div className={`flex flex-col items-end gap-0.5 ${ (isBefore(parseISO(task.due_date), new Date()) && !isToday(parseISO(task.due_date)) && task.status !== 'COMPLETED') ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
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
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 flex-wrap max-w-[150px] ml-auto">
                                        {task.assigned_to && task.assigned_to.length > 0 ? (
                                            task.assigned_to.map(id => {
                                                const emp = employees.find(e => e.id === id);
                                                return (
                                                    <span key={id} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800/40 uppercase tracking-tight whitespace-nowrap">
                                                        {emp ? `${emp.first_name} ${emp.last_name || ""}` : "Unknown User"}
                                                    </span>
                                                )
                                            })
                                        ) : (
                                            <span className="text-[10px] text-zinc-400 italic">Unassigned</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <select 
                                        value={task.status} 
                                        onChange={(e) => handleStatusChange(task.id, e.target.value, task.status)}
                                        className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer dark:text-white"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Done</option>
                                    </select>
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
                                    onChange={(e) => handleStatusChange(task.id, e.target.value, task.status)}
                                    className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-xs font-semibold dark:text-white"
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Done</option>
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
