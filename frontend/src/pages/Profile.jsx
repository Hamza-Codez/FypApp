import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock, Building2, Phone, Globe, BadgeCheck, ShieldCheck, UserCircle, Users, Trash2, ChevronRight, Activity, Settings, Fingerprint, ShieldAlert, Clock, LayoutDashboard, Info } from 'lucide-react';
import { updateProfile, changePassword, deleteWorkspace } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="group space-y-1.5 flex-1 min-w-[180px]">
        <label className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-[0.2em] ml-1">{label}</label>
        <div className="relative flex items-center">
            <div className="absolute left-3 p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 transition-colors group-focus-within:border-emerald-500/50">
                <Icon className="size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
                {...props}
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 outline-none focus:border-emerald-500/50 transition-all"
            />
        </div>
    </div>
);

const DataNode = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-100 dark:border-zinc-800/50 group transition-all hover:border-emerald-500/30">
        <div className="p-2 bg-white dark:bg-zinc-950 rounded-md border border-zinc-100 dark:border-zinc-800 group-hover:text-emerald-500 transition-colors">
            <Icon className="size-4" />
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{value || 'Not Defined'}</p>
        </div>
    </div>
);

const Profile = () => {
    const { user, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('overview');
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        organization_name: '',
        contact_info: '',
        gender: '',
        age: '',
        org_architecture: '',
        org_headcounts: '',
        cultural_practices: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                username: user.username || '',
                organization_name: user.organization_name || '',
                contact_info: user.contact_info || '',
                gender: user.gender || '',
                age: user.age || '',
                org_architecture: user.org_architecture || '',
                org_headcounts: user.org_headcounts || '',
                cultural_practices: user.cultural_practices || '',
            });
        }
    }, [user]);

    const [showPasswords, setShowPasswords] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...profileData,
            age: profileData.age === '' ? null : parseInt(profileData.age),
            org_headcounts: String(profileData.org_headcounts)
        };
        const res = await dispatch(updateProfile(payload));
        if (updateProfile.fulfilled.match(res)) {
            toast.success("Profile updated");
        } else {
            const errorMsg = res.payload?.detail;
            if (Array.isArray(errorMsg)) {
                toast.error(`${errorMsg[0]?.msg || "Validation error"}`);
            } else {
                toast.error(typeof errorMsg === 'string' ? errorMsg : "Update failed");
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return toast.error("Passwords do not match");
        }
        const res = await dispatch(changePassword({
            old_password: passwordData.old_password,
            new_password: passwordData.new_password
        }));
        if (changePassword.fulfilled.match(res)) {
            toast.success("Password updated");
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } else {
            const errorMsg = res.payload?.detail;
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Password update failed");
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Intelligence' },
        { id: 'personal', label: 'Edit Info', icon: Fingerprint, desc: 'Personal' },
        { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Passwords' },
        ...(user?.role === 'HR' ? [{ id: 'organization', label: 'Workspace', icon: Building2, desc: 'Settings' }] : []),
        { id: 'danger', label: 'Danger', icon: ShieldAlert, desc: 'Purge' },
    ];

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto space-y-3 animate-in fade-in duration-700 overflow-hidden py-2">
            {/* Minimal Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-500/10 rounded-md">
                        <Settings className="size-3.5 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Account Management</h1>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Operational Core Profile</p>
                    </div>
                </div>
            </div>

            {/* Main Layout - No Scroll Architecture */}
            <div className="flex-1 grid grid-cols-[240px_1fr] gap-4 overflow-hidden min-h-0">
                {/* Sidebar / Drawer */}
                <div className="space-y-4 flex flex-col h-full overflow-hidden">
                    {/* User Profile Summary - Compact */}
                    <div className="p-4 bg-zinc-950 rounded-md border border-white/5 relative overflow-hidden group shrink-0">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="size-10 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative shrink-0">
                                <img 
                                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=10b981&color=fff`} 
                                    alt="Avatar" 
                                    className="size-10 rounded-md object-cover ring-2 ring-emerald-500/20"
                                />
                                <div className="absolute -bottom-1 -right-1 size-3.5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-zinc-950">
                                    <BadgeCheck className="size-2 text-white" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-wider truncate">{user?.first_name}</h3>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest truncate">@{user?.username}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation - No Scroll */}
                    <nav className="flex-1 space-y-1 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-2.5 p-2.5 rounded-md border transition-all duration-300 group ${activeTab === tab.id ? 'bg-zinc-950 border-white/10 text-white shadow-xl shadow-zinc-950/20' : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                            >
                                <div className={`p-1.5 rounded-md transition-colors ${activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500'}`}>
                                    <tab.icon className="size-3.5" />
                                </div>
                                <div className="text-left min-w-0">
                                    <div className="text-[9px] font-black uppercase tracking-widest">{tab.label}</div>
                                    <div className="text-[7px] font-bold uppercase tracking-tighter opacity-40 truncate">{tab.desc}</div>
                                </div>
                                <ChevronRight className={`size-2.5 ml-auto transition-transform ${activeTab === tab.id ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Outlet Content Area - High Density No Scroll */}
                <div className="bg-white dark:bg-zinc-950/50 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-950/5 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 p-6 md:py-3 flex flex-col min-h-0">
                        
                        {activeTab === 'overview' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
                                {/* Identity Intelligence Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <Fingerprint className="size-4 text-zinc-900 dark:text-zinc-100" />
                                        <h2 className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">General Information</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        <DataNode label="First Name" value={user?.first_name} icon={User} />
                                        <DataNode label="Last Name" value={user?.last_name} icon={User} />
                                        <DataNode label="Email" value={user?.email} icon={Mail} />
                                        <DataNode label="Username" value={user?.username} icon={UserCircle} />
                                        <DataNode label="Age" value={user?.age} icon={Clock} />
                                        <DataNode label="Gender" value={user?.gender} icon={Activity} />
                                    </div>
                                </div>

                                {/* Organizational Context Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                        <Building2 className="size-4 text-emerald-500" />
                                        <h2 className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">Organizational Context</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        <DataNode label="Company" value={user?.organization_name} icon={Building2} />
                                        {user?.role === 'HR' && (
                                            <>
                                                <DataNode label="Contact" value={user?.contact_info} icon={Phone} />
                                                <DataNode label="Structure" value={user?.org_architecture} icon={Users} />
                                                <DataNode label="Scale" value={user?.org_headcounts} icon={Globe} />
                                                <DataNode label="Culture" value={user?.cultural_practices} icon={Info} />
                                            </>
                                        )}
                                        <DataNode label="Access Level" value={user?.role} icon={ShieldCheck} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">Update Personal Data</h2>
                                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Modify contact details</p>
                                    </div>
                                    <button type="submit" disabled={loading} className="px-5 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-zinc-950/10">
                                        Save Changes
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                                    <InputField label="First Name" name="first_name" icon={User} value={profileData.first_name} onChange={handleProfileChange} />
                                    <InputField label="Last Name" name="last_name" icon={User} value={profileData.last_name} onChange={handleProfileChange} />
                                    <InputField label="Email Address" name="email" type="email" icon={Mail} value={profileData.email} onChange={handleProfileChange} />
                                    <InputField label="Username" name="username" icon={UserCircle} value={profileData.username} onChange={handleProfileChange} />
                                    <InputField label="Age" name="age" type="number" icon={Clock} value={profileData.age} onChange={handleProfileChange} />
                                    <InputField label="Gender" name="gender" icon={Activity} value={profileData.gender} onChange={handleProfileChange} />
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">Password & Security</h2>
                                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Update account access keys</p>
                                    </div>
                                    <button type="submit" className="px-5 py-2 bg-emerald-600/80 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                                        Update Password
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 max-w-2xl">
                                    <InputField label="Current Password" name="old_password" type={showPasswords ? "text" : "password"} icon={Lock} value={passwordData.old_password} onChange={handlePasswordChange} required />
                                    <InputField label="New Password" name="new_password" type={showPasswords ? "text" : "password"} icon={ShieldCheck} value={passwordData.new_password} onChange={handlePasswordChange} required />
                                    <InputField label="Confirm Password" name="confirm_password" type={showPasswords ? "text" : "password"} icon={BadgeCheck} value={passwordData.confirm_password} onChange={handlePasswordChange} required />
                                    
                                    <div className="pt-4 flex items-center">
                                        <label className="flex items-center gap-2.5 p-2 px-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer group transition-all">
                                            <input 
                                                type="checkbox" 
                                                checked={showPasswords}
                                                onChange={(e) => setShowPasswords(e.target.checked)}
                                                className="accent-emerald-500 size-3"
                                            />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white">Show Passwords</span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        )}

                        {activeTab === 'organization' && user?.role === 'HR' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">Organization Settings</h2>
                                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Manage workspace details</p>
                                    </div>
                                    <button type="submit" disabled={loading} className="px-5 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-zinc-950/10">
                                        Save Settings
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                                    <InputField label="Company Name" name="organization_name" icon={Building2} value={profileData.organization_name} onChange={handleProfileChange} />
                                    <InputField label="Contact Number" name="contact_info" icon={Phone} value={profileData.contact_info} onChange={handleProfileChange} />
                                    <InputField label="Organization Type" name="org_architecture" icon={Users} value={profileData.org_architecture} onChange={handleProfileChange} />
                                    <InputField label="Employee Count" name="org_headcounts" type="number" icon={Globe} value={profileData.org_headcounts} onChange={handleProfileChange} />
                                </div>
                            </form>
                        )}

                        {activeTab === 'danger' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
                                <div className="space-y-1">
                                    <h2 className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">Delete Account</h2>
                                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Permanent removal</p>
                                </div>

                                <div className="max-w-xl p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                                    <div className="flex items-center gap-3 text-zinc-950 dark:text-white">
                                        <div className="p-2 bg-zinc-950 dark:bg-white/10 text-white rounded-md">
                                            <ShieldAlert className="size-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-wider">Warning</h3>
                                            <p className="text-[8px] font-bold opacity-60">Irreversible Action</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                                        Deleting this {user?.role === 'HR' ? 'workspace' : 'account'} will permanently remove all associated tactical data and access.
                                    </p>

                                    <button 
                                        onClick={() => {
                                            setConfirmState({
                                                isOpen: true,
                                                title: user?.role === 'HR' ? "Dissolve Workspace?" : "Purge Account?",
                                                message: "Are you sure? This action is permanent and cannot be undone.",
                                                onConfirm: async () => {
                                                    const res = await dispatch(deleteWorkspace());
                                                    if (deleteWorkspace.fulfilled.match(res)) {
                                                        toast.success("Account deleted");
                                                        window.location.href = '/login';
                                                    }
                                                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                                                }
                                            });
                                        }}
                                        className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[9px] uppercase tracking-[0.2em] rounded-md transition-all hover:opacity-90 active:scale-[0.98]"
                                    >
                                        Confirm {user?.role === 'HR' ? "Dissolution" : "Purge"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                type="danger"
                confirmText={user?.role === 'HR' ? "Dissolve Workspace" : "Purge Account"}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default Profile;
