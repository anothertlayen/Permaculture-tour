import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Download,
  Trash2,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Users,
  Car,
  GitFork,
  Sparkles,
  Plus,
  Check,
  Sprout,
  Ticket,
  Copy,
  Receipt,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { PropertyStop, Booking, GuestProfile, CoTraveler } from '../types';

interface RoadtripItineraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryProperties: PropertyStop[];
  onRemoveFromItinerary: (id: string) => void;
  onSelectProperty: (property: PropertyStop) => void;
  allProperties?: PropertyStop[];
  onAddPropertyToItinerary?: (id: string) => void;
  onAddCompanionStop?: (stop: PropertyStop) => void;
  onStartCheckoutForProperty?: (property: PropertyStop) => void;
  bookings?: Booking[];
  allBookings?: Booking[];
  guestName?: string;
  guestEmail?: string;
  guestProfile?: GuestProfile;
  isLocalModeEnabled?: boolean;
  onOpenProfileBookings?: () => void;
  onUpdateGuestProfile?: (profile: GuestProfile) => void;
  onOpenGuestProfile?: (tab?: 'bookings' | 'profile') => void;
  hostPropertyIds?: string[];
  onAddCompanionForProperty?: (property: PropertyStop) => void;
}

export const RoadtripItineraryDrawer: React.FC<RoadtripItineraryDrawerProps> = ({
  isOpen,
  onClose,
  itineraryProperties,
  onRemoveFromItinerary,
  onSelectProperty,
  allProperties = [],
  onAddPropertyToItinerary,
  onAddCompanionStop,
  onStartCheckoutForProperty,
  bookings = [],
  allBookings = [],
  guestName,
  guestEmail,
  isSimplifiedTravelGroup = true,
  guestProfile,
  isLocalModeEnabled = false,
  onOpenProfileBookings,
  onUpdateGuestProfile,
  onOpenGuestProfile,
  hostPropertyIds = [],
  onAddCompanionForProperty,
}) => {
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const handleCopyRef = (refCode: string) => {
    navigator.clipboard?.writeText(refCode);
    setCopiedRef(refCode);
    setTimeout(() => setCopiedRef(null), 2500);
  };
  const [activeTab, setActiveTab] = useState<'stops' | 'passes'>('stops');

  const [roadtripNotice, setRoadtripNotice] = useState<string | null>(null);

  // Filter out cancelled bookings
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled / Unpaid');
  const isUnified = isSimplifiedTravelGroup;
  const leadTravelerName = guestProfile?.name || guestName || 'Lead Traveler';
  const coTravelers = guestProfile?.coTravelers || [];

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sort stops chronologically by startDate
  const sortedStops = [...(itineraryProperties || [])].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Count stops in itinerary that do not have a booked pass yet (excluding host's own farms where no pass is needed)
  const missingPassesCount = sortedStops.filter(
    stop => !hostPropertyIds.includes(stop.id) && !activeBookings.some(b => b.propertyId === stop.id)
  ).length;

  // Selected traveler filter ('all' or traveler ID)
  const [selectedTravelerId, setSelectedTravelerId] = useState<string>('all');

  // Party travelers with distinct planned stops
  const allPartyTravelers = useMemo(() => {
    return [
      {
        id: 'lead',
        name: leadTravelerName,
        isLead: true,
        relationship: 'Lead Booker',
        plannedStopIds: guestProfile?.plannedStopIds || sortedStops.map(s => s.id),
      },
      ...coTravelers.map(c => ({
        id: c.id,
        name: c.name,
        isLead: false,
        relationship: c.relationship || 'Companion',
        plannedStopIds:
          c.plannedStopIds ||
          (c.name.toLowerCase().includes('liam')
            ? (sortedStops[0] ? [sortedStops[0].id] : [])
            : sortedStops.map(s => s.id)),
      })),
    ];
  }, [leadTravelerName, guestProfile?.plannedStopIds, coTravelers, sortedStops]);

  // Only display traveling party controls when there are 2 or more travelers (lead + co-travelers)
  const hasMultipleTravelers = allPartyTravelers.length > 1;

  // Selected traveler filter (only relevant if multiple travelers exist)
  const selectedTraveler = hasMultipleTravelers
    ? allPartyTravelers.find(t => t.id === selectedTravelerId)
    : undefined;

  // Filtered stops for current view
  const displayedStops = selectedTraveler
    ? sortedStops.filter(s => selectedTraveler.plannedStopIds.includes(s.id))
    : sortedStops;

  // Toggle whether a traveler is planning / going to a specific stop
  const handleToggleTravelerForStop = (travelerId: string, stopId: string) => {
    if (!guestProfile || !onUpdateGuestProfile) return;

    if (travelerId === 'lead') {
      const current = guestProfile.plannedStopIds || sortedStops.map(s => s.id);
      const next = current.includes(stopId)
        ? current.filter(id => id !== stopId)
        : [...current, stopId];
      onUpdateGuestProfile({
        ...guestProfile,
        plannedStopIds: next,
      });
      const tName = leadTravelerName;
      setRoadtripNotice(next.includes(stopId) ? `Marked ${tName} as attending this stop.` : `Removed ${tName} from this stop.`);
      setTimeout(() => setRoadtripNotice(null), 2500);
      return;
    }

    const updatedList = (guestProfile.coTravelers || []).map(c => {
      if (c.id === travelerId) {
        const current =
          c.plannedStopIds ||
          (c.name.toLowerCase().includes('liam')
            ? (sortedStops[0] ? [sortedStops[0].id] : [])
            : sortedStops.map(s => s.id));
        const next = current.includes(stopId)
          ? current.filter(id => id !== stopId)
          : [...current, stopId];
        return { ...c, plannedStopIds: next };
      }
      return c;
    });

    onUpdateGuestProfile({
      ...guestProfile,
      coTravelers: updatedList,
    });
    const found = updatedList.find(c => c.id === travelerId);
    const isNowGoing = found?.plannedStopIds?.includes(stopId);
    setRoadtripNotice(isNowGoing ? `Marked ${found?.name} IN for this event.` : `Marked ${found?.name} OUT of this event.`);
    setTimeout(() => setRoadtripNotice(null), 2500);
  };

  // Set all managed travelers IN or OUT for a stop (Requirement 3)
  const handleSetAllTravelersForStop = (stopId: string, setIn: boolean) => {
    if (!guestProfile || !onUpdateGuestProfile) return;

    const currentLead = guestProfile.plannedStopIds || sortedStops.map(s => s.id);
    const nextLead = setIn
      ? Array.from(new Set([...currentLead, stopId]))
      : currentLead.filter(id => id !== stopId);

    const updatedCo = (guestProfile.coTravelers || []).map(c => {
      const current = c.plannedStopIds || sortedStops.map(s => s.id);
      const next = setIn
        ? Array.from(new Set([...current, stopId]))
        : current.filter(id => id !== stopId);
      return { ...c, plannedStopIds: next };
    });

    onUpdateGuestProfile({
      ...guestProfile,
      plannedStopIds: nextLead,
      coTravelers: updatedCo,
    });

    setRoadtripNotice(setIn ? 'Marked all managed travelers IN for this event.' : 'Marked all managed travelers OUT of this event.');
    setTimeout(() => setRoadtripNotice(null), 2500);
  };

  return (
    <div id="roadtrip-itinerary-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full rounded-2xl sm:rounded-3xl border border-[#E0D8C8] shadow-sm overflow-hidden flex flex-col text-left">
        {/* Navigation & Header */}
        <div className="p-4 sm:p-5 bg-[#FAF6EE] border-b border-[#E7E0D3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="itinerary-back-btn"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CCBA] text-xs font-bold text-[#1E2E1A] hover:bg-[#F2ECE0] shadow-2xs transition cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Back</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#C86446] text-white flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold font-display text-base sm:text-lg text-[#1C2C19] leading-tight">
                My Permaculture Roadtrip
              </h2>
              <span className="text-xs text-[#596A55]">
                {sortedStops.length} events planned • {activeBookings.length} passes booked
              </span>
            </div>
          </div>

          {/* Header Action: Link to Profile Bookings in Unified mode, or Tab Switcher in Group mode */}
          {isUnified ? (
            onOpenProfileBookings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileBookings();
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-[#D5CCBA] text-[#2D5A27] hover:bg-[#FAF6EE] shadow-2xs transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                title="View all confirmed bookings and reference codes in your Profile"
              >
                <Ticket className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>My Bookings in Profile</span>
                {activeBookings.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#E8F0E6] text-[#2D5A27] text-[10px] font-bold">
                    {activeBookings.length}
                  </span>
                )}
              </button>
            )
          ) : (
            /* Tab Switcher: Stops vs Passes (Group / Legacy Mode) */
            <div className="flex items-center bg-[#EBE4D5] rounded-xl p-1 border border-[#D9D0BE] shrink-0 self-start sm:self-auto">
              <button
                id="itinerary-tab-stops"
                onClick={() => setActiveTab('stops')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'stops'
                    ? 'bg-white text-[#1C2C19] shadow-xs'
                    : 'text-[#5E6E59] hover:text-[#1C2C19]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Planned Events</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#E5ECE3] text-[#2D5A27] text-[10px] font-bold">
                  {sortedStops.length}
                </span>
              </button>

              <button
                id="itinerary-tab-passes"
                onClick={() => setActiveTab('passes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'passes'
                    ? 'bg-white text-[#1C2C19] shadow-xs'
                    : 'text-[#5E6E59] hover:text-[#1C2C19]'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-[#C86446]" />
                <span>Tour Passes &amp; Tickets</span>
                {activeBookings.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#C86446] text-white text-[10px] font-bold">
                    {activeBookings.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ROADTRIP NOTICE TOAST */}
        {roadtripNotice && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{roadtripNotice}</span>
            </span>
            <button
              onClick={() => setRoadtripNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* COMPANIONS FILTER (Only displayed if more than one traveler in party) */}
          {hasMultipleTravelers && (
            <div className="bg-white rounded-2xl border border-[#D5CCBA] p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F0E6] text-[#2D5A27] border border-[#C6DCBF] flex items-center justify-center shrink-0 shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#1C2C19]">
                        Companions
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F0E6] text-[#2D5A27] text-[10px] font-bold">
                        {coTravelers.length} Companion{coTravelers.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Filter stops by companion or toggle attendance with IN / OUT buttons on each card below
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter route by companion */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-500 shrink-0">
                  View Stops For:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTravelerId('all')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                    selectedTravelerId === 'all'
                      ? 'bg-[#2D5A27] text-white border border-[#20401B]'
                      : 'bg-white hover:bg-[#FAF6EE] text-stone-700 border border-[#D5CCBA]'
                  }`}
                  title="View all events on this roadtrip"
                >
                  <span>All Stops ({sortedStops.length})</span>
                </button>
                {allPartyTravelers.map(member => {
                  const stopCount = sortedStops.filter(s => member.plannedStopIds.includes(s.id)).length;
                  const isSelected = selectedTravelerId === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedTravelerId(isSelected ? 'all' : member.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs border ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white hover:bg-emerald-50 text-[#1C2C19] border-[#D5CCBA]'
                      }`}
                      title={`Click to filter stops where ${member.name} is attending (${stopCount} stops)`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`} />
                      <span className="font-bold">{member.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'stops' ? (
            <>

          {sortedStops.length === 0 ? (
            <div className="py-6 space-y-6 text-left">
              <div className="bg-linear-to-b from-[#FAF6EE] to-white rounded-3xl p-6 border border-[#E2DAC9] shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center mx-auto shadow-2xs">
                  <Sprout className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-base text-[#1C2C19]">
                  Start Building Your 2027 Roadtrip Route
                </h4>
                <p className="text-xs text-[#5D6E5A] max-w-sm mx-auto leading-relaxed">
                  Your roadtrip itinerary is empty. Explore regenerative permaculture events across Aotearoa or add a curated starter route with 1 click to get moving!
                </p>

                {allProperties.length > 0 && onAddPropertyToItinerary && (
                  <button
                    type="button"
                    onClick={() => {
                      // Streamlined 1-click starter route: Add first 3 properties
                      const starterProps = allProperties.slice(0, 3);
                      starterProps.forEach((p) => onAddPropertyToItinerary(p.id));
                    }}
                    className="mt-2 w-full py-2.5 px-4 bg-[#2D5A27] hover:bg-[#1E3E1A] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#A8D59D]" />
                    <span>⚡ Add Curated 3-Event Starter Route (1-Click)</span>
                  </button>
                )}
              </div>

              {allProperties.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#495A46]">
                      Recommended Tour Events
                    </span>
                    <span className="text-[11px] text-stone-500">Click to add to your route</span>
                  </div>

                  <div className="space-y-2">
                    {allProperties.slice(0, 4).map((prop) => (
                      <div
                        key={prop.id}
                        className="p-3 bg-white hover:bg-[#FAF8F3] rounded-2xl border border-[#E8E0D2] shadow-2xs transition flex items-center justify-between gap-3"
                      >
                        <div
                          onClick={() => {
                            if (onSelectProperty) onSelectProperty(prop);
                          }}
                          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                        >
                          <img
                            src={prop.heroImage}
                            alt={prop.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E2DAC9]"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-[#1C2C19] truncate hover:text-[#2D5A27] transition">
                              {prop.name}
                            </h5>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#556651] mt-0.5">
                              <MapPin className="w-3 h-3 text-[#2D5A27] shrink-0" />
                              <span className="truncate">{prop.region}</span>
                              <span>•</span>
                              <span>{prop.datesText.split('-')[0].trim()}</span>
                            </div>
                          </div>
                        </div>

                        {onAddPropertyToItinerary && (
                          <button
                            type="button"
                            onClick={() => onAddPropertyToItinerary(prop.id)}
                            className="p-2 bg-[#FAF6EE] hover:bg-[#2D5A27] hover:text-white text-[#2D5A27] border border-[#D5CCBA] rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Add event to roadtrip"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>

              {/* Stop Cards */}
              {selectedTraveler && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>
                      Showing {displayedStops.length} stop{displayedStops.length === 1 ? '' : 's'} planned for <strong>{selectedTraveler.name}</strong> ({sortedStops.length} on whole roadtrip)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTravelerId('all')}
                    className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Show All Stops
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {displayedStops.map((stop, index) => {
                  const matchingBooking = activeBookings.find(b => b.propertyId === stop.id);
                  const attendingTravelers = allPartyTravelers.filter(t => t.plannedStopIds.includes(stop.id));
                  const nonAttendingTravelers = allPartyTravelers.filter(t => !t.plannedStopIds.includes(stop.id));
                  const allGoing = nonAttendingTravelers.length === 0;

                  return (
                    <div
                      key={stop.id}
                      onClick={() => {
                        onSelectProperty(stop);
                        onClose();
                      }}
                      className="p-4 bg-white rounded-2xl border border-[#E2DAC9] hover:border-[#2D5A27]/40 hover:shadow-xs transition duration-200 relative group cursor-pointer"
                      title={`Click to inspect ${stop.name} details`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#E8F0E6] text-[#2D5A27] font-bold text-[11px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#C86446]">
                            {stop.region.split('(')[0]}
                          </span>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onRemoveFromItinerary(stop.id);
                          }}
                          className="text-stone-300 hover:text-red-500 p-1 transition cursor-pointer"
                          title="Remove event from roadtrip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-[#1C2C19] mt-1.5 group-hover:text-[#2D5A27] transition">
                        {stop.name}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-[#5D6D5A] mt-1">
                        <Calendar className="w-3 h-3 text-[#2D5A27]" />
                        <span>{stop.datesText}</span>
                        <span>•</span>
                        <span>{stop.district}</span>
                      </div>

                      {/* CLEARLY DISPLAY WHO IS IN OR OUT OF THIS EVENT (Only when party has multiple travelers) */}
                      {hasMultipleTravelers && (
                        <div
                          className="mt-2.5 p-3 rounded-2xl bg-[#FAF7F0] border border-[#DECDBB] space-y-2 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#1C2C19] text-xs flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                                <span>Attendance Status ({attendingTravelers.length} IN • {nonAttendingTravelers.length} OUT):</span>
                              </span>
                              <span className="text-[10px] font-semibold text-stone-500">
                                {allGoing ? 'All IN' : attendingTravelers.length > 0 ? `${attendingTravelers.map(t => t.name.split(' ')[0]).join(' & ')} only` : 'All OUT'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] self-start sm:self-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetAllTravelersForStop(stop.id, true);
                                }}
                                className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition cursor-pointer"
                                title="Mark lead & companions IN for this stop"
                              >
                                All IN
                              </button>
                              <span className="text-stone-300">•</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetAllTravelersForStop(stop.id, false);
                                }}
                                className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold transition cursor-pointer"
                                title="Mark lead & companions OUT of this stop"
                              >
                                All OUT
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {allPartyTravelers.map(trav => {
                              const isAttending = trav.plannedStopIds.includes(stop.id);
                              return (
                                <button
                                  key={trav.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTravelerForStop(trav.id, stop.id);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs border ${
                                    isAttending
                                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                                      : 'bg-white hover:bg-stone-100 text-stone-500 border-dashed border-stone-300'
                                  }`}
                                  title={`Click to mark ${trav.name} ${isAttending ? 'OUT of' : 'IN for'} this stop`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isAttending ? 'bg-emerald-600' : 'bg-stone-300'}`}></span>
                                  <span>{trav.name}</span>
                                  <span className={`text-[10px] font-extrabold ${isAttending ? 'text-emerald-700' : 'text-stone-400'}`}>
                                    {isAttending ? '✓ IN' : '✗ OUT'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}


                      {/* Matching Tour Pass badge if already booked, or 1-click Book Pass action */}
                      {matchingBooking ? (
                        <div className="mt-2.5 p-2 rounded-xl bg-[#EAF3E7] border border-[#2D5A27]/25 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${matchingBooking.status === 'Confirmed' ? 'text-emerald-600' : 'text-amber-600'}`} />
                            <span className="text-xs font-bold text-[#1C2C19]">
                              {isUnified ? 'Booking:' : 'Pass:'} {matchingBooking.status}
                            </span>
                            <span className="font-mono text-[10px] bg-white text-[#2D5A27] px-1.5 py-0.2 rounded border border-[#2D5A27]/20 font-semibold">
                              #{matchingBooking.referenceCode}
                            </span>
                            <span className="text-[11px] text-stone-600">
                              • Booked for {matchingBooking.partyMembers && matchingBooking.partyMembers.length > 0 ? matchingBooking.partyMembers.join(', ') : matchingBooking.guestName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isUnified && onOpenProfileBookings) {
                                onClose();
                                onOpenProfileBookings();
                              } else {
                                setActiveTab('passes');
                              }
                            }}
                            className="text-[11px] font-bold text-[#2D5A27] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>{isUnified ? 'View in Profile' : 'View Ticket'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : hostPropertyIds.includes(stop.id) ? (
                        <div className="mt-2.5 p-2 rounded-xl bg-[#E8F0E6] border border-[#2D5A27]/30 flex items-center justify-between gap-2 shadow-2xs">
                          <span className="text-xs text-[#1C2C19] font-medium flex items-center gap-1.5 truncate">
                            <Sprout className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                            <span className="truncate">Your Farm • <strong>Host Steward (No Pass Needed)</strong></span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAddCompanionForProperty) {
                                onAddCompanionForProperty(stop);
                              } else {
                                onSelectProperty(stop);
                              }
                            }}
                            className="px-2.5 py-1 bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
                            title="Add companions or whānau to this farm"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-[#A8D59D]" />
                            <span>Add Companions</span>
                          </button>
                        </div>
                      ) : onStartCheckoutForProperty ? (
                        <div className="mt-2.5 p-2 rounded-xl bg-[#FAF8F3] border border-[#E7E0D3] flex items-center justify-between gap-2">
                          <span className="text-xs text-[#5D6E5A] font-medium flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-[#C86446]" />
                            <span>{isUnified ? 'No booking yet' : 'No pass booked yet'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartCheckoutForProperty(stop);
                            }}
                            className="px-3 py-1 bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
                            title={isUnified ? "Book session or stay for this stop" : "Book pass for this stop"}
                          >
                            <span>{isUnified ? 'Book Event' : 'Book Pass'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}

                      {/* Detailed Sessions & Stays Clarity Breakdown */}
                      <div className="mt-3 pt-2.5 border-t border-[#EFE8DC] space-y-2 text-xs">
                        {/* SESSIONS ROW */}
                        <div className="p-2.5 rounded-xl bg-[#F5F8F4] border border-[#2D5A27]/20 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1C2C19] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                              <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
                              <span>
                                {matchingBooking
                                  ? `Booked Sessions (${matchingBooking.components.length})`
                                  : `Available Sessions (${stop.eventComponents?.length || 0})`}
                              </span>
                            </span>
                            {matchingBooking && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Pass Active
                              </span>
                            )}
                          </div>

                          {matchingBooking ? (
                            <div className="space-y-1">
                              {matchingBooking.components.map(comp => (
                                <div key={comp.componentId} className="flex items-center justify-between text-xs text-[#2C3B29]">
                                  <span className="font-semibold truncate">• {comp.componentTitle}</span>
                                  <span className="text-[10px] text-stone-500 shrink-0 ml-2">
                                    {comp.attendeeCount} guest{comp.attendeeCount > 1 ? 's' : ''} • {comp.activityType}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {(stop.eventComponents || []).slice(0, 2).map(comp => (
                                <div key={comp.id} className="flex items-center justify-between text-xs text-[#3E4F3B]">
                                  <span className="truncate">• {comp.title}</span>
                                  <span className="text-[10px] text-stone-600 font-medium shrink-0 ml-2">
                                    {comp.priceAmount && comp.priceAmount > 0 ? `$${comp.priceAmount} NZD` : comp.pricingType}
                                  </span>
                                </div>
                              ))}
                              {(stop.eventComponents || []).length > 2 && (
                                <span className="text-[10px] text-[#2D5A27] font-semibold block">
                                  +{(stop.eventComponents || []).length - 2} more session{(stop.eventComponents || []).length - 2 > 1 ? 's' : ''} on site
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* STAYS ROW */}
                        <div className="p-2.5 rounded-xl bg-[#FAF5EE] border border-[#DECDBB] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1C2C19] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                              <Compass className="w-3.5 h-3.5 text-[#C86446]" />
                              <span>Farm Stay &amp; Camping</span>
                            </span>
                            {matchingBooking?.accommodationTitle ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E6] text-[#C86446] border border-[#C86446]/20">
                                Reserved
                              </span>
                            ) : matchingBooking ? (
                              <span className="text-[10px] font-medium text-stone-500">
                                Day Visit Only
                              </span>
                            ) : null}
                          </div>

                          {matchingBooking?.accommodationTitle ? (
                            <div className="flex items-center justify-between text-xs text-[#7B341E] font-semibold">
                              <span>🏕️ {matchingBooking.accommodationTitle}</span>
                              <span className="text-[10px] font-normal text-stone-600">
                                {matchingBooking.accommodationNights || 1} night{matchingBooking.accommodationNights && matchingBooking.accommodationNights > 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : matchingBooking ? (
                            <p className="text-[11px] text-stone-500 italic">
                              ☀️ Day event reservation • No overnight stay booked
                            </p>
                          ) : (stop.accommodations && stop.accommodations.length > 0) ? (
                            <div className="space-y-1">
                              {stop.accommodations.slice(0, 2).map(acc => (
                                <div key={acc.id} className="flex items-center justify-between text-xs text-[#5D4E37]">
                                  <span className="truncate">🏕️ {acc.title} ({acc.type.split('/')[0]})</span>
                                  <span className="text-[10px] font-bold text-[#C86446] shrink-0 ml-2">
                                    ${acc.nightlyCost} NZD/night
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-stone-500 italic">
                              ☀️ Day tour venue • No on-site camping
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#EFE8DC] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#697966]">
                          {matchingBooking ? 'Pass verified on route' : 'Tap to customize sessions & stay'}
                        </span>
                        <span className="text-xs font-semibold text-[#2D5A27] group-hover:underline flex items-center gap-0.5">
                          <span>Inspect Event</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>


              {/* Rural Offline Reminder */}
              <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#E2DAC9] text-xs text-[#4F604B] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                <p>
                  <strong>Offline Roadtrip Guarantee:</strong> All events and host instructions are saved in your browser&apos;s
                  offline storage. You can access this itinerary even when driving through remote valleys with zero mobile coverage.
                </p>
              </div>
            </>
          )}
        </>
      ) : (
        /* TOUR PASSES & TICKETS VIEW */
        <div className="space-y-4">
              {/* Passes Summary Bar */}
              <div className="p-4 bg-white rounded-2xl border border-[#E2DAC9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1C2C19] flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-[#C86446]" />
                    <span>{isUnified ? 'Your Farm Bookings & Tickets' : 'Your Permaculture Tour Passes'}</span>
                  </h3>
                  <p className="text-xs text-[#556651] mt-0.5">
                    {guestName ? (
                      <>{isUnified ? 'Booked for ' : 'Issued to '}<strong>{guestName}</strong> • </>
                    ) : (
                      <>{isUnified ? 'Direct Booking • ' : (isLocalModeEnabled ? 'Local Tour Pass • ' : 'Tour Pass • ')}</>
                    )}
                    {activeBookings.filter(b => b.status === 'Confirmed').length} Confirmed • {activeBookings.filter(b => b.status === 'Pending Payment').length} Pending Payment
                  </p>
                </div>
              </div>

              {/* Host Farms In Itinerary (No Pass Needed, with Companion Management) */}
              {itineraryProperties.filter(p => hostPropertyIds.includes(p.id)).length > 0 && (
                <div className="space-y-3 mb-4">
                  {itineraryProperties
                    .filter(p => hostPropertyIds.includes(p.id))
                    .map(hostFarm => {
                      const farmCompanions = (allBookings || []).filter(
                        b => b.propertyId === hostFarm.id && (b.isHostCompanion || b.status !== 'Cancelled / Unpaid')
                      );
                      return (
                        <div
                          key={hostFarm.id}
                          className="p-4 bg-[#E8F0E6] rounded-2xl border border-[#2D5A27]/40 shadow-2xs space-y-2.5 text-left"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#2D5A27]/20">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                                <Sprout className="w-4 h-4 text-[#A8D59D]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-sm text-[#1C2C19]">{hostFarm.name}</h4>
                                  <span className="px-2 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-extrabold uppercase">
                                    No Pass Needed
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#3E523A]">
                                  Your Hosted Farm • Land Steward Unlimited Access
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (onAddCompanionForProperty) onAddCompanionForProperty(hostFarm);
                                else onSelectProperty(hostFarm);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-[#A8D59D]" />
                              <span>Add Companions to List</span>
                            </button>
                          </div>

                          {farmCompanions.length > 0 ? (
                            <div>
                              <span className="text-[11px] font-semibold text-[#1C2C19] block mb-1">
                                Companions &amp; Whānau on Farm Guest List ({farmCompanions.length}):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {farmCompanions.map(c => (
                                  <span
                                    key={c.id}
                                    className="text-[11px] bg-white border border-[#2D5A27]/30 px-2 py-0.5 rounded-md text-[#1C2C19] font-medium flex items-center gap-1 shadow-2xs"
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
                            <p className="text-[11px] text-[#4A5D47]">
                              No companions registered yet. You can add apprentices, whānau members, or friends to your farm&apos;s guest list anytime ($0).
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {activeBookings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E2DAC9] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF3EC] text-[#C86446] flex items-center justify-center mx-auto">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#1C2C19]">{isUnified ? 'No Bookings Yet' : 'No Passes Booked Yet'}</h3>
                  <p className="text-xs text-[#5D6E5A] max-w-md mx-auto leading-relaxed">
                    {isUnified
                      ? 'When you book events or sessions on your roadtrip, your tickets, koha notes, and bank transfer reference codes will automatically appear here.'
                      : 'When you book events or sessions on your roadtrip, your passes, koha notes, and unique reference codes will automatically appear here.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('stops')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D5A27] text-white rounded-xl text-xs font-bold hover:bg-[#20401B] transition cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>View Your Planned Roadtrip Events</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((booking) => {
                    const matchingStop = allProperties.find(p => p.id === booking.propertyId) ||
                      sortedStops.find(p => p.id === booking.propertyId);

                    const singleSession = booking.components && booking.components.length === 1 ? booking.components[0] : null;
                    const primaryTitle = singleSession
                      ? singleSession.componentTitle
                      : `Farm Pass & Workshops: ${booking.propertyName}`;

                    return (
                      <div
                        key={booking.id}
                        className="p-4 bg-white rounded-2xl border border-[#E2DAC9] hover:border-[#2D5A27]/40 shadow-2xs transition duration-200"
                      >
                        {/* Header: Status, Location Badge & Reference Code */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[#EFE9DC]">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                booking.status === 'Confirmed'
                                   ? 'bg-emerald-100 text-emerald-800'
                                   : 'bg-amber-100 text-amber-800'
                              }`}>
                                <CheckCircle2 className="w-3 h-3" />
                                {booking.status === 'Confirmed' ? 'Confirmed Pass' : 'Pending Payment'}
                              </span>

                              {matchingStop && (
                                <span className="inline-flex items-center gap-1 text-xs text-[#C86446] font-semibold bg-[#FAF3EC] px-2 py-0.5 rounded-md">
                                  <MapPin className="w-3 h-3" />
                                  <span>{matchingStop.region.split('(')[0].trim()}</span>
                                </span>
                              )}

                              {matchingStop?.datesText && (
                                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#2D5A27]" />
                                  <span>{matchingStop.datesText}</span>
                                </span>
                              )}
                            </div>

                            {/* Main Event / Workshop Title */}
                            <h4 className="font-bold text-base text-[#1C2C19] mt-2">
                              {primaryTitle}
                            </h4>

                            {/* Host Farm Venue indicator (clears up venue vs workshop confusion) */}
                            <p className="text-xs text-[#5D6E5A] flex items-center gap-1 mt-0.5">
                              <span className="font-medium text-stone-500">Venue:</span>
                              <span className="font-semibold text-[#1C2C19]">{booking.propertyName}</span>
                              {matchingStop?.hostName && (
                                <span className="text-stone-400">• Hosted by {matchingStop.hostName}</span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <span className="text-xs text-stone-500 font-medium">Ref:</span>
                            <div className="flex items-center gap-1 bg-[#F4EFE6] px-2.5 py-1 rounded-lg border border-[#D5CCBA]">
                              <span className="font-mono text-xs font-bold text-[#1C2C19]">
                                {booking.referenceCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyRef(booking.referenceCode)}
                                className="text-stone-400 hover:text-[#2D5A27] transition cursor-pointer p-0.5"
                                title="Copy Reference Code"
                              >
                                {copiedRef === booking.referenceCode ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Breakdown: If single session, show concise details. If multi, list sub-events without repeating venue name */}
                        <div className="py-3 space-y-2 text-xs text-[#4F604B]">
                          {singleSession ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-[#FAF7F0] border border-[#EBE3D3]">
                              <div className="space-y-0.5">
                                <div className="font-semibold text-[#1C2C19] flex items-center gap-1.5">
                                  <span>{singleSession.activityType}</span>
                                  <span className="text-stone-400">•</span>
                                  <span className="text-stone-600 font-normal">
                                    {singleSession.attendeeCount} {singleSession.attendeeCount === 1 ? 'attendee' : 'attendees'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Pass Holder: <strong>{booking.guestName}</strong>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-[#2D5A27] self-start sm:self-auto">
                                ${booking.totalNzdDue} NZD
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="font-semibold text-[#1C2C19] flex items-center justify-between">
                                <span>Included Sessions ({booking.components.length}):</span>
                                <span className="text-sm font-bold text-[#2D5A27]">
                                  ${booking.totalNzdDue} NZD Total
                                </span>
                              </div>
                              {booking.components.map((comp, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] pl-2 border-l-2 border-[#2D5A27]/30">
                                  <span>• {comp.componentTitle} ({comp.attendeeCount} traveler{comp.attendeeCount > 1 ? 's' : ''} • {comp.activityType})</span>
                                  <span className="font-medium text-stone-600">
                                    {comp.priceAmount > 0 ? `$${comp.priceAmount * comp.attendeeCount} NZD` : 'Free / Koha'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {booking.accommodationTitle && (
                            <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[#FAF3EC] text-[#C86446] font-medium border border-[#C86446]/20">
                              <span>🏕️ Farm Stay: {booking.accommodationTitle} ({booking.accommodationNights || 1} night{booking.accommodationNights && booking.accommodationNights > 1 ? 's' : ''})</span>
                              <span className="font-semibold">
                                {booking.accommodationCostTotal ? `$${booking.accommodationCostTotal} NZD` : 'Included'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Direct Pass Info & Actions */}
                        <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E8E0D1] text-[11px] text-[#4E5E4A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                            <span>
                              {booking.status === 'Confirmed'
                                ? `Confirmed & verified pass. Gate code: ${matchingStop?.gateCode || '7294 (Farm Gate)'}`
                                : (booking.totalNzdDue > 0
                                    ? `Payment reference #${booking.referenceCode}. Amount due to host: $${booking.totalNzdDue} NZD.`
                                    : `Pass reference #${booking.referenceCode}. Free / voluntary koha upon arrival.`)}
                            </span>
                          </div>

                          {matchingStop && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectProperty(matchingStop);
                                onClose();
                              }}
                              className="text-xs font-bold text-[#2D5A27] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <span>Inspect Event</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedStops.length > 0 && (
          <div className="p-4 bg-[#FAF6EE] border-t border-[#E7E0D3] shrink-0 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#1C2C19] font-bold">
              <MapPin className="w-4 h-4 text-[#2D5A27]" />
              <span>{sortedStops.length} Roadtrip Stops Planned</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#D5CCBA] text-stone-800 font-bold hover:bg-[#F2ECE0] transition cursor-pointer shadow-2xs"
            >
              Continue Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
