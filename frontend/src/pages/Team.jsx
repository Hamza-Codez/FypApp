import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, fetchProjects, deleteEmployee, deleteAllEmployees } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import { Trash2, UserPlus, Search, User, Users as UsersIcon, Activity } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import ConfirmDialog from "../components/ConfirmDialog";

const Team = () => {
    const dispatch = useDispatch();
    const { isSidebarCollapsed } = useOutletContext() || { isSidebarCollapsed: false };
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {} });
    
    const { employees, projects } = useSelector((state) => state.workspace);
    const { user } = useSelector((state) => state.auth);

    const filteredUsers = employees.filter(
        (emp) =>
            emp?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleDelete = (id, name) => {
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
    };

    const handleDeleteAll = () => {
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
    };

    return (
        <div className="space-y-6 max-w-6xl overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        Manage team members and their contributions
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === 'HR' && employees.length > 0 && (
                        <button onClick={handleDeleteAll} className="flex items-center px-4 py-2 rounded text-[11px] font-bold bg-white dark:bg-zinc-900 text-red-500 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all uppercase tracking-widest shadow-sm" title="Reset team members">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Reset
                        </button>
                    )}
                    {user?.role === 'HR' && (
                        <button onClick={() => setIsDialogOpen(true)} className="flex items-center px-6 py-2.5 rounded text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20" >
                            <UserPlus className="w-3.5 h-3.5 mr-2" /> Invite Member
                        </button>
                    )}
                </div>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
                {/* Total Members */}
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Members</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10">
                            <UsersIcon className="size-4 text-blue-500 dark:text-blue-200" />
                        </div>
                    </div>
                </div>

                {/* Active Projects */}
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Active projects</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {projects.filter((p) => p.status !== "COMPLETED").length}
                                </p>

                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                            <Activity className="size-4 text-emerald-500 dark:text-emerald-200" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3" />
                <input placeholder="Search team members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 py-2 focus:outline-none focus:border-blue-500" />
            </div>

            {/* Team Members */}
            <div className="w-full">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {employees.length === 0
                                ? "No team members yet"
                                : "No members match your search"}
                        </h3>
                    </div>
                ) : (
                    <div className="max-w-5xl w-full">
                        {/* Desktop Table */}
                        <div className={`hidden sm:block ${!isSidebarCollapsed ? 'w-[58rem]' : 'w-[67rem]'} overflow-x-hidden rounded-md border border-gray-200 dark:border-zinc-800`}>
                            <table className={`${!isSidebarCollapsed ? 'min-w-58rem' : 'w-full'} divide-y divide-gray-200 dark:divide-zinc-800`}>
                                <thead className="bg-gray-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-400">Name</th>
                                        <th className="px-6 py-4 text-left font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-400">Email</th>
                                        <th className="px-6 py-4 text-left font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-400">Phone</th>
                                        <th className="px-6 py-4 text-left font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-400">Role</th>
                                        <th className="px-6 py-4 text-left font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-400">Salary</th>
                                        {user?.role === 'HR' && (
                                            <th className="px-6 py-4 text-right font-bold text-[10px] uppercase tracking-[0.15em] text-zinc-400">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {filteredUsers.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                                                        <User className="size-4 text-blue-500 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {emp.first_name} {emp.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                                {emp.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[11px] text-zinc-400 font-medium font-mono">
                                                {emp.contact_info || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                                                    {emp.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {emp.salary_pkr ? `PKR ${emp.salary_pkr.toLocaleString()}` : "—"}
                                            </td>
                                            {user?.role === 'HR' && (
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                                                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-300 hover:text-red-500 transition-colors"
                                                        title="Delete Employee"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden space-y-3">
                            {filteredUsers.map((emp) => (
                                <div
                                    key={emp.id}
                                    className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                                            <User className="size-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-bold text-zinc-900 dark:text-white truncate">
                                                    {emp.first_name} {emp.last_name}
                                                </p>
                                                {user?.role === 'HR' && (
                                                    <button 
                                                        onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                                                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate mb-1.5">
                                                {emp.email}
                                            </p>
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                                                {emp.role}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                              <p className="text-[10px] text-zinc-400 font-mono">{emp.contact_info || "No Contact"}</p>
                                              {emp.salary_pkr && (
                                                <p className="text-[11px] font-bold text-emerald-600">
                                                  PKR {emp.salary_pkr.toLocaleString()}
                                                </p>
                                              )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals & Dialogs */}
            <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            
            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.confirmText}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default Team;
