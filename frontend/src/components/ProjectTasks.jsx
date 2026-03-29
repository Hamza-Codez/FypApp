import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
                toast.error(resultAction.payload?.detail || "Update failed");
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
                        <option value="DONE">Done</option>
                    </select>
                </div>
            )}

            <div className="hidden lg:block overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4 text-right">Assignee</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold dark:text-white">{task.title}</div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{task.description}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 flex-wrap max-w-[150px] ml-auto">
                                        {task.assigned_to && task.assigned_to.length > 0 ? (
                                            task.assigned_to.map(id => {
                                                const emp = employees.find(e => e.id === id);
                                                return (
                                                    <span key={id} className="text-[10px] bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/50" title={emp?.email || id}>
                                                        {emp?.first_name ? `${emp.first_name[0]}${emp.last_name?.[0] || ""}` : id.substring(0, 2).toUpperCase()}
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
                                        className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-xs font-semibold focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-white"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
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
                        <div className="flex justify-between items-center pt-2">
                             <span className="text-xs text-zinc-400 uppercase font-bold">Status</span>
                             <select 
                                value={task.status} 
                                onChange={(e) => handleStatusChange(task.id, e.target.value, task.status)}
                                className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-xs font-semibold dark:text-white"
                             >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                             </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectTasks;
