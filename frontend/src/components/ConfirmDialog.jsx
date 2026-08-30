import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const themes = {
        danger: {
            icon: <Trash2 className="size-6 text-red-600" />,
            iconBg: 'bg-red-50 dark:bg-red-950/30',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
            border: 'border-red-100 dark:border-red-900/30'
        },
        info: {
            icon: <AlertCircle className="size-6 text-emerald-600" />,
            iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
            button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
            border: 'border-emerald-100 dark:border-emerald-900/30'
        }
    };

    const theme = themes[type] || themes.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 w-full h-full bg-zinc-900/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />
            
            {/* Modal */}
            <div className={`relative w-full max-w-md bg-white dark:bg-zinc-950 border ${theme.border} rounded-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200`}>
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 transition-colors"
                >
                    <X className="size-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-md ${theme.iconBg} mb-4`}>
                        {theme.icon}
                    </div>
                    
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md transition-all uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 text-[10px] font-bold text-white ${theme.button} shadow-lg rounded-md transition-all active:scale-[0.98] uppercase tracking-widest`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
