import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LayoutGrid, Users, Briefcase, Settings, LogOut, Search, Bell, Menu, X, ChevronRight, UserCircle, BrainCircuit } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
                `flex items-center justify-between px-6 py-4 rounded-2xl group transition-all duration-300 transform font-bold text-sm ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-1'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'
                }`
            }
            onClick={() => setIsSidebarOpen(false)}
        >
            <div className="flex items-center gap-3">
                <Icon className="size-5 group-hover:scale-110 transition-transform duration-300" />
                <span>{label}</span>
            </div>
            <ChevronRight className={`size-4 opacity-0 group-hover:opacity-100 transition-all transform ${isSidebarOpen ? 'rotate-90' : ''}`} />
        </NavLink>
    );

    return (
        <div className="min-h-screen flex bg-white dark:bg-zinc-950 font-sans tracking-tight">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-72 h-screen border-r border-zinc-200 dark:border-zinc-800 fixed left-0 top-0 z-50 bg-white dark:bg-zinc-950">
                <div className="p-8">
                    <NavLink to="/dashboard" className="flex items-center gap-3 group">
                        <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0">
                            <LayoutDashboard className="size-6 text-white" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                            OfficeOS
                        </span>
                    </NavLink>
                </div>

                <div className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {/* Organization Banner */}
                    <div className="px-4 mb-8 pt-4">
                        <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                            {user?.org_logo || user?.logo_url ? (
                                <img 
                                    src={user.org_logo || user.logo_url} 
                                    alt="Org Logo" 
                                    className="size-10 rounded-lg object-cover bg-white ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            ) : (
                                <div className="size-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                                    <span className="text-white font-black text-xl uppercase tracking-tighter">
                                        {(user?.organization_name || user?.org_name || 'W').charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Organization</p>
                                <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                                    {user?.organization_name || user?.org_name || 'Office Workspace'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <NavItem to="/dashboard" icon={LayoutGrid} label="Insights" />
                    <p className="px-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest my-4">Management</p>
                    {user?.role === 'HR' && <NavItem to="/dashboard/team" icon={Users} label="People" />}
                    {user?.role === 'HR' && <NavItem to="/dashboard/ai-screener" icon={BrainCircuit} label="AI Screener" />}
                    <NavItem to="/dashboard/projects" icon={Briefcase} label="Operations" />
                    <NavItem to="/dashboard/profile" icon={UserCircle} label="Profile" />
                </div>

                <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl group cursor-pointer transition-all hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <img src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`} className="size-10 rounded-full border-2 border-white dark:border-zinc-800" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold dark:text-white truncate uppercase tracking-tighter">{user?.first_name || 'User'}</p>
                          <p className="text-[10px] text-zinc-500 font-bold truncate">{user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30" >
                        <LogOut className="size-5" /> Sign out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100]" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            {/* Sidebar Mobile */}
            <aside className={`lg:hidden fixed left-0 top-0 h-screen w-80 bg-white dark:bg-zinc-950 z-[110] transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="size-6 text-blue-600" />
                        <span className="text-xl font-bold tracking-tighter">OfficeOS</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full">
                      <X className="size-5 dark:text-white" />
                    </button>
                </div>
                <div className="px-4 mb-4">
                    <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        {user?.org_logo || user?.logo_url ? (
                            <img 
                                src={user.org_logo || user.logo_url} 
                                alt="Org Logo" 
                                className="size-10 rounded-lg object-cover bg-white ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <div className="size-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                                <span className="text-white font-black text-xl uppercase tracking-tighter">
                                    {(user?.organization_name || user?.org_name || 'W').charAt(0)}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Organization</p>
                            <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                                {user?.organization_name || user?.org_name || 'Office Workspace'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="px-4 space-y-2">
                    <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" />
                    {user?.role === 'HR' && <NavItem to="/dashboard/team" icon={Users} label="Team" />}
                    {user?.role === 'HR' && <NavItem to="/dashboard/ai-screener" icon={BrainCircuit} label="AI Screener" />}
                    <NavItem to="/dashboard/projects" icon={Briefcase} label="Projects" />
                    <NavItem to="/dashboard/profile" icon={UserCircle} label="Profile" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
                {/* Navbar Desktop/Mobile Top */}
                <header className="sticky top-0 z-40 h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 lg:px-12 flex items-center justify-between">
                    <button className="lg:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="size-6 dark:text-white" />
                    </button>

                    <div className="hidden md:flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 px-5 py-2.5 rounded-full w-96 group focus-within:ring-2 ring-blue-500 transition-all border border-transparent focus-within:bg-white dark:focus-within:bg-zinc-950">
                        <Search className="size-4 text-zinc-400" />
                        <input type="text" placeholder="Global search commands..." className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
                        <span className="text-[10px] font-black text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded leading-none border border-zinc-300 dark:border-zinc-700">⌘K</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="size-11 flex items-center justify-center rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all relative group">
                            <Bell className="size-5 text-zinc-500 group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-3 right-3 size-2 bg-red-600 rounded-full border-2 border-white dark:border-zinc-950"></span>
                        </button>
                        <div className="w-px h-6 bg-zinc-200 dark:border-zinc-800 hidden md:block mx-2"></div>
                        <div className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-1 rounded-2xl transition-all cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold dark:text-white line-clamp-1">{user?.first_name || 'Workspace'}</p>
                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{user?.role || 'Admin'}</p>
                            </div>
                            <img src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`} className="size-10 rounded-xl" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-12 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
