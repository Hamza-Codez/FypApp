import { useState } from "react";
import { Mail, UserPlus, FileText, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { addEmployee, uploadEmployeesCSV } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tab, setTab] = useState("manual"); // manual or csv
    const [csvFile, setCsvFile] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        contact_info: "",
        gender: "",
        age: "",
        role: "Employee",
        salary_pkr: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let resultAction;
        if (tab === "manual") {
            const sanitizedData = { ...formData };

            // Clean optional fields
            if (sanitizedData.age === "" || sanitizedData.age === null) {
                delete sanitizedData.age;
            } else {
                sanitizedData.age = parseInt(sanitizedData.age);
            }

            if (sanitizedData.contact_info === "") delete sanitizedData.contact_info;
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
            toast.success(tab === "manual" ? "Employee added and email sent!" : "CSV processed successfully!");
            setIsDialogOpen(false);
            setFormData({ first_name: "", last_name: "", email: "", contact_info: "", gender: "", age: "", role: "Employee", salary_pkr: "" });
            setCsvFile(null);
        } else {
            toast.error(resultAction.payload?.detail || "Action failed");
        }
    };

    if (!isDialogOpen) return null;

    return (
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
                            className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase tracking-widest ${tab === "manual" ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
                        >
                            Manual
                        </button>
                        <button 
                            type="button"
                            onClick={() => setTab("csv")} 
                            className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase tracking-widest ${tab === "csv" ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
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
                              { label: 'Phone Number', name: 'contact_info', type: 'text', placeholder: '+92 ...' },
                              { label: 'Monthly Salary', name: 'salary_pkr', type: 'number', placeholder: '50000' }
                            ].map((field) => (
                              <div key={field.name} className="group">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-1.5 transition-colors group-focus-within:text-blue-500">{field.label}</label>
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/5 transition-all">
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
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-1.5 transition-colors group-focus-within:text-blue-500">Member Role</label>
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/5 transition-all">
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
                            <div className="flex-1 relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-blue-400 dark:hover:border-blue-600 transition-all group overflow-hidden">
                                <FileText className="size-8 mx-auto text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-colors mb-3" />
                                <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white">Click or drop your CSV file here</p>
                                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="" />
                                <div className="inline-flex px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm group-hover:shadow-md transition-all">
                                    {csvFile ? csvFile.name : 'Select File'}
                                </div>
                            </div>
                            <div className="w-64 space-y-3">
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest mb-1.5 flex items-center gap-2">
                                        <div className="size-1 rounded-full bg-blue-600 animate-pulse" />
                                        Primary
                                    </p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Name, Email, Job Title</p>
                                </div>
                                <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 flex items-center gap-2">
                                        <div className="size-1 rounded-full bg-zinc-400" />
                                        Secondary
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-relaxed">Phone, Salary, Gender</p>
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
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-3 px-10 rounded-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Syncing..." : tab === "manual" ? "Add Team Member" : "Start Import"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
