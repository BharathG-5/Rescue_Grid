import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  ArrowRight,
  X,
  Info
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
    navigateToIncidentDetails
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationItem['type']>('all');

  const filtered = notifications.filter(
    (n) => categoryFilter === 'all' || n.type === categoryFilter
  );

  const categories: { id: 'all' | NotificationItem['type']; label: string }[] = [
    { id: 'all', label: 'All Alerts' },
    { id: 'critical', label: 'New Reports' },
    { id: 'assignment', label: 'Assignments' },
    { id: 'status', label: 'Status Changes' },
    { id: 'resource', label: 'Resource Shortages' },
    { id: 'sync', label: 'Sync Results' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              In-App Notifications Center
            </h1>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              LOCAL DEMO ALERTS
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            In frontend-only demo mode, notifications are local in-app demonstrations persisted in IndexedDB and do not represent external push or SMS dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            disabled={notifications.every((n) => n.read)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Mark All Read</span>
          </button>
          <button
            type="button"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-40 text-red-700 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h2 className="font-bold text-slate-800 text-sm">No Notifications in This Category</h2>
          <p className="text-xs text-slate-500 mt-1">
            New reports, status transitions, resource alerts, and sync outcomes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-white border-slate-200 text-slate-600'
                  : 'bg-blue-50/40 border-blue-300 text-slate-900 shadow-xs'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  <span className="text-slate-400">·</span>
                  <span className="uppercase text-[10px] font-semibold text-slate-500">
                    {n.type}
                  </span>
                  {!n.read && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="text-[11px] font-mono tabular-nums text-slate-400 flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.linkId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(n.id);
                      navigateToIncidentDetails(n.linkId!);
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Inspect {n.linkId}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  aria-label="Clear notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
