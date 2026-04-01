import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signupHR } from '../../features/auth/authSlice';
import { LayoutDashboard, User, Mail, Lock, Building2, UsersRound, Globe, Phone, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Define InputField OUTSIDE to prevent focus loss during re-renders
const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-md p-3.5 bg-white dark:bg-zinc-950 focus-within:border-blue-500 transition-all flex-1 min-w-[200px] shadow-sm">
        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block mb-1">{label}</label>
        <div className="relative group">
            <Icon className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-zinc-300 group-focus-within:text-blue-500 transition-colors" />
            <input
                {...props}
                className="w-full pl-6 bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-300 outline-none"
            />
        </div>
    </div>
);

const SignupHR = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        age: '',
        organization_name: '',
        contact_info: '',
        email: '',
        username: '',
        password: '',
        confirm_password: '',
        organizational_architecture: '',
        headcounts: '',
        cultural_practices: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [orgLogo, setOrgLogo] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'profile_image') setProfileImage(e.target.files[0]);
        if (e.target.name === 'org_logo') setOrgLogo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            return toast.error("Passwords don't match");
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        if (profileImage) data.append('profile_image', profileImage);
        if (orgLogo) data.append('org_logo', orgLogo);

        const resultAction = await dispatch(signupHR(data));
        if (signupHR.fulfilled.match(resultAction)) {
            toast.success('Registration successful!');
            navigate('/login');
        } else {
            toast.error(resultAction.payload?.detail || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 group w-fit">
                        <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                            <LayoutDashboard className="size-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold dark:text-white tracking-tight">OfficeOS</span>
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">Already registered?</span>
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition-all">
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <div className="grid lg:grid-cols-3">
                        <div className="lg:col-span-1 bg-zinc-900 border-r border-zinc-800 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                            <div className="relative space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Launch your Organization Workspace.</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed">Join thousands of high-performance teams. Set up your HR infrastructure in minutes.</p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        "Automated Payroll Settings",
                                        "Custom Org Architecture",
                                        "Employee Image Database",
                                        "Role-based Permissions"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle2 className="size-5 text-blue-500" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="lg:col-span-2 p-10 space-y-10">
                            {/* Personal Master Box */}
                            <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="size-3.5" /> Personal Account Info
                                    </h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex flex-wrap gap-4">
                                        <InputField icon={User} label="First Name" name="first_name" required value={formData.first_name} onChange={handleChange} />
                                        <InputField icon={User} label="Last Name" name="last_name" required value={formData.last_name} onChange={handleChange} />
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <InputField icon={Mail} label="Email Address" type="email" name="email" required value={formData.email} onChange={handleChange} />
                                        <InputField icon={User} label="Username" name="username" required value={formData.username} onChange={handleChange} />
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <InputField icon={Lock} label="Password" type={showPasswords ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} />
                                        <InputField icon={Lock} label="Confirm Password" type={showPasswords ? "text" : "password"} name="confirm_password" required value={formData.confirm_password} onChange={handleChange} />
                                    </div>
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
                            </div>

                            {/* Organization Master Box */}
                            <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <Building2 className="size-3.5" /> Organization Profile
                                    </h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex flex-wrap gap-4">
                                        <InputField icon={Building2} label="Organization Name" name="organization_name" required value={formData.organization_name} onChange={handleChange} />
                                        <InputField icon={Phone} label="Contact Info" name="contact_info" value={formData.contact_info} onChange={handleChange} />
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <InputField icon={UsersRound} label="Headcount" type="number" name="headcounts" value={formData.headcounts} onChange={handleChange} />
                                        <InputField icon={Globe} label="Cultural Practices" name="cultural_practices" value={formData.cultural_practices} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Branding Master Box */}
                            <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="size-3.5" /> Branding & Media
                                    </h3>
                                </div>
                                <div className="p-6 grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Profile Picture</label>
                                        <input type="file" name="profile_image" accept="image/*" onChange={handleFileChange} className="w-full text-[11px] text-zinc-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-300 transition-all cursor-pointer" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Org Logo</label>
                                        <input type="file" name="org_logo" accept="image/*" onChange={handleFileChange} className="w-full text-[11px] text-zinc-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-300 transition-all cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[11px] rounded-md shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Complete Registration & Launch'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupHR;
