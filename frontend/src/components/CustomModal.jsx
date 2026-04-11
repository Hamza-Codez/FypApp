import React, { useState, useEffect } from "react";
import { X, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";

export default function CustomModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = "confirm", // "confirm" or "prompt"
  defaultValue = "",
  placeholder = "Enter here...",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "blue" // "blue", "red", "emerald"
}) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(type === "prompt" ? inputValue : true);
    onClose();
  };

  const colors = {
    blue: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      text: "text-blue-600",
      light: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800/40",
      icon: <HelpCircle className="size-5 text-blue-600 dark:text-blue-400" />
    },
    red: {
      bg: "bg-red-600",
      hover: "hover:bg-red-700",
      text: "text-red-600",
      light: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-100 dark:border-red-800/40",
      icon: <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
    },
    emerald: {
      bg: "bg-emerald-600",
      hover: "hover:bg-emerald-700",
      text: "text-emerald-600",
      light: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800/40",
      icon: <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
    }
  };

  const theme = colors[variant] || colors.blue;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl shadow-zinc-950/20 dark:shadow-none animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-md ${theme.light} ${theme.border} border shrink-0`}>
                {theme.icon}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
                  {message}
                </p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {type === "prompt" && (
              <div className="mt-6">
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-3 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none transition-all uppercase tracking-widest"
                />
              </div>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-md ${theme.bg} ${theme.hover} text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-zinc-950/10 active:scale-[0.98] transition-all`}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
