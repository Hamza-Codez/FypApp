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
        <div className="space-y-1.5 flex-1 min-w-[240px]">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />}
                <input
                    {...props}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all dark:text-white text-sm"
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-12 text-white border border-zinc-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <img 
                            src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`} 
                            alt="Profile" 
                            className="size-32 rounded-2xl object-cover ring-4 ring-zinc-800 shadow-2xl"
                        />
                        {user?.role === 'HR' && user?.org_logo && (
                            <div className="absolute -top-3 -right-3 p-1 bg-white rounded-lg shadow-xl ring-2 ring-zinc-800">
                                <img src={user.org_logo} alt="Org Logo" className="size-10 rounded-md object-contain" />
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 rounded-lg shadow-lg">
                            <BadgeCheck className="size-5 text-white" />
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h1 className="text-3xl font-black tracking-tight">{user?.first_name} {user?.last_name}</h1>
                            {user?.role === 'HR' && (
                                <span className="w-fit px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-600/30">
                                    Organization Owner
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-400 font-medium flex items-center justify-center md:justify-start gap-2">
                            @{user?.username} • <span className="text-blue-400">{user?.role}</span>
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold border border-zinc-700 flex items-center gap-2">
                                <Briefcase className="size-3 text-zinc-400" /> {user?.organization_name || 'No Org'}
                            </span>
                            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold border border-zinc-700 flex items-center gap-2">
                                <Mail className="size-3 text-zinc-400" /> {user?.email}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Details Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <UserCircle className="size-5 text-blue-600" /> Account Settings
                            </h2>
                            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
                                <Save className="size-4" /> Save Changes
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2">Personal Information</h3>
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

                        {user?.role === 'HR' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2">Organization Profile</h3>
                                <div className="flex flex-wrap gap-4">
                                    <InputField label="Organization Name" name="organization_name" icon={Building2} value={profileData.organization_name} onChange={handleProfileChange} />
                                    <InputField label="Contact Info" name="contact_info" icon={Phone} value={profileData.contact_info} onChange={handleProfileChange} />
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <InputField label="Architecture" name="org_architecture" icon={Users} value={profileData.org_architecture} onChange={handleProfileChange} />
                                    <InputField label="Headcounts" name="org_headcounts" type="number" icon={Globe} value={profileData.org_headcounts} onChange={handleProfileChange} />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Password Sidebar */}
                <div className="space-y-8">
                    <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="size-5 text-blue-600" /> Security
                        </h2>
                        <p className="text-xs text-zinc-500 leading-relaxed">Ensure your account is using a long, random password to stay secure.</p>
                        
                        <div className="space-y-4">
                            <InputField label="Current Password" name="old_password" type="password" icon={Lock} value={passwordData.old_password} onChange={handlePasswordChange} required />
                            <InputField label="New Password" name="new_password" type="password" icon={Lock} value={passwordData.new_password} onChange={handlePasswordChange} required />
                            <InputField label="Confirm New Password" name="confirm_password" type="password" icon={Lock} value={passwordData.confirm_password} onChange={handlePasswordChange} required />
                        </div>

                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                            Update Password
                        </button>
                    </form>

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <Trash2 className="size-5" />
                            <h3 className="font-bold uppercase tracking-widest text-sm">Danger Zone</h3>
                        </div>
                        <p className="text-xs text-zinc-500">
                            {user?.role === 'HR' 
                                ? "Deleting the workspace will permanently remove all employees, projects, tasks, and your account. This action cannot be undone."
                                : "Deleting your account will remove your personal data and access to this workspace."}
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
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 text-sm"
                        >
                            {user?.role === 'HR' ? "Delete Workspace & Account" : "Delete Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
