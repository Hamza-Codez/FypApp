import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signupHR } from '../../features/auth/authSlice';
import { LayoutGrid, User, Mail, Lock, Building2, UsersRound, Globe, Phone, Image as ImageIcon, CheckCircle2, Loader2, ArrowRight, ArrowLeft, Info, ShieldCheck, Clock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="group space-y-2 flex-1 min-w-[240px]">
        <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-[0.2em] block pl-1 transition-colors group-focus-within:text-emerald-500">
            {label}
        </label>
        <div className="relative flex items-center">
            <div className="absolute left-0 h-full w-10 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 transition-colors group-focus-within:border-emerald-500/50">
                <Icon className="size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input 
                {...props}
                className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-md py-3 pl-14 pr-4 text-xs focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-[#111111] dark:text-white"
            />
        </div>
    </div>
);

const SignupHR = () => {
    const [step, setStep] = useState(1);
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
        org_architecture: '',
        org_headcounts: '',
        cultural_practices: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [orgLogo, setOrgLogo] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const steps = [
        { id: 1, title: 'Identity', desc: 'Personal details', icon: User },
        { id: 2, title: 'Organization', desc: 'Corporate profile', icon: Building2 },
        { id: 3, title: 'Security', desc: 'Access credentials', icon: Lock },
    ];

    const userGuides = {
        1: {
            title: "Identity Verification",
            tips: [
                "Legal names are required for administrative integrity.",
                "Age and Gender help us personalize your HR dashboard.",
                "All personal data is encrypted at rest."
            ]
        },
        2: {
            title: "Architecting Workspace",
            tips: [
                "Organization name will appear on all issued reports.",
                "Headcount helps us scale your database resources.",
                "Contact info is used for critical system alerts."
            ]
        },
        3: {
            title: "Access Hardening",
            tips: [
                "Use a unique username for system-wide identification.",
                "Passwords must be at least 8 characters long.",
                "Compliance verification is active for this session."
            ]
        }
    };

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
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                data.append(key, value);
            }
        });
        if (profileImage) data.append('profile_image', profileImage);
        if (orgLogo) data.append('org_logo', orgLogo);

        const resultAction = await dispatch(signupHR(data));
        if (signupHR.fulfilled.match(resultAction)) {
            toast.success('Registration successful!');
            navigate('/login');
        } else {
            const error = resultAction.payload;
            const message = typeof error === 'string' 
                ? error 
                : (Array.isArray(error?.detail) 
                    ? error.detail.map(err => err.msg).join(', ') 
                    : (error?.detail || 'Signup failed'));
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-500">
            {/* Background Decorative Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#111_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
            </div>

            <div className="w-full max-w-[1340px] h-[min(850px,92vh)] bg-white dark:bg-[#0F0F0E] rounded-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-zinc-200 dark:border-zinc-800 flex overflow-hidden relative z-10 transition-all">
                
                {/* Left Column: Intelligence Sidebar */}
                <div className="w-[300px] bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
                    <div className="p-8 border-b border-zinc-200 dark:border-zinc-800">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="size-10 bg-[#111111] dark:bg-white rounded-md flex items-center justify-center shadow-lg shadow-black/10">
                                <LayoutGrid className="size-5 text-white dark:text-black" />
                            </div>
                            <div>
                                <span className="text-xl font-bold font-serif text-[#111111] dark:text-white tracking-tight block">OfficeOS</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Command Center</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="size-5 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <ShieldCheck className="size-3 text-emerald-500" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#111111] dark:text-white/40">User Guide</span>
                            </div>
                            
                            <div className="bg-[#111111] dark:bg-black p-6 rounded-md border border-white/5 shadow-2xl relative group mb-8">
                                <h4 className="text-[12px] font-bold text-white mb-4 tracking-tight border-l-2 border-emerald-500 pl-4 uppercase tracking-wider">
                                    {userGuides[step].title}
                                </h4>
                                <ul className="space-y-4 pl-4">
                                    {userGuides[step].tips.map((tip, i) => (
                                        <li key={i} className="flex gap-3 text-[10px] leading-relaxed text-zinc-400 group/tip">
                                            <div className="w-1.5 h-[1px] bg-emerald-500/50 mt-[7px] shrink-0 transition-all group-hover/tip:w-3 group-hover/tip:bg-emerald-500"></div>
                                            <span className="group-hover:text-zinc-200 transition-colors">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar in Sidebar */}
                    <div className="p-6 mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-black/20 space-y-4">
                        <Link to="/login" className="flex items-center justify-between group p-3 rounded-md bg-[#111111] dark:bg-white text-white dark:text-black transition-all hover:scale-[1.02] shadow-xl">
                            <div className="flex items-center gap-3">
                                <LogIn className="size-4 opacity-70 group-hover:rotate-12 transition-transform" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Operator Sign In</span>
                                    <span className="text-[8px] opacity-50 uppercase font-medium mt-1 tracking-tighter">Existing Accounts</span>
                                </div>
                            </div>
                            <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>

                {/* Right Column: Steps & Content */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    
                    {/* Slick Top Bar with Integrated Stepper */}
                    <div className="h-20 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-12 shrink-0 bg-white/50 dark:bg-[#0F0F0E]/50 backdrop-blur-xl z-20">
                        <div className="flex-1 flex items-center justify-between relative max-w-[900px] mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-100 dark:bg-zinc-800 -translate-y-1/2 z-0"></div>
                            {steps.map((s) => (
                                <div key={s.id} className="relative z-10 flex items-center gap-4 group cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                                    <div className={`size-9 rounded-md flex items-center justify-center border-2 transition-all duration-500 ${
                                        step === s.id ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                        step > s.id ? 'bg-[#111111] dark:bg-white border-[#111111] dark:border-white text-white dark:text-black' : 
                                        'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400'
                                    }`}>
                                        {step > s.id ? <CheckCircle2 className="size-4" /> : <s.icon className="size-4" />}
                                    </div>
                                    <div className="hidden xl:block">
                                        <div className={`text-[8px] font-bold uppercase tracking-[0.2em] mb-0.5 ${step === s.id ? 'text-emerald-500' : 'text-zinc-400'}`}>Stage 0{s.id}</div>
                                        <div className={`text-[10px] font-bold tracking-tight uppercase ${step === s.id ? 'text-[#111111] dark:text-white' : 'text-zinc-500'}`}>{s.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-zinc-50/20 dark:bg-transparent">
                        <div className="max-w-[850px] mx-auto px-12 py-8">
                            
                            <div className="mb-6">
                                <h2 className="text-2xl font-serif font-bold text-[#111111] dark:text-white tracking-tight mb-1">
                                    {steps[step-1].title} <span className="text-zinc-300 dark:text-zinc-700 mx-2">—</span> <span className="text-zinc-400 dark:text-zinc-600 font-medium text-lg">{steps[step-1].desc}</span>
                                </h2>
                                <div className="w-12 h-1 bg-emerald-500 rounded-full"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col min-h-[350px]">
                                {step === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField icon={User} label="First Name" name="first_name" required value={formData.first_name} onChange={handleChange} placeholder="e.g. Alex" />
                                            <InputField icon={User} label="Last Name" name="last_name" required value={formData.last_name} onChange={handleChange} placeholder="e.g. Rivera" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField icon={User} label="Gender" name="gender" value={formData.gender} onChange={handleChange} placeholder="Male / Female / Other" />
                                            <InputField icon={Clock} label="Current Age" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 28" />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField icon={Building2} label="Organization Name" name="organization_name" required value={formData.organization_name} onChange={handleChange} placeholder="e.g. Acme Corp" />
                                            <InputField icon={Phone} label="Contact Info" name="contact_info" value={formData.contact_info} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField icon={UsersRound} label="Headcount" type="number" name="org_headcounts" value={formData.org_headcounts} onChange={handleChange} placeholder="Total employees" />
                                            <InputField icon={Globe} label="Cultural Practices" name="cultural_practices" value={formData.cultural_practices} onChange={handleChange} placeholder="e.g. Agile, Remote" />
                                        </div>
                                        <InputField icon={LayoutGrid} label="Organizational Architecture" name="org_architecture" value={formData.org_architecture} onChange={handleChange} placeholder="Describe your hierarchy..." />
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField icon={Mail} label="Email Address" type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="alex@company.com" />
                                            <InputField icon={User} label="Unique Username" name="username" required value={formData.username} onChange={handleChange} placeholder="alex_rivera" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <InputField icon={Lock} label="Password" type={showPasswords ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                            <InputField icon={Lock} label="Confirm Password" type={showPasswords ? "text" : "password"} name="confirm_password" required value={formData.confirm_password} onChange={handleChange} placeholder="••••••••" />
                                        </div>
                                        <div className="flex items-center gap-3 pl-1">
                                            <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={showPasswords}
                                                    onChange={(e) => setShowPasswords(e.target.checked)}
                                                    className="accent-emerald-500 size-4 rounded bg-zinc-800 border-none outline-none ring-0 focus:ring-0"
                                                />
                                                <span className="group-hover:text-emerald-500 transition-colors">Show Passwords</span>
                                            </label>
                                        </div>
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-md flex items-center gap-4 mt-4">
                                            <ShieldCheck className="size-5 text-emerald-500" />
                                            <p className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-relaxed">
                                                By clicking launch, you agree to the OfficeOS Terms of Infrastructure and secure data processing protocols.
                                            </p>
                                        </div>
                                    </div>
                                )}



                                <div className="mt-auto pb-12 flex justify-between items-center">
                                    {step > 1 ? (
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(s => s - 1)}
                                            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-[#111111] dark:hover:text-white transition-colors group"
                                        >
                                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Previous Stage
                                        </button>
                                    ) : <div />}

                                    {step < 3 ? (
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(s => s + 1)}
                                            className="bg-[#111111] dark:bg-white text-white dark:text-black px-8 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] hover:shadow-2xl transition-all flex items-center gap-3 active:scale-95 group shadow-xl"
                                        >
                                            Next Stage <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-emerald-500 text-white px-10 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-xl shadow-emerald-800/40 active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Launch Node'} <ArrowRight className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupHR;
