import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Bed,
  Check,
  Plus,
  Minus,
  Share2,
  Copy,
  Mail,
  Info,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sprout,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Ticket,
  User,
  Layers,
  UserPlus,
} from 'lucide-react';
import { PropertyStop, SelectedComponentBooking, AccommodationOption, GuestProfile, ChatScope, Booking, StreamlineMode } from '../types';
import { HostCompanionModal } from './HostCompanionModal';

interface PropertyDetailModalProps {
  property: PropertyStop;
  onClose: () => void;
  onStartCheckout: (
    property: PropertyStop,
    selectedComponents: SelectedComponentBooking[],
    selectedAccommodation?: {
      option: AccommodationOption;
      nights: number;
    }
  ) => void;
  isInItinerary: boolean;
  onToggleItinerary: (id: string) => void;
  guestProfile?: GuestProfile;
  onOpenChat?: (scope: ChatScope, targetId?: string) => void;
  hasPass?: boolean;
  matchingBooking?: Booking;
  streamlineMode?: StreamlineMode;
  isSimplifiedTravelGroup?: boolean;
  isHostProperty?: boolean;
  onManageHostProperty?: () => void;
  onAddCompanionBooking?: (booking: Booking) => void;
  propertyBookings?: Booking[];
  onRemoveCompanion?: (bookingId: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onStartCheckout,
  isInItinerary,
  onToggleItinerary,
  guestProfile,
  onOpenChat,
  hasPass = false,
  matchingBooking,
  streamlineMode,
  isSimplifiedTravelGroup = false,
  isHostProperty = false,
  onManageHostProperty,
  onAddCompanionBooking,
  propertyBookings = [],
  onRemoveCompanion,
}) => {
  const [showAddCompanionModal, setShowAddCompanionModal] = useState(false);
  const isUnified = isSimplifiedTravelGroup || streamlineMode === 'unified';
  // Shared profile party size (Lead contact + party companions, or 1 in Unified mode)
  const partySize = isUnified ? 1 : Math.max(1, 1 + (guestProfile?.partyMembers?.length || 0));

  const hostCompanions = useMemo(() => {
    return (propertyBookings || []).filter(
      b => b.propertyId === property.id && (b.isHostCompanion || b.status !== 'Cancelled / Unpaid')
    );
  }, [propertyBookings, property.id]);

  // Sub-events: Profile is either IN (true) or OUT (false)
  // Default: All sub-events are IN for the profile
  const [componentsInState, setComponentsInState] = useState<{ [id: string]: boolean }>(() => {
    const initial: { [id: string]: boolean } = {};
    (property.eventComponents || []).forEach(comp => {
      initial[comp.id] = true;
    });
    return initial;
  });

  // Selected accommodation
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);
  const [accNights, setAccNights] = useState<number>(1);

  // Social share copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Re-sync and default all sub-events to IN when opening property
  useEffect(() => {
    const initial: { [id: string]: boolean } = {};
    (property.eventComponents || []).forEach(comp => {
      initial[comp.id] = true;
    });
    setComponentsInState(initial);
  }, [property.id, guestProfile?.id]);

  // Toggle single component IN / OUT
  const handleToggleComponentInOrOut = (componentId: string) => {
    setComponentsInState(prev => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  const handleSetComponentInOrOut = (componentId: string, isIn: boolean) => {
    setComponentsInState(prev => ({
      ...prev,
      [componentId]: isIn,
    }));
  };

  // Check if all sub-events are currently IN
  const allComponents = property.eventComponents || [];
  const isAllIn = allComponents.length > 0 && allComponents.every(c => componentsInState[c.id] !== false);

  const handleToggleAllInOrOut = () => {
    const targetState = !isAllIn;
    const next: { [id: string]: boolean } = {};
    allComponents.forEach(c => {
      next[c.id] = targetState;
    });
    setComponentsInState(next);
  };

  // Calculate totals for sub-events that are IN
  const selectedComponentsList: SelectedComponentBooking[] = allComponents
    .filter(c => componentsInState[c.id] !== false)
    .map(comp => ({
      componentId: comp.id,
      componentTitle: comp.title,
      activityType: comp.activityType,
      pricingType: comp.pricingType,
      priceAmount: comp.priceAmount || 0,
      attendeeCount: partySize,
    }));

  const ticketsTotalNzd = selectedComponentsList.reduce((acc, curr) => {
    if (curr.pricingType === 'Fixed Paid Ticket') {
      return acc + curr.priceAmount * curr.attendeeCount;
    }
    return acc;
  }, 0);

  const selectedAccOption = property.accommodations?.find(a => a.id === selectedAccId);
  const accommodationTotalNzd = selectedAccOption ? selectedAccOption.nightlyCost * accNights : 0;
  const grandTotalNzd = ticketsTotalNzd + accommodationTotalNzd;

  const hasAnySelection = selectedComponentsList.length > 0 || !!selectedAccOption;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'email') => {
    const text = encodeURIComponent(
      `Check out ${property.name} on The Great Kiwi Permaculture Tour 2027! Multi-part workshops and off-grid stays.`
    );
    const url = encodeURIComponent(window.location.href);

    try {
      if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      } else if (platform === 'email') {
        window.open(`mailto:?subject=${encodeURIComponent(property.name + ' - Kiwi Permaculture Tour')}&body=${text}%20${url}`, '_blank');
      }
    } catch {
      handleCopyLink();
    }
  };

  return (
    <div id="property-detail-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full rounded-2xl sm:rounded-3xl border border-[#E0D8C8] shadow-sm overflow-hidden flex flex-col relative text-left">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="bg-[#FAF6EE] px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#E7E0D3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              id="back-to-stops-btn"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#D5CCBA] text-xs font-bold text-[#1E2E1A] hover:bg-[#F2ECE0] shadow-2xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#2D5A27]" />
              <span>Back to Events</span>
            </button>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#E8F0E6] text-[#2D5A27] rounded-md">
              {property.region.split('(')[0]}
            </span>
            <span className="text-xs text-[#6B7C67] font-medium hidden sm:inline">
              {property.datesText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-itinerary-toggle"
              onClick={() => onToggleItinerary(property.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isInItinerary
                  ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                  : 'bg-white text-[#2C3B29] border-[#D5CCBA] hover:bg-[#F0EAE0]'
              }`}
            >
              {isInItinerary ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isInItinerary ? 'In Roadtrip' : 'Add to Roadtrip'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 space-y-6 sm:space-y-8">
          {/* ROADTRIP & PASS STATUS CALLOUT */}
          {isHostProperty ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#E8F0E6] border border-[#2D5A27]/40 text-xs shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Sprout className="w-5 h-5 text-[#A8D59D]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1C2C19] text-sm flex items-center gap-2">
                      <span>Your Farm • Host Steward Access</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-extrabold uppercase tracking-wide">
                        No Pass Needed
                      </span>
                    </div>
                    <p className="text-[#3E553B] text-[11px] mt-0.5 leading-relaxed">
                      As the land steward of <strong>{property.name}</strong>, you have unlimited free access to all sessions and tours. No pass purchase is needed. You can register your companions, apprentices, assistants, and whānau directly onto the guest list with zero fees.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="host-detail-add-companion-btn"
                  onClick={() => setShowAddCompanionModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#A8D59D]" />
                  <span>Add Companions to List</span>
                </button>
              </div>

              {/* Companions on Attendee List */}
              {hostCompanions.length > 0 ? (
                <div className="pt-3 border-t border-[#2D5A27]/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#1C2C19] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>Companions &amp; Whānau on Farm Attendee List ({hostCompanions.length})</span>
                    </span>
                    <span className="text-[10px] text-[#2D5A27] font-bold bg-white px-2 py-0.5 rounded-md border border-[#2D5A27]/25">
                      Complimentary Pass ($0)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hostCompanions.map(comp => (
                      <div
                        key={comp.id}
                        className="p-2.5 rounded-xl bg-white/90 border border-[#2D5A27]/25 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-[#1C2C19] truncate">{comp.guestName}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold truncate">
                              {comp.companionRole || 'Companion'}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-mono mt-0.5 truncate">
                            Ref: #{comp.referenceCode} • {comp.components?.length || 0} session{comp.components?.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        {onRemoveCompanion && (
                          <button
                            type="button"
                            onClick={() => onRemoveCompanion(comp.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                            title="Remove companion from list"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2.5 border-t border-[#2D5A27]/20 flex items-center justify-between text-[11px] text-[#3E553B]">
                  <span>No companions registered yet. Click &ldquo;Add Companions to List&rdquo; to add whānau or helpers.</span>
                </div>
              )}
            </div>
          ) : isInItinerary && !hasPass ? (
            <div className="p-4 rounded-2xl bg-[#FFF8EE] border-2 border-[#F59E0B] shadow-xs text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#92400E]">
                  <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />
                  <span>In Your Roadtrip • Entry Pass Needed</span>
                </div>
                <p className="text-[#78350F] leading-snug">
                  You have added this event to your roadtrip route, but <strong>have not yet reserved an entry pass</strong>. Select your sessions below and click <strong>&ldquo;Get Free / Koha Pass&rdquo;</strong> or <strong>&ldquo;Register for Pass&rdquo;</strong> to guarantee your place with the host.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#D97706] text-white text-[11px] font-extrabold uppercase tracking-wide shrink-0">
                Pass Needed
              </span>
            </div>
          ) : hasPass ? (
            <div className="p-4 rounded-2xl bg-[#EAF5E7] border border-[#2D5A27]/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                <div>
                  <div className="font-bold text-[#1C2C19] text-sm">
                    Pass Booked for this Event ({matchingBooking?.status || 'Confirmed'})
                  </div>
                  <div className="text-[#3E553B] text-[11px] mt-0.5">
                    Pass Reference: <span className="font-mono font-bold text-[#2D5A27]">#{matchingBooking?.referenceCode}</span> • Gate arrival instructions &amp; workshop spot secured.
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#2D5A27] text-white text-[11px] font-extrabold uppercase tracking-wide shrink-0">
                Pass Confirmed
              </span>
            </div>
          ) : null}

          {/* Hero Banner & Gallery */}
          <div>
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-sm bg-stone-200">
              <img
                src={property.heroImage}
                alt={property.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs font-medium text-[#A8D59D] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>{property.district}, {property.region}</span>
                  <span>•</span>
                  <span>{property.propertyAcreage}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display leading-tight">
                  {property.name}
                </h1>
              </div>
            </div>

            {/* Thumbnail strip if available */}
            {property.galleryImages && property.galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {property.galleryImages.map((img, idx) => (
                  <div key={idx} className="h-16 rounded-xl overflow-hidden border border-[#E2DAC9]">
                    <img
                      src={img}
                      alt="Property gallery"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Host Profile Header: Bio, Land Vision, History */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2DAC9] shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-[#EFE8DC]">
              <img
                src={property.hostAvatar}
                alt={property.hostName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#2D5A27]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-[#2D5A27] tracking-wider">
                    Land Stewards & Hosts
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0E6] text-[#2D5A27]">
                    Verified Property
                  </span>
                </div>
                <h2 className="text-xl font-bold font-display text-[#1C2C19] mt-0.5">
                  {property.hostName}
                </h2>
                <p className="text-xs sm:text-sm text-[#546451] mt-1 leading-relaxed">
                  {property.hostBio}
                </p>

                {onOpenChat && (
                  <button
                    id="property-detail-chat-btn"
                    onClick={() => onOpenChat('event', property.id)}
                    className="mt-3 px-3.5 py-1.5 rounded-xl border border-[#D5CCBA] bg-[#FAF6EE] hover:bg-[#EFE7D8] text-[#2D5A27] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Open Group Chat for this event"
                  >
                    <MessageSquare className="w-4 h-4 text-[#2D5A27]" />
                    <span>Chat with Host & Attendees (Event Channel)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Vision & History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs sm:text-sm text-[#465643]">
              <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#ECE5D7]">
                <h3 className="font-bold text-[#1E2E1A] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                  <Sprout className="w-4 h-4 text-[#2D5A27]" />
                  Land Vision
                </h3>
                <p className="leading-relaxed">{property.landVision}</p>
              </div>
              <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#ECE5D7]">
                <h3 className="font-bold text-[#1E2E1A] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-[#C86446]" />
                  Site History & Restoration
                </h3>
                <p className="leading-relaxed">{property.landHistory}</p>
              </div>
            </div>

            {/* Permaculture Feature Badges */}
            <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#63725F] mb-2">
                Demonstrated Permaculture Systems:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(property.features || []).map(f => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E8F0E6] text-[#244A1F] border border-[#2D5A27]/20"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* DYNAMIC MULTI-PART SCHEDULE BUILDER (Default All Sessions IN for Profile) */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2DAC9] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                  Event Sessions & Schedule
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display text-[#1C2C19]">
                  Sessions Participation
                </h2>
                <p className="text-xs text-[#52644F] mt-0.5">
                  Default: All sessions are IN for your profile. Switch to OUT for any sessions you wish to skip.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAllInOrOut}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                    isAllIn
                      ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                      : 'bg-white text-[#2D5A27] border-[#2D5A27] hover:bg-[#F3F8F1]'
                  }`}
                >
                  {isAllIn ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>All {allComponents.length} Sessions IN (Default)</span>
                    </>
                  ) : (
                    <span>Set All to IN</span>
                  )}
                </button>
                {isAllIn && (
                  <button
                    type="button"
                    onClick={handleToggleAllInOrOut}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-stone-300 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                  >
                    Mark All OUT
                  </button>
                )}
              </div>
            </div>

            {/* TOUR PASS PROFILE BANNER (Shared Party only; hidden in unified mode) */}
            {!isUnified && (
              <div className="bg-[#F3F8F1] border border-[#2D5A27]/25 rounded-2xl p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                    {isUnified ? <Layers className="w-5 h-5 text-[#A8D59D]" /> : partySize > 1 ? <Users className="w-5 h-5 text-[#A8D59D]" /> : <User className="w-5 h-5 text-[#A8D59D]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#1C2C19]">
                        {isUnified || partySize === 1
                          ? `Tour Pass: ${guestProfile?.name || 'Personal Pass'}`
                          : `Tour Pass: ${guestProfile?.groupName || (guestProfile ? `${guestProfile.name} & Companions` : 'Tour Pass')}`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-bold">
                        {isUnified || partySize === 1 ? '1 Pass' : `${partySize} Passes`}
                      </span>
                    </div>
                    <p className="text-xs text-[#4E624A] mt-0.5">
                      Direct registration for your pass — select IN or OUT per session.
                    </p>
                    {!isUnified && partySize > 1 && guestProfile && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        <span className="text-[10px] font-semibold text-stone-500">Companions on pass:</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700 font-medium">
                          {guestProfile.name} (Lead)
                        </span>
                        {(guestProfile.coTravelers?.map(c => c.name) || guestProfile.partyMembers || []).map((m, idx) => (
                          <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700 font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-[#2D5A27] bg-white px-3 py-1.5 rounded-xl border border-[#C5D9C0] shadow-2xs self-start sm:self-center">
                  {selectedComponentsList.length} of {allComponents.length} Sessions IN
                </div>
              </div>
            </div>
            )}

            {/* List of sessions */}
            <div className="space-y-3">
              {allComponents.map(comp => {
                const isIn = componentsInState[comp.id] !== false;

                return (
                  <div
                    key={comp.id}
                    id={`schedule-component-${comp.id}`}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isIn
                        ? 'bg-[#F4F9F2] border-[#2D5A27] shadow-xs ring-1 ring-[#2D5A27]/20'
                        : 'bg-[#FAF8F3] border-[#E2DAC9] hover:border-stone-400 opacity-75'
                    }`}
                    onClick={() => handleToggleComponentInOrOut(comp.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-2xs ${
                              isIn
                                ? 'bg-[#2D5A27] text-white'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {isIn ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{isIn ? 'PROFILE IN' : 'PROFILE OUT'}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-[#2D5A27] border border-[#D5CCBA]">
                            {comp.startTime} – {comp.endTime}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#ECE6D9] text-[#556551]">
                            {comp.activityType}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#1C2C19]">{comp.title}</h3>
                        <p className="text-xs text-[#536250] mt-1 leading-relaxed">
                          {comp.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[#697966]">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>Capacity: {comp.capacity}</span>
                          </span>
                          <span>•</span>
                          <span className="text-[#2D5A27] font-semibold">
                            {comp.spotsRemaining} spots left
                          </span>
                        </div>
                      </div>

                      {/* Right price and Profile IN / OUT toggle */}
                      <div
                        onClick={e => e.stopPropagation()}
                        className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DEC4]"
                      >
                        <div className="text-right">
                          <span
                            className={`text-sm sm:text-base font-bold ${
                              comp.pricingType === 'Fixed Paid Ticket'
                                ? 'text-[#2D5A27]'
                                : comp.pricingType === 'Koha'
                                ? 'text-[#C86446]'
                                : 'text-[#42523F]'
                            }`}
                          >
                            {comp.pricingType === 'Fixed Paid Ticket'
                              ? `$${comp.priceAmount * partySize} NZD`
                              : comp.pricingType === 'Koha'
                              ? 'Koha (Donation)'
                              : comp.pricingType === 'Seed/Produce Swap'
                              ? 'Bring Seeds/Produce'
                              : 'Free Entry'}
                          </span>
                          <span className="block text-[10px] text-[#6D7D6A]">
                            {comp.pricingType === 'Fixed Paid Ticket' && partySize > 1
                              ? `$${comp.priceAmount} × ${partySize} Passes`
                              : comp.pricingType}
                          </span>
                        </div>

                        {/* Explicit Profile IN / OUT Toggle (NO quantity controls) */}
                        <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#D5CCBA] shadow-2xs">
                          <button
                            id={`profile-in-btn-${comp.id}`}
                            type="button"
                            onClick={() => handleSetComponentInOrOut(comp.id, true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isIn
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                            title="Mark Profile IN"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>IN</span>
                          </button>
                          <button
                            id={`profile-out-btn-${comp.id}`}
                            type="button"
                            onClick={() => handleSetComponentInOrOut(comp.id, false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              !isIn
                                ? 'bg-[#8C3A27] text-white shadow-xs'
                                : 'text-stone-400 hover:text-stone-700'
                            }`}
                            title="Mark Profile OUT"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>OUT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* INTEGRATED ACCOMMODATION BOOKING SECTION */}
          {property.accommodations && property.accommodations.length > 0 && (
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2DAC9] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C86446]">
                    Optional Add-on
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-[#1C2C19] flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[#C86446]" />
                    <span>Low-Impact Overnight Accommodation</span>
                  </h2>
                </div>
                {selectedAccId && (
                  <button
                    onClick={() => setSelectedAccId(null)}
                    className="text-xs text-[#C86446] underline cursor-pointer"
                  >
                    Remove Stay
                  </button>
                )}
              </div>

              <p className="text-xs text-[#52634F] mb-4 leading-relaxed">
                Stay on the land alongside the host community. Bring your campervan, tent, or stay in handcrafted strawbale cabins.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {property.accommodations.map(acc => {
                  const isSelected = selectedAccId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccId(isSelected ? null : acc.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#FFF7F4] border-[#C86446] ring-2 ring-[#C86446]/20'
                          : 'bg-[#FAF8F3] border-[#E2DAC9] hover:border-stone-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-white border border-[#D5CCBA] text-[#C86446] rounded">
                            {acc.type}
                          </span>
                          <span className="text-sm font-bold text-[#1C2C19]">
                            ${acc.nightlyCost} <span className="text-xs font-normal text-stone-500">/ night</span>
                          </span>
                        </div>
                        <h3 className="font-bold text-[#1C2C19] text-sm mt-2">{acc.title}</h3>
                        <p className="text-xs text-[#546551] mt-1 leading-relaxed">
                          {acc.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#ECE5D7]">
                        <div className="flex flex-wrap gap-1">
                          {acc.amenities.map((a, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-white text-[#4D5D4A] border border-stone-200">
                              {a}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-[11px] text-[#2D5A27] font-medium flex items-center justify-between">
                          <span>{acc.availableUnits} spots available</span>
                          <span className="font-semibold">{isSelected ? '✓ Selected' : '+ Select'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* If accommodation is selected, show nights selector */}
              {selectedAccId && (
                <div className="mt-4 p-3.5 bg-[#FFF9F6] rounded-xl border border-[#F0D5CB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-[#C86446]" />
                    <span className="font-semibold text-[#283824]">
                      Stay Duration for {selectedAccOption?.title}:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAccNights(Math.max(1, accNights - 1))}
                      className="w-7 h-7 rounded-md bg-white border border-[#E0D0C8] flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm w-12 text-center text-[#1C2C19]">
                      {accNights} {accNights === 1 ? 'night' : 'nights'}
                    </span>
                    <button
                      onClick={() => setAccNights(accNights + 1)}
                      className="w-7 h-7 rounded-md bg-white border border-[#E0D0C8] flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                    <span className="font-bold text-[#C86446] ml-2 text-sm">
                      = ${selectedAccOption ? selectedAccOption.nightlyCost * accNights : 0} NZD
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Simple Direct Payment Notice */}
          <div className="bg-[#FAF6EF] rounded-2xl p-4 border border-[#E2DAC9] flex items-center gap-3 text-xs text-[#3E503B]">
            <ShieldCheck className="w-5 h-5 text-[#2D5A27] shrink-0" />
            <div>
              <strong className="text-[#1E2E1A] font-bold block">Zero Fees • Free Passes, Koha & Direct Support</strong>
              <p className="text-[12px] text-[#556652]">
                Zero fees — guest passes, koha, and any payments are handled directly with hosts.
              </p>
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM CHECKOUT & SOCIAL SHARE BAR */}
        <div className="shrink-0 bg-[#FBF8F3] px-4 py-3 sm:px-5 sm:py-4 border-t border-[#E5DECE] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Social Share bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-xs font-semibold text-[#6E7E6A] flex items-center gap-1 shrink-0">
              <Share2 className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span className="hidden sm:inline">Share:</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleShare('whatsapp')}
                className="px-2 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-semibold transition cursor-pointer"
                title="Share via WhatsApp"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="px-2 py-1 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] text-xs font-semibold transition cursor-pointer"
                title="Share on Facebook"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare('email')}
                className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 transition cursor-pointer"
                title="Share via Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopyLink}
                className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right Action: Summary & Checkout Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
            <div className="text-left sm:text-right">
              <span className="block text-[10px] sm:text-[11px] uppercase font-bold text-[#72836F] truncate max-w-[120px] sm:max-w-none">
                {isHostProperty ? 'Steward Access' : `Total Due (${selectedComponentsList.length} ${selectedComponentsList.length === 1 ? 'session' : 'sessions'}${selectedAccOption ? ' + stay' : ''})`}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#1C2C19]">
                {isHostProperty ? '$0 • No Pass Needed' : (grandTotalNzd === 0 ? 'Free / Koha' : `$${grandTotalNzd} NZD`)}
              </span>
            </div>

            {isHostProperty ? (
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                <span className="text-xs font-bold text-[#2D5A27] bg-[#E8F0E6] px-3 py-2 rounded-xl border border-[#2D5A27]/25 flex items-center gap-1.5 shadow-2xs">
                  <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Your Farm • No Pass Needed</span>
                </span>
                <button
                  id="host-footer-add-companion-btn"
                  onClick={() => setShowAddCompanionModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#A8D59D]" />
                  <span>Add Companions to List</span>
                </button>
                {onManageHostProperty && (
                  <button
                    onClick={onManageHostProperty}
                    className="px-3 py-2.5 rounded-xl border border-[#D5CCBA] bg-white hover:bg-[#F2ECE0] text-[#1C2C19] font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Host Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                id="proceed-bank-checkout-btn"
                disabled={!hasAnySelection}
                onClick={() => {
                  onStartCheckout(
                    property,
                    selectedComponentsList,
                    selectedAccOption ? { option: selectedAccOption, nights: accNights } : undefined
                  );
                }}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                  hasAnySelection
                    ? 'bg-[#2D5A27] hover:bg-[#20401B] text-white'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>{grandTotalNzd === 0 ? 'Get Free / Koha Pass' : 'Register for Pass'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Host Companion Registration Modal */}
      {showAddCompanionModal && (
        <HostCompanionModal
          property={property}
          guestProfile={guestProfile}
          onClose={() => setShowAddCompanionModal(false)}
          onAddCompanionBooking={(b) => {
            if (onAddCompanionBooking) onAddCompanionBooking(b);
          }}
        />
      )}
    </div>
  );
};
