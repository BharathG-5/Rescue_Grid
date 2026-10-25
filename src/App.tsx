import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { ReportEmergency } from './pages/ReportEmergency';
import { DraftReports } from './pages/DraftReports';
import { IncidentManagement } from './pages/IncidentManagement';
import { LiveMapPage } from './pages/LiveMapPage';
import { RescueTeams } from './pages/RescueTeams';
import { VolunteerManagement } from './pages/VolunteerManagement';
import { ResourceManagement } from './pages/ResourceManagement';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WifiOff } from 'lucide-react';

const MainShell: React.FC = () => {
  const { currentPage, isOnline, pendingSyncCount, setCurrentPage, isLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="py-20 text-center text-sm text-slate-500 font-medium">
          Loading RescueGrid IndexedDB Emergency Store...
        </div>
      );
    }

    switch (currentPage) {
      case 'overview':
        return <OverviewDashboard />;
      case 'report':
        return <ReportEmergency />;
      case 'drafts':
        return <DraftReports />;
      case 'incidents':
        return <IncidentManagement />;
      case 'map':
        return <LiveMapPage />;
      case 'teams':
        return <RescueTeams />;
      case 'volunteers':
        return <VolunteerManagement />;
      case 'resources':
        return <ResourceManagement />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Persistent Offline Warning Bar when disconnected */}
      {!isOnline && (
        <div
          className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Reports and workflow changes are saved locally in IndexedDB ({pendingSyncCount} pending sync). Offline reports have <strong>not</strong> reached a live rescue team.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage('settings')}
            className="font-bold underline hover:text-amber-800 whitespace-nowrap"
          >
            Manage Offline &amp; Sync Queue
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        <Sidebar isMobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {renderPage()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
