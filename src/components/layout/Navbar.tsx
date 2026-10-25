import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Search,
  UserCheck,
  Menu
} from 'lucide-react';

export const Navbar: React.FC<{ onToggleMobileMenu: () => void }> = ({ onToggleMobileMenu }) => {
  const {
    isOnline,
    pendingSyncCount,
    triggerManualSync,
    notifications,
    globalSearch,
    setGlobalSearch,
    setCurrentPage
  } = useApp();

  const [timeStr, setTimeStr] = useState<string>('');
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
          ' · ' +
          now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSyncClick = async () => {
    setSyncing(true);
    await triggerManualSync();
    setSyncing(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B132B] border-b border-slate-800 text-white">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg pr-1 whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap shrink-0">
              RescueGrid
            </span>
          </button>
        </div>

        {/* Zone 2: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              aria-label="Search incidents, teams, locations, or IDs"
              placeholder="Search incidents, teams, locations, ID..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Zone 3: System Status, Sync Count, Notifications & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs shrink-0">
          {/* Current Date & Time */}
          <div className="hidden xl:block font-mono tabular-nums text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 whitespace-nowrap shrink-0">
            {timeStr}
          </div>

          {/* Online/Offline Status */}
          <button
            type="button"
            onClick={() => setCurrentPage('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              isOnline
                ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/70'
                : 'bg-red-950/90 border-red-600 text-red-200 hover:bg-red-900'
            }`}
            title="Click to configure network & offline status"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </button>

          {/* Pending Synchronization Count & Trigger */}
          <button
            type="button"
            onClick={handleSyncClick}
            disabled={syncing}
            title={
              pendingSyncCount > 0
                ? `${pendingSyncCount} local report(s) pending synchronization`
                : 'All local changes synchronized'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              pendingSyncCount > 0
                ? 'bg-amber-950/80 border-amber-600 text-amber-200 hover:bg-amber-900/80'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Pending Sync:</span>
            <span className="font-mono tabular-nums font-bold">{pendingSyncCount}</span>
          </button>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => setCurrentPage('notifications')}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
            aria-label={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono tabular-nums font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile & Role */}
          <button
            type="button"
            onClick={() => setCurrentPage('settings')}
            className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-slate-800 text-left hover:opacity-90 whitespace-nowrap shrink-0"
            title="Coordinator Profile & System Settings"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-100 text-xs leading-tight">Anita Rao</div>
              <div className="text-[10px] text-slate-400 leading-tight">HQ Lead Coordinator</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
