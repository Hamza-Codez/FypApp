import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users, ArrowRightIcon } from "lucide-react";

// Colors for charts and priorities
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const PRIORITY_COLORS = {
    LOW: "text-red-600 bg-red-200 dark:text-red-500 dark:bg-red-600",
    MEDIUM: "text-blue-600 bg-blue-200 dark:text-blue-500 dark:bg-blue-600",
    HIGH: "text-emerald-600 bg-emerald-200 dark:text-emerald-500 dark:bg-emerald-600",
};

const ProjectAnalytics = ({ project, tasks }) => {
    const { stats, statusData } = useMemo(() => {
        const stats = {
            total: tasks.length * 1,
            completed: 0,
            inProgress: 0,
            todo: 0,
        };

        const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };

        tasks.forEach((t) => {
            if (t.status === "DONE") stats.completed++;
            if (t.status === "IN_PROGRESS") stats.inProgress++;
            if (t.status === "TODO") stats.todo++;
            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({ name: k.replace("_", " "), value: v })),
        };
    }, [tasks]);

    const completionRate = stats.total > 0 ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0;

    const metrics = [
        {
            label: "Completion Rate",
            value: `${completionRate}%`,
            color: "text-emerald-600 dark:text-emerald-400",
            icon: <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />,
            bg: "bg-emerald-200 dark:bg-emerald-500/10",
        },
        {
            label: "Active Tasks",
            value: stats.inProgress,
            color: "text-blue-600 dark:text-blue-400",
            icon: <Clock className="size-5 text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-200 dark:bg-blue-500/10",
        },
        {
            label: "Team Size",
            value: project?.assigned_to?.length || 0,
            color: "text-purple-600 dark:text-purple-400",
            icon: <Users className="size-5 text-purple-600 dark:text-purple-400" />,
            bg: "bg-purple-200 dark:bg-purple-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">{m.label}</p>
                                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${m.bg}`}>{m.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
                <h2 className="text-xl font-bold dark:text-white mb-8">Task Distribution</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;
