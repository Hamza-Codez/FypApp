import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyTasks, updateTaskStatus } from "../features/workspaceSlice";
import { format, parseISO } from "date-fns";
import { Clock, ExternalLink, ArrowLeft, FilePlus, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import CustomModal from "../components/CustomModal";

export default function MyTasks() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myTasks, loading } = useSelector((state) => state.workspace);
    
    // Modal State
    const [modal, setModal] = useState({ isOpen: false, taskId: null, defaultValue: "" });

    useEffect(() => {
        dispatch(fetchMyTasks());
    }, [dispatch]);

    const handleShareReportClick = (taskId, existingLink) => {
        setModal({
            isOpen: true,
            taskId,
            defaultValue: existingLink || ""
        });
    };

    const handleModalConfirm = async (link) => {
        if (!link.startsWith("http")) {
            toast.error("Please enter a valid URL");
            return;
        }

        try {
            toast.loading("Uploading report...");
            const resultAction = await dispatch(updateTaskStatus({ taskId: modal.taskId, status: "IN_PROGRESS", report_link: link }));
            toast.dismiss();
            if (updateTaskStatus.fulfilled.match(resultAction)) {
                toast.success("Report link shared with HR!");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to share report");
        }
    };


    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CustomModal 
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={handleModalConfirm}
                title="Share Report"
                message="Paste your Google Doc link for the task report below."
                type="prompt"
                defaultValue={modal.defaultValue}
                placeholder="https://docs.google.com/..."
                confirmText="Share Now"
            />

            <div className="flex justify-between items-end">
                <div className="flex items-start gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-90"
                    >
                        <ArrowLeft className="size-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">My Assignments</h1>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Manage your active tasks and submit reports</p>
                    </div>
                </div>
            </div>


            {myTasks.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
                    <p className="text-zinc-500 font-medium">You have no tasks assigned to you at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myTasks.map((task) => (
                        <div key={task.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full border-b-4 border-b-blue-600">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {task.priority}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">{task.status.replace('_', ' ')}</span>
                            </div>
                            
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-tight">{task.title}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-grow">{task.description}</p>
                            
                            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-widest">
                                        <Clock className="size-3" />
                                        Deadline
                                    </div>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                        {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy") : "None"}
                                    </span>
                                </div>

                                {task.report_link && (
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-widest">
                                            <ExternalLink className="size-3" />
                                            Report Submitted
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button 
                                        disabled={task.status === 'COMPLETED'}
                                        onClick={() => handleShareReportClick(task.id, task.report_link)}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                                    >
                                        {task.report_link ? <><MessageCircle className="size-3.5" /> Update Report Link</> : <><FilePlus className="size-3.5" /> Share Report to HR</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
}
