import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  KeyRound,
  MapPin,
  Printer,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  Upload,
  User,
  Users,
  UserPlus,
  UserCheck,
  Link as LinkIcon,
  X,
  ExternalLink,
  Sprout,
  Compass,
  Clock,
  Heart,
  ChevronRight,
  Car,
} from 'lucide-react';
import {
  GuestProfile,
  CoTraveler,
  Booking,
  PropertyStop,
  SelectedComponentBooking,
  TravelStyle,
  StreamlineMode,
} from '../types';
import {
  DEMO_GUESTS,
  exportGuestCalendarIcs,
  attachPaymentProof,
  cancelBooking,
  updateBookingPartyMembers,
} from '../utils/storage';

const TRAVEL_STYLES: { style: TravelStyle; label: string; icon: string }[] = [
  { style: 'Self-Contained Campervan', label: 'Campervan', icon: '🚐' },
  { style: 'Tent & Car', label: 'Tent & Car', icon: '⛺' },
  { style: 'Carpooler / Hitchhiker', label: 'Carpooler', icon: '🚗' },
  { style: 'Public Transport / Bicycle', label: 'Bicycle / Transit', icon: '🚲' },
  { style: 'Homestay Traveler', label: 'Homestay', icon: '🏡' },
];

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestProfile: GuestProfile;
  onUpdateProfile: (updated: GuestProfile) => void;
  onSwitchGuest: (newGuest: GuestProfile) => void;
  bookings: Booking[];
  properties: PropertyStop[];
  onRefreshBookings: () => void;
  onOpenCheckoutForProperty?: (property: PropertyStop, customComponents?: SelectedComponentBooking[]) => void;
  onSelectPropertyForDetail?: (property: PropertyStop) => void;
  streamlineMode?: StreamlineMode;
  onSelectStreamlineMode?: (mode: StreamlineMode) => void;
  isDemoDataOn?: boolean;
  isLocalModeEnabled?: boolean;
  isSimplifiedTravelGroup?: boolean;
  onToggleSimplifiedTravelGroup?: (enabled: boolean) => void;
  onOpenItinerary?: () => void;
  initialTab?: 'bookings' | 'settings';
  myHostProperties?: PropertyStop[];
  onAddCompanionForProperty?: (property: PropertyStop) => void;
}

export const GuestProfileModal: React.FC<GuestProfileModalProps> = ({
  isOpen,
  onClose,
  guestProfile,
  onUpdateProfile,
  onSwitchGuest,
  bookings,
  properties,
  onRefreshBookings,
  onSelectPropertyForDetail,
  isDemoDataOn = true,
  initialTab = 'bookings',
  myHostProperties = [],
  onAddCompanionForProperty,
}) => {
  // Navigation tabs: 'bookings' or 'profile'
  const [currentTab, setCurrentTab] = useState<'bookings' | 'profile'>(() => {
    return initialTab === 'settings' ? 'profile' : 'bookings';
  });

  useEffect(() => {
    if (initialTab === 'settings') {
      setCurrentTab('profile');
    } else if (initialTab === 'bookings') {
      setCurrentTab('bookings');
    }
  }, [initialTab]);

  // All bookings for this traveler
  const guestBookings = useMemo(() => {
    const emailLower = (guestProfile.email || '').toLowerCase().trim();
    if (!emailLower) return bookings;
    const matches = bookings.filter(b => b.guestEmail.toLowerCase().trim() === emailLower);
    return matches.length > 0 ? matches : bookings;
  }, [bookings, guestProfile.email]);

  // Active selected booking on the bookings view
  const [selectedBookingId, setSelectedBookingId] = useState<string>(() => {
    return guestBookings[0]?.id || '';
  });

  // Keep selected booking in sync if bookings list updates
  useEffect(() => {
    if (guestBookings.length > 0) {
      const exists = guestBookings.some(b => b.id === selectedBookingId);
      if (!exists) {
        setSelectedBookingId(guestBookings[0].id);
      }
    } else {
      setSelectedBookingId('');
    }
  }, [guestBookings, selectedBookingId]);

  const activeBooking = useMemo(() => {
    return guestBookings.find(b => b.id === selectedBookingId) || guestBookings[0] || null;
  }, [guestBookings, selectedBookingId]);

  const activeProperty = useMemo(() => {
    if (!activeBooking) return undefined;
    return properties.find(p => p.id === activeBooking.propertyId);
  }, [activeBooking, properties]);

  const matchingAccommodationOption = useMemo(() => {
    if (!activeProperty || !activeBooking?.accommodationTitle) return undefined;
    return (activeProperty.accommodations || []).find(
      a =>
        a.id === activeBooking.accommodationOptionId ||
        a.title.toLowerCase().trim() === activeBooking.accommodationTitle?.toLowerCase().trim()
    );
  }, [activeProperty, activeBooking]);

  // Traveler Profile Form state
  const [editName, setEditName] = useState(guestProfile.name || '');
  const [editEmail, setEditEmail] = useState(guestProfile.email || '');
  const [editPhone, setEditPhone] = useState(guestProfile.phone || '');
  const [editDiet, setEditDiet] = useState(guestProfile.dietaryNotes || '');
  const [editTravel, setEditTravel] = useState<TravelStyle>(
    guestProfile.travelStyle || 'Self-Contained Campervan'
  );
  const [editSeeds, setEditSeeds] = useState(guestProfile.seedSwapOfferings || '');
  const [editEmergency, setEditEmergency] = useState(guestProfile.emergencyContact || '');
  const [editGroup, setEditGroup] = useState(guestProfile.groupName || '');
  const [editRegion, setEditRegion] = useState(guestProfile.homeRegion || '');

  // Co-Travelers & Party
  const coTravelers = useMemo<CoTraveler[]>(() => {
    if (guestProfile.coTravelers && guestProfile.coTravelers.length > 0) {
      return guestProfile.coTravelers;
    }
    return (guestProfile.partyMembers || []).map((name, idx) => ({
      id: `party-${idx}`,
      name,
      relationship: 'Companion',
      canBookOnBehalf: true,
      sharesRoadtrip: true,
      sharesBookings: true,
    }));
  }, [guestProfile.coTravelers, guestProfile.partyMembers]);

  // Adding a new co-traveler state
  const [newTravName, setNewTravName] = useState('');
  const [newTravEmail, setNewTravEmail] = useState('');
  const [newTravRelationship, setNewTravRelationship] = useState('Partner / Companion');
  const [newTravCanBook, setNewTravCanBook] = useState(true);
  const [isAddingTravelerOpen, setIsAddingTravelerOpen] = useState(false);

  // Toggle a party member on an active booking
  const handleToggleTravelerInBooking = (travelerName: string) => {
    if (!activeBooking) return;
    const currentMembers = activeBooking.partyMembers || (activeBooking.guestName ? [activeBooking.guestName] : []);
    const nextMembers = currentMembers.includes(travelerName)
      ? currentMembers.filter(m => m !== travelerName)
      : [...currentMembers, travelerName];

    // Ensure at least 1 attendee remains
    const finalMembers = nextMembers.length > 0 ? nextMembers : [activeBooking.guestName || guestProfile.name || 'Lead Traveler'];
    const nextCount = Math.max(1, finalMembers.length);
    updateBookingPartyMembers(activeBooking.id, finalMembers, nextCount);
    onRefreshBookings();
    setNotice(
      finalMembers.includes(travelerName)
        ? `Added ${travelerName} to booking #${activeBooking.referenceCode}`
        : `Removed ${travelerName} from booking #${activeBooking.referenceCode}`
    );
    setTimeout(() => setNotice(null), 3000);
  };

  // Book on behalf permission state
  const [bookOnBehalfAllowed, setBookOnBehalfAllowed] = useState(guestProfile.bookOnBehalfAllowed ?? true);

  // UI state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setEditName(guestProfile.name && guestProfile.name !== 'Guest Traveler' ? guestProfile.name : '');
    setEditEmail(guestProfile.email || '');
    setEditPhone(guestProfile.phone || '');
    setEditDiet(guestProfile.dietaryNotes || '');
    setEditTravel(guestProfile.travelStyle || 'Self-Contained Campervan');
    setEditSeeds(guestProfile.seedSwapOfferings || '');
    setEditEmergency(guestProfile.emergencyContact || '');
    setEditGroup(guestProfile.groupName || '');
    setEditRegion(guestProfile.homeRegion || '');
    setBookOnBehalfAllowed(guestProfile.bookOnBehalfAllowed ?? true);
  }, [guestProfile]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Save Primary Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GuestProfile = {
      ...guestProfile,
      name: editName.trim() || 'Traveler',
      email: editEmail.trim(),
      phone: editPhone.trim(),
      dietaryNotes: editDiet.trim(),
      travelStyle: editTravel,
      seedSwapOfferings: editSeeds.trim(),
      emergencyContact: editEmergency.trim(),
      groupName: editGroup.trim(),
      homeRegion: editRegion.trim(),
      bookOnBehalfAllowed,
    };
    onUpdateProfile(updated);
    setNotice('Traveler profile details saved successfully!');
    setTimeout(() => setNotice(null), 3000);
  };

  // Add a Co-Traveler to traveling party
  const handleAddCoTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTravName.trim()) return;

    const newMember: CoTraveler = {
      id: `cotrav-${Date.now()}`,
      name: newTravName.trim(),
      email: newTravEmail.trim() || undefined,
      relationship: newTravRelationship.trim() || 'Companion',
      canBookOnBehalf: newTravCanBook,
      sharesRoadtrip: true,
      sharesBookings: true,
    };

    const updatedList = [...coTravelers, newMember];
    const updatedPartyNames = Array.from(new Set([...(guestProfile.partyMembers || []), newMember.name]));

    const updatedProfile: GuestProfile = {
      ...guestProfile,
      coTravelers: updatedList,
      partyMembers: updatedPartyNames,
    };

    onUpdateProfile(updatedProfile);
    setNewTravName('');
    setNewTravEmail('');
    setNewTravRelationship('Partner / Companion');
    setNewTravCanBook(true);
    setIsAddingTravelerOpen(false);
    setNotice(`Added ${newMember.name} as companion.`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Remove a Co-Traveler
  const handleRemoveCoTraveler = (id: string, name: string) => {
    const updatedList = coTravelers.filter(c => c.id !== id);
    const updatedPartyNames = (guestProfile.partyMembers || []).filter(m => m !== name);

    const updatedProfile: GuestProfile = {
      ...guestProfile,
      coTravelers: updatedList,
      partyMembers: updatedPartyNames,
    };

    onUpdateProfile(updatedProfile);
    setNotice(`Removed ${name} from companions.`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Toggle book-on-behalf for companion
  const handleToggleCompanionBookingPermission = (id: string) => {
    const updatedList = coTravelers.map(c =>
      c.id === id ? { ...c, canBookOnBehalf: !c.canBookOnBehalf } : c
    );
    onUpdateProfile({
      ...guestProfile,
      coTravelers: updatedList,
    });
    setNotice('Companion booking permissions updated.');
    setTimeout(() => setNotice(null), 2500);
  };

  // Toggle global book on behalf
  const handleToggleGlobalBookOnBehalf = () => {
    const nextVal = !bookOnBehalfAllowed;
    setBookOnBehalfAllowed(nextVal);
    onUpdateProfile({
      ...guestProfile,
      bookOnBehalfAllowed: nextVal,
    });
    setNotice(nextVal ? 'Permission granted: Companions can book on your behalf.' : 'Booking on behalf restricted.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleUploadProof = (bookingId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      attachPaymentProof(bookingId, dataUrl, file.name);
      onRefreshBookings();
      setNotice(`Proof of payment "${file.name}" uploaded. Host notified.`);
      setTimeout(() => setNotice(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCancel = () => {
    if (!confirmCancelBooking) return;
    cancelBooking(confirmCancelBooking.id);
    onRefreshBookings();
    setNotice(`Reservation #${confirmCancelBooking.referenceCode} cancelled.`);
    setConfirmCancelBooking(null);
    setTimeout(() => setNotice(null), 3000);
  };

  if (!isOpen) return null;

  const isConfirmed = activeBooking?.status === 'Confirmed';
  const hasGateCode = Boolean(activeProperty?.gateCode && activeProperty.gateCode.trim().length > 0);
  const gateCode = activeProperty?.gateCode?.trim() || '';
  const arrivalDirections =
    activeProperty?.exactArrivalInstructions ||
    activeProperty?.accessNotes ||
    'Please arrive 10-15 minutes prior to start. Park along the mowed orchard terrace, latch all timber gates, and follow signposts to the gathering pavilion.';

  return (
    <div id="booking-single-screen" className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-in fade-in duration-150">
      <div className="bg-[#FAF7F0] w-full rounded-2xl sm:rounded-3xl border border-[#DED7C8] shadow-sm overflow-hidden flex flex-col text-left">
        {/* UNIFIED SCREEN TOP NAVIGATION HEADER */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#E7DFD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CCBA] text-xs font-bold text-[#1E2E1A] hover:bg-[#F2ECE0] shadow-2xs transition cursor-pointer shrink-0"
              title="Return to interactive tour"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Back to Tour</span>
            </button>

            {/* UNIFIED TAB SWITCHER: NO DUPLICATION BETWEEN TOP & BOTTOM */}
            <div className="flex items-center bg-[#EFE9DC] p-1 rounded-xl border border-[#DCD3C1]">
              <button
                type="button"
                onClick={() => setCurrentTab('bookings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'bookings'
                    ? 'bg-white text-[#1C2C19] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>My Bookings</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    currentTab === 'bookings' ? 'bg-[#E8F0E6] text-[#2D5A27]' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {guestBookings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-white text-[#1C2C19] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {coTravelers.length > 0 ? (
                  <Users className="w-3.5 h-3.5 text-[#C86446]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#2D5A27]" />
                )}
                <span>{coTravelers.length > 0 ? 'Traveler & Companions' : 'Traveler Profile'}</span>
                {coTravelers.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      currentTab === 'profile' ? 'bg-[#FAF0E6] text-[#C86446]' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {1 + coTravelers.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TOP HEADER ACTIONS */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {currentTab === 'bookings' ? (
              <>
                {/* One small calendar export from bookings only */}
                {activeBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      const propList = activeProperty ? [activeProperty] : properties;
                      exportGuestCalendarIcs([activeBooking], propList, guestProfile.name);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5CCBA] bg-white text-xs font-semibold text-[#2D5A27] hover:bg-[#F2ECE0] transition cursor-pointer shadow-2xs"
                    title="Export this booking pass to your calendar (.ics)"
                  >
                    <Download className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Export .ics</span>
                  </button>
                )}

                {activeBooking && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D5CCBA] bg-white text-xs font-semibold text-stone-700 hover:bg-[#F5F0E6] transition cursor-pointer shadow-2xs"
                    title="Print your booking slip"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Print</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTravelerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5CCBA] bg-white text-xs font-bold text-[#2D5A27] hover:bg-[#F2ECE0] transition cursor-pointer shadow-2xs"
                  title="Add companion to your profile"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>+ Companion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* GLOBAL NOTICE TOAST */}
        {notice && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: MY BOOKINGS & PASSES */}
        {currentTab === 'bookings' && (
          <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-150">

            {/* MULTIPLE BOOKINGS SELECTOR TABS */}
            {guestBookings.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-stone-500 shrink-0 uppercase tracking-wider text-[10px]">
                  Your Stops:
                </span>
                {guestBookings.map((bkg, idx) => {
                  const isCurrent = bkg.id === activeBooking?.id;
                  const bkgConfirmed = bkg.status === 'Confirmed';
                  return (
                    <button
                      key={bkg.id}
                      type="button"
                      onClick={() => setSelectedBookingId(bkg.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 border ${
                        isCurrent
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs'
                          : 'bg-white text-stone-700 border-[#D5CCBA] hover:bg-[#F2ECE0]'
                      }`}
                    >
                      <span>
                        {idx + 1}. {bkg.propertyName}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          bkgConfirmed ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* HOST FARMS - STEWARD ACCESS & COMPANION MANAGEMENT */}
            {myHostProperties && myHostProperties.length > 0 && (
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#1C2C19] flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-[#2D5A27]" />
                    <span>Your Hosted Farm(s) • Steward Access</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-extrabold uppercase tracking-wide">
                    No Pass Needed
                  </span>
                </div>
                {myHostProperties.map(hostProp => {
                  const companions = (bookings || []).filter(
                    b => b.propertyId === hostProp.id && (b.isHostCompanion || b.status !== 'Cancelled / Unpaid')
                  );
                  return (
                    <div
                      key={hostProp.id}
                      className="p-4 bg-[#E8F0E6] rounded-2xl border border-[#2D5A27]/30 shadow-2xs space-y-3 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#1C2C19]">{hostProp.name}</span>
                            <span className="text-[10px] text-[#2D5A27] bg-white border border-[#2D5A27]/25 px-2 py-0.5 rounded-md font-semibold">
                              {hostProp.region.split('(')[0].trim()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#3E523A] mt-0.5">
                            Unlimited host access ($0). You do not need a pass to visit your own farm.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {onAddCompanionForProperty && (
                            <button
                              type="button"
                              onClick={() => onAddCompanionForProperty(hostProp)}
                              className="px-3 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-[#A8D59D]" />
                              <span>Add Companions to List</span>
                            </button>
                          )}
                          {onSelectPropertyForDetail && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectPropertyForDetail(hostProp);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D5CCBA] hover:bg-[#FAF8F3] text-[#1C2C19] text-xs font-semibold transition cursor-pointer"
                            >
                              View Farm
                            </button>
                          )}
                        </div>
                      </div>

                      {companions.length > 0 ? (
                        <div className="pt-2 border-t border-[#2D5A27]/20">
                          <span className="text-[11px] font-semibold text-[#1C2C19] block mb-1">
                            Companions &amp; Whānau on Attendee List ({companions.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {companions.map(c => (
                              <span
                                key={c.id}
                                className="text-[11px] bg-white border border-[#2D5A27]/25 px-2 py-0.5 rounded-md text-[#1C2C19] font-medium flex items-center gap-1 shadow-2xs"
                              >
                                <span>{c.guestName}</span>
                                <span className="text-stone-400 text-[10px]">
                                  ({c.companionRole || 'Companion'})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#4A5D47] pt-1">
                          No companions registered yet. You can add apprentices, assistants, and whānau with $0 pass fees.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* EMPTY BOOKINGS STATE */}
            {guestBookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E0D8C8] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs my-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center mx-auto shadow-2xs">
                  <Ticket className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1C2C19]">No Farm Bookings Yet</h2>
                  <p className="text-xs text-[#5D6F59] mt-1 leading-relaxed">
                    Explore 40+ permaculture venues across New Zealand. When you reserve workshops or stays, your verified pass, host contact, and exact arrival directions will appear here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Tour Events &amp; Stops</span>
                </button>
              </div>
            ) : activeBooking ? (
              <div className="space-y-4">
                {/* TRAVELING PARTY ON BOOKING (Only displayed if party has multiple members) */}
                {coTravelers.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#D5CCBA] p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#E8F0E6] text-[#2D5A27] border border-[#C6DCBF] flex items-center justify-center shrink-0 shadow-2xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#1C2C19]">
                            Companions:
                          </span>
                          <span className="text-xs text-stone-600 font-semibold">
                            {guestProfile.name || 'Lead Traveler'}, {coTravelers.map(c => c.name).join(', ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {coTravelers.length} companion{coTravelers.length === 1 ? '' : 's'} registered. Select who is attending this pass below.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTab('profile');
                        setIsAddingTravelerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2D5A27] bg-[#E8F0E6] hover:bg-[#D9E8D6] border border-[#C6DCBF] transition cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Companion</span>
                    </button>
                  </div>
                )}

                {/* THE DIGITAL BOARDING PASS / TOUR TICKET */}
                <div className="bg-white rounded-3xl border border-[#D5CCBA] shadow-md overflow-hidden">
                {/* Brand Strip */}
                <div
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white ${
                    isConfirmed ? 'bg-[#2D5A27]' : 'bg-[#C86446]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {activeProperty?.heroImage && (
                      <img
                        src={activeProperty.heroImage}
                        alt={activeBooking.propertyName}
                        onClick={() => {
                          if (activeProperty && onSelectPropertyForDetail) {
                            onClose();
                            onSelectPropertyForDetail(activeProperty);
                          }
                        }}
                        className="w-12 h-12 rounded-xl object-cover border border-white/30 shrink-0 cursor-pointer hover:opacity-90 transition"
                        title="Click to view farm event listing"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                          {activeProperty?.region || 'Aotearoa NZ'}
                        </span>
                        <span className="text-white/60">•</span>
                        <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
                          #{activeBooking.referenceCode}
                        </span>
                      </div>
                      <h2
                        onClick={() => {
                          if (activeProperty && onSelectPropertyForDetail) {
                            onClose();
                            onSelectPropertyForDetail(activeProperty);
                          }
                        }}
                        className="text-lg sm:text-xl font-bold font-display text-white mt-0.5 cursor-pointer hover:underline inline-flex items-center gap-1.5 group"
                        title="Click to view farm event listing"
                      >
                        <span className="truncate">{activeBooking.propertyName}</span>
                        <ExternalLink className="w-4 h-4 text-white/70 group-hover:text-white shrink-0 transition" />
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="px-3 py-1 rounded-full bg-white text-xs font-bold text-[#1C2C19] flex items-center gap-1.5 shadow-2xs">
                      {isConfirmed ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Confirmed &amp; Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Awaiting Payment</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Ticket Body Content */}
                <div className="p-5 sm:p-7 space-y-5 text-xs text-[#2C3B29]">
                  {/* Manage Travelers on this Booking (Only when party has multiple members) */}
                  {coTravelers.length > 0 && (
                    <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#D5CCBA] space-y-2.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#1C2C19] text-xs flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                            <span>Manage Companions on This Booking:</span>
                          </span>
                          <span className="text-[11px] font-bold text-[#2D5A27] bg-[#E8F0E6] px-2 py-0.5 rounded-md border border-[#C6DCBF]">
                            {activeBooking.attendeeCount || (activeBooking.partyMembers?.length || 1)} on Pass
                          </span>
                          {activeBooking.groupName && (
                            <span className="text-[11px] text-stone-500">• {activeBooking.groupName}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 font-medium">
                          Click any companion to toggle IN or OUT of this pass
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {/* Lead Traveler */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>{activeBooking.guestName || guestProfile.name || 'Lead Traveler'} (Lead: IN)</span>
                        </span>

                        {/* Managed Companions */}
                        {coTravelers.map(member => {
                          const isIncluded = (activeBooking.partyMembers || []).includes(member.name);
                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => handleToggleTravelerInBooking(member.name)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs border ${
                                isIncluded
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                                  : 'bg-white hover:bg-stone-100 text-stone-500 border-dashed border-stone-300'
                              }`}
                              title={`Click to mark ${member.name} ${isIncluded ? 'OUT of' : 'IN on'} this booking`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isIncluded ? 'bg-emerald-600' : 'bg-stone-300'}`}></span>
                              <span>{member.name}</span>
                              <span className={`text-[10px] font-extrabold ${isIncluded ? 'text-emerald-700' : 'text-stone-400'}`}>
                                {isIncluded ? '✓ IN' : '✗ OUT'}
                              </span>
                            </button>
                          );
                        })}

                        {/* Quick button to add another companion right from Bookings view */}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('profile');
                            setIsAddingTravelerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-[#2D5A27] bg-[#E8F0E6] hover:bg-[#D9E8D6] border border-[#C6DCBF] transition cursor-pointer"
                          title="Add companion to profile"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Companion</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 1. DISTINCT SESSIONS & STAY SECTIONS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Sessions Booked Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F8F4] border border-[#2D5A27]/25 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#2D5A27]/15">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Sprout className="w-4 h-4 text-[#A8D59D]" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#1C2C19] uppercase tracking-wider">
                              Booked Workshops &amp; Sessions
                            </h4>
                            <span className="text-[11px] text-[#4E624A]">
                              {activeBooking.components.length} activity session{activeBooking.components.length > 1 ? 's' : ''} confirmed
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-bold">
                          {activeBooking.components.length} {activeBooking.components.length === 1 ? 'Session' : 'Sessions'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-0.5">
                        {activeBooking.components.map(comp => {
                          const matchingComponent = (activeProperty?.eventComponents || []).find(
                            c => c.id === comp.componentId
                          );
                          return (
                            <div
                              key={comp.componentId}
                              className="p-3 bg-white rounded-xl border border-[#D8E4D5] shadow-2xs space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-xs text-[#1C2C19] block">
                                    {comp.componentTitle}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5 flex-wrap">
                                    <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 font-medium">
                                      {comp.activityType}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {comp.attendeeCount} traveler{comp.attendeeCount > 1 ? 's' : ''}
                                    </span>
                                    {matchingComponent?.startTime && (
                                      <>
                                        <span>•</span>
                                        <span className="text-[#2D5A27] font-semibold flex items-center gap-0.5">
                                          <Clock className="w-3 h-3 inline" />
                                          {matchingComponent.startTime} – {matchingComponent.endTime}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold text-xs text-[#2D5A27] bg-[#E8F0E6] px-2 py-0.5 rounded shrink-0">
                                  {comp.priceAmount > 0 ? `$${comp.priceAmount * comp.attendeeCount} NZD` : 'Free / Koha'}
                                </span>
                              </div>
                              {matchingComponent?.description && (
                                <p className="text-[11px] text-[#4F604B] leading-snug line-clamp-2 pt-0.5">
                                  {matchingComponent.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Farm Stay & Accommodation Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EE] border border-[#DECDBB] space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#DECDBB]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#C86446] text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#1C2C19] uppercase tracking-wider">
                                Farm Stay &amp; Accommodation
                              </h4>
                              <span className="text-[11px] text-[#7A6451]">
                                {activeBooking.accommodationTitle ? 'Overnight stay reserved' : 'Day visit only'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              activeBooking.accommodationTitle ? 'bg-[#C86446] text-white' : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {activeBooking.accommodationTitle ? 'Stay Included' : 'Day Pass'}
                          </span>
                        </div>

                        <div className="pt-2">
                          {activeBooking.accommodationTitle ? (
                            <div className="p-3 bg-white rounded-xl border border-[#E8DACB] shadow-2xs space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-xs text-[#1C2C19] block">
                                    🏕️ {activeBooking.accommodationTitle}
                                  </span>
                                  <span className="text-[10px] text-stone-500">
                                    {matchingAccommodationOption?.type || 'Overnight Farm Stay'} • {activeBooking.accommodationNights || 1} Night
                                    {(activeBooking.accommodationNights || 1) > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <span className="font-bold text-xs text-[#C86446] bg-[#FAF3EC] px-2 py-0.5 rounded shrink-0">
                                  {activeBooking.accommodationCostTotal ? `$${activeBooking.accommodationCostTotal} NZD` : 'Included'}
                                </span>
                              </div>

                              {matchingAccommodationOption?.description && (
                                <p className="text-[11px] text-stone-600 leading-snug">
                                  {matchingAccommodationOption.description}
                                </p>
                              )}

                              {matchingAccommodationOption?.amenities && matchingAccommodationOption.amenities.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-stone-100 text-[10px]">
                                  <span className="text-stone-400 font-medium">Facilities:</span>
                                  {matchingAccommodationOption.amenities.map((amenity, i) => (
                                    <span key={i} className="px-1.5 py-0.2 bg-[#FAF5EE] text-[#5D4E37] rounded border border-[#DECDBB] font-medium">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-white/80 rounded-xl border border-dashed border-[#DECDBB] text-stone-600 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-xs text-[#1C2C19]">
                                <span>☀️ Day Visit Pass Only</span>
                              </div>
                              <p className="text-[11px] leading-relaxed">
                                No overnight stay was booked at this venue. You are registered for daytime workshops and will depart before dark.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Host Contact & Registration Total */}
                      <div className="pt-3 border-t border-[#DECDBB] space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">Host Steward</span>
                            <span className="font-bold text-xs text-stone-900">{activeProperty?.hostName || 'Permaculture Host'}</span>
                            <span className="text-[10px] text-stone-500 block">
                              {activeProperty?.hostEmail || 'host@greatkiwipermatour.nz'}
                              {activeProperty?.hostPhone ? ` • ${activeProperty.hostPhone}` : ''}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Booking</span>
                            <span className="font-bold text-sm text-[#2D5A27] bg-[#E8F0E6] px-2.5 py-0.5 rounded-lg inline-block">
                              ${activeBooking.totalNzdDue} NZD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. DIRECT PAYMENT TRANSFER (IF PENDING) */}
                  {!isConfirmed && activeProperty?.bankDetails && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-3">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>Direct Host Bank Transfer</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-amber-200">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-semibold">Bank</span>
                          <span className="font-bold text-stone-900">{activeProperty.bankDetails.bankName || 'Kiwibank'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-semibold">Account</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-stone-900 text-xs">
                              {activeProperty.bankDetails.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(activeProperty.bankDetails.accountNumber, 'acct-num')}
                              className="p-0.5 text-stone-400 hover:text-amber-700 cursor-pointer"
                              title="Copy Account Number"
                            >
                              {copiedKey === 'acct-num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-semibold">Reference</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#2D5A27] text-xs">
                              #{activeBooking.referenceCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(activeBooking.referenceCode, 'ref-num')}
                              className="p-0.5 text-stone-400 hover:text-amber-700 cursor-pointer"
                              title="Copy Reference"
                            >
                              {copiedKey === 'ref-num' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Upload Proof */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-[11px] text-amber-900 font-medium">
                          {activeBooking.paymentProofUrl ? '✓ Payment slip uploaded' : 'Upload payment slip screenshot to verify quickly'}
                        </span>
                        <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{activeBooking.paymentProofUrl ? 'Update Slip' : 'Upload Slip'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => handleUploadProof(activeBooking.id, e)}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 3. ARRIVAL INSTRUCTIONS AT THE BOTTOM */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EC] border border-[#DECDBB] space-y-2.5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-[#1C2C19] font-bold text-xs uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-[#2D5A27]" />
                        <span>Arrival Directions &amp; Farm Entry</span>
                      </div>

                      {/* Host access code: only displayed if there is a code, and subtle */}
                      {hasGateCode && (
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#D5CCBA] text-xs shadow-2xs">
                          <KeyRound className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span className="text-stone-500 text-[11px]">Gate Code:</span>
                          <span className="font-mono font-bold text-[#1C2C19]">{gateCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(gateCode, 'gate')}
                            className="p-0.5 text-stone-400 hover:text-[#2D5A27] transition cursor-pointer"
                            title="Copy Gate Code"
                          >
                            {copiedKey === 'gate' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-[#E5DEC9] font-medium">
                      {arrivalDirections}
                    </p>
                  </div>

                  {/* 4. TICKET ACTIONS BAR */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeProperty && onSelectPropertyForDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectPropertyForDetail(activeProperty);
                          }}
                          className="px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white hover:bg-[#FAF6EE] text-[#2D5A27] font-semibold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>Inspect Farm Venue</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setCurrentTab('profile')}
                        className="px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white hover:bg-[#FAF6EE] text-[#7B341E] font-semibold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Companions &amp; Permissions</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmCancelBooking(activeBooking)}
                      className="px-3 py-2 text-stone-400 hover:text-red-600 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Reservation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          </div>
        )}

        {/* TAB 2: TRAVELER PROFILE & TRAVELING PARTY */}
        {currentTab === 'profile' && (
          <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-150">
            {/* Header intro / summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#D5CCBA] shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  {(guestProfile.name || 'T')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm text-[#1C2C19] truncate">
                      {guestProfile.name || 'Traveler Profile'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8F0E6] text-[#2D5A27] text-[10px] font-bold">
                      Lead Booker
                    </span>
                    {editGroup && (
                      <span className="text-xs text-stone-500 font-medium">
                        • {editGroup}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5D6F59] mt-0.5 truncate">
                    {guestProfile.email || 'No email registered'} {guestProfile.homeRegion ? `• ${guestProfile.homeRegion}` : ''}
                  </p>
                </div>
              </div>

              {/* Companion Count Badge (Only when companions registered) */}
              {coTravelers.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#D5CCBA] text-xs font-bold text-[#1C2C19] flex items-center gap-1.5 shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>{coTravelers.length} Companion{coTravelers.length === 1 ? '' : 's'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* TWO-COLUMN GRID: LEFT = PROFILE DETAILS, RIGHT = TRAVELING PARTY & PERMISSIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* COLUMN 1: PRIMARY TRAVELER PROFILE DETAILS */}
              <div className="bg-white rounded-2xl border border-[#D5CCBA] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[#1C2C19]">
                        Personal Profile Details
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Used for farm check-in, workshop attendance & dietary needs
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} id="primary-profile-form" className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="e.g. Jessica Blomfield"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="e.g. jessica@permatour.nz"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="e.g. +64 21 000 0000"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Home Region</label>
                      <input
                        type="text"
                        value={editRegion}
                        onChange={e => setEditRegion(e.target.value)}
                        placeholder="e.g. Auckland / Tāmaki Makaurau"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1.5">Travel Style &amp; Vehicle</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {TRAVEL_STYLES.map(s => {
                        const isSelected = editTravel === s.style;
                        return (
                          <button
                            key={s.style}
                            type="button"
                            onClick={() => setEditTravel(s.style)}
                            className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#E8F0E6] border-[#2D5A27] text-[#1C2C19] font-bold shadow-2xs'
                                : 'bg-[#FAF7F0] border-[#D5CCBA] text-stone-700 hover:bg-white'
                            }`}
                          >
                            <span>{s.icon}</span>
                            <span className="truncate">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Dietary Requirements</label>
                      <input
                        type="text"
                        value={editDiet}
                        onChange={e => setEditDiet(e.target.value)}
                        placeholder="e.g. Vegetarian, Gluten-Free"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={editEmergency}
                        onChange={e => setEditEmergency(e.target.value)}
                        placeholder="e.g. Liam (+64 21 000 0000)"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Seed &amp; Plant Swap Offerings</label>
                    <input
                      type="text"
                      value={editSeeds}
                      onChange={e => setEditSeeds(e.target.value)}
                      placeholder="e.g. Heritage Kūmara, Purple Maori potatoes, heirloom seeds"
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19] focus:bg-white transition"
                    />
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Profile Details</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* COLUMN 2: TRAVELING PARTY & PERMISSIONS */}
              <div className="space-y-6">
                {/* CARD: TRAVELING PARTY & PERMISSIONS (UNIFIED - ZERO DUPLICATION) */}
                <div className="bg-white rounded-2xl border border-[#D5CCBA] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#C86446] text-white flex items-center justify-center shadow-2xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-[#1C2C19]">
                          {coTravelers.length > 0 ? 'Traveling Companions & Permissions' : 'Traveling Companions (Optional)'}
                        </h3>
                        <p className="text-[11px] text-stone-500">
                          {coTravelers.length > 0
                            ? 'Add companions and give permission to book on your behalf'
                            : 'Currently solo. Add companions if others are joining your tour.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingTravelerOpen(!isAddingTravelerOpen)}
                      className="px-2.5 py-1.5 bg-[#FAF0E6] hover:bg-[#F2ECE0] text-[#C86446] border border-[#C86446]/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAddingTravelerOpen ? 'Close' : '+ Companion'}</span>
                    </button>
                  </div>

                  {/* Group / Whānau Tour Name Header (Only relevant when multiple travelers or custom group name set) */}
                  {(coTravelers.length > 0 || editGroup) && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Group / Whānau Tour Name</label>
                      <input
                        type="text"
                        value={editGroup}
                        onChange={e => setEditGroup(e.target.value)}
                        placeholder="e.g. Blomfield Whānau Tour Group"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CCBA] rounded-xl text-[#1C2C19]"
                      />
                    </div>
                  )}

                  {/* Inline Add Companion Form */}
                  {isAddingTravelerOpen && (
                    <form onSubmit={handleAddCoTraveler} className="p-4 bg-[#FAF5EE] rounded-xl border border-[#DECDBB] space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#7B341E] flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add New Companion</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingTravelerOpen(false)}
                          className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Companion Name *</label>
                          <input
                            type="text"
                            required
                            value={newTravName}
                            onChange={e => setNewTravName(e.target.value)}
                            placeholder="e.g. Liam or Aroha"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D5CCBA] rounded-lg text-[#1C2C19]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Email / Mobile (Optional)</label>
                          <input
                            type="text"
                            value={newTravEmail}
                            onChange={e => setNewTravEmail(e.target.value)}
                            placeholder="e.g. liam@example.com"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D5CCBA] rounded-lg text-[#1C2C19]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Relationship to Lead</label>
                        <input
                          type="text"
                          value={newTravRelationship}
                          onChange={e => setNewTravRelationship(e.target.value)}
                          placeholder="e.g. Partner, Child, Whānau, Friend"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D5CCBA] rounded-lg text-[#1C2C19]"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#1C2C19] pt-1 border-t border-[#DECDBB]/60">
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={newTravCanBook}
                            onChange={e => setNewTravCanBook(e.target.checked)}
                            className="rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                          />
                          <span>✓ Allow to book passes on behalf of lead</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingTravelerOpen(false)}
                          className="px-3 py-1.5 bg-white border border-stone-300 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#C86446] hover:bg-[#A94C32] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-2xs"
                        >
                          Add Companion
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Master Permission Switch */}
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D5CCBA] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span className="font-bold text-xs text-[#1C2C19]">
                          Allow Authorized Companions to Book on Behalf
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-snug mt-0.5">
                        When active, companions marked with booking permissions can reserve workshop seats and farm stays under your tour group.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleGlobalBookOnBehalf}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        bookOnBehalfAllowed ? 'bg-[#2D5A27]' : 'bg-stone-300'
                      }`}
                      title={bookOnBehalfAllowed ? 'Booking on behalf allowed' : 'Booking on behalf disabled'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          bookOnBehalfAllowed ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Companions List */}
                  {coTravelers.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Registered Companions ({coTravelers.length}):
                      </span>
                      {coTravelers.map(member => (
                        <div
                          key={member.id}
                          className="p-3 bg-white rounded-xl border border-[#D5CCBA] flex items-center justify-between gap-2.5 hover:border-[#C86446]/40 transition shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#FAF0E6] text-[#C86446] border border-[#DECDBB] flex items-center justify-center font-bold text-xs shrink-0">
                              {member.name[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-[#1C2C19] block truncate">
                                {member.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5 flex-wrap">
                                <span className="font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.2 rounded">
                                  {member.relationship || 'Companion'}
                                </span>
                                {member.email && <span>• {member.email}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Inline Book on Behalf Permission Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleCompanionBookingPermission(member.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1 border ${
                                member.canBookOnBehalf && bookOnBehalfAllowed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                              }`}
                              title="Click to toggle permission to book passes on behalf of lead"
                            >
                              <ShieldCheck className={`w-3 h-3 ${member.canBookOnBehalf && bookOnBehalfAllowed ? 'text-emerald-600' : 'text-stone-400'}`} />
                              <span>{member.canBookOnBehalf && bookOnBehalfAllowed ? '✓ Can Book' : 'View Only'}</span>
                            </button>

                            {/* Remove Companion */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCoTraveler(member.id, member.name)}
                              className="p-1.5 text-stone-400 hover:text-red-600 transition cursor-pointer rounded-lg hover:bg-red-50"
                              title={`Remove ${member.name} from companions`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#FAF7F0] border border-dashed border-[#D5CCBA] text-center space-y-1.5">
                      <p className="text-xs text-stone-600 font-medium">
                        Traveling solo (no companions registered).
                      </p>
                      <p className="text-[11px] text-stone-500">
                        If companions join your tour later, click &ldquo;+ Companion&rdquo; above to include them.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INLINE CANCELLATION CONFIRMATION DIALOG */}
        {confirmCancelBooking && (
          <div className="m-4 sm:m-6 p-5 bg-red-50 rounded-2xl border border-red-200 text-left space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-red-700 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Farm Tour Reservation?</span>
            </div>
            <p className="text-xs text-red-900 leading-relaxed">
              Are you sure you want to cancel booking <strong>#{confirmCancelBooking.referenceCode}</strong> at <strong>{confirmCancelBooking.propertyName}</strong>? Your spot will be released.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
