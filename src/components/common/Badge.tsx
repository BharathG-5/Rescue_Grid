import React from 'react';
import { SeverityLevel, IncidentStatus, VerificationState } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'severity' | 'status' | 'verification' | 'neutral' | 'skill';
  severity?: SeverityLevel;
  status?: IncidentStatus;
  verification?: VerificationState;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  severity,
  status,
  verification,
  className = ''
}) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'severity' || severity) {
    const target = severity || label;
    if (target === 'Critical') colorClasses = 'bg-red-50 text-red-700 border-red-200 font-bold';
    else if (target === 'High') colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
    else if (target === 'Medium') colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-200 font-medium';
    else if (target === 'Low') colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
  } else if (variant === 'status' || status) {
    const target = status || label;
    if (target === 'New') colorClasses = 'bg-sky-50 text-sky-800 border-sky-200 font-medium';
    else if (target === 'Pending Review') colorClasses = 'bg-purple-50 text-purple-800 border-purple-200 font-medium';
    else if (target === 'Verified') colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
    else if (target === 'Unverified') colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    else if (target === 'Assigned') colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold';
    else if (target === 'In Progress') colorClasses = 'bg-blue-600 text-white border-blue-700 font-semibold';
    else if (target === 'Resolved') colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
    else if (target === 'Failed') colorClasses = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
  } else if (variant === 'verification' || verification) {
    const target = verification || label;
    if (target === 'Verified') colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
    else if (target === 'Pending') colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    else if (target === 'Unverified') colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
  } else if (variant === 'skill') {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border whitespace-nowrap shrink-0 ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
};
