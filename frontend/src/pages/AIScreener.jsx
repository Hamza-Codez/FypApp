import React, { useState } from 'react';
import {
    FileUp,
    Search,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    BrainCircuit,
    User,
    Trophy,
    ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AIScreener = () => {
    const [requirements, setRequirements] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleAnalyze = async () => {
        if (!requirements) {
            toast.error("Please enter job requirements");
            return;
        }
        if (files.length === 0) {
            toast.error("Please upload at least one CV");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('requirements', requirements);
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/ai-screener/analyze', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResults(response.data.results);
            toast.success("Analysis complete!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze CVs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                    AI Talent Screener
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Automated CV screening using Llama 3 70B. Upload candidates and see who fits best.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.618fr] gap-6">
                {/* Inputs Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                <Search className="size-3.5" /> Screening Parameters
                            </h2>
                        </div>
                        
                        <div className="p-5 space-y-6">
                            {/* Requirements Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-4 bg-white dark:bg-zinc-950 focus-within:border-blue-500 transition-all shadow-sm">
                                <label className="text-[10px] font-bold uppercase text-zinc-300 tracking-widest block mb-2">Job Requirements & Skills</label>
                                <textarea
                                    className="w-full h-40 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 outline-none resize-none leading-relaxed"
                                    placeholder="Paste your job description or key requirements here... (e.g. 3 years React exp, Python backend, Team player)"
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                />
                            </div>

                            {/* CV Upload Box */}
                            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-4 bg-white dark:bg-zinc-950 focus-within:border-blue-500 transition-all shadow-sm">
                                <label className="text-[10px] font-bold uppercase text-zinc-300 tracking-widest block mb-2">Candidate Pool (PDF/Docx)</label>
                                <label className="flex flex-col items-center justify-center w-full h-24 transition border-2 border-zinc-100 dark:border-zinc-800 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none bg-zinc-50/30 dark:bg-zinc-900/10">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileUp size={20} className="text-zinc-300" />
                                        <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Select CV Files</span>
                                    </div>
                                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                                    {files.length > 0 && (
                                        <span className="mt-2 text-[10px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                            {files.length} Files Selected
                                        </span>
                                    )}
                                </label>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all ${loading
                                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <BrainCircuit size={16} />
                                        <span>Start AI Screening</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    {results ? (
                        <div className="grid grid-cols-1 gap-6">
                            {results.map((res, idx) => (
                                <CandidateCard key={idx} result={res} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/50 dark:bg-zinc-900/50 p-12">
                            <BrainCircuit size={48} strokeWidth={1} className="mb-4 text-zinc-300" />
                            <p className="text-lg font-medium">Ready for Analysis</p>
                            <p className="text-sm">Upload CVs and requirements to begin screening.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CandidateCard = ({ result }) => {
    const scoreColor = result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500';
    const verdictBg = result.score >= 80 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 p-5 hover:border-blue-400 dark:hover:border-blue-800 transition-colors group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white capitalize">
                            {result.candidate_name}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{result.summary}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-semibold ${scoreColor}`}>
                        {result.score}%
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-zinc-500 tracking-wide">Match Score</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-md border border-emerald-100 dark:border-emerald-900/20">
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] uppercase tracking-widest">
                        <CheckCircle2 size={12} />
                        Core Strengths
                    </div>
                    <ul className="space-y-1">
                        {result.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-md border border-rose-100 dark:border-rose-900/20">
                    <div className="flex items-center gap-2 mb-3 text-rose-500 dark:text-rose-400 font-bold text-[9px] uppercase tracking-widest">
                        <AlertCircle size={12} />
                        Potential Gaps
                    </div>
                    <ul className="space-y-1">
                        {result.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-400" />
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-md border border-transparent ${verdictBg}`}>
                <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                    <Trophy size={14} />
                    <span>Verdict: {result.verdict}</span>
                </div>
                <button className="flex items-center gap-1 text-xs font-bold hover:gap-2 transition-all opacity-70 hover:opacity-100">
                    Full Report <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default AIScreener;
