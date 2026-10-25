import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FilePlus2,
  FileEdit,
  AlertTriangle,
  Map,
  Radio,
  HeartHandshake,
  Box,
  BarChart3,
  Bell,
  Settings,
  Database
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentPage, setCurrentPage, drafts, incidents, notifications, pendingSyncCount } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const criticalCount = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length;

  const navigationItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'Report Emergency', icon: FilePlus2, highlight: true },
    {
      id: 'drafts',
      label: 'Draft Reports',
      icon: FileEdit,
      count: drafts.length > 0 ? String(drafts.length) : undefined
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      icon: AlertTriangle,
      count: criticalCount > 0 ? `${criticalCount} Crit` : undefined,
      isUrgent: criticalCount > 0
    },
    { id: 'map', label: 'Live Emergency Map', icon: Map },
    { id: 'teams', label: 'Rescue Teams', icon: Radio },
    { id: 'volunteers', label: 'Volunteer Management', icon: HeartHandshake },
    { id: 'resources', label: 'Resource Management', icon: Box },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      count: unreadNotifs > 0 ? String(unreadNotifs) : undefined
    },
    {
      id: 'settings',
      label: 'Settings & Offline Status',
      icon: Settings,
      count: pendingSyncCount > 0 ? `${pendingSyncCount} Sync` : undefined
    }
  ];

  const handleNav = (id: string) => {
    setCurrentPage(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B132B] text-slate-300 border-r border-slate-800 select-none">
      {/* Tagline Subheader */}
      <div className="px-4 py-3.5 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-blue-400 tracking-wide">
          Disaster Response Coordination
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Every Second Matters. Every Life Counts.
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : item.highlight
                  ? 'bg-red-600/15 text-red-300 hover:bg-red-600/25 border border-red-500/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-red-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={`font-mono tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    item.isUrgent
                      ? 'bg-red-600 text-white'
                      : isActive
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Local Persistence Notice */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>IndexedDB Offline Store</span>
        </div>
        <p className="text-[11px] leading-snug text-slate-400">
          Sample records are labeled <strong className="text-slate-200">DEMO DATA</strong>. Changes persist across browser refreshes.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {navContent}
      </aside>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
