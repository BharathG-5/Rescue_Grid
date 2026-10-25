import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className={`flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold transition whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
        title="Install RescueGrid for offline field operations"
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
        <span>{isIOS ? 'Install on iOS' : 'Install PWA'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold">Install RescueGrid Offline App</h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-600 space-y-2 leading-relaxed">
              {isIOS ? (
                <>
                  <p>1. Tap the <strong>Share</strong> button in your Safari toolbar.</p>
                  <p>2. Scroll down and select <strong>Add to Home Screen</strong>.</p>
                  <p>3. Launch RescueGrid from your home screen for full offline capability.</p>
                </>
              ) : (
                <>
                  <p>
                    RescueGrid caches its application shell via a Service Worker and persists reports locally in IndexedDB.
                  </p>
                  <p>
                    To install as a standalone desktop or mobile app, open the browser address bar menu and choose <strong>Install RescueGrid</strong> or <strong>Add to Home Screen</strong>.
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
