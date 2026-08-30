import { useState, useCallback, useEffect, useMemo } from 'react';
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
    ArrowRight,
    Zap,
    Target,
    Fingerprint,
    Activity,
    Clock,
    Trash2,
    UserPlus,
    X,
    ChevronRight,
    CheckSquare,
    Square
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import InviteMemberDialog from '../components/InviteMemberDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const ScoreRing = ({ score }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    return (
        <div className="relative size-12 flex items-center justify-center shrink-0">
            <svg className="size-full transform -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-zinc-100 dark:text-zinc-800"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-zinc-900 dark:text-white transition-all duration-1000 ease-out"
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-zinc-900 dark:text-white tracking-tighter">{score}%</span>
        </div>
    );
};

const CandidateCard = ({ result, rank }) => {
    return (
        <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 p-5 transition-all duration-500 hover:shadow-xl hover:shadow-zinc-500/5 hover:border-zinc-400 dark:hover:border-zinc-600 group relative">
            <div className="absolute top-4 right-5 flex items-center gap-2">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    MATCH #{rank + 1}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-5 mb-5">
                <div className="flex items-center gap-4 w-full">
                    <div className="size-12 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-300 shrink-0">
                        <User size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white uppercase tracking-tight truncate">
                                {result.candidate_name}
                            </h3>
                            {result.score >= 85 && (
                                <span className="px-1 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[7px] font-black uppercase tracking-widest rounded shrink-0">
                                    TOP
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Fingerprint size={10} className="text-zinc-400" /> {result.summary}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-2 pr-4 rounded-md border border-zinc-200 dark:border-zinc-800 shrink-0 w-full md:w-auto">
                    <ScoreRing score={result.score} />
                    <div>
                        <div className="text-[8px] font-bold uppercase text-zinc-400 tracking-widest mb-0.5 leading-none">Neural Fit</div>
                        <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">AI Match</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden mb-5">
                <div className="p-4 bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100 font-bold text-[9px] uppercase tracking-[0.2em]">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Competencies
                    </div>
                    <ul className="space-y-2">
                        {result.strengths.map((s, i) => (
                            <li key={i} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                                <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[9px] mt-0.5 font-bold">0{i+1}</span>
                                <span className="leading-snug font-medium">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100 font-bold text-[9px] uppercase tracking-[0.2em]">
                        <AlertCircle size={12} className="text-amber-500" />
                        Growth
                    </div>
                    <ul className="space-y-2">
                        {result.weaknesses.map((w, i) => (
                            <li key={i} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                                <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[9px] mt-0.5 font-bold">0{i+1}</span>
                                <span className="leading-snug font-medium">{w}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-500/10">
                <div className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] w-full sm:w-auto">
                    <Trophy size={14} />
                    <span>Verdict: {result.verdict}</span>
                </div>
                <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-white/10 dark:border-zinc-200 pt-3 sm:pt-0 sm:pl-5">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white/60 dark:text-zinc-500">
                        <Activity size={10} />
                        Conf. 98.4%
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group/btn">
                        Details <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AIScreener = () => {
    const [requirements, setRequirements] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const [showArchive, setShowArchive] = useState(false);
    const [archiveData, setArchiveData] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [loadingArchive, setLoadingArchive] = useState(false);
    const [isOnboardOpen, setIsOnboardOpen] = useState(false);
    const [onboardInitialData, setOnboardInitialData] = useState(null);
    const [onboardingCandidate, setOnboardingCandidate] = useState(null);
    const [selectedDetailCandidate, setSelectedDetailCandidate] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'danger', title: '', message: '', confirmText: 'Confirm', onConfirm: () => {} });

    const filteredData = useMemo(() => {
        if (filterType === 'eligible') {
            return archiveData.filter(d => d.score >= 80);
        }
        if (filterType === 'non-eligible') {
            return archiveData.filter(d => d.score < 80);
        }
        return archiveData;
    }, [archiveData, filterType]);

    const fetchArchive = async () => {
        setLoadingArchive(true);
        try {
            const response = await api.get('/ai-screener/recent');
            setArchiveData(response.data);
        } catch (error) {
            toast.error("Failed to fetch archive");
        } finally {
            setLoadingArchive(false);
        }
    };

    const handleDiscardAll = async () => {
        if (archiveData.length === 0) return;
        setConfirmState({
            isOpen: true,
            type: 'danger',
            title: 'Discard Archive?',
            message: 'Are you sure you want to discard ALL profiles in the archive? This action is irreversible.',
            confirmText: 'Discard All',
            onConfirm: async () => {
                try {
                    const allIds = archiveData.map(d => d.id);
                    await api.post('/ai-screener/delete', { ids: allIds });
                    toast.success("Archive fully cleared");
                    setSelectedSlots([]);
                    fetchArchive();
                } catch (error) {
                    toast.error("Failed to clear archive");
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedSlots.length === 0) return;
        setConfirmState({
            isOpen: true,
            type: 'danger',
            title: 'Discard Selected?',
            message: `Are you sure you want to discard ${selectedSlots.length} profile(s)? This action is irreversible.`,
            confirmText: 'Discard Selected',
            onConfirm: async () => {
                try {
                    await api.post('/ai-screener/delete', { ids: selectedSlots });
                    toast.success("Profiles discarded");
                    setSelectedSlots([]);
                    fetchArchive();
                } catch (error) {
                    toast.error("Failed to discard profiles");
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleDeleteSingle = (id) => {
        setConfirmState({
            isOpen: true,
            type: 'danger',
            title: 'Discard Profile?',
            message: 'Are you sure you want to discard this screened profile? This action is irreversible.',
            confirmText: 'Discard Profile',
            onConfirm: async () => {
                try {
                    await api.post('/ai-screener/delete', { ids: [id] });
                    toast.success("Profile discarded successfully");
                    setSelectedSlots(prev => prev.filter(item => item !== id));
                    fetchArchive();
                } catch (error) {
                    toast.error("Failed to discard profile");
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleAction = async (id, action) => {
        try {
            await api.post(`/ai-screener/action/${id}`, { action });
            toast.success(`Profile marked as ${action}`);
            fetchArchive();
        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} profile`);
        }
    };

    const handleStartOnboarding = (candidate) => {
        const nameParts = candidate.candidate_name.split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';
        setOnboardInitialData({
            first_name,
            last_name,
            role: candidate.verdict || 'Employee',
            email: ''
        });
        setOnboardingCandidate(candidate);
        setIsOnboardOpen(true);
    };

    const handleFileChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    }, []);

    const handleAnalyze = useCallback(async () => {
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
            const response = await api.post('/ai-screener/analyze', formData);
            setResults(response.data.results);
            toast.success("Analysis complete!");
        } catch (error) {
            toast.error("Failed to analyze CVs");
        } finally {
            setLoading(false);
        }
    }, [requirements, files]);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700 space-y-6 pb-8">
            {/* Sticky Header & Action Bar Group */}
            <div className="sticky top-0 bg-white dark:bg-zinc-950 z-30 pt-4 pb-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
                                <BrainCircuit size={16} />
                            </div>
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                                {showArchive ? "Recent Personas" : "AI Screener"}
                            </h1>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-semibold tracking-wide uppercase">
                            {showArchive ? "Screening History Archive" : "Neural Screening • Llama 3 Performance"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {showArchive ? (
                            <button 
                                onClick={() => setShowArchive(false)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:opacity-80 transition bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 rounded border border-zinc-200 dark:border-zinc-800"
                            >
                                <ArrowRight size={12} className="rotate-180" /> Back to Screener
                            </button>
                        ) : (
                            <button 
                                onClick={() => {
                                    setShowArchive(true);
                                    fetchArchive();
                                }}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition px-4 py-2.5 rounded shadow-md shadow-zinc-500/5 active:scale-[0.98]"
                            >
                                <Clock size={12} /> Recent Personas
                            </button>
                        )}
                        {!showArchive && results && (
                            <button 
                                onClick={() => {setResults(null); setFiles([]); setRequirements("");}}
                                className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>                {showArchive && archiveData && archiveData.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
                        <div className="flex flex-wrap items-center gap-4">
                            <button 
                                onClick={() => {
                                    const allFilteredSelected = filteredData.every(item => selectedSlots.includes(item.id));
                                    if (allFilteredSelected) {
                                        const filteredIds = filteredData.map(item => item.id);
                                        setSelectedSlots(selectedSlots.filter(id => !filteredIds.includes(id)));
                                    } else {
                                        const newSelected = [...selectedSlots];
                                        filteredData.forEach(item => {
                                            if (!newSelected.includes(item.id)) {
                                                newSelected.push(item.id);
                                            }
                                        });
                                        setSelectedSlots(newSelected);
                                    }
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                            >
                                {filteredData.length > 0 && filteredData.every(item => selectedSlots.includes(item.id)) ? "Deselect All" : "Select All"}
                            </button>
                            <span className="text-zinc-300 dark:text-zinc-800">|</span>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{selectedSlots.length} Selected</span>
                            
                            <span className="hidden md:inline text-zinc-300 dark:text-zinc-800">|</span>
                            
                            {/* Eligible & Non-Eligible Filters */}
                            <div className="flex items-center gap-1 bg-zinc-150/70 dark:bg-zinc-900/80 p-0.5 rounded border border-zinc-200/60 dark:border-zinc-800/60">
                                <button 
                                    onClick={() => {
                                        setFilterType('all');
                                        setSelectedSlots([]);
                                    }}
                                    className={`px-3 py-1 rounded-[3px] text-[9px] font-black uppercase tracking-widest transition-all ${
                                        filterType === 'all' 
                                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-250 dark:border-zinc-700' 
                                            : 'text-zinc-455 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    All ({archiveData.length})
                                </button>
                                <button 
                                    onClick={() => {
                                        setFilterType('eligible');
                                        setSelectedSlots([]);
                                    }}
                                    className={`px-3 py-1 rounded-[3px] text-[9px] font-black uppercase tracking-widest transition-all ${
                                        filterType === 'eligible' 
                                            ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-250 dark:border-zinc-700' 
                                            : 'text-zinc-455 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    Eligible ({archiveData.filter(d => d.score >= 80).length})
                                </button>
                                <button 
                                    onClick={() => {
                                        setFilterType('non-eligible');
                                        setSelectedSlots([]);
                                    }}
                                    className={`px-3 py-1 rounded-[3px] text-[9px] font-black uppercase tracking-widest transition-all ${
                                        filterType === 'non-eligible' 
                                            ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 shadow-sm border border-zinc-250 dark:border-zinc-700' 
                                            : 'text-zinc-455 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    Non-Eligible ({archiveData.filter(d => d.score < 80).length})
                                </button>
                            </div>
                        </div>

                        {/* Discard Actions */}
                        <div className="flex items-center gap-2">
                            {selectedSlots.length > 0 && (
                                <button 
                                    onClick={handleDeleteSelected}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-[9.5px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm animate-in fade-in duration-200"
                                >
                                    <Trash2 size={11} /> Discard Selected ({selectedSlots.length})
                                </button>
                            )}
                            <button 
                                onClick={handleDiscardAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-200 dark:border-red-950/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 text-[9.5px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                            >
                                <Trash2 size={11} /> Discard All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showArchive ? (
                /* Archive View */
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Archive Grid */}
                    {loadingArchive ? (
                        <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-400 gap-2">
                            <Loader2 className="animate-spin" size={28} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Loading archives...</span>
                        </div>
                    ) : !archiveData || archiveData.length === 0 ? (
                        <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 p-12">
                            <Fingerprint size={48} strokeWidth={1} className="mb-4 text-zinc-300 dark:text-zinc-800" />
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-zinc-900 dark:text-white">No Archive Found</h3>
                            <p className="text-[10px] font-medium tracking-wide text-zinc-500 text-center max-w-[240px] leading-relaxed">
                                Your neural screening archive is currently empty. Run screenings to populate history.
                            </p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="min-h-[300px] flex flex-col items-center justify-center text-zinc-550 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 p-12">
                            <BrainCircuit size={36} strokeWidth={1} className="mb-3 text-zinc-300 dark:text-zinc-800 animate-pulse" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 text-zinc-900 dark:text-white">No Profiles Found</h3>
                            <p className="text-[10px] font-medium text-zinc-400 text-center max-w-[240px]">
                                No candidates match the "{filterType}" eligibility filter currently.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredData.map((candidate) => {
                                const isSelected = selectedSlots.includes(candidate.id);
                                return (
                                    <div key={candidate.id} className={`bg-white dark:bg-zinc-950 rounded-md border p-5 transition-all duration-300 relative flex flex-col justify-between group ${
                                        isSelected 
                                            ? 'border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]' 
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xl hover:shadow-zinc-500/5'
                                    }`}>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-center gap-4 mb-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {/* Checkbox */}
                                                    <button 
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedSlots(selectedSlots.filter(id => id !== candidate.id));
                                                            } else {
                                                                setSelectedSlots([...selectedSlots, candidate.id]);
                                                            }
                                                        }}
                                                        className="text-zinc-400 hover:text-emerald-500 transition-colors shrink-0"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare size={18} className="text-emerald-500" />
                                                        ) : (
                                                            <Square size={18} />
                                                        )}
                                                    </button>
                                                    <div className="min-w-0">
                                                        <h3 className="text-[13px] font-black uppercase text-zinc-900 dark:text-white truncate tracking-tight">
                                                            {candidate.candidate_name}
                                                        </h3>
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate mt-0.5">
                                                            {candidate.filename || 'Direct Input'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* fit badge */}
                                                <div className={`flex items-center gap-2 px-2.5 py-1 rounded border shrink-0 ${
                                                    candidate.score >= 80 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                                                }`}>
                                                    <span className="text-[10px] font-black tracking-tight shrink-0">
                                                        {candidate.score}% Fit
                                                    </span>
                                                </div>
                                            </div>
 
                                            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed line-clamp-3">
                                                {candidate.summary}
                                            </p>
                                        </div>
 
                                        {/* Improved Button Alignment & Dynamics of Display */}
                                        <div className="flex flex-col gap-2 pt-3.5 border-t border-zinc-100 dark:border-zinc-900 mt-auto">
                                            {candidate.score >= 80 ? (
                                                <>
                                                    {/* Secondary Actions: Details */}
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => setSelectedDetailCandidate(candidate)}
                                                            className="w-full h-8 flex items-center justify-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98] shadow-sm"
                                                        >
                                                            <BrainCircuit size={12} className="text-emerald-500" /> View Details
                                                        </button>
                                                    </div>
                                                    {/* Primary Actions: Onboard */}
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                handleStartOnboarding(candidate);
                                                            }}
                                                            disabled={candidate.status === 'ONBOARD'}
                                                            className={`w-full h-8 flex items-center justify-center gap-1.5 rounded text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm active:scale-[0.98] transition-all duration-300 ${
                                                                candidate.status === 'ONBOARD'
                                                                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-650 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                            }`}
                                                        >
                                                            <UserPlus size={12} /> {candidate.status === 'ONBOARD' ? 'Onboarded' : 'Onboard'}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Low Match (< 80%): Simple View Details */
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => setSelectedDetailCandidate(candidate)}
                                                        className="w-full h-8 flex items-center justify-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98] shadow-sm"
                                                    >
                                                        <BrainCircuit size={12} className="text-emerald-500" /> View Details
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Regular Screener Columns */
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
                    {/* Inputs Sidebar */}
                    <div className="space-y-6 lg:sticky lg:top-6">
                        <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                <h2 className="text-[10px] font-bold uppercase text-zinc-900 dark:text-white tracking-widest flex items-center gap-2">
                                    <Target size={14} /> Params
                                </h2>
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                            
                            <div className="p-4 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest ml-0.5">Specifications</label>
                                    <textarea
                                        className="w-full h-36 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 text-[12px] font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none resize-none leading-normal focus:border-zinc-900 dark:focus:border-zinc-500 transition-colors"
                                        placeholder="Enter requirements..."
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest ml-0.5">Candidate Pool</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 transition border border-zinc-200 dark:border-zinc-800 border-dashed rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 group/upload">
                                        <div className="flex flex-col items-center gap-2 text-zinc-400 group-hover/upload:text-zinc-900 dark:group-hover/upload:text-white transition-colors">
                                            <FileUp size={20} strokeWidth={1.5} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Files</span>
                                        </div>
                                        <input type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                                        {files.length > 0 && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-[9px] text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                    {files.length} Assets
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${loading
                                            ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed'
                                            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98]'
                                        }`}
                                    >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={16} />
                                            <span>Start Screening</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="space-y-5 min-h-[600px]">
                        {results ? (
                            <div className="grid grid-cols-1 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {results.map((res, idx) => (
                                    <CandidateCard key={idx} rank={idx} result={res} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 p-12 group">
                                <div className="size-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
                                    <BrainCircuit size={28} strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />
                                </div>
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-zinc-900 dark:text-white">Core Standby</h3>
                                <p className="text-[10px] font-medium tracking-wide text-zinc-500 text-center max-w-[200px] leading-relaxed">
                                    Provide requirements to initiate neural screening.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <InviteMemberDialog 
                isDialogOpen={isOnboardOpen} 
                setIsDialogOpen={setIsOnboardOpen} 
                initialData={onboardInitialData} 
                onSuccess={() => {
                    if (onboardingCandidate) {
                        handleAction(onboardingCandidate.id, 'ONBOARD');
                    }
                }}
            />

            {selectedDetailCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={() => setSelectedDetailCandidate(null)} />
                    
                    {/* Modal Box */}
                    <div className="relative bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 z-10">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30 shrink-0">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                                        {selectedDetailCandidate.candidate_name}
                                    </h2>
                                    <span className={`text-[10px] font-black tracking-tight shrink-0 px-2 py-0.5 rounded ${
                                        selectedDetailCandidate.score >= 80 
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                    }`}>
                                        {selectedDetailCandidate.score}% Fit
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                                    Source: {selectedDetailCandidate.filename || 'Direct Input'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDetailCandidate(null)} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                <X size={16} className="text-zinc-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Summary Section */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Candidate Profile Summary</label>
                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-md border border-zinc-150 dark:border-zinc-900 leading-relaxed">
                                    {selectedDetailCandidate.summary}
                                </p>
                            </div>

                            {/* Strengths & Weaknesses Grids */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                                    <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100 font-bold text-[9px] uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-900 pb-2">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        Key Strengths / Competencies
                                    </div>
                                    <ul className="space-y-2.5">
                                        {selectedDetailCandidate.strengths && selectedDetailCandidate.strengths.map((s, i) => (
                                            <li key={i} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                                                <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[9px] mt-0.5 font-bold">0{i+1}</span>
                                                <span className="leading-snug font-medium">{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                                    <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-zinc-100 font-bold text-[9px] uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-900 pb-2">
                                        <AlertCircle size={12} className="text-amber-500" />
                                        Areas For Growth
                                    </div>
                                    <ul className="space-y-2.5">
                                        {selectedDetailCandidate.weaknesses && selectedDetailCandidate.weaknesses.map((w, i) => (
                                            <li key={i} className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                                                <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[9px] mt-0.5 font-bold">0{i+1}</span>
                                                <span className="leading-snug font-medium">{w}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Verdict Section */}
                            <div className="flex items-center justify-between gap-4 p-4 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg">
                                <div className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em]">
                                    <Trophy size={14} className="text-emerald-500" />
                                    <span>Verdict: {selectedDetailCandidate.verdict}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-60">
                                    <Activity size={10} /> Conf. 98.4%
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30 shrink-0">
                            <button 
                                onClick={() => setSelectedDetailCandidate(null)}
                                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded transition-all"
                            >
                                Close Details
                            </button>

                            <div className="flex items-center gap-2">
                                {selectedDetailCandidate.score >= 80 ? (
                                    <>
                                        <button 
                                            onClick={() => {
                                                handleStartOnboarding(selectedDetailCandidate);
                                                setSelectedDetailCandidate(null);
                                            }}
                                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-md shadow-emerald-500/10 transition-all"
                                        >
                                            <UserPlus size={12} /> Onboard Member
                                        </button>
                                        <button 
                                            onClick={() => {
                                                handleDeleteSingle(selectedDetailCandidate.id);
                                                setSelectedDetailCandidate(null);
                                            }}
                                            className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 rounded transition-all"
                                            title="Discard Candidate"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            handleDeleteSingle(selectedDetailCandidate.id);
                                            setSelectedDetailCandidate(null);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest rounded transition-all"
                                    >
                                        <Trash2 size={12} /> Discard Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
                confirmText={confirmState.confirmText}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default AIScreener;
