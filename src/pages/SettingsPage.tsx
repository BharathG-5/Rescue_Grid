import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Download,
  RotateCcw,
  Server,
  Eye,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    isOnline,
    manualOnlineOverride,
    setIsOnlineManualOverride,
    simulateSyncFailure,
    setSimulateSyncFailure,
    syncQueue,
    pendingSyncCount,
    lastSyncTime,
    triggerManualSync,
    backendUrl,
    setBackendUrl,
    incidents,
    drafts,
    reduceMotion,
    setReduceMotion,
    highContrast,
    setHighContrast,
    language,
    setLanguage,
    resetToDemoData,
    exportDataJson,
    showToast
  } = useApp();

  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputUrl.trim();
    setBackendUrl(cleaned);
    localStorage.setItem('rescuegrid_backend_url', cleaned);
    showToast(
      cleaned
        ? `Backend API endpoint configured: ${cleaned}`
        : 'Backend API endpoint cleared (running in standalone local IndexedDB mode).',
      'info'
    );
  };

  const handleDownloadJson = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rescuegrid_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported all local IndexedDB stores as JSON.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings, Offline Status & System Architecture
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Inspect offline synchronization queues, test network disconnects, configure accessibility, and export local stores.
          </p>
        </div>
        <PWAInstallButton />
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Connectivity State</span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {isOnline ? 'Online' : 'Offline Mode Active'}
          </div>
          <div className="text-[11px] text-slate-500">
            {manualOnlineOverride !== null ? 'Controlled via Simulator Override' : 'Following browser navigator.onLine'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Locally Saved Reports</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums text-slate-900">
            {incidents.length} Incidents · {drafts.length} Drafts
          </div>
          <div className="text-[11px] text-slate-500">
            Persisted in browser IndexedDB (`rescuegrid_offline_db`)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Sync Queue</span>
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold font-mono tabular-nums text-slate-900">
            {pendingSyncCount} Pending Item{pendingSyncCount === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-slate-500">
            Last sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Offline & Failed Sync Testing Controls */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Offline Mode & Synchronization Resilience Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Test creating reports while offline and verify that failed synchronizations preserve all queued reports without data loss.
            </p>
          </div>
          <button
            type="button"
            onClick={triggerManualSync}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition self-start whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Attempt Sync Now ({pendingSyncCount})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="font-bold text-slate-900">1. Network Connectivity Mode</div>
            <p className="text-slate-600 leading-relaxed">
              Simulate losing internet connectivity in the field. Reports created while offline are marked <strong>Pending Sync</strong> and never falsely claim to have reached a rescue team.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOnlineManualOverride(null)}
                className={`px-3 py-1.5 rounded-lg font-semibold border ${
                  manualOnlineOverride === null
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Auto (Browser Default)
              </button>
              <button
                type="button"
                onClick={() => setIsOnlineManualOverride(true)}
                className={`px-3 py-1.5 rounded-lg font-semibold border ${
                  manualOnlineOverride === true
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Force Online
              </button>
              <button
                type="button"
                onClick={() => setIsOnlineManualOverride(false)}
                className={`px-3 py-1.5 rounded-lg font-semibold border ${
                  manualOnlineOverride === false
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Simulate Offline Disconnect
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="font-bold text-slate-900">2. Simulate Unreachable Backend (Sync Failure Test)</div>
            <p className="text-slate-600 leading-relaxed">
              Browser <code className="font-mono">navigator.onLine</code> does not guarantee the backend server is reachable. Enable this toggle to verify that a failed sync keeps all pending reports safely in the queue.
            </p>
            <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={simulateSyncFailure}
                onChange={(e) => setSimulateSyncFailure(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Simulate Backend HTTP 503 Failure on Sync Attempt
              </span>
            </label>
          </div>
        </div>

        {/* Active Sync Queue Inspection */}
        {syncQueue.length > 0 && (
          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Pending Synchronization Queue ({syncQueue.length} items with Idempotency Keys)</span>
            </div>
            <div className="divide-y divide-amber-200/60">
              {syncQueue.map((sq) => (
                <div key={sq.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{sq.idempotencyKey}</span>
                    <span className="ml-2 text-slate-600">Type: {sq.entityType}</span>
                    {sq.lastError && (
                      <div className="text-red-700 font-medium mt-0.5">{sq.lastError}</div>
                    )}
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-slate-600">
                    Retries: {sq.retryCount} · Status: <strong>{sq.status}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Backend Configuration & Accessibility Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Backend API Endpoint Configuration</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Connection State:{' '}
            <strong>
              {backendUrl
                ? isOnline && !simulateSyncFailure
                  ? `Configured (${backendUrl})`
                  : 'Configured — Unreachable / Offline'
                : 'Not Configured (Local IndexedDB Standalone Mode)'}
            </strong>
          </p>
          <form onSubmit={handleSaveEndpoint} className="space-y-3">
            <div>
              <label htmlFor="backend-url" className="block font-semibold text-slate-700 mb-1">
                Public Backend Synchronization URL (Optional)
              </label>
              <input
                id="backend-url"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://api.your-emergency-domain.org/v1/sync"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
            >
              Save Endpoint URL
            </button>
          </form>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            App Version: <span className="font-mono font-semibold text-slate-700">v1.0.0-offline-pwa</span> · Zero private API keys in client code.
          </div>
        </section>

        <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Accessibility & Display Preferences</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Reduced Motion Mode</div>
                <div className="text-[11px] text-slate-500">Minimize UI transitions and animations</div>
              </div>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <div className="font-bold text-slate-900">Enhanced Contrast Filter</div>
                <div className="text-[11px] text-slate-500">Boost contrast legibility for bright field conditions</div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
            </label>

            <div>
              <label htmlFor="lang-select" className="block font-semibold text-slate-700 mb-1">
                Interface Locale / Date Formatting
              </label>
              <select
                id="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="en-US">English (International / US)</option>
                <option value="en-GB">English (UK / 24h Metric)</option>
                <option value="hi-IN">English / India Regional Format</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* Data Export & Demo Data Reset */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h2 className="font-bold text-slate-900 text-sm">Local Data Backup & Demo Reset</h2>
          <p className="text-slate-600 mt-0.5">
            Export all locally stored incidents, drafts, teams, volunteers, and resources as JSON, or restore the original fictional DEMO seed dataset.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export Full JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </section>

      {/* Honest Transparency & Deployment Reference */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-700" />
          <h2 className="font-bold text-slate-900 text-sm">
            Local-Only vs. Backend Capabilities & Deployment Guide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Working Local-First Capabilities (No Backend Needed)</div>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>IndexedDB persistence across refreshes (`incidents`, `drafts`, `teams`, `volunteers`, `resources`, `sync_queue`)</li>
              <li>Browser Geolocation API with accuracy in metres & permission error handling</li>
              <li>Interactive OpenStreetMap Leaflet maps & coordinate grid offline fallback</li>
              <li>Idempotent offline sync queue & failure recovery without data loss</li>
              <li>Live Recharts analytics, CSV export, JSON export, and print-friendly layouts</li>
            </ul>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Requires Real Backend Service in Production</div>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Multi-user cross-device database synchronization (PostgreSQL / PostGIS)</li>
              <li>Actual SMS / VHF radio / push dispatch to external emergency responders</li>
              <li>Official government identity & medical license verification for volunteers</li>
              <li>Role-based authentication & server-enforced audit logs</li>
            </ul>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
          <div className="text-slate-400"># Run locally, build for production, or deploy to Vercel:</div>
          <div>npm install &amp;&amp; npm run dev</div>
          <div>npm run build &amp;&amp; npx vercel --prod</div>
        </div>
      </section>

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset All Stores to Initial DEMO DATA"
        message="This will clear your custom local incidents, drafts, and stock changes in IndexedDB and restore the initial fictional seed records. Continue?"
        confirmLabel="Reset Demo Data"
        variant="danger"
        onConfirm={async () => {
          await resetToDemoData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
