import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-xs transition-opacity duration-150 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-950'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          </div>
          <div className="flex-1 font-medium leading-relaxed">{toast.text}</div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 opacity-70 hover:opacity-100 p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
