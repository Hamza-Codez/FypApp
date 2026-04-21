import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock, Building2, Phone, Globe, BadgeCheck, Save, ShieldCheck, UserCircle, Briefcase, Users, Trash2 } from 'lucide-react';
import { updateProfile, changePassword, deleteWorkspace } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

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
        const res = await dispatch(updateProfile(profileData));
        if (updateProfile.fulfilled.match(res)) {
            toast.success("Profile updated successfully");
        } else {
            toast.error(res.payload?.detail || "Update failed");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return toast.error("New passwords do not match");
        }
        const res = await dispatch(changePassword({
            old_password: passwordData.old_password,
            new_password: passwordData.new_password
        }));
        if (changePassword.fulfilled.match(res)) {
            toast.success("Password changed successfully");
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } else {
            toast.error(res.payload?.detail || "Password change failed");
        }
    };

    const InputField = ({ label, icon: Icon, ...props }) => (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-3.5 bg-white dark:bg-zinc-950 focus-within:border-blue-500 transition-all flex-1 min-w-[240px] shadow-sm">
            <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block mb-1">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-zinc-300 group-focus-within:text-blue-500 transition-colors" />}
                <input
                    {...props}
                    className={`w-full ${Icon ? 'pl-6' : 'pl-0'} bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-300 outline-none`}
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-md bg-white dark:bg-zinc-900 p-6 md:p-8 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <img 
                            src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`} 
                            alt="Profile" 
                            className="size-24 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-sm"
                        />
                        {user?.role === 'HR' && user?.org_logo && (
                            <div className="absolute -top-1 -right-1 p-1 bg-white rounded-md shadow-md border border-zinc-200">
                                <img src={user.org_logo} alt="Org Logo" className="size-8 rounded-sm object-contain" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full shadow-sm text-white border-2 border-white dark:border-zinc-900">
                            <BadgeCheck className="size-4" />
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{user?.first_name} {user?.last_name}</h1>
                            {user?.role === 'HR' && (
                                <span className="w-fit px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold uppercase tracking-wider rounded border border-blue-100 dark:border-blue-900/30">
                                    HR Manager/ PMO
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-500 font-medium flex items-center justify-center md:justify-start gap-1 text-sm">
                            @{user?.username} • <span className="text-blue-600 dark:text-blue-400">{user?.role}</span>
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                            <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                                <Briefcase className="size-3" /> {user?.organization_name || 'No Org'}
                            </span>
                            <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                                <Mail className="size-3" /> {user?.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1.618fr_1fr] gap-6">
                {/* Details Form */}
                <div className="space-y-8">
                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                        {/* Personal Info Master Box */}
                        <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                                <h2 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                    <UserCircle className="size-3.5" /> Personal Information
                                </h2>
                                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10">
                                    Save Changes
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex flex-wrap gap-4">
                                    <InputField label="First Name" name="first_name" icon={User} value={profileData.first_name} onChange={handleProfileChange} />
                                    <InputField label="Last Name" name="last_name" icon={User} value={profileData.last_name} onChange={handleProfileChange} />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <InputField label="Email Address" name="email" type="email" icon={Mail} value={profileData.email} onChange={handleProfileChange} />
                                    <InputField label="Username" name="username" icon={User} value={profileData.username} onChange={handleProfileChange} />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <InputField label="Age" name="age" type="number" icon={User} value={profileData.age} onChange={handleProfileChange} />
                                    <InputField label="Gender" name="gender" icon={User} value={profileData.gender} onChange={handleProfileChange} />
                                </div>
                            </div>
                        </div>

                        {user?.role === 'HR' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                                    <h2 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                        <Building2 className="size-3.5" /> Organization Profile
                                    </h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex flex-wrap gap-4">
                                        <InputField label="Organization Name" name="organization_name" icon={Building2} value={profileData.organization_name} onChange={handleProfileChange} />
                                        <InputField label="Contact Info" name="contact_info" icon={Phone} value={profileData.contact_info} onChange={handleProfileChange} />
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <InputField label="Architecture" name="org_architecture" icon={Users} value={profileData.org_architecture} onChange={handleProfileChange} />
                                        <InputField label="Headcounts" name="org_headcounts" type="number" icon={Globe} value={profileData.org_headcounts} onChange={handleProfileChange} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Password Sidebar */}
                <div className="space-y-6">
                    <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <h2 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                <ShieldCheck className="size-3.5" /> Security & Password
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Update your credentials</p>
                            <div className="space-y-4">
                                <InputField label="Current Password" name="old_password" type={showPasswords ? "text" : "password"} icon={Lock} value={passwordData.old_password} onChange={handlePasswordChange} required />
                                <InputField label="New Password" name="new_password" type={showPasswords ? "text" : "password"} icon={Lock} value={passwordData.new_password} onChange={handlePasswordChange} required />
                                <InputField label="Confirm New Password" name="confirm_password" type={showPasswords ? "text" : "password"} icon={Lock} value={passwordData.confirm_password} onChange={handlePasswordChange} required />
                                <div className="flex items-center gap-2 pl-1 mt-2">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={showPasswords}
                                            onChange={(e) => setShowPasswords(e.target.checked)}
                                        />
                                        <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Show Passwords</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]">
                                Update Password
                            </button>
                        </div>
                    </form>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-md p-6 space-y-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="size-4" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Delete Account</h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                            {user?.role === 'HR' 
                                ? "This will permanently remove the entire workspace, including all employees and projects."
                                : "This will permanently remove your account and workspace access."}
                        </p>
                        <button 
                            onClick={async () => {
                                if (window.confirm("ARE YOU ABSOLUTELY SURE? All data will be permanently deleted.")) {
                                    const res = await dispatch(deleteWorkspace());
                                    if (deleteWorkspace.fulfilled.match(res)) {
                                        toast.success("Account deleted successfully");
                                        window.location.href = '/login';
                                    }
                                }
                            }}
                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-md transition-all shadow-lg shadow-red-500/10"
                        >
                            {user?.role === 'HR' ? "Delete Workspace" : "Delete Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
