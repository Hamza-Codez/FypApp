import { useState, useEffect } from "react";
import { Mail, UserPlus, FileText, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { addEmployee, uploadEmployeesCSV } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const CredentialPopup = ({ credentials, onClose }) => {
    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="size-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20">
                        <Mail className="size-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Credentials Generated</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Please copy these credentials and share them with the employee manually. They will not be sent via email.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block ml-1">Email Address</label>
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl group hover:border-emerald-500/50 transition-all">
                            <input readOnly value={credentials.email} className="flex-1 bg-transparent text-sm font-semibold dark:text-white outline-none" />
                            <button onClick={() => handleCopy(credentials.email, "Email")} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all shadow-sm active:scale-95">
                                <FileText className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest block ml-1">Temporary Password</label>
                        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl group hover:border-emerald-500/50 transition-all">
                            <input readOnly value={credentials.password} className="flex-1 bg-transparent text-sm font-semibold dark:text-white outline-none" />
                            <button onClick={() => handleCopy(credentials.password, "Password")} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all shadow-sm active:scale-95">
                                <FileText className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/20 rounded-xl flex gap-3">
                        <div className="size-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-amber-600">!</span>
                        </div>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">Ensure you copy these now. You won't be able to see this password again once closed.</p>
                    </div>
                    <button onClick={onClose} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-xl transition-all active:scale-[0.98]">
                        Done, I've copied it
                    </button>
                </div>
            </div>
        </div>
    );
};

const CSVResultsPopup = ({ results, onClose }) => {
    const handleCopyAll = () => {
        const text = results.filter(r => r.status === 'SUCCESS').map(r => `${r.email}: ${r.password}`).join('\n');
        navigator.clipboard.writeText(text);
        toast.success("All credentials copied!");
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Import Summary</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Generated credentials for imported employees</p>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 border border-zinc-100 dark:border-zinc-900 rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 font-bold text-[10px] uppercase text-zinc-400">Email</th>
                                <th className="px-4 py-3 font-bold text-[10px] uppercase text-zinc-400">Password</th>
                                <th className="px-4 py-3 font-bold text-[10px] uppercase text-zinc-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {results.map((res, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3 font-medium dark:text-white">{res.email}</td>
                                    <td className="px-4 py-3 font-mono text-emerald-500 dark:text-emerald-400">{res.password || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                            res.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'
                                        }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-3 mt-auto">
                    <button onClick={handleCopyAll} className="flex-1 flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                        <FileText className="size-4" /> Copy All Credentials
                    </button>
                    <button onClick={onClose} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen, initialData }) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tab, setTab] = useState("manual"); // manual or csv
    const [csvFile, setCsvFile] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [csvResults, setCsvResults] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: "Employee",
    });

    useEffect(() => {
        if (isDialogOpen && initialData) {
            setFormData({
                first_name: initialData.first_name || "",
                last_name: initialData.last_name || "",
                email: initialData.email || "",
                role: initialData.role || "Employee",
            });
        } else if (isDialogOpen) {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                role: "Employee",
            });
        }
    }, [isDialogOpen, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let resultAction;
        if (tab === "manual") {
            const sanitizedData = { ...formData };
            if (sanitizedData.age === "" || sanitizedData.age === null) {
                delete sanitizedData.age;
            } else {
                sanitizedData.age = parseInt(sanitizedData.age);
            }
            if (sanitizedData.gender === "") delete sanitizedData.gender;

            resultAction = await dispatch(addEmployee(sanitizedData));
        } else {
            if (!csvFile) {
                toast.error("Please select a CSV file");
                setIsSubmitting(false);
                return;
            }
            resultAction = await dispatch(uploadEmployeesCSV(csvFile));
        }

        setIsSubmitting(false);
        if (addEmployee.fulfilled.match(resultAction) || uploadEmployeesCSV.fulfilled.match(resultAction)) {
            if (tab === "manual") {
                setCredentials({ email: resultAction.payload.user.email, password: resultAction.payload.password });
                toast.success("Employee created successfully!");
            } else {
                setCsvResults(resultAction.payload.results);
                toast.success(`Imported ${resultAction.payload.added_count} employees`);
            }
            
            // Don't close setIsDialogOpen(false) yet so user can copy credentials
            setFormData({ first_name: "", last_name: "", email: "", gender: "", age: "", role: "Employee" });
            setCsvFile(null);
        } else {
            toast.error(resultAction.payload?.detail || "Action failed");
        }
    };

    if (!isDialogOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/10 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
                    <div className="mb-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Add Team Member</h2>
                            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1 opacity-80 uppercase leading-none">Personnel Onboarding</p>
                        </div>
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg w-48 shadow-inner">
                            <button 
                                type="button"
                                onClick={() => setTab("manual")} 
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase tracking-widest ${tab === "manual" ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
                            >
                                Manual
                            </button>
                            <button 
                                type="button"
                                onClick={() => setTab("csv")} 
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase tracking-widest ${tab === "csv" ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
                            >
                                CSV import
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {tab === "manual" ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">
                                {[
                                { label: 'First Name', name: 'first_name', type: 'text', placeholder: 'e.g. John', required: true },
                                { label: 'Last Name', name: 'last_name', type: 'text', placeholder: 'e.g. Doe', required: true },
                                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john@company.com', required: true },
                                ].map((field) => (
                                <div key={field.name} className="group">
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-1.5 transition-colors group-focus-within:text-emerald-500">{field.label}</label>
                                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/5 transition-all">
                                    <input 
                                        name={field.name} 
                                        type={field.type} 
                                        required={field.required} 
                                        value={formData[field.name]} 
                                        onChange={handleChange} 
                                        placeholder={field.placeholder}
                                        className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" 
                                    />
                                    </div>
                                </div>
                                ))}
                                
                                <div className="group">
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-1.5 transition-colors group-focus-within:text-emerald-500">Member Role</label>
                                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/5 transition-all">
                                    <input 
                                        name="role" 
                                        list="role-suggestions"
                                        value={formData.role} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Frontend Developer"
                                        className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-white outline-none appearance-none"
                                    />
                                    <datalist id="role-suggestions">
                                        <option value="Employee" />
                                        <option value="Manager" />
                                        <option value="Frontend Developer" />
                                        <option value="Backend Developer" />
                                        <option value="UI/UX Designer" />
                                        <option value="QA Specialist" />
                                        <option value="DevOps Engineer" />
                                        <option value="Tech Lead" />
                                    </datalist>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-8 py-2 px-1">
                                <div className="flex-1 relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group overflow-hidden">
                                    <FileText className="size-8 mx-auto text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-colors mb-3" />
                                    <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white">Click or drop your CSV file here</p>
                                    <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="" />
                                    <div className="inline-flex px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm group-hover:shadow-md transition-all">
                                        {csvFile ? csvFile.name : 'Select File'}
                                    </div>
                                </div>
                                <div className="w-64 space-y-3">
                                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                        <p className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="size-1 rounded-full bg-emerald-600 animate-pulse" />
                                            Primary
                                        </p>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Name, Email, Job Title</p>
                                    </div>
                                    <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="size-1 rounded-full bg-zinc-400" />
                                            Secondary
                                        </p>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-relaxed">Gender</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-900 gap-4">
                            <button type="button" onClick={() => setIsDialogOpen(false)} className="px-8 py-2.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 uppercase font-black text-[9px] tracking-widest transition-all">
                                Discard
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] py-3 px-10 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? "Syncing..." : tab === "manual" ? "Add Team Member" : "Start Import"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {credentials && (
                <CredentialPopup 
                    credentials={credentials} 
                    onClose={() => { setCredentials(null); setIsDialogOpen(false); }} 
                />
            )}

            {csvResults && (
                <CSVResultsPopup 
                    results={csvResults} 
                    onClose={() => { setCsvResults(null); setIsDialogOpen(false); }} 
                />
            )}
        </>
    );
};

export default InviteMemberDialog;
