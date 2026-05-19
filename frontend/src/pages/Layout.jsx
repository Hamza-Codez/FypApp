import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LayoutGrid, Users, Briefcase, Settings, LogOut, Search, Bell, Menu, X, ChevronRight, UserCircle, BrainCircuit, Home } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toggleTheme } from '../features/themeSlice';
import { MoonIcon, SunIcon } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

const NavItem = ({ to, icon: Icon, label, isSidebarCollapsed, setIsSidebarOpen }) => (
    <NavLink
        to={to}
        end={to === "/dashboard"}
        className={({ isActive }) =>
            `flex items-center group transition-all duration-300 font-medium text-sm rounded-lg overflow-hidden ${
                isSidebarCollapsed ? 'px-2 justify-center py-2.5 mx-2' : 'px-4 justify-between py-2.5 mx-0'
            } ${
                isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'
            }`
        }
        onClick={() => setIsSidebarOpen(false)}
    >
        <div className={`flex items-center gap-3 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <Icon className={`size-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`} />
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {label}
            </span>
        </div>
        {!isSidebarCollapsed && (
            <ChevronRight className={`size-4 opacity-0 group-hover:opacity-100 transition-all transform`} />
        )}
    </NavLink>
);

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const { theme } = useSelector((state) => state.theme);

    return (
        <div className="min-h-screen flex bg-white dark:bg-zinc-950 font-sans tracking-tight">
            {/* Sidebar Desktop */}
            <aside className={`hidden lg:flex flex-col h-screen border-r border-zinc-200 dark:border-zinc-800 fixed left-0 top-0 z-50 bg-white dark:bg-zinc-950 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className={`flex items-center transition-all duration-500 p-6 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
                    {!isSidebarCollapsed && (
                    <NavLink to="/dashboard" className="flex items-center gap-3 animate-in fade-in duration-500">
                        <div className="p-2 bg-slate-800 dark:bg-slate-200 rounded-md shadow-sm">
                            <LayoutDashboard className="size-5 text-white dark:text-zinc-900" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            Dashboard
                        </span>
                    </NavLink>
                    )}
                    {isSidebarCollapsed && (
                        <div onClick={() => setIsSidebarCollapsed(false)} className="p-2 bg-slate-800 dark:bg-slate-200 rounded-md shadow-sm cursor-pointer hover:scale-110 transition-transform">
                            <LayoutDashboard className="size-5 text-white dark:text-zinc-900" />
                        </div>
                    )}
                    {!isSidebarCollapsed && (
                        <button 
                            onClick={() => setIsSidebarCollapsed(true)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 transition-all"
                        >
                            <Menu className="size-4" />
                        </button>
                    )}
                </div>

                <div className={`flex-1 space-y-2 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}>
                    {/* Organization Banner */}
                    <div className={`mb-6 pt-2 transition-all duration-300 ${isSidebarCollapsed ? 'px-0' : 'px-3'}`}>
                        <div className={`flex items-center gap-3 p-2 rounded-lg ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                            {user?.org_logo || user?.logo_url ? (
                                <img 
                                    src={user.org_logo || user.logo_url} 
                                    alt="Org Logo" 
                                    className="size-8 rounded-md object-cover bg-white ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm transition-all"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            ) : (
                            <div className="size-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <span className="text-slate-700 dark:text-zinc-300 font-bold text-sm uppercase">
                                    {(user?.organization_name || user?.org_name || 'W').charAt(0)}
                                </span>
                            </div>
                            )}
                            <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest leading-none mb-1">Organization</p>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                    {user?.organization_name || user?.org_name || 'Office Workspace'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                    
                    {!isSidebarCollapsed && (
                        <p className="px-4 text-[10px] font-bold uppercase text-zinc-400 tracking-widest my-4 animate-in fade-in duration-500">Workspace</p>
                    )}
                    {isSidebarCollapsed && <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-4 my-4 opacity-50" />}
                    {user?.role === 'HR' && <NavItem to="/dashboard/team" icon={Users} label="Active Employees" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />}
                    {user?.role === 'HR' && <NavItem to="/dashboard/ai-screener" icon={BrainCircuit} label="Hire & Onboard" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />}
                    <NavItem to="/dashboard/projects" icon={Briefcase} label="Active Projects" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                    <NavItem to="/dashboard/profile" icon={UserCircle} label="Manage Account" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                </div>

                <div className={`p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-center transition-all ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}>
                    <p className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-all ${isSidebarCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>OfficeOS Dashboard</p>
                    {isSidebarCollapsed && (
                        <button onClick={() => setIsSidebarCollapsed(false)} className="mx-auto p-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:scale-110 transition-all">
                           <ChevronRight className="size-4" />
                        </button>
                    )}
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
                        <LayoutDashboard className="size-6 text-slate-800 dark:text-slate-200" />
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
                            <div className="size-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
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
                    <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                    {user?.role === 'HR' && <NavItem to="/dashboard/team" icon={Users} label="Active Employees" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />}
                    {user?.role === 'HR' && <NavItem to="/dashboard/ai-screener" icon={BrainCircuit} label="Hire & Onboard" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />}
                    <NavItem to="/dashboard/projects" icon={Briefcase} label="Active Projects" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                    <NavItem to="/dashboard/profile" icon={UserCircle} label="Manage Account" isSidebarCollapsed={isSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                {/* Navbar Desktop/Mobile Top */}
                <header className="sticky top-0 z-40 h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 lg:px-8 flex items-center justify-between">
                    <button className="lg:hidden p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="size-5 dark:text-white" />
                    </button>

                    <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
                        <NavLink 
                            to="/" 
                            className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 group relative"
                            title="Go to Home"
                        >
                            <Home className="size-5 group-hover:scale-110 transition-transform duration-300" />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Home</span>
                        </NavLink>

                        <div className="hidden md:flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-2 rounded-md w-80 group focus-within:ring-1 ring-emerald-500 transition-all border border-zinc-200 dark:border-zinc-800">
                            <Search className="size-4 text-zinc-400" />
                            <input type="text" placeholder="Search projects, tasks..." className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
                            <span className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded leading-none border border-zinc-200 dark:border-zinc-700">⌘K</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center rounded-md bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800">
                            { theme === 'light' ? <MoonIcon className="size-4 text-zinc-600 dark:text-zinc-300" /> : <SunIcon className="size-4 text-zinc-400 dark:text-zinc-300" /> }
                        </button>
                        <NotificationBell />
                        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 hidden md:block mx-1"></div>
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer ${isProfileOpen ? 'bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold dark:text-white line-clamp-1 leading-tight">{user?.first_name || 'Workspace'}</p>
                                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-0.5">
                                        {user?.role === 'HR' ? 'HR/ PMO' : (user?.role || 'Admin')}
                                    </p>
                                </div>
                                <div className="relative">
                                    <img 
                                        src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`} 
                                        className="size-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover" 
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950"></div>
                                </div>
                            </div>

                            {/* Dropdown Popover */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                                    <div className="p-5 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`} 
                                                className="size-12 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm object-cover" 
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                                                    {user?.first_name} {user?.last_name}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100 dark:border-emerald-900/30">
                                                {user?.role === 'HR' ? 'HR/Project Manager' : 'Team Member'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100 dark:border-emerald-900/30">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-2 space-y-1">
                                        <button 
                                            onClick={() => { navigate('/dashboard/profile'); setIsProfileOpen(false); }}
                                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <UserCircle className="size-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                                                <span>Manage Account</span>
                                            </div>
                                            <ChevronRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                        
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <LogOut className="size-4" />
                                                <span>Sign out</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet context={{ isSidebarCollapsed }} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
