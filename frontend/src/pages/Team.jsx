import { useEffect, useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, fetchProjects, deleteEmployee, deleteAllEmployees, updateProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import { Trash2, UserPlus, Search, User, Users as UsersIcon, Activity, MoreHorizontal, Mail } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import ReassignLeadDialog from "../components/ReassignLeadDialog";

const Team = () => {
    const dispatch = useDispatch();
    const { isSidebarCollapsed } = useOutletContext() || { isSidebarCollapsed: false };
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {} });
    const [reassignState, setReassignState] = useState({ isOpen: false, employeeId: "", employeeName: "", projects: [] });
    
    const { employees, projects } = useSelector((state) => state.workspace);
    const { user } = useSelector((state) => state.auth);

    const filteredUsers = useMemo(() => 
        employees.filter(
            (emp) =>
                emp?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [employees, searchTerm]
    );

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleReassignAndConfirmDelete = useCallback(async (assignments) => {
        setReassignState(prev => ({ ...prev, isOpen: false }));
        
        let allSuccessful = true;
        
        // 1. Reassign team leads first
        for (const [projectId, newLeadId] of Object.entries(assignments)) {
            const projectToUpdate = projects.find(p => p.id === projectId);
            if (projectToUpdate) {
                // If the selected new lead is not already in the project's assigned_to list,
                // we should add them to assigned_to along with updating team_lead_id
                let newAssigned = [...(projectToUpdate.assigned_to || [])];
                if (newLeadId && !newAssigned.includes(newLeadId)) {
                    newAssigned.push(newLeadId);
                }
                
                const result = await dispatch(updateProject({
                    id: projectId,
                    team_lead_id: newLeadId,
                    assigned_to: newAssigned
                }));
                
                if (!updateProject.fulfilled.match(result)) {
                    allSuccessful = false;
                    toast.error(`Failed to reassign team lead for project: ${projectToUpdate.name}`);
                }
            }
        }
        
        if (!allSuccessful) {
            toast.error("Process aborted due to reassignment failure.");
            return;
        }
        
        // 2. Perform the deletion
        const employeeId = reassignState.employeeId;
        const employeeName = reassignState.employeeName;
        const deleteResult = await dispatch(deleteEmployee(employeeId));
        
        if (deleteEmployee.fulfilled.match(deleteResult)) {
            toast.success(`${employeeName} removed from team and leadership reassigned.`);
        } else {
            toast.error(deleteResult.payload?.detail || "Failed to remove employee account");
        }
    }, [dispatch, projects, reassignState]);

    const handleDelete = useCallback((id, name) => {
        // Find if this employee is the team lead for any active projects
        const ledProjects = projects.filter(p => p.team_lead_id === id);
        
        if (ledProjects.length > 0) {
            // Must reassign team leads first
            setReassignState({
                isOpen: true,
                employeeId: id,
                employeeName: name,
                projects: ledProjects
            });
        } else {
            // Normal confirm and delete
            setConfirmState({
                isOpen: true,
                type: 'danger',
                title: 'Delete Employee?',
                message: `Are you sure you want to remove ${name} from your organization? This action cannot be undone.`,
                confirmText: 'Delete',
                onConfirm: async () => {
                    const result = await dispatch(deleteEmployee(id));
                    if (deleteEmployee.fulfilled.match(result)) {
                        toast.success(`${name} removed from team`);
                    } else {
                        toast.error(result.payload?.detail || "Failed to delete");
                    }
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }
            });
        }
    }, [dispatch, projects]);

    const handleDeleteAll = useCallback(() => {
        setConfirmState({
            isOpen: true,
            type: 'danger',
            title: 'Reset Team?',
            message: 'ARE YOU ABSOLUTELY SURE? This will permanently delete all team members from your organization. This action cannot be reversed.',
            confirmText: 'Reset Team',
            onConfirm: async () => {
                const result = await dispatch(deleteAllEmployees());
                if (deleteAllEmployees.fulfilled.match(result)) {
                    toast.success("Team reset successfully");
                } else {
                    toast.error(result.payload?.detail || "Failed to reset team");
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, [dispatch]);

    return (
        <div className="space-y-8 max-w-6xl animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Team Directory</h1>
                    <p className="text-[12px] text-zinc-500 font-medium  tracking-wide">
                        Managing {employees.length} active organizational assets
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === 'HR' && employees.length > 0 && (
                        <button 
                            onClick={handleDeleteAll} 
                            className="flex items-center px-4 py-2 rounded-md text-[10px] font-semibold bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900/30 hover:text-red-500 transition-all uppercase tracking-widest"
                        >
                            <Trash2 className="size-3.5 mr-2" /> Reset
                        </button>
                    )}
                    {user?.role === 'HR' && (
                        <button 
                            onClick={() => setIsDialogOpen(true)} 
                            className="flex items-center px-5 py-2 rounded-md text-[10px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all uppercase tracking-widest shadow-sm" 
                        >
                            <UserPlus className="size-3.5 mr-2" /> Invite Member
                        </button>
                    )}
                </div>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-5 flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Total Assets</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">{employees.length}</p>
                    </div>
                    <div className="size-9 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-100 dark:border-zinc-800">
                        <UsersIcon className="size-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-5 flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Active Projects</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {projects.filter((p) => p.status !== "COMPLETED").length}
                        </p>
                    </div>
                    <div className="size-9 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-100 dark:border-zinc-800">
                        <Activity className="size-4" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 py-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-3.5" />
                    <input 
                        placeholder="SEARCH TEAM..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md pl-10 pr-4 py-2 text-[11px] font-medium uppercase tracking-wider text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all" 
                    />
                </div>
            </div>

            {/* Team Assets Table/Cards */}
            <div className="w-full">
                {filteredUsers.length === 0 ? (
                    <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-950/50 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800">
                        <UsersIcon className="size-8 mx-auto mb-4 text-zinc-300 dark:text-zinc-800" />
                        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                            {employees.length === 0 ? "No assets in directory" : "No results for search query"}
                        </h3>
                    </div>
                ) : (
                    <div className="w-full">
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Team Asset</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Credentials</th>
                                        <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Designation</th>
                                        {user?.role === 'HR' && (
                                            <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {filteredUsers.map((emp) => (
                                        <tr key={emp.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                                                        <User className="size-3.5" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-200">
                                                        {emp.first_name} {emp.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                    <Mail className="size-3" />
                                                    <span className="text-[11px] font-medium tracking-tight">{emp.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-tight rounded border bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
                                                    {emp.role}
                                                </span>
                                            </td>
                                            {user?.role === 'HR' && (
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                                                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                                        title="Remove Asset"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3">
                            {filteredUsers.map((emp) => (
                                <div
                                    key={emp.id}
                                    className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                                <User className="size-4 text-zinc-500" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">
                                                    {emp.first_name} {emp.last_name}
                                                </p>
                                                <p className="text-[10px] text-zinc-400 font-medium truncate max-w-[180px]">
                                                    {emp.email}
                                                </p>
                                            </div>
                                        </div>
                                        {user?.role === 'HR' && (
                                            <button 
                                                onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                                                className="p-1 text-zinc-400 hover:text-red-500"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        <span className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-tight rounded border bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-zinc-200 dark:border-zinc-700">
                                            {emp.role}
                                        </span>
                                        <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                            <MoreHorizontal className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.confirmText}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />

            <ReassignLeadDialog
                isOpen={reassignState.isOpen}
                projects={reassignState.projects}
                employees={employees}
                employeeId={reassignState.employeeId}
                employeeName={reassignState.employeeName}
                onClose={() => setReassignState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleReassignAndConfirmDelete}
            />
        </div>
    );
};

export default Team;
