import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'minimal' | 'full' }> = ({ variant = 'minimal' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled || justInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#2D5A27] bg-[#E8F0E6] rounded-full">
        <Check className="w-3.5 h-3.5" />
        Offline App Ready
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) setJustInstalled(true);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback instructions modal for browsers like Safari desktop or Firefox
      setShowIOSGuide(true);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        title="Install for rural offline access in low cellular coverage areas"
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition cursor-pointer ${
          variant === 'full'
            ? 'px-4 py-2 text-sm bg-[#3F6B38] text-white hover:bg-[#2D5A27] shadow-sm'
            : 'px-3 py-1.5 text-xs text-[#2D5A27] bg-[#E8F0E6] hover:bg-[#D5E5D1] border border-[#2D5A27]/20'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-[#2D5A27]" />
        <span>Install PWA (Off-Grid)</span>
      </button>

      {showIOSGuide && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#FBF8F3] border border-[#E0D8C8] p-5 shadow-xl z-30 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8F0E6] flex items-center justify-center text-[#2D5A27]">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-display text-[#1C2C19]">Install for Rural Roadtrip</h3>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="p-1 rounded-full text-[#63725F] hover:bg-[#EBE4D5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#4E5C4A] leading-relaxed">
            Install this app to access all host arrival directions, gate codes, and transfer reference numbers completely offline when in weak cellular reception.
          </p>
          <div className="mt-3 p-2.5 bg-white rounded-xl border border-[#E6DFC5] text-[11px] text-[#354332] space-y-1.5">
            <p><strong>iPhone / iPad (Safari):</strong> Tap <strong>Share</strong> &gt; <strong>Add to Home Screen</strong>.</p>
            <p><strong>Android (Chrome):</strong> Tap menu (3 dots) &gt; <strong>Install app</strong>.</p>
          </div>
          <button
            onClick={() => setShowIOSGuide(false)}
            className="mt-3 w-full rounded-xl bg-[#2D5A27] py-2 text-xs font-semibold text-white hover:bg-[#20401B] transition cursor-pointer"
          >
            Got it, Kia Ora!
          </button>
        </div>
      )}
    </div>
  );
};
