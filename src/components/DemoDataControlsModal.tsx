import React, { useState } from 'react';
import {
  X,
  Database,
  Sparkles,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Layers,
  Users,
  Car,
  GitFork,
  CreditCard,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  Eraser,
  CheckSquare,
  HardDrive,
} from 'lucide-react';
import { StreamlineMode, CaravanGroup, TravelPod, ForkedRoadtrip } from '../types';

interface DemoDataControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoDataOn: boolean;
  onToggleDemoData: (enabled: boolean) => void;
  isLocalModeEnabled?: boolean;
  onToggleLocalMode?: (enabled: boolean) => void;
  onSeedDemoData: () => void;
  onCleanAllDemoData: () => void;
  onClearAllBookings: () => void;
  onResetAllData: () => void;
  currentStreamlineMode: StreamlineMode;
  onSelectStreamlineMode: (mode: StreamlineMode) => void;
  caravanGroup: CaravanGroup;
  travelPod: TravelPod;
  forkedRoadtrip: ForkedRoadtrip;
  onOpenCheckoutDemo: () => void;
  onOpenItinerary: () => void;
  onOpenProfile: () => void;
  bookingsCount: number;
  propertiesCount: number;
  totalEventsCount?: number;
  onClearAllPropertiesAndEvents?: () => void;
  onRestoreCleanCatalog?: () => void;
}

export const DemoDataControlsModal: React.FC<DemoDataControlsModalProps> = ({
  isOpen,
  onClose,
  isDemoDataOn,
  onToggleDemoData,
  isLocalModeEnabled = false,
  onToggleLocalMode,
  onSeedDemoData,
  onCleanAllDemoData,
  onClearAllBookings,
  onResetAllData,
  currentStreamlineMode,
  onSelectStreamlineMode,
  caravanGroup,
  travelPod,
  forkedRoadtrip,
  onOpenCheckoutDemo,
  onOpenItinerary,
  onOpenProfile,
  bookingsCount,
  propertiesCount,
  totalEventsCount = 14,
  onClearAllPropertiesAndEvents,
  onRestoreCleanCatalog,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [showClearCatalogConfirm, setShowClearCatalogConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div
      id="demo-data-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F3] w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-[#D5CCBA] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#1C2C19] text-white flex items-center justify-between border-b border-[#2A3F26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D5A27] text-[#A8D59D] flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C86446] text-white tracking-wider uppercase">
                  Developer & Tester
                </span>
                <span className="text-xs text-[#A8BAA4]">
                  {propertiesCount} Stops · {bookingsCount} Bookings
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-white mt-0.5">
                Demo & Seed Data Controls
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close demo controls"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if triggered */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-[#1C2C19]">
          {/* SECTION 0: LOCAL-ONLY MODE TOGGLE (DEFAULT OFF) */}
          {onToggleLocalMode && (
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2DAC9] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#2D5A27]" />
                    <h3 className="font-bold text-sm text-[#1C2C19]">Local-Only Mode</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isLocalModeEnabled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isLocalModeEnabled ? '● LOCAL MODE ON' : '○ LOCAL MODE OFF (Default)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5D6E5A] mt-1 leading-relaxed">
                    {isLocalModeEnabled
                      ? 'Local Mode is visible. Footer guide link, on-device JSON export, and offline tour passes are exposed.'
                      : 'Local Mode is hidden behind settings by default. The UI displays clean cloud & guest passes.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-[#F4EFE6] p-1 rounded-xl border border-[#D5CCBA]">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLocalMode(true);
                      triggerFeedback('Local Mode enabled (visible across tour).');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      isLocalModeEnabled
                        ? 'bg-[#2D5A27] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLocalMode(false);
                      triggerFeedback('Local Mode turned OFF (hidden by default).');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      !isLocalModeEnabled
                        ? 'bg-[#C86446] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>OFF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: MASTER DEMO DATA TOGGLE (ON / OFF) */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2DAC9] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2D5A27]" />
                  <h3 className="font-bold text-sm text-[#1C2C19]">Demo Data Master State</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDemoDataOn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isDemoDataOn ? '● DEMO DATA ON (Seeded)' : '○ DEMO DATA OFF (Clean Slate)'}
                  </span>
                </div>
                <p className="text-xs text-[#5D6E5A] mt-1 leading-relaxed">
                  {isDemoDataOn
                    ? 'Sample tour passes, demo bookings, and roadtrip stop seeds are actively loaded for testing.'
                    : 'Clean slate mode active. Sample bookings and mock passes are cleared so you can test authentic zero-data state.'}
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-[#F4EFE6] p-1 rounded-xl border border-[#D5CCBA]">
                <button
                  type="button"
                  onClick={() => {
                    onToggleDemoData(true);
                    triggerFeedback('Demo data enabled & seeded successfully.');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    isDemoDataOn
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ON (Seeded)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleDemoData(false);
                    triggerFeedback('Demo data turned OFF. Clean slate activated.');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    !isDemoDataOn
                      ? 'bg-[#C86446] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>OFF (Clean)</span>
                </button>
              </div>
            </div>

            {/* Quick Actions for Seeded & Clean Data */}
            <div className="pt-3 border-t border-[#EFE9DC] grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSeedDemoData();
                  triggerFeedback('Demo bookings, tour stops & companions restored.');
                }}
                className="p-2.5 bg-[#FAF6EE] hover:bg-[#F0E8D9] border border-[#D5CCBA] text-[#2D5A27] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C86446]" />
                <span>Re-Seed Demo Data</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClearAllBookings();
                  triggerFeedback('All active bookings cleared to 0.');
                }}
                className="p-2.5 bg-[#FAF6EE] hover:bg-[#FEECEB] hover:text-red-700 border border-[#D5CCBA] text-stone-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Trash2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Clear Bookings Only</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!showCleanConfirm) {
                    setShowCleanConfirm(true);
                  } else {
                    onCleanAllDemoData();
                    setShowCleanConfirm(false);
                    triggerFeedback('Cleaned every piece of demo data (bookings, rosters, chats, passes).');
                  }
                }}
                className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  showCleanConfirm
                    ? 'bg-red-600 text-white border-red-700 animate-pulse'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{showCleanConfirm ? 'Confirm Clean Slate' : 'Clean All Demo Data'}</span>
              </button>
            </div>

            {/* Optional Deep Clean: Zero Stops & Events Catalog */}
            {(onClearAllPropertiesAndEvents || onRestoreCleanCatalog) && (
              <div className="pt-2 border-t border-[#EFE9DC] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-[#52634F] text-[11px]">
                  <strong>Want zero listings?</strong> Clear or restore the entire farm stops & event workshops catalog:
                </span>
                <div className="flex items-center gap-2">
                  {propertiesCount > 0 && onClearAllPropertiesAndEvents && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!showClearCatalogConfirm) {
                          setShowClearCatalogConfirm(true);
                        } else {
                          onClearAllPropertiesAndEvents();
                          setShowClearCatalogConfirm(false);
                          triggerFeedback('All properties and event sessions cleared to 0 (empty database).');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        showClearCatalogConfirm
                          ? 'bg-red-600 text-white border-red-700 animate-pulse'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{showClearCatalogConfirm ? 'Confirm 0 Stops & Events' : 'Clear Stops & Events (0 Listings)'}</span>
                    </button>
                  )}
                  {propertiesCount === 0 && onRestoreCleanCatalog && (
                    <button
                      type="button"
                      onClick={() => {
                        onRestoreCleanCatalog();
                        triggerFeedback('Restored pristine 6 farm stops with clean 0-attendee events.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#2D5A27] text-white hover:bg-[#20401B] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#A8D59D]" />
                      <span>Restore Clean Stops & Events Catalog</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Itemized Demo Data Audit & Status */}
            <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#E8DFC9] text-xs space-y-2">
              <div className="flex items-center justify-between text-[#1C2C19] font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#2D5A27]" />
                  <span>Demo Data Footprint & Cleaning Audit</span>
                </span>
                <span className="text-[11px] font-normal text-stone-600">
                  {isDemoDataOn ? 'Active Demo Artifacts' : 'All Clean (Zero Demo Data)'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#4A5D46]">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Sample Bookings & Slips:</span>
                  <span className="font-semibold text-[#1C2C19]">{bookingsCount} bookings</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Event Workshop Rosters:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {isDemoDataOn ? 'Seeded attendees (spots filled)' : '0 registered (all spots open)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Itinerary Stops & Events:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {isDemoDataOn ? '2 pre-selected stops' : '0 stops (clean)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Tour Stops & Sessions Catalog:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {propertiesCount === 0
                      ? '0 stops & 0 events (clean slate)'
                      : `${propertiesCount} stops • ${totalEventsCount} sessions`}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Community Tour & Event Chats:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {isDemoDataOn ? 'Mock chat messages loaded' : '0 messages (clean)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Demo Guest & Whānau Pass:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {isDemoDataOn ? 'Jessica Blomfield (whānau pass)' : 'Blank Traveler'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Caravan / Convoy Demo:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {isDemoDataOn ? `${caravanGroup.companionName || 'Alex Rivers'} convoy` : 'Blank Convoy'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E5DAC6]">
                  <span>Travel Pod & Vehicle:</span>
                  <span className="font-semibold text-[#1C2C19]">
                    {isDemoDataOn ? 'Toyota Hiace & Taylor Quinn' : 'Blank Pod'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#7A8C77] leading-relaxed">
                <strong>Includes events:</strong> All demo event bookings and workshop attendee counts are wiped clean to 0 (freeing all event capacities on all host dashboards) while maintaining the pristine permaculture stops and workshop schedules for test bookings.
              </p>
            </div>
          </div>

          {/* SECTION 2: ARCHITECTURE STREAMLINE VARIATIONS (MOVED FROM OLD FOOTER BANNER) */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2DAC9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C86446]" />
                <h3 className="font-bold text-sm text-[#1C2C19]">
                  Travel Group Architecture Variations
                </h3>
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                Mode: <strong>{currentStreamlineMode}</strong>
              </span>
            </div>
            <p className="text-xs text-[#5D6E5A]">
              Switch how companions coordinate routes, independent cart checkouts, and split bank transfers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {/* Option 1: Unified / Companions Only */}
              <button
                type="button"
                id="demo-mode-unified-btn"
                onClick={() => {
                  onSelectStreamlineMode('unified');
                  triggerFeedback('Companions Only (Simplified) mode activated.');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentStreamlineMode === 'unified'
                    ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-1 ring-[#2D5A27]'
                    : 'bg-[#FAF8F3] border-[#E2DAC9] hover:bg-[#F5EFE4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1C2C19] flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Companions Only
                    </span>
                    {currentStreamlineMode === 'unified' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-tight">
                    Simple companions only; manage companions and attendance with zero sharing complexity.
                  </p>
                </div>
              </button>

              {/* Option 2: Caravan */}
              <button
                type="button"
                id="demo-mode-caravan-btn"
                onClick={() => {
                  onSelectStreamlineMode('caravan');
                  triggerFeedback('Caravan Pass mode activated.');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentStreamlineMode === 'caravan'
                    ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-1 ring-[#2D5A27]'
                    : 'bg-[#FAF8F3] border-[#E2DAC9] hover:bg-[#F5EFE4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1C2C19] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Caravan Pass
                    </span>
                    {currentStreamlineMode === 'caravan' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-tight">
                    Shared route overlay via code ({caravanGroup.code}), separate carts &amp; bank slips.
                  </p>
                </div>
              </button>

              {/* Option 3: Travel Pods */}
              <button
                type="button"
                id="demo-mode-pods-btn"
                onClick={() => {
                  onSelectStreamlineMode('pods');
                  triggerFeedback('Travel Pods mode activated.');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentStreamlineMode === 'pods'
                    ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-1 ring-[#2D5A27]'
                    : 'bg-[#FAF8F3] border-[#E2DAC9] hover:bg-[#F5EFE4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1C2C19] flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Travel Pods
                    </span>
                    {currentStreamlineMode === 'pods' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-tight">
                    Shared vehicle/pitch with per-attendee session checkboxes in checkout.
                  </p>
                </div>
              </button>

              {/* Option 4: Roadtrip Forking */}
              <button
                type="button"
                id="demo-mode-forking-btn"
                onClick={() => {
                  onSelectStreamlineMode('forking');
                  triggerFeedback('Roadtrip Forking mode activated.');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentStreamlineMode === 'forking'
                    ? 'bg-[#2D5A27]/10 border-[#2D5A27] ring-1 ring-[#2D5A27]'
                    : 'bg-[#FAF8F3] border-[#E2DAC9] hover:bg-[#F5EFE4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1C2C19] flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Roadtrip Forking
                    </span>
                    {currentStreamlineMode === 'forking' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-tight">
                    Playlist-style share code ({forkedRoadtrip.forkCode}) for 1-click merging missing stops.
                  </p>
                </div>
              </button>
            </div>

            {/* Test Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCheckoutDemo();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#C86446] hover:bg-[#B5573B] text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Test Checkout & Split Slips</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenItinerary();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#A8D59D]" />
                <span>Inspect Roadtrip Itinerary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="px-3 py-1.5 rounded-lg border border-[#D5CCBA] bg-[#FAF6EE] hover:bg-[#F0E8D9] text-[#1C2C19] font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Passes & Variations</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: FACTORY RESET LOCAL STORAGE */}
          <div className="p-4 bg-[#FAF3EC] rounded-2xl border border-[#E8D5C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#8C3E26] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Factory Reset Local Device Storage</span>
              </span>
              <p className="text-[11px] text-[#7A5B4D] mt-0.5">
                Clears all custom stops, manual bookings, and cached preferences on this device.
              </p>
            </div>

            {showResetConfirm ? (
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setShowResetConfirm(false);
                    triggerFeedback('All local storage cleared & reset to factory defaults.');
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Yes, Wipe Everything
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 bg-[#C86446]/10 hover:bg-[#C86446]/20 text-[#C86446] border border-[#C86446]/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F2ECE0] border-t border-[#D5CCBA] flex items-center justify-between text-xs text-[#5D6E5A]">
          <span>This control panel is tucked away unobtrusively in the footer.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
