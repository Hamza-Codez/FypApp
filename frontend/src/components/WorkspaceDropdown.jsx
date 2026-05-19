import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { deleteWorkspace } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmDialog from "./ConfirmDialog";

function WorkspaceDropdown() {

    const { workspaces } = useSelector((state) => state.workspace);
    const { user } = useSelector((state) => state.auth);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId) => {
        dispatch(setCurrentWorkspace(organizationId))
        setIsOpen(false);
        navigate('/')
    }

    const handleDeleteWorkspace = async () => {
        setConfirmState({
            isOpen: true,
            title: "Delete Workspace?",
            message: "Are you sure you want to delete this workspace? This will delete all employees, projects, and your account. This action cannot be undone.",
            onConfirm: async () => {
                await dispatch(deleteWorkspace());
                toast.success("Workspace deleted successfully");
                navigate('/login');
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    {currentWorkspace?.image_url ? (
                        <img src={currentWorkspace.image_url} alt={currentWorkspace.name} className="w-8 h-8 rounded shadow" />
                    ) : (
                        <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Plus className="size-4 text-emerald-600" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {workspaces.map((ws) => (
                            <div key={ws.id} onClick={() => onSelectWorkspace(ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                <img src={ws.image_url} alt={ws.name} className="w-6 h-6 rounded" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {ws.membersCount || 0} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === ws.id && (
                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    <div className="p-1 space-y-1">
                        <div className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800" >
                            <p className="flex items-center text-xs gap-2 w-full text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300">
                                <Plus className="w-4 h-4" /> Create Workspace
                            </p>
                        </div>
                        
                        {user?.role === 'HR' && (
                            <div onClick={handleDeleteWorkspace} className="p-2 cursor-pointer rounded group hover:bg-red-50 dark:hover:bg-red-500/10" >
                                <p className="flex items-center text-xs gap-2 w-full text-red-600 group-hover:text-red-500">
                                    <Trash2 className="w-4 h-4" /> Delete Workspace
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                type="danger"
                confirmText="Delete Workspace"
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default WorkspaceDropdown;
