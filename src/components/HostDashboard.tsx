import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Ban,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  FileImage,
  Sparkles,
  MapPin,
  Building,
  Key,
  Calendar,
  AlertTriangle,
  Phone,
  Mail,
  Send,
  X,
  Plus,
  Cloud,
  ShieldCheck,
  Sprout,
  PlusCircle,
  Check,
  Copy,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PropertyStop,
  Booking,
  BookingStatus,
  SelectedComponentBooking,
  EventComponent,
  ActivityType,
  PricingType,
} from '../types';
import { generatePaymentReference } from '../utils/storage';

interface HostDashboardProps {
  property: PropertyStop | null;
  allProperties: PropertyStop[];
  onSelectHostProperty: (propId: string) => void;
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onAddManualBooking: (booking: Booking) => void;
  onUpdatePropertyBankDetails: (updatedProp: PropertyStop) => void;
  onViewPropertyListing?: (property: PropertyStop) => void;
  onRegisterNewProperty?: () => void;
  onUpdateProperty?: (updatedProp: PropertyStop) => void;
  travelerBookingsCount?: number;
  onOpenTravelerBookings?: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  property,
  allProperties,
  onSelectHostProperty,
  bookings,
  onUpdateStatus,
  onAddManualBooking,
  onUpdatePropertyBankDetails,
  onViewPropertyListing,
  onRegisterNewProperty,
  onUpdateProperty,
  travelerBookingsCount,
  onOpenTravelerBookings,
}) => {
  // Safety guard if no properties exist (Clean slate zero-properties mode)
  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
        <div className="bg-white rounded-3xl p-10 border border-[#E2DAC9] text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8 text-[#2D5A27]" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#1C2C19]">
            No Permaculture Land or Events Registered Yet
          </h2>
          <p className="text-xs sm:text-sm text-[#5D6D5A] leading-relaxed">
            Your host portal strictly displays and manages your own tour events and sessions. You haven&apos;t registered any permaculture events or sessions yet.
          </p>
          {onRegisterNewProperty && (
            <button
              onClick={onRegisterNewProperty}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#20401B] transition cursor-pointer flex items-center gap-2 mx-auto shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Your Land & Schedule Events</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filter bookings for this property
  const propertyBookings = bookings.filter(b => b.propertyId === property.id);

  // Search and status filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');

  // Triggered Confirmation Dispatch modal state
  const [confirmedGuestNotice, setConfirmedGuestNotice] = useState<{
    booking: Booking;
    property: PropertyStop;
  } | null>(null);

  // Manual Guest Entry modal state
  const [showManualAddModal, setShowManualAddModal] = useState(false);

  // Add Event Session modal state
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // View proof screenshot modal state
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  // Host bank account settings modal
  const [showBankSettingsModal, setShowBankSettingsModal] = useState(false);
  const [editBankName, setEditBankName] = useState(property.bankDetails?.bankName || 'Kiwibank');
  const [editAccountName, setEditAccountName] = useState(property.bankDetails?.accountName || property.hostName || '');
  const [editAccountNumber, setEditAccountNumber] = useState(property.bankDetails?.accountNumber || '38-9000-0000000-00');
  const [editInstructions, setEditInstructions] = useState(property.bankDetails?.instructions || '');
  const [bankUpdateToast, setBankUpdateToast] = useState<string | null>(null);

  // Synchronize bank details form fields whenever selected property updates or modal is opened
  useEffect(() => {
    if (property?.bankDetails) {
      setEditBankName(property.bankDetails.bankName || 'Kiwibank');
      setEditAccountName(property.bankDetails.accountName || property.hostName || '');
      setEditAccountNumber(property.bankDetails.accountNumber || '38-9000-0000000-00');
      setEditInstructions(property.bankDetails.instructions || 'Include your booking reference code in particulars/reference.');
    }
  }, [property, showBankSettingsModal]);

  const handleAddEventSession = (newEvent: EventComponent) => {
    const updatedProp: PropertyStop = {
      ...property,
      eventComponents: [...(property.eventComponents || []), newEvent],
    };
    if (onUpdateProperty) {
      onUpdateProperty(updatedProp);
    } else {
      onUpdatePropertyBankDetails(updatedProp);
    }
    try {
      confetti({ particleCount: 35 });
    } catch {}
    setShowAddEventModal(false);
  };

  // Escape key handler to close any active popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewingProofUrl) setViewingProofUrl(null);
        else if (confirmedGuestNotice) setConfirmedGuestNotice(null);
        else if (showBankSettingsModal) setShowBankSettingsModal(false);
        else if (showManualAddModal) setShowManualAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingProofUrl, confirmedGuestNotice, showBankSettingsModal, showManualAddModal]);

  // Filtered rows
  const safeBookings = propertyBookings || [];
  const filteredBookings = safeBookings.filter(b => {
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (b.guestName || '').toLowerCase().includes(term) ||
      (b.referenceCode || '').toLowerCase().includes(term) ||
      (b.guestEmail || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalGuests = safeBookings.length;
  const pendingCount = safeBookings.filter(b => b.status === 'Pending Payment').length;
  const confirmedCount = safeBookings.filter(b => b.status === 'Confirmed').length;
  const totalRevenue = safeBookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.totalNzdDue, 0);

  // Handle One-Click Status Toggle
  const handleToggleStatus = (booking: Booking, newStatus: BookingStatus) => {
    onUpdateStatus(booking.id, newStatus);
    if (newStatus === 'Confirmed') {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
      // Trigger automated confirmation preview
      setConfirmedGuestNotice({ booking, property });
    }
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProp: PropertyStop = {
      ...property,
      bankDetails: {
        bankName: editBankName.trim() || 'Kiwibank',
        accountName: editAccountName.trim() || property.hostName,
        accountNumber: editAccountNumber.trim() || '38-9000-0000000-00',
        instructions: editInstructions.trim(),
      },
    };
    onUpdatePropertyBankDetails(updatedProp);
    if (onUpdateProperty) {
      onUpdateProperty(updatedProp);
    }
    setShowBankSettingsModal(false);
    try {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    } catch {}
    setBankUpdateToast(
      `Bank details successfully updated: ${updatedProp.bankDetails.bankName} (${updatedProp.bankDetails.accountNumber})`
    );
    setTimeout(() => {
      setBankUpdateToast(null);
    }, 4500);
  };

  // Export roster as CSV
  const handleExportRoster = () => {
    const headers = [
      'Reference',
      'Name',
      'Status',
      'Email',
      'Phone',
      'TotalDueNZD',
      'Accommodation',
      'Sessions',
      'DateRegistered',
    ];
    const rows = propertyBookings.map(b => [
      `"${b.referenceCode}"`,
      `"${b.guestName}"`,
      `"${b.status}"`,
      `"${b.guestEmail}"`,
      `"${b.guestPhone}"`,
      b.totalNzdDue,
      `"${b.accommodationTitle || 'None'}"`,
      `"${(b.components || []).map(c => c.componentTitle).join('; ')}"`,
      `"${b.createdAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${property.slug}_attendees_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Real-time Toast Confirmation */}
      {bankUpdateToast && (
        <div
          id="host-bank-update-toast"
          className="fixed top-5 right-5 z-50 bg-[#2D5A27] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-top-4 duration-200 border border-[#488040]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#A8D59D] shrink-0" />
          <span>{bankUpdateToast}</span>
          <button
            type="button"
            onClick={() => setBankUpdateToast(null)}
            className="ml-2 p-1 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dual Booker/Host Cross-Link Banner */}
      {travelerBookingsCount !== undefined && travelerBookingsCount > 0 && onOpenTravelerBookings && (
        <div className="mb-4 bg-white rounded-2xl p-4 border border-[#E0D8C8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#C86446] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#1C2C19] block">
                Traveling the tour as a guest too?
              </span>
              <span className="text-[#556651]">
                You have {travelerBookingsCount} upcoming farm {travelerBookingsCount === 1 ? 'reservation' : 'reservations'} on your personal roadtrip itinerary.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenTravelerBookings}
            className="px-3.5 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <span>View My Roadtrip Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Host First Entry Hub Encouragement Banner */}
      <div className="mb-6 bg-linear-to-r from-[#EBF5E9] via-[#F3F8F1] to-[#FAF6EE] rounded-3xl p-6 border border-[#BBDCB4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sprout className="w-6 h-6 text-[#A8D59D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                Host Stewardship Hub
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#BBDCB4] font-semibold text-[#3D5239]">
                Zero Platform Fees • Free, Koha & Direct
              </span>
            </div>
            <h3 className="text-base font-bold font-display text-[#1C2C19] mt-0.5">
              Steward a Permaculture Site, Food Forest, or Eco-Sanctuary?
            </h3>
            <p className="text-xs text-[#4F604B] max-w-2xl mt-0.5">
              Welcome conscious travelers to your land on the 2027 Aotearoa Tour. Offer free visits, koha, or workshops with zero platform deductions and simple direct bookings.
            </p>
          </div>
        </div>
        {onRegisterNewProperty && (
          <button
            type="button"
            onClick={onRegisterNewProperty}
            className="px-4 py-2.5 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#A8D59D]" />
            <span>+ Register Your Tour Event</span>
          </button>
        )}
      </div>

      {/* Host Portal Banner */}
      <div className="bg-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#E2DAC9] shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={property.hostAvatar}
              alt={property.hostName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2D5A27] shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-[#E8F0E6] text-[#2D5A27] rounded-md">
                  Host Management Portal
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#E8F3EE] text-[#1E5631] rounded-md flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-[#2D5A27]" />
                  <span>Cloud Database Synced</span>
                </span>
                <span className="text-xs font-semibold text-[#667761]">
                  Tour Event: {property.datesText}
                </span>
              </div>
              <h1
                onClick={() => onViewPropertyListing && onViewPropertyListing(property)}
                className={`text-xl sm:text-2xl font-bold font-display text-[#1C2C19] mt-1 ${
                  onViewPropertyListing ? 'cursor-pointer hover:text-[#2D5A27] transition' : ''
                }`}
                title={onViewPropertyListing ? 'Click to inspect public event listing' : undefined}
              >
                {property.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#546450]">
                Host Steward: <strong>{property.hostName}</strong> • {property.district}, {property.region}
              </p>
            </div>
          </div>

          {/* Switch Property / Manage Bank Details & Inspect Listing */}
          <div className="flex flex-wrap items-center gap-2.5">
            {allProperties.length > 1 && (
              <div className="w-full sm:w-auto">
                <select
                  value={property.id}
                  onChange={e => onSelectHostProperty(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-[#D5CCBA] bg-white text-xs font-semibold text-[#20301E] focus:ring-2 focus:ring-[#2D5A27]/20 cursor-pointer shadow-2xs"
                  aria-label="Switch event"
                >
                  {allProperties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name.split('&')[0]} ({p.district})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="host-add-another-event-btn"
                onClick={() => setShowAddEventModal(true)}
                className="px-3.5 py-2.5 rounded-xl border border-[#2D5A27] bg-[#2D5A27] hover:bg-[#20401B] text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Add another workshop, tour, or session to this event"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Add Session</span>
              </button>

              {onRegisterNewProperty && (
                <button
                  type="button"
                  onClick={onRegisterNewProperty}
                  className="px-3 py-2.5 rounded-xl border border-[#D5CCBA] bg-white hover:bg-[#F2ECE0] text-xs font-semibold text-[#283825] flex items-center gap-1.5 transition cursor-pointer"
                  title="Register another event or permaculture land"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Add Another Event</span>
                </button>
              )}

              {onViewPropertyListing && (
                <button
                  type="button"
                  onClick={() => onViewPropertyListing(property)}
                  className="px-3 py-2.5 rounded-xl border border-[#2D5A27]/30 bg-[#E8F0E6] hover:bg-[#D8E6D5] text-xs font-bold text-[#2D5A27] flex items-center gap-1.5 transition cursor-pointer"
                  title="View this event as guests see it"
                >
                  <Eye className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Inspect Event Listing</span>
                </button>
              )}

              <button
                id="edit-host-bank-btn"
                type="button"
                onClick={() => setShowBankSettingsModal(true)}
                className="px-3.5 py-2.5 rounded-xl border border-[#D5CCBA] bg-white hover:bg-[#F2ECE0] text-xs font-semibold text-[#283825] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Configure Host Bank Details & Direct Settlement Account"
              >
                <Building className="w-3.5 h-3.5 text-[#C86446]" />
                <span>
                  Bank Details ({property.bankDetails?.bankName || 'Kiwibank'}{property.bankDetails?.accountNumber ? ` • ${property.bankDetails.accountNumber}` : ''})
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Direct Settlement & Bank Status Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E2DAC9] text-xs text-[#244A1F] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
            <p className="text-[11px] text-[#4A5E47]">
              <strong>Direct settlements:</strong> Zero platform deductions. Guest deposits clear directly into{' '}
              <strong className="text-[#1C2C19]">{property.bankDetails?.bankName || 'Kiwibank'}</strong>{' '}
              <span className="font-mono text-[#2D5A27] font-semibold">({property.bankDetails?.accountNumber || '38-9000-0000000-00'})</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBankSettingsModal(true)}
            className="self-start sm:self-auto text-[11px] font-bold text-[#2D5A27] hover:text-[#193615] underline flex items-center gap-1 cursor-pointer"
          >
            <span>Change Bank Particulars</span>
          </button>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#E8DFD0]">
          <div className="bg-white p-4 rounded-2xl border border-[#E4DCCF]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#738470]">
              Total Registrations
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#1C2C19]">{totalGuests}</span>
              <span className="text-xs text-[#52634F]">parties</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4DCCF]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#C86446]">
              Pending Bank Payment
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#C86446]">{pendingCount}</span>
              <span className="text-xs text-[#52634F]">awaiting clear</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4DCCF]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2D5A27]">
              Confirmed Attendees
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#2D5A27]">{confirmedCount}</span>
              <span className="text-xs text-[#52634F]">cleared</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E4DCCF]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#344631]">
              Cleared Revenue
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#1C2C19]">${totalRevenue}</span>
              <span className="text-xs text-[#52634F]">NZD direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Event Component Capacities Overview */}
      <div className="bg-white rounded-2xl border border-[#E2DAC9] p-5 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#2D5A27] flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Event Parts & Capacity Tracking</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7B68]">
              {(property.eventComponents || []).length} sequential sessions
            </span>
            <button
              type="button"
              onClick={() => setShowAddEventModal(true)}
              className="px-2.5 py-1 rounded-lg bg-[#E8F0E6] hover:bg-[#D8E6D5] text-xs font-bold text-[#2D5A27] flex items-center gap-1 transition cursor-pointer"
              title="Add a new workshop, tour, or session to this event"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event Session</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(property.eventComponents || []).map(comp => {
            const filledCount = comp.capacity - comp.spotsRemaining;
            const pct = Math.min(100, Math.round((filledCount / comp.capacity) * 100));
            return (
              <div key={comp.id} className="p-3.5 bg-[#FAF8F3] rounded-xl border border-[#ECE5D7]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[11px] font-bold text-[#2D5A27]">
                    {comp.startTime}–{comp.endTime}
                  </span>
                  <span className="font-semibold text-[#667761]">{comp.pricingType}</span>
                </div>
                <h3 className="text-xs font-bold text-[#1C2C19] truncate">{comp.title}</h3>
                <div className="mt-2.5">
                  <div className="w-full bg-[#E5DEC\-D] h-2 rounded-full overflow-hidden bg-stone-200">
                    <div
                      className="bg-[#2D5A27] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1 text-[#62735F]">
                    <span>{filledCount} / {comp.capacity} registered</span>
                    <span className="font-bold text-[#2D5A27]">{comp.spotsRemaining} spots left</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ATTENDEE TABLE & MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-[#E2DAC9] shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 sm:p-6 border-b border-[#E8DFD0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-[#1C2C19]">
              Registered Attendees & Payment Pipeline
            </h2>
            <p className="text-xs text-[#5D6D5A]">
              Match incoming bank deposits using unique reference codes. Toggle status to trigger arrival coordinates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#768772] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search reference, guest..."
                className="pl-8 pr-3 py-2 rounded-xl border border-[#D5CCBA] bg-[#FAF8F3] text-xs text-[#1C2C19] placeholder:text-[#889784] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 w-44"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center bg-[#F4EFE6] rounded-xl p-0.5 border border-[#E5DEC\-D]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-[#1C2C19] shadow-2xs' : 'text-[#61715E]'
                }`}
              >
                All ({propertyBookings.length})
              </button>
              <button
                onClick={() => setStatusFilter('Pending Payment')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusFilter === 'Pending Payment'
                    ? 'bg-[#C86446] text-white shadow-2xs'
                    : 'text-[#61715E]'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('Confirmed')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  statusFilter === 'Confirmed'
                    ? 'bg-[#2D5A27] text-white shadow-2xs'
                    : 'text-[#61715E]'
                }`}
              >
                Confirmed ({confirmedCount})
              </button>
            </div>

            {/* Export Roster CSV */}
            <button
              onClick={handleExportRoster}
              className="p-2 rounded-xl border border-[#D5CCBA] bg-white hover:bg-[#F2ECE0] text-[#344430] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Download CSV Roster for offline check-in"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Manual Guest / Companion Entry Button */}
            <button
              id="manual-add-guest-btn"
              onClick={() => setShowManualAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#A8D59D]" />
              <span>Add Companion or Guest</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#E8E0D2] text-[#5A6A57] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Payment Reference</th>
                <th className="py-3 px-4">Sessions Selected</th>
                <th className="py-3 px-4">Accommodation</th>
                <th className="py-3 px-4">Total Due</th>
                <th className="py-3 px-4">Proof</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DC]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center mx-auto shadow-2xs">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-display font-bold text-base text-[#1C2C19]">
                        No Attendee Bookings Yet for {property.name}
                      </h4>
                      <p className="text-xs text-[#5D6E5A] leading-relaxed">
                        When guests book your tour passes or workshops, direct deposits will clear into your account ({property.bankDetails?.bankName || 'Kiwibank'} • {property.bankDetails?.accountNumber || 'Pending'}) with unique reference codes.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowBankSettingsModal(true)}
                          className="px-3.5 py-2 bg-white hover:bg-[#F2ECE0] border border-[#D5CCBA] text-[#283825] text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Building className="w-3.5 h-3.5 text-[#C86446]" />
                          <span>Configure Settlement Bank Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowManualAddModal(true)}
                          className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Log First Booking (Manual Entry)</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#FAF8F3] transition">
                    {/* Guest Name & contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C2C19] flex items-center gap-1.5">
                        <span>{b.guestName}</span>
                        {b.isHostCompanion ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            Host Companion • {b.companionRole || 'Whānau'}
                          </span>
                        ) : b.isManualOfflineEntry ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-medium">
                            Offline Entry
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-[#556652] space-y-0.5 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{b.guestEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{b.guestPhone}</span>
                        </div>
                        {b.dietaryNotes && (
                          <div className="text-stone-500 italic">Note: {b.dietaryNotes}</div>
                        )}
                        {b.seedSwapDescription && (
                          <div className="text-[#2D5A27] font-medium">Swap: {b.seedSwapDescription}</div>
                        )}
                      </div>
                    </td>

                    {/* Reference Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#1C2C19]">
                      <span className="px-2 py-1 bg-[#FAF6EE] rounded border border-[#E0D8C8]">
                        {b.referenceCode}
                      </span>
                    </td>

                    {/* Sessions Selected */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="space-y-1">
                        {b.components.map(c => (
                          <div key={c.componentId} className="text-[11px] text-[#293926] truncate">
                            • {c.componentTitle}{' '}
                            <span className="text-[#657562]">({c.attendeeCount}p)</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Accommodation */}
                    <td className="py-3.5 px-4 text-[#354632]">
                      {b.accommodationTitle ? (
                        <div>
                          <span className="font-medium">{b.accommodationTitle}</span>
                          <span className="block text-[10px] text-stone-500">
                            {b.accommodationNights} nights (${b.accommodationCostTotal})
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Day visitor</span>
                      )}
                    </td>

                    {/* Total Due */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1C2C19]">
                      ${b.totalNzdDue} NZD
                    </td>

                    {/* Proof of Payment Screenshot */}
                    <td className="py-3.5 px-4">
                      {b.paymentProofUrl ? (
                        <button
                          onClick={() => setViewingProofUrl(b.paymentProofUrl || null)}
                          className="px-2 py-1 rounded bg-[#E8F0E6] text-[#2D5A27] hover:bg-[#D5E5D1] font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px] italic">None uploaded</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'Confirmed'
                            ? 'bg-[#E8F0E6] text-[#244A1F]'
                            : b.status === 'Pending Payment'
                            ? 'bg-[#FAF0ED] text-[#C86446]'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {b.status === 'Confirmed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : b.status === 'Pending Payment' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <Ban className="w-3 h-3" />
                        )}
                        <span>{b.status}</span>
                      </span>
                    </td>

                    {/* One-Click Status Toggle & Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {b.status === 'Pending Payment' ? (
                        <button
                          id={`btn-confirm-booking-${b.id}`}
                          onClick={() => handleToggleStatus(b, 'Confirmed')}
                          className="px-3 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#1F3E1B] text-white font-bold text-xs shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                          title="Click to confirm bank transfer cleared"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D59D]" />
                          <span>Confirm Payment</span>
                        </button>
                      ) : b.status === 'Confirmed' ? (
                        <button
                          onClick={() => handleToggleStatus(b, 'Pending Payment')}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
                          title="Revert to pending"
                        >
                          Revert Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(b, 'Pending Payment')}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
                        >
                          Re-open
                        </button>
                      )}

                      {b.status !== 'Cancelled / Unpaid' && (
                        <button
                          onClick={() => handleToggleStatus(b, 'Cancelled / Unpaid')}
                          className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Cancel booking & release capacity"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTOMATED CONFIRMATION TRIGGER DISPATCH INLINE PREVIEW */}
      {confirmedGuestNotice && (
        <div className="bg-[#FAF8F3] rounded-3xl p-6 border border-[#2D5A27]/30 shadow-sm text-left space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2D5A27] text-white flex items-center justify-center">
                <Send className="w-4 h-4 text-[#A8D59D]" />
              </div>
              <div>
                <h3 className="font-bold font-display text-base text-[#1C2C19]">
                  Automated Confirmation Trigger Dispatched!
                </h3>
                <span className="text-xs text-[#52634F]">
                  Email & SMS sent to {confirmedGuestNotice.booking.guestName}
                </span>
              </div>
            </div>
            <button
              onClick={() => setConfirmedGuestNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Upon marking reference <strong>{confirmedGuestNotice.booking.referenceCode}</strong> as Confirmed,
            the automated notification pipeline immediately delivers secret arrival instructions and directions:
          </p>

          <div className="bg-white rounded-2xl p-4 border border-[#E4DCCF] text-xs space-y-2.5 text-stone-800">
            <div className="flex items-center gap-1.5 text-[#2D5A27] font-bold">
              <MapPin className="w-4 h-4" />
              <span>Exact Arrival & Secret Pin Drop:</span>
            </div>
            <p className="text-stone-700 pl-5 text-[11px] leading-relaxed">
              {confirmedGuestNotice.property.exactArrivalInstructions}
            </p>

            <div className="pt-2 border-t border-[#ECE5D7] flex items-center justify-between text-[11px]">
              <span className="font-semibold text-stone-600">GPS Coordinates:</span>
              <span className="font-mono font-bold text-stone-900">
                {confirmedGuestNotice.property.coordinates.lat},{' '}
                {confirmedGuestNotice.property.coordinates.lng}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-stone-600">Host Direct Phone:</span>
              <span className="font-bold text-stone-900">
                {confirmedGuestNotice.property.hostPhone}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setConfirmedGuestNotice(null)}
              className="px-5 py-2 rounded-xl bg-[#2D5A27] text-white font-bold text-xs hover:bg-[#20401B] transition cursor-pointer"
            >
              Dismiss Notification
            </button>
          </div>
        </div>
      )}

      {/* MANUAL GUEST ENTRY (Offline phone calls / walk-ins) */}
      {showManualAddModal && (
        <ManualGuestEntryModal
          property={property}
          onClose={() => setShowManualAddModal(false)}
          onAdd={booking => {
            onAddManualBooking(booking);
            setShowManualAddModal(false);
          }}
        />
      )}

      {/* VIEW PROOF SCREENSHOT MODAL OVERLAY */}
      {viewingProofUrl && (
        <div
          id="proof-screenshot-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setViewingProofUrl(null);
          }}
        >
          <div className="bg-white rounded-3xl p-6 border border-stone-300 shadow-2xl text-left space-y-4 max-w-2xl w-full my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-[#2D5A27]" />
                <span>Guest Uploaded Bank Transfer Screenshot</span>
              </h3>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center p-2">
              <img
                src={viewingProofUrl}
                alt="Proof of payment"
                className="max-w-full h-auto rounded object-contain"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setViewingProofUrl(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black cursor-pointer"
              >
                Close Screenshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOST BANK DETAILS SETTINGS MODAL DIALOG */}
      {showBankSettingsModal && (
        <div
          id="host-bank-settings-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setShowBankSettingsModal(false);
          }}
        >
          <div
            id="host-bank-settings-dialog"
            className="bg-[#FAF8F3] w-full max-w-xl rounded-2xl sm:rounded-3xl border border-[#E0D8C8] shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 text-left"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E7E0D3] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0ED] text-[#C86446] flex items-center justify-center border border-[#EACEC5] shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-base text-[#1C2C19]">
                    Host Bank Account & Settlement Settings
                  </h3>
                  <p className="text-[11px] text-[#5A6D57]">
                    Settlement for <strong className="text-[#1C2C19]">{property.name}</strong> • 100% direct to host account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBankSettingsModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBankDetails} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              {/* NZ Bank Preset Quick Chips */}
              <div>
                <label className="block font-semibold text-[#283825] mb-1.5">
                  Popular NZ Banks (Click to Select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Kiwibank', 'ANZ Bank', 'ASB Bank', 'BNZ', 'Westpac NZ', 'TSB Bank', 'Co-operative Bank'].map(bank => {
                    const isSelected = editBankName.toLowerCase().includes(bank.toLowerCase().slice(0, 3));
                    return (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setEditBankName(bank)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-2xs font-bold'
                            : 'bg-white text-stone-700 border-[#D5CCBA] hover:bg-[#F2ECE0]'
                        }`}
                      >
                        {bank.replace(' New Zealand', '').replace(' Bank', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#283825] mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBankName}
                    onChange={e => setEditBankName(e.target.value)}
                    placeholder="e.g. Kiwibank / ANZ"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-medium focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#283825]">
                      Account Holder Name *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditAccountName(property.hostName)}
                      className="text-[10px] text-[#2D5A27] hover:underline cursor-pointer font-semibold"
                      title="Use Host Name"
                    >
                      Use Host Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editAccountName}
                    onChange={e => setEditAccountName(e.target.value)}
                    placeholder="e.g. Pohutukawa Permaculture"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-medium focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-[#283825]">
                    NZ Bank Account Number *
                  </label>
                  <span className="text-[10px] text-stone-500 font-mono">Format: XX-XXXX-XXXXXXX-XX</span>
                </div>
                <input
                  type="text"
                  required
                  value={editAccountNumber}
                  onChange={e => setEditAccountNumber(e.target.value)}
                  placeholder="38-9000-0000000-00"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] outline-none font-semibold text-[#1C2C19]"
                />
                <p className="text-[10px] text-[#5A6D57] mt-1">
                  Standard New Zealand 16-digit structure: Bank (2) • Branch (4) • Account (7) • Suffix (2-3).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#283825] mb-1">
                  Payment Reference & Particulars Instructions for Guests
                </label>
                <textarea
                  rows={2}
                  value={editInstructions}
                  onChange={e => setEditInstructions(e.target.value)}
                  placeholder="e.g. Include your unique PERMA booking code in the reference/particulars field."
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] outline-none"
                />
              </div>

              {/* Live Preview of How Guests See These Bank Details */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#E2DAC9] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73836F] flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#2D5A27]" />
                    Guest Checkout Preview (How Guests View Your Details)
                  </span>
                  <span className="text-[10px] text-[#2D5A27] font-semibold bg-[#E8F0E6] px-2 py-0.5 rounded-md">
                    Zero Fees
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF8F3] p-3 rounded-xl border border-[#EDE5D6]">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Bank:</span>
                    <strong className="text-[#1C2C19]">{editBankName || 'Kiwibank'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Account Name:</span>
                    <strong className="text-[#1C2C19] truncate block">{editAccountName || property.hostName}</strong>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-[#EAE2D2]">
                    <span className="text-stone-500 block text-[10px]">Account Number:</span>
                    <strong className="font-mono text-xs text-[#2D5A27] font-bold">{editAccountNumber || '38-9000-0000000-00'}</strong>
                  </div>
                  <div className="col-span-2 text-[10px] text-[#546851] italic">
                    {editInstructions || 'Please include your booking reference code in particulars.'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E8DFD0]">
                <button
                  type="button"
                  onClick={() => setShowBankSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  id="save-host-bank-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white font-bold hover:bg-[#20401B] shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Bank Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Event Session / Workshop */}
      {showAddEventModal && (
        <AddEventSessionModal
          onClose={() => setShowAddEventModal(false)}
          onAdd={handleAddEventSession}
        />
      )}
    </div>
  );
};

// Subcomponent: Manual Offline Guest Entry Modal
const ManualGuestEntryModal: React.FC<{
  property: PropertyStop;
  onClose: () => void;
  onAdd: (booking: Booking) => void;
}> = ({ property, onClose, onAdd }) => {
  const [entryType, setEntryType] = useState<'companion' | 'manual'>('companion');
  const [name, setName] = useState('');
  const [companionRole, setCompanionRole] = useState('Whānau / Family Member');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCompId, setSelectedCompId] = useState(property.eventComponents[0]?.id || '');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [selectedAccId, setSelectedAccId] = useState('');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [notes, setNotes] = useState('');

  const isCompanion = entryType === 'companion';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const comp = property.eventComponents.find(c => c.id === selectedCompId);
    const acc = property.accommodations?.find(a => a.id === selectedAccId);

    const compTotal = isCompanion ? 0 : (comp && comp.pricingType === 'Fixed Paid Ticket' ? (comp.priceAmount || 0) * attendeeCount : 0);
    const accTotal = isCompanion ? 0 : (acc ? acc.nightlyCost : 0);

    const refCode = `${generatePaymentReference(property.region)}${isCompanion ? '-HOST' : ''}`;

    const newBooking: Booking = {
      id: 'bkg-manual-' + Date.now(),
      referenceCode: refCode,
      propertyId: property.id,
      propertyName: property.name,
      guestName: name.trim(),
      guestEmail: email.trim() || property.hostEmail || 'companion@host.nz',
      guestPhone: phone.trim() || property.hostPhone,
      dietaryNotes: notes || (isCompanion ? `${companionRole} • Complimentary Host Pass` : 'Offline booking'),
      components: comp
        ? [
            {
              componentId: comp.id,
              componentTitle: comp.title,
              activityType: comp.activityType,
              pricingType: comp.pricingType,
              priceAmount: isCompanion ? 0 : comp.priceAmount || 0,
              attendeeCount,
            },
          ]
        : [],
      accommodationOptionId: acc?.id,
      accommodationTitle: acc?.title,
      accommodationNights: acc ? 1 : undefined,
      accommodationCostTotal: accTotal > 0 ? accTotal : undefined,
      totalNzdDue: isCompanion ? 0 : (compTotal + accTotal),
      status: isCompanion ? 'Confirmed' : status,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      isManualOfflineEntry: true,
      isHostCompanion: isCompanion,
      companionRole: isCompanion ? companionRole : undefined,
      partyMembers: [name.trim()],
    };

    onAdd(newBooking);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FBF8F3] rounded-3xl p-6 border border-[#E0D8C8] shadow-2xl max-w-lg w-full space-y-4 text-left animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD0]">
          <h3 className="font-bold font-display text-base text-[#1C2C19] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#2D5A27]" />
            <span>Add to Attendee List</span>
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Toggle: Companion vs Offline Walk-In */}
        <div className="flex rounded-xl bg-[#EFE8DC] p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setEntryType('companion');
              setStatus('Confirmed');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              entryType === 'companion'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-[#4A5D47] hover:text-[#1C2C19]'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Host Companion / Whānau ($0)</span>
          </button>
          <button
            type="button"
            onClick={() => setEntryType('manual')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              entryType === 'manual'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-[#4A5D47] hover:text-[#1C2C19]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Walk-In / Phone Guest</span>
          </button>
        </div>

        {isCompanion && (
          <div className="p-3 bg-[#E8F0E6] rounded-xl border border-[#2D5A27]/25 text-[11px] text-[#2D5A27]">
            <strong className="block text-[#1C2C19]">Host Steward Privilege</strong>
            No pass fee is charged for your companions, apprentices, or whānau members ($0 NZD).
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isCompanion && (
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Companion Role</label>
              <select
                value={companionRole}
                onChange={e => setCompanionRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs cursor-pointer"
              >
                <option value="Whānau / Family Member">Whānau / Family Member</option>
                <option value="Farm Apprentice / WWOOFer">Farm Apprentice / WWOOFer</option>
                <option value="Co-Host / Workshop Assistant">Co-Host / Workshop Assistant</option>
                <option value="Farm Volunteer / Crew">Farm Volunteer / Crew</option>
                <option value="Guest Speaker / Kaumātua">Guest Speaker / Kaumātua</option>
                <option value="Visiting Friend / Neighbor">Visiting Friend / Neighbor</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#324330] mb-1">
              {isCompanion ? 'Companion Name *' : 'Guest Alias *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Wiremu"
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+64 21..."
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="optional"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#324330] mb-1">Select Event Part</label>
            <select
              value={selectedCompId}
              onChange={e => setSelectedCompId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
            >
              {property.eventComponents.map(c => (
                <option key={c.id} value={c.id}>
                  {c.startTime} - {c.title} ({c.pricingType} {c.priceAmount ? '$' + c.priceAmount : ''})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Attendee Count</label>
              <input
                type="number"
                min={1}
                max={20}
                value={attendeeCount}
                onChange={e => setAttendeeCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BookingStatus)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
              >
                <option value="Confirmed">Confirmed (Cash / Paid)</option>
                <option value="Pending Payment">Pending Payment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#324330] mb-1">Optional Stay</label>
            <select
              value={selectedAccId}
              onChange={e => setSelectedAccId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
            >
              <option value="">No stay (Day attendee)</option>
              {property.accommodations?.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} (${a.nightlyCost}/night)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#324330] mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white font-semibold hover:bg-[#20401B] cursor-pointer"
            >
              {isCompanion ? 'Confirm Companion Pass ($0)' : 'Add to Roster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subcomponent: Add New Event Session / Workshop Modal
const AddEventSessionModal: React.FC<{
  onClose: () => void;
  onAdd: (newEvent: EventComponent) => void;
}> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Workshop');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [pricingType, setPricingType] = useState<PricingType>('Fixed Paid Ticket');
  const [priceAmount, setPriceAmount] = useState(25);
  const [capacity, setCapacity] = useState(20);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newComp: EventComponent = {
      id: 'ev-custom-' + Date.now(),
      startTime,
      endTime,
      title: title.trim(),
      activityType,
      pricingType,
      priceAmount: pricingType === 'Fixed Paid Ticket' ? priceAmount : pricingType === 'Koha' ? (priceAmount || 10) : 0,
      description: description.trim() || `${activityType} session at the property.`,
      capacity,
      spotsRemaining: capacity,
    };

    onAdd(newComp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 border border-[#E2DAC9] max-w-md w-full shadow-2xl text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-[#1C2C19]">Schedule Event Session</h3>
              <p className="text-[11px] text-[#5D6D5A]">Add a workshop, tour, or session to your event schedule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#324330] mb-1">Session Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Swale Construction & Water Harvesting"
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-[#FAF8F3] text-xs focus:ring-2 focus:ring-[#2D5A27]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Activity Type</label>
              <select
                value={activityType}
                onChange={e => setActivityType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs cursor-pointer"
              >
                <option value="Guided Tour">Guided Tour</option>
                <option value="Workshop">Workshop</option>
                <option value="Hands-on Workbee">Hands-on Workbee</option>
                <option value="Shared Feast / Gathering">Shared Feast / Gathering</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#324330] mb-1">Pricing Model</label>
              <select
                value={pricingType}
                onChange={e => setPricingType(e.target.value as PricingType)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs cursor-pointer"
              >
                <option value="Fixed Paid Ticket">Fixed Paid Ticket</option>
                <option value="Koha">Koha (Donation)</option>
                <option value="Free Inclusion">Free Inclusion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-[#324330] mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="10:00"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#324330] mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="12:30"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#324330] mb-1">
                {pricingType === 'Fixed Paid Ticket' ? 'Price ($)' : 'Koha Guide ($)'}
              </label>
              <input
                type="number"
                min={0}
                value={priceAmount}
                onChange={e => setPriceAmount(parseFloat(e.target.value) || 0)}
                disabled={pricingType === 'Free Inclusion'}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-mono disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#324330] mb-1">Max Attendee Capacity</label>
            <input
              type="number"
              min={1}
              max={200}
              value={capacity}
              onChange={e => setCapacity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#324330] mb-1">Session Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What will attendees experience or learn in this session?"
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-[#FAF8F3] text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DFD0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white font-bold hover:bg-[#20401B] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
