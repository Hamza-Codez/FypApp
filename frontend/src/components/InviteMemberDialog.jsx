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
        username: "",
        contact_info: "",
        gender: "",
        age: ""
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
            setFormData({ first_name: "", last_name: "", email: "", username: "", contact_info: "", gender: "", age: "" });
            setCsvFile(null);
        } else {
            toast.error(resultAction.payload?.detail || "Action failed");
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 shadow-2xl">
                <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-blue-500" /> Add Team Member
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Onboard new employees to your organization</p>
                </div>

                <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
                    <button onClick={() => setTab("manual")} className={`pb-2 px-4 text-sm font-medium transition-colors ${tab === "manual" ? "border-b-2 border-blue-500 text-blue-500" : "text-zinc-500"}`}>Manual Entry</button>
                    <button onClick={() => setTab("csv")} className={`pb-2 px-4 text-sm font-medium transition-colors ${tab === "csv" ? "border-b-2 border-blue-500 text-blue-500" : "text-zinc-500"}`}>CSV Upload</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {tab === "manual" ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-zinc-500">First Name</label>
                                <input name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-zinc-500">Last Name</label>
                                <input name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-semibold uppercase text-zinc-500">Email Address</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs font-semibold uppercase text-zinc-500">Username</label>
                                <input name="username" required value={formData.username} onChange={handleChange} className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4 text-center">
                            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-8">
                                <FileText className="size-12 mx-auto text-zinc-400 mb-4" />
                                <p className="text-sm text-zinc-500 mb-4">Upload your employee CSV file</p>
                                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="text-sm block w-full text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                            </div>
                            <p className="text-xs text-zinc-500">CSV must include columns: first_name, last_name, email, username</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 rounded text-sm font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
                            {isSubmitting ? "Processing..." : tab === "manual" ? "Add Employee" : "Upload CSV"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
