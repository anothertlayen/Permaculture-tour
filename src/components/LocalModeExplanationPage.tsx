import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Cloud,
  WifiOff,
  Download,
  Upload,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Compass,
  FileJson,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  exportLocalDataAsJSON,
  importLocalDataFromJSON,
  resetAllLocalData,
  exportGuestCalendarIcs,
  getStoredBookings,
  getStoredProperties,
  getStoredItinerary,
  getStoredGuestProfile,
} from '../utils/storage';

interface LocalModeExplanationPageProps {
  onBackToExplore: () => void;
  onOpenAuthModal: () => void;
  onOpenItinerary: () => void;
  onOpenProfile: () => void;
  onRefreshData?: () => void;
}

export const LocalModeExplanationPage: React.FC<LocalModeExplanationPageProps> = ({
  onBackToExplore,
  onOpenAuthModal,
  onOpenItinerary,
  onOpenProfile,
  onRefreshData,
}) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const bookingsCount = getStoredBookings().length;
  const itineraryCount = getStoredItinerary().length;
  const guestProfile = getStoredGuestProfile();

  const handleExportJSON = () => {
    try {
      exportLocalDataAsJSON();
      setNotification({
        type: 'success',
        text: 'Local backup file downloaded! Keep this JSON file safe to restore your tour pass anytime.',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch {
      setNotification({ type: 'error', text: 'Failed to download local backup file.' });
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importLocalDataFromJSON(text);
        if (success) {
          setNotification({
            type: 'success',
            text: 'Tour pass and itinerary successfully restored from backup file!',
          });
          if (onRefreshData) onRefreshData();
          setTimeout(() => setNotification(null), 5000);
        } else {
          setNotification({
            type: 'error',
            text: 'Invalid backup file format. Please upload a valid Kiwi Permaculture Tour JSON file.',
          });
        }
      } catch {
        setNotification({
          type: 'error',
          text: 'Error reading backup file. Please try again.',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportICS = () => {
    const bookings = getStoredBookings();
    const props = getStoredProperties();
    if (bookings.length === 0) {
      setNotification({
        type: 'error',
        text: 'You do not have any registered tour passes yet. Add stops to your itinerary or book a pass first!',
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    exportGuestCalendarIcs(bookings, props, guestProfile.name || 'Permaculture Traveler');
    setNotification({
      type: 'success',
      text: 'Calendar (.ics) downloaded! Open it to import all your tour stops directly into Apple, Google, or Outlook Calendar.',
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleReset = () => {
    resetAllLocalData();
    setShowResetConfirm(false);
    setNotification({
      type: 'success',
      text: 'Local storage reset to default demo stops.',
    });
    if (onRefreshData) onRefreshData();
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Top Breadcrumb / Return */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToExplore}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2D5A27] hover:text-[#1E3E1A] bg-white px-3.5 py-2 rounded-xl border border-[#D5CCBA] shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Tour Stops</span>
        </button>

        {/* Current Active Mode Indicator */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 bg-[#EBF5E9] text-[#2D5A27] border border-[#BBDCB4] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs">
              <Cloud className="w-4 h-4 text-[#2D5A27]" />
              <span>
                Active Mode: <strong className="font-bold">Cloud Sync</strong> ({user.email})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#FAF4EB] text-[#8C4A32] border border-[#E8D0C3] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs">
              <HardDrive className="w-4 h-4 text-[#C86446]" />
              <span>
                Active Mode: <strong className="font-bold">Local-Only (No Registration)</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition border shadow-xs ${
            notification.type === 'success'
              ? 'bg-[#EBF5E9] text-[#204E1B] border-[#BBDCB4]'
              : 'bg-[#FDF2F0] text-[#9E2A1C] border-[#F4C7C2]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A27]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C86446]" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Hero Banner: Sovereign & Private Offline Permaculture Navigation */}
      <section className="bg-linear-to-br from-[#FAF6EE] via-[#F5EFE3] to-[#EDE5D5] rounded-3xl p-6 sm:p-10 border border-[#E2DAC9] shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D5A27] text-[#A8D59D] text-[11px] font-bold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Permaculture Principle: Value Diversity & Data Sovereignty</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#1C2C19] tracking-tight leading-tight">
          Local-Only Mode: Explore, Book & Travel Without Registration
        </h1>

        <p className="text-[#4E5F4A] text-sm sm:text-base leading-relaxed max-w-3xl">
          You are never forced to create an account, share an email, or sign in with Google to explore the 2027 Aotearoa Permaculture Tour.
          Everything you plan, customize, or book runs directly in your device’s browser sandbox and works entirely offline when travelling remote backcountry valleys.
        </p>

        {/* Quick Mode Status Actions */}
        <div className="pt-3 flex flex-wrap items-center gap-3">
          {!user ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#2D5A27] text-xs font-bold rounded-xl border border-[#D5CCBA] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                <span>You are completely private & unregistered right now</span>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF6EE] hover:bg-[#EAE2D2] text-[#3E4E3B] text-xs font-semibold rounded-xl border border-[#D5CCBA] transition cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Want multi-device cloud sync instead? Sign in</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF6EE] hover:bg-[#EAE2D2] text-[#8C4A32] text-xs font-bold rounded-xl border border-[#E8D0C3] transition cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-[#C86446]" />
                <span>Switch to Local-Only Mode (Sign Out of Cloud)</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* The 4 Pillars of Local Use */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1C2C19]">
          How Local-Only Mode Protects You & Your Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1C2C19]">On-Device Privacy</h3>
            <p className="text-xs text-[#5D6E5A] leading-relaxed">
              Your itinerary, travel pod members, and seed swap offerings are saved exclusively to your browser’s <code className="bg-[#FAF6EE] px-1 py-0.5 rounded text-[10px] text-[#2D5A27]">localStorage</code>. No analytics cookies or trackers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] text-[#C86446] flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1C2C19]">Backcountry Offline Ready</h3>
            <p className="text-xs text-[#5D6E5A] leading-relaxed">
              Aotearoa’s valleys, fjords, and bush tracks frequently have zero cellular coverage. Our Progressive Web App (PWA) caches all stop data and host maps on your phone.
            </p>
            <div className="pt-1">
              <PWAInstallButton variant="minimal" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5E9] text-[#2D5A27] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1C2C19]">Free Passes, Koha & Direct Support</h3>
            <p className="text-xs text-[#5D6E5A] leading-relaxed">
              Free guest passes, voluntary koha, and any payments are arranged directly with hosts. Zero platform fees.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] text-[#556651] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1C2C19]">Full Data Portability</h3>
            <p className="text-xs text-[#5D6E5A] leading-relaxed">
              You own your information. Export your tour pass anytime as an offline <code className="bg-[#FAF6EE] px-1 py-0.5 rounded text-[10px] text-[#2D5A27]">.json</code> backup file or an <code className="bg-[#FAF6EE] px-1 py-0.5 rounded text-[10px] text-[#2D5A27]">.ics</code> calendar file.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Local-Only vs Cloud Sync */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DAC9] shadow-xs space-y-6">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1C2C19]">
            Detailed Comparison: Local Mode vs. Cloud Sync
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6E59] mt-1">
            Choose the approach that matches your privacy preferences and travel style. You can seamlessly switch between them at any time.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E0D2] bg-[#FAF6EE]">
                <th className="py-3 px-4 font-bold text-[#1C2C19] w-1/3">Feature</th>
                <th className="py-3 px-4 font-bold text-[#2D5A27] w-1/3">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#C86446]" />
                    <span>Local-Only Mode (No Registration)</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-[#1C2C19] w-1/3">
                  <div className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Cloud Sync Account (Optional)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DC]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Registration & Login</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">None required (instant use)</td>
                <td className="py-3 px-4 text-[#546652]">Email/Password or 1-click Google</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Data Storage Location</td>
                <td className="py-3 px-4 text-[#546652]">Browser sandbox on current device</td>
                <td className="py-3 px-4 text-[#546652]">Encrypted Firestore database</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Works in Remote Cell Deadzones</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Full offline access via PWA cache</td>
                <td className="py-3 px-4 text-[#546652]">Functional offline, syncs on reconnect</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Roadtrip Itinerary & Mapping</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Full access (add, reorder, map)</td>
                <td className="py-3 px-4 text-[#546652]">Full access + synchronized across devices</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Tour Passes, Koha & Payments</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Handled directly with hosts</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Handled directly with hosts</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Platform Intermediary Fees</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">$0.00 (Zero platform fees)</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">$0.00 (Zero platform fees)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Cross-Device Sync (Phone + Laptop)</td>
                <td className="py-3 px-4 text-[#546652]">Via 1-click JSON export/import</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Automatic in real time</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Recovery if Browser Cache Cleared</td>
                <td className="py-3 px-4 text-[#546652]">Requires downloaded JSON backup</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Instant cloud login restore</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#1C2C19]">Calendar Export (.ics)</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Yes, standard .ics download</td>
                <td className="py-3 px-4 text-[#2D5A27] font-semibold">Yes, standard .ics download</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Local Data & Backup Control Center */}
      <section className="bg-linear-to-b from-white to-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#E2DAC9] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                Device Data Hub
              </span>
              <span className="text-[10px] bg-[#FAF6EE] px-2 py-0.5 rounded-full border border-[#D5CCBA] text-[#556651]">
                Current Stored: {bookingsCount} Bookings • {itineraryCount} Route Stops
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1C2C19] mt-0.5">
              Backup, Restore & Export Your Local Data
            </h2>
          </div>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-[#A8D59D]" />
            <span>Export Local Backup (JSON)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Action 1: Export Calendar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2DAC9] space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#C86446] flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#1C2C19]">Add Stops to Apple/Google Calendar</h4>
              <p className="text-[11px] text-[#5D6E5A] mt-1 leading-relaxed">
                Generate an industry-standard <code className="text-[#2D5A27]">.ics</code> calendar file with your tour stops, dates, and host addresses.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportICS}
              className="w-full py-2 px-3 bg-[#FAF6EE] hover:bg-[#F2ECE0] text-[#2D5A27] border border-[#D5CCBA] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C86446]" />
              <span>Download .ics Calendar</span>
            </button>
          </div>

          {/* Action 2: Import Backup JSON */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2DAC9] space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center mb-2">
                <FileJson className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#1C2C19]">Restore Tour Pass from JSON</h4>
              <p className="text-[11px] text-[#5D6E5A] mt-1 leading-relaxed">
                Restore your itinerary, companions, and pass bookings from an exported backup file on any device.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
                id="local-import-json-file"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-white hover:bg-[#FAF8F3] text-[#1C2C19] border border-[#D5CCBA] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Upload & Restore JSON</span>
              </button>
            </div>
          </div>

          {/* Action 3: Reset / Clear */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2DAC9] space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#FAF0F0] text-[#A6382D] flex items-center justify-center mb-2">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#1C2C19]">Reset Local Device Storage</h4>
              <p className="text-[11px] text-[#5D6E5A] mt-1 leading-relaxed">
                Clear all custom itinerary selections and local test bookings on this device and revert to initial demo data.
              </p>
            </div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2 px-2 bg-[#9E2A1C] hover:bg-[#7D2116] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 px-3 bg-stone-50 hover:bg-[#FAF0F0] text-stone-600 hover:text-[#9E2A1C] border border-[#E8E0D2] rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Reset Local Data</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2DAC9] shadow-xs space-y-5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-[#1C2C19]">
          Frequently Asked Questions About Local Mode
        </h2>

        <div className="space-y-4 text-xs leading-relaxed text-[#4F604B]">
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE3D6] space-y-1.5">
            <h4 className="font-bold text-sm text-[#1C2C19]">
              How does a host know I have booked without an account?
            </h4>
            <p>
              When you reserve a stop in local mode, the application generates a unique reference code (e.g. <span className="font-semibold text-[#1C2C19]">NZ-2027-8492</span>) alongside the host’s registered bank account particulars. When you initiate direct internet banking, you input this code into your transfer reference field. When arriving at the farm gate, simply present your local tour pass screen or reference number. Hosts match your name and code directly against their bank statement.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE3D6] space-y-1.5">
            <h4 className="font-bold text-sm text-[#1C2C19]">
              What happens if I clear my browser history or site cookies?
            </h4>
            <p>
              In local mode, your roadtrip itinerary and reservations live in your browser’s <code className="text-[#2D5A27]">localStorage</code>. If you clear all website storage, this data is removed. To protect against this, download a 1-click JSON backup file anytime using the button above, or export your tour pass to your phone’s calendar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE3D6] space-y-1.5">
            <h4 className="font-bold text-sm text-[#1C2C19]">
              Can I upgrade to a Cloud Sync account later without losing my stops?
            </h4>
            <p>
              Yes! Whenever you sign in or create an account with Google or email, your locally planned stops, custom companions, and bookings automatically merge into your cloud profile, allowing you to access them on multiple devices.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE3D6] space-y-1.5">
            <h4 className="font-bold text-sm text-[#1C2C19]">
              Can I also host a property without a cloud account?
            </h4>
            <p>
              Yes! Landowners can register properties and manage bookings entirely in local mode. All attendee updates, manual walk-in entries, and direct bank details are stored on-device and can be exported as JSON or CSV reports for accounting and tax purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Navigation CTA */}
      <div className="bg-[#FAF6EE] rounded-3xl p-6 border border-[#E2DAC9] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-[#1C2C19]">
            Ready to Plan Your 2027 Regenerative Journey?
          </h3>
          <p className="text-xs text-[#5D6E5A] mt-0.5">
            Explore 12+ permaculture properties across the North and South Islands with zero tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenItinerary}
            className="px-4 py-2 bg-white hover:bg-[#FAF8F3] text-[#1C2C19] border border-[#D5CCBA] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#C86446]" />
            <span>Open Roadtrip Route</span>
          </button>
          <button
            type="button"
            onClick={onBackToExplore}
            className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A8D59D]" />
            <span>Explore Tour Stops</span>
          </button>
        </div>
      </div>
    </div>
  );
};
