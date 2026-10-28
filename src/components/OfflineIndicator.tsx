import React, { useEffect, useState } from 'react';
import { WifiOff, Radio, ShieldCheck } from 'lucide-react';

interface OfflineIndicatorProps {
  isLocalModeEnabled?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isLocalModeEnabled = false }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showSimulatedNotice, setShowSimulatedNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <aside
          aria-label="Offline Mode Notification"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-[#C86446] px-4 py-2 text-xs font-semibold text-white shadow-xl border border-white/20 animate-bounce"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Rural Off-Grid Mode: Cached Tour Data Active</span>
        </aside>
      )}

      {isLocalModeEnabled && showSimulatedNotice && (
        <aside
          aria-label="Offline Simulation Notification"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#2D5A27] text-white px-4 py-2.5 text-xs font-medium shadow-xl border border-white/20"
        >
          <ShieldCheck className="w-4 h-4 text-[#A8D59D]" />
          <span>All 2027 property directions and references saved to local storage!</span>
          <button
            onClick={() => setShowSimulatedNotice(false)}
            className="ml-2 text-white/80 hover:text-white underline text-[11px]"
          >
            Dismiss
          </button>
        </aside>
      )}
    </>
  );
};
