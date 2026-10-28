import React from 'react';
import {
  X,
  Sliders,
  HardDrive,
  CheckCircle2,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';

interface FooterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocalModeEnabled: boolean;
  onToggleLocalMode: (enabled: boolean) => void;
  onNavigateToLocalGuide?: () => void;
  isDemoDataOn?: boolean;
  onOpenDemoControls?: () => void;
}

export const FooterSettingsModal: React.FC<FooterSettingsModalProps> = ({
  isOpen,
  onClose,
  isLocalModeEnabled,
  onToggleLocalMode,
  onNavigateToLocalGuide,
  isDemoDataOn = false,
  onOpenDemoControls,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="footer-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="footer-settings-modal"
        className="bg-[#FAF8F3] w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl border border-[#D5CCBA] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#1C2C19] text-white flex items-center justify-between border-b border-[#2A3F26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D5A27] text-[#A8D59D] flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D5A27] text-[#A8D59D] tracking-wider uppercase">
                  Preferences
                </span>
                <span className="text-xs text-[#A8BAA4]">
                  Footer & System Settings
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-white mt-0.5">
                Tour & Application Settings
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-140px)]">
          {/* PRIMARY SETTING: LOCAL-ONLY MODE TOGGLE */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0D8C8] shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isLocalModeEnabled
                      ? 'bg-[#2D5A27] text-[#A8D59D]'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold font-display text-[#1C2C19]">
                      Local-Only Mode
                    </h3>
                    <span
                      id="local-mode-status-badge"
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isLocalModeEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {isLocalModeEnabled ? 'Enabled' : 'Disabled (Default)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5D6E5A] mt-1 leading-relaxed">
                    Controls whether local-only mode pages, guides, device-only guest pass tools,
                    and on-device backup options are exposed across the tour.
                  </p>
                </div>
              </div>

              {/* Interactive Toggle Switch */}
              <button
                id="footer-settings-local-mode-toggle"
                role="switch"
                aria-checked={isLocalModeEnabled}
                onClick={() => onToggleLocalMode(!isLocalModeEnabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27] focus:ring-offset-2 ${
                  isLocalModeEnabled ? 'bg-[#2D5A27]' : 'bg-stone-300'
                }`}
                title={`Toggle Local-Only Mode (${isLocalModeEnabled ? 'Currently ON' : 'Currently OFF'})`}
              >
                <span className="sr-only">Toggle Local Mode</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isLocalModeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Explanatory Info Card based on state */}
            {isLocalModeEnabled ? (
              <div className="p-4 rounded-xl bg-[#F0F6EF] border border-[#C5DDC2] space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D5A27]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Local Mode Active & Visible</span>
                </div>
                <p className="text-xs text-[#3E523A] leading-relaxed">
                  The Local & Privacy Guide, on-device JSON export/import backup utilities,
                  and device-only tour pass options are now visible and accessible.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {onNavigateToLocalGuide && (
                    <button
                      type="button"
                      id="settings-open-local-guide-btn"
                      onClick={() => {
                        onClose();
                        onNavigateToLocalGuide();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Open Local & Privacy Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="text-[11px] text-[#556D51]">
                    Visible in footer navigation: <strong>Local & Privacy</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2 font-semibold text-stone-700">
                  <Info className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Hidden by Default (Tucked Away)</span>
                </div>
                <p className="leading-relaxed text-stone-500">
                  All local mode pages, navigation links, and device-only prompts are hidden
                  from the main tour interface. The app behaves seamlessly with standard
                  cloud authentication and guest passes.
                </p>
              </div>
            )}
          </div>



          {/* SECONDARY SETTING: DEVELOPER & DEMO DATA CONTROLS */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0D8C8] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Database className="w-4 h-4 text-[#C86446]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C2C19]">
                    Demo & Seed Catalog Controls
                  </h4>
                  <p className="text-[11px] text-[#5D6E5A]">
                    Simulate realistic rural roadtrip bookings, demo chat & convoy groups.
                  </p>
                </div>
              </div>

              {onOpenDemoControls && (
                <button
                  type="button"
                  id="settings-open-demo-controls-btn"
                  onClick={() => {
                    onClose();
                    onOpenDemoControls();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#D5CCBA] hover:bg-[#F4EFE6] text-xs font-semibold text-[#1C2C19] transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3 text-[#5D6E5A]" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6F7E6B] pt-1 border-t border-[#F0EAE0]">
              <span className="font-mono text-[11px]">
                Demo Data Status: <strong>{isDemoDataOn ? 'ON' : 'OFF'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F2EDE2] border-t border-[#E2DAC9] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#71826E]">
            Settings persist automatically in your browser.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
