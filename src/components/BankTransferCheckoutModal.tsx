import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  Mail,
  Smartphone,
  Calendar,
  AlertCircle,
  FileImage,
  Users,
  Car,
  GitFork,
  Split,
  UserPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PropertyStop,
  SelectedComponentBooking,
  AccommodationOption,
  Booking,
  GuestProfile,
  CoTraveler,
  StreamlineMode,
  CaravanGroup,
  TravelPod,
  ForkedRoadtrip,
} from '../types';
import { generatePaymentReference, saveStoredGuestProfile } from '../utils/storage';

interface BankTransferCheckoutModalProps {
  property: PropertyStop;
  selectedComponents: SelectedComponentBooking[];
  selectedAccommodation?: {
    option: AccommodationOption;
    nights: number;
  };
  onClose: () => void;
  onBookingComplete: (newBooking: Booking) => void;
  onUpdateGuestProfile?: (profile: GuestProfile) => void;
  prefillEmail?: string;
  guestProfile?: GuestProfile;
  onOpenGuestPass?: () => void;
  streamlineMode?: StreamlineMode;
  caravanGroup?: CaravanGroup;
  travelPod?: TravelPod;
  forkedRoadtrip?: ForkedRoadtrip;
  isDemoDataOn?: boolean;
  isLocalModeEnabled?: boolean;
  isSimplifiedTravelGroup?: boolean;
}

export const BankTransferCheckoutModal: React.FC<BankTransferCheckoutModalProps> = ({
  property,
  selectedComponents,
  selectedAccommodation,
  onClose,
  onBookingComplete,
  onUpdateGuestProfile,
  prefillEmail = '',
  guestProfile,
  onOpenGuestPass,
  streamlineMode = 'unified',
  caravanGroup,
  travelPod,
  forkedRoadtrip,
  isDemoDataOn = true,
  isLocalModeEnabled = false,
  isSimplifiedTravelGroup = true,
}) => {
  // Step 1: Guest Information
  // Step 2: Reference Code & Host Bank Transfer Instructions
  const [step, setStep] = useState<'form' | 'instructions'>('form');
  const isUnified = streamlineMode === 'unified' || isSimplifiedTravelGroup;

  // Form State - Respect clean state if demo data is OFF
  const initialGuestName = isDemoDataOn
    ? (guestProfile?.name && guestProfile.name !== 'Guest Traveler' ? guestProfile.name : 'Aroha Taiaroa')
    : (guestProfile?.name && guestProfile.name !== 'Guest Traveler' ? guestProfile.name : '');
  const initialGuestEmail = isDemoDataOn
    ? guestProfile?.email || prefillEmail || 'aroha@permaculture.co.nz'
    : guestProfile?.email || prefillEmail || '';
  const initialGuestPhone = isDemoDataOn
    ? guestProfile?.phone || '+64 21 555 3829'
    : guestProfile?.phone || '';

  const [guestName, setGuestName] = useState(initialGuestName);
  const [guestEmail, setGuestEmail] = useState(initialGuestEmail);
  const [guestPhone, setGuestPhone] = useState(initialGuestPhone);
  const [dietaryNotes, setDietaryNotes] = useState(guestProfile?.dietaryNotes || '');
  const [kohaNote, setKohaNote] = useState('');
  const [seedSwapNote, setSeedSwapNote] = useState(guestProfile?.seedSwapOfferings || '');
  const [formError, setFormError] = useState<string | null>(null);

  // Generated Booking
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Split payment state for Pods mode
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPaymentDetails, setSplitPaymentDetails] = useState<
    Array<{ memberName: string; amountNzd: number; refCode: string }>
  >([]);

  // Travel Pod members list
  const activePodMembers = travelPod?.members && travelPod.members.length > 0
    ? travelPod.members
    : isDemoDataOn
    ? [
        { id: 'm-1', name: guestName || 'Aroha Taiaroa', role: 'Lead Planner' },
        { id: 'm-2', name: 'Taylor Quinn', role: 'Companion' },
      ]
    : guestName
    ? [{ id: 'm-1', name: guestName, role: 'Lead Planner' }]
    : [];

  // Pods attendee selection per session: componentId -> member IDs attending
  const [podAttendeeSelection, setPodAttendeeSelection] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    selectedComponents.forEach(c => {
      map[c.componentId] = activePodMembers.map(m => m.id);
    });
    return map;
  });

  // Available extra travelers from guestProfile and any added during this checkout
  const [customTravelers, setCustomTravelers] = useState<string[]>([]);
  const [isAddingBookingTraveler, setIsAddingBookingTraveler] = useState(false);
  const [newBookingTravelerName, setNewBookingTravelerName] = useState('');

  const availablePartyMembers = useMemo<string[]>(() => {
    const fromProfile =
      guestProfile?.coTravelers && guestProfile.coTravelers.length > 0
        ? guestProfile.coTravelers.map(c => c.name)
        : guestProfile?.partyMembers || [];
    return Array.from(new Set([...fromProfile, ...customTravelers]));
  }, [guestProfile, customTravelers]);

  // Selected party members attending this specific booking
  const [selectedPartyMembers, setSelectedPartyMembers] = useState<string[]>(() => availablePartyMembers);

  const handleTogglePartyMember = (name: string) => {
    setSelectedPartyMembers(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleAddBookingTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBookingTravelerName.trim();
    if (!trimmed) return;
    setCustomTravelers(prev => [...prev, trimmed]);
    setSelectedPartyMembers(prev => Array.from(new Set([...prev, trimmed])));
    setNewBookingTravelerName('');
    setIsAddingBookingTraveler(false);

    if (guestProfile && onUpdateGuestProfile) {
      const newCoTraveler: CoTraveler = {
        id: `cotrav-${Date.now()}`,
        name: trimmed,
        relationship: 'Companion',
        canBookOnBehalf: true,
      };
      const updated: GuestProfile = {
        ...guestProfile,
        coTravelers: [...(guestProfile.coTravelers || []), newCoTraveler],
        partyMembers: Array.from(new Set([...(guestProfile.partyMembers || []), trimmed])),
      };
      onUpdateGuestProfile(updated);
      saveStoredGuestProfile(updated);
    }
  };

  const handleTogglePodMember = (componentId: string, memberId: string) => {
    setPodAttendeeSelection(prev => {
      const current = prev[componentId] || [];
      const updated = current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId];
      return { ...prev, [componentId]: updated };
    });
  };

  // Copy feedbacks
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedSplitRefIndex, setCopiedSplitRefIndex] = useState<number | null>(null);

  // Proof screenshot upload state
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Email simulation preview modal
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEmailModal) {
          setShowEmailModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showEmailModal]);

  // Totals
  let ticketsTotal = 0;
  if (streamlineMode === 'pods') {
    ticketsTotal = selectedComponents.reduce((sum, c) => {
      if (c.pricingType !== 'Fixed Paid Ticket') return sum;
      const count = (podAttendeeSelection[c.componentId] || []).length;
      return sum + c.priceAmount * count;
    }, 0);
  } else {
    ticketsTotal = selectedComponents.reduce((sum, c) => {
      return c.pricingType === 'Fixed Paid Ticket' ? sum + c.priceAmount * c.attendeeCount : sum;
    }, 0);
  }

  const accommodationTotal = selectedAccommodation
    ? selectedAccommodation.option.nightlyCost * selectedAccommodation.nights
    : 0;

  const totalNzd = ticketsTotal + accommodationTotal;

  // Split calculation per member for Pods
  const member1 = activePodMembers[0] || { id: 'm-1', name: 'Traveler 1' };
  const member2 = activePodMembers[1] || { id: 'm-2', name: 'Traveler 2' };

  let member1Total = 0;
  let member2Total = 0;
  if (streamlineMode === 'pods') {
    selectedComponents.forEach(c => {
      if (c.pricingType === 'Fixed Paid Ticket') {
        const attending = podAttendeeSelection[c.componentId] || [];
        if (attending.includes(member1.id)) member1Total += c.priceAmount;
        if (attending.includes(member2.id)) member2Total += c.priceAmount;
      }
    });
    const halfStay = Math.round(accommodationTotal / 2);
    member1Total += halfStay;
    member2Total += accommodationTotal - halfStay;
  }

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setFormError('Please provide your name, email, and phone number so the host can verify your transfer and send directions.');
      return;
    }
    setFormError(null);

    const refCode = generatePaymentReference(property.region);
    const partyMembers = selectedPartyMembers;
    const attendeeCount = Math.max(
      1 + partyMembers.length,
      selectedComponents.reduce((max, c) => Math.max(max, c.attendeeCount), 1)
    );

    // Tag mode annotations
    let finalDietary = dietaryNotes.trim();
    if (streamlineMode === 'caravan' && caravanGroup) {
      finalDietary = `[Caravan #${caravanGroup.code} - Convoy with ${caravanGroup.companionName}] ${finalDietary}`.trim();
    } else if (streamlineMode === 'pods' && travelPod) {
      finalDietary = `[Pod: ${travelPod.name} (${travelPod.vehicleDescription})] ${finalDietary}`.trim();
    } else if (streamlineMode === 'forking' && forkedRoadtrip) {
      finalDietary = `[Forked Route: ${forkedRoadtrip.forkCode}] ${finalDietary}`.trim();
    }

    const newBooking: Booking = {
      id: 'bkg-' + Date.now(),
      referenceCode: refCode,
      propertyId: property.id,
      propertyName: property.name,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      dietaryNotes: finalDietary || undefined,
      components: selectedComponents.map(c => ({
        ...c,
        attendeeCount:
          streamlineMode === 'pods'
            ? (podAttendeeSelection[c.componentId] || []).length
            : Math.max(c.attendeeCount, attendeeCount),
      })),
      accommodationOptionId: selectedAccommodation?.option.id,
      accommodationTitle: selectedAccommodation?.option.title,
      accommodationNights: selectedAccommodation?.nights,
      accommodationCostTotal: accommodationTotal > 0 ? accommodationTotal : undefined,
      totalNzdDue: totalNzd,
      kohaNotes: kohaNote.trim() || undefined,
      seedSwapDescription: seedSwapNote.trim() || undefined,
      status: totalNzd === 0 ? 'Confirmed' : 'Pending Payment',
      createdAt: new Date().toISOString(),
      isManualOfflineEntry: false,
      attendeeCount,
      partyMembers: partyMembers.length > 0 ? partyMembers : undefined,
      groupName: guestProfile?.groupName || (partyMembers.length > 0 ? `${guestName.trim()} & Party` : undefined),
    };

    if (streamlineMode === 'pods' && isSplitPayment) {
      setSplitPaymentDetails([
        { memberName: member1.name, amountNzd: member1Total, refCode: `${refCode}-P1` },
        { memberName: member2.name, amountNzd: member2Total, refCode: `${refCode}-P2` },
      ]);
    }

    // Ensure a guest identity is always created locally and persisted, ready to be sent to hosts
    const updatedProfile: GuestProfile = {
      ...(guestProfile || {}),
      id: guestProfile?.id && guestProfile.id !== 'guest-local' && guestProfile.id !== 'guest-clean'
        ? guestProfile.id
        : `guest-local-${Date.now()}`,
      name: guestName.trim(),
      email: guestEmail.trim(),
      phone: guestPhone.trim(),
      dietaryNotes: dietaryNotes.trim() || guestProfile?.dietaryNotes || '',
      seedSwapOfferings: seedSwapNote.trim() || guestProfile?.seedSwapOfferings || '',
      partyMembers: isUnified ? [] : (partyMembers.length > 0 ? partyMembers : (guestProfile?.partyMembers || [])),
      groupName: isUnified ? undefined : (guestProfile?.groupName || (partyMembers.length > 0 ? `${guestName.trim()} & Whānau` : undefined)),
      isCreatedLocally: true,
      createdAt: guestProfile?.createdAt || new Date().toISOString(),
    };
    saveStoredGuestProfile(updatedProfile);
    if (onUpdateGuestProfile) {
      onUpdateGuestProfile(updatedProfile);
    }

    setCreatedBooking(newBooking);
    onBookingComplete(newBooking);
    setStep('instructions');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = (text: string, type: 'ref' | 'account' | 'split', splitIdx?: number) => {
    navigator.clipboard?.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === 'split' && splitIdx !== undefined) {
      setCopiedSplitRefIndex(splitIdx);
      setTimeout(() => setCopiedSplitRefIndex(null), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProof(true);
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result as string);
      setProofFileName(file.name);
      setIsUploadingProof(false);
      // If we have createdBooking, update it
      if (createdBooking) {
        createdBooking.paymentProofUrl = reader.result as string;
        createdBooking.paymentProofFileName = file.name;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="bank-transfer-checkout-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full rounded-2xl sm:rounded-3xl border border-[#E0D8C8] shadow-sm overflow-hidden flex flex-col text-left">
        {/* Navigation & Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-[#FAF6EE] border-b border-[#E7E0D3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="back-to-property-btn"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CCBA] text-xs font-bold text-[#1E2E1A] hover:bg-[#F2ECE0] shadow-2xs transition cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Back to Event</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center font-bold text-xs">
              NZ
            </div>
            <div>
              <h2 className="font-bold font-display text-base sm:text-lg text-[#1E2E1A]">
                {step === 'form'
                  ? (totalNzd > 0 ? 'Guest Registration & Payment' : 'Guest Pass Registration')
                  : (totalNzd > 0 ? 'Direct Payment Instructions' : 'Guest Pass Confirmed')}
              </h2>
              <p className="text-xs text-[#5D6E58]">
                {property.name}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-7">
          {step === 'form' ? (
            <form onSubmit={handleSubmitRegistration} className="space-y-6">

              {!isUnified && streamlineMode === 'caravan' && (
                <div className="p-3.5 bg-[#E8F0E6] rounded-xl border border-[#2D5A27]/25 text-xs text-[#243521] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-[#1C2C19]">
                      <Users className="w-4 h-4 text-[#2D5A27]" />
                      Caravan Pass: #{caravanGroup?.code || 'FERN-789'}
                    </span>
                    <span className="text-[10px] font-bold text-[#2D5A27] bg-white px-2 py-0.5 rounded-md border border-[#2D5A27]/20">
                      In Convoy with {caravanGroup?.companionName || 'Alex Rivers'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#41553E] leading-relaxed">
                    <strong>Independent Cart:</strong> You are booking and paying for your own tickets independently with zero shared liability. The host will note your Caravan Pass to allocate adjacent parking/campsite spaces upon arrival.
                  </p>
                </div>
              )}

              {!isUnified && streamlineMode === 'pods' && (
                <div className="p-3.5 bg-[#FAF0E6] rounded-xl border border-[#C86446]/25 text-xs text-[#243521] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-[#1C2C19]">
                      <Car className="w-4 h-4 text-[#C86446]" />
                      Travel Pod: {travelPod?.name || 'Mahu Hiace Pod'}
                    </span>
                    <span className="text-[10px] font-bold text-[#C86446] bg-white px-2 py-0.5 rounded-md border border-[#C86446]/20">
                      {travelPod?.vehicleDescription || '1998 Toyota Hiace'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A6355] leading-relaxed">
                    Vehicle pitch is shared by the pod. You can customize per-person workshop attendance and select split payment references below.
                  </p>
                </div>
              )}

              {!isUnified && streamlineMode === 'forking' && (
                <div className="p-3.5 bg-[#EAF0F6] rounded-xl border border-[#2B5B84]/25 text-xs text-[#1C2C19] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-[#1C2C19]">
                      <GitFork className="w-4 h-4 text-[#2B5B84]" />
                      Forked Route: {forkedRoadtrip?.forkCode || 'KT-FORK-504'}
                    </span>
                    <span className="text-[10px] font-bold text-[#2B5B84] bg-white px-2 py-0.5 rounded-md border border-[#2B5B84]/20">
                      Forked from {forkedRoadtrip?.authorName || 'Tane & Pip'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A5D6F] leading-relaxed">
                    <strong>Independent Booking:</strong> Individual booking with your personal reference code. Zero liability or debt to route curators.
                  </p>
                </div>
              )}

              {/* Summary of what is being booked */}
              <div className="bg-white rounded-xl p-4 border border-[#E2DAC9] text-xs space-y-2">
                <span className="block font-bold uppercase tracking-wider text-[#63725F] mb-1">
                  Selected Event Sessions ({selectedComponents.length})
                </span>
                {selectedComponents.map(c => {
                  const attendeeCount =
                    streamlineMode === 'pods'
                      ? (podAttendeeSelection[c.componentId] || []).length
                      : c.attendeeCount;

                  return (
                    <div key={c.componentId} className="py-2 border-b border-[#F5EFE4] last:border-b-0 space-y-1.5">
                      <div className="flex items-center justify-between text-[#2D3D2A]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#2D5A27] text-white text-[10px] font-bold">
                            IN
                          </span>
                          <span className="font-medium text-[#1C2C19]">
                            {c.componentTitle}
                          </span>
                        </div>
                        <span className="font-semibold text-xs">
                          {c.pricingType === 'Fixed Paid Ticket'
                            ? `$${c.priceAmount * attendeeCount} NZD`
                            : c.pricingType}
                        </span>
                      </div>

                      {/* Travel Pods: Per-attendee checkbox variation */}
                      {streamlineMode === 'pods' && c.pricingType === 'Fixed Paid Ticket' && (
                        <div className="flex items-center gap-3 pl-6 pt-1 text-[11px]">
                          <span className="text-stone-500 font-medium">Attendees:</span>
                          {activePodMembers.map(m => {
                            const isSelected = (podAttendeeSelection[c.componentId] || []).includes(m.id);
                            return (
                              <label key={m.id} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleTogglePodMember(c.componentId, m.id)}
                                  className="rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                                />
                                <span className={isSelected ? 'font-semibold text-[#1C2C19]' : 'text-stone-400 line-through'}>
                                  {m.name} (${c.priceAmount})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {selectedAccommodation && (
                  <div className="flex items-center justify-between text-[#C86446] pt-2 border-t border-[#EFE8DC] font-medium">
                    <span>
                      Stay: {selectedAccommodation.option.title} ({selectedAccommodation.nights} nights)
                    </span>
                    <span className="font-bold">${accommodationTotal} NZD</span>
                  </div>
                )}

                {/* Zero Platform Fee line item */}
                <div className="flex items-center justify-between text-xs text-[#2D5A27] pt-2 border-t border-[#EFE8DC] font-medium">
                  <span>Platform & Intermediary Fees:</span>
                  <span className="font-semibold">$0.00 (Zero platform fees)</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D5] text-sm font-bold text-[#1C2C19]">
                  <span>{totalNzd > 0 ? 'Total Due to Host:' : 'Total (Free / Koha):'}</span>
                  <span className="text-base text-[#2D5A27] font-mono">
                    {totalNzd > 0 ? `$${totalNzd} NZD` : 'Free / Koha'}
                  </span>
                </div>
              </div>

              {/* PODS SPLIT PAYMENT OPTION */}
              {streamlineMode === 'pods' && (
                <div className="p-3.5 bg-white rounded-xl border border-[#E2DAC9] text-xs space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[#344631] block">
                    Pod Payment Arrangement
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSplitPayment(false)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        !isSplitPayment
                          ? 'bg-[#E8F0E6] border-[#2D5A27] text-[#1C2C19] font-bold shadow-xs'
                          : 'bg-[#FAF8F3] border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block text-xs">Single Pod Transfer</span>
                      <span className="text-[11px] font-normal text-stone-500">1 reference code for total ${totalNzd} NZD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSplitPayment(true)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSplitPayment
                          ? 'bg-[#E8F0E6] border-[#2D5A27] text-[#1C2C19] font-bold shadow-xs'
                          : 'bg-[#FAF8F3] border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block text-xs flex items-center gap-1">
                        <Split className="w-3.5 h-3.5 text-[#2D5A27]" /> Split References
                      </span>
                      <span className="text-[11px] font-normal text-stone-500">
                        {member1.name}: ${member1Total} • {member2.name}: ${member2Total}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {availablePartyMembers.length > 0 && (
                <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#D5CCBA] text-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-bold text-[#1C2C19] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#2D5A27]" />
                      <span>Manage Companions for This Booking ({1 + selectedPartyMembers.length} IN):</span>
                    </span>
                    <div className="flex items-center gap-1 text-[11px] self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedPartyMembers(availablePartyMembers)}
                        className="text-[#2D5A27] font-bold hover:underline cursor-pointer"
                      >
                        All IN
                      </button>
                      <span className="text-stone-300">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPartyMembers([])}
                        className="text-stone-500 font-bold hover:underline cursor-pointer"
                      >
                        Lead Only
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{guestName || 'Lead Booker'} (Lead: IN)</span>
                    </span>
                    {availablePartyMembers.map(name => {
                      const isIncluded = selectedPartyMembers.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleTogglePartyMember(name)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs border ${
                            isIncluded
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                              : 'bg-white hover:bg-stone-100 text-stone-500 border-dashed border-stone-300'
                          }`}
                          title={`Click to mark ${name} ${isIncluded ? 'OUT' : 'IN'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isIncluded ? 'bg-emerald-600' : 'bg-stone-300'}`}></span>
                          <span>{name}</span>
                          <span className={`text-[10px] font-bold ${isIncluded ? 'text-emerald-700' : 'text-stone-400'}`}>
                            {isIncluded ? '✓ IN' : '✗ OUT'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Click any companion to include (IN) or exclude (OUT) from this farm event reservation.
                  </p>
                </div>
              )}

              {/* Event Booking: Option to add a companion to this booking */}
              {isAddingBookingTraveler ? (
                <form onSubmit={handleAddBookingTraveler} className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D5CCBA] text-xs space-y-2 animate-in fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1C2C19] flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>Add Companion</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingBookingTraveler(false)}
                      className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newBookingTravelerName}
                      onChange={e => setNewBookingTravelerName(e.target.value)}
                      placeholder="Companion Name (e.g. Aroha Blomfield)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D5CCBA] rounded-lg text-[#1C2C19]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
                    >
                      Add Companion
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingBookingTraveler(true)}
                    className="text-xs font-bold text-[#2D5A27] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Companion</span>
                  </button>
                </div>
              )}

              {/* Guest Details Fields */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                  Primary Guest Contact
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#30402D] mb-1">
                    Alias *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Aroha"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white text-sm text-[#1C2C19] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#30402D] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      placeholder="e.g. aroha@example.co.nz"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white text-sm text-[#1C2C19] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#30402D] mb-1">
                      Mobile Phone (for arrival SMS) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      placeholder="e.g. +64 21 000 0000"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white text-sm text-[#1C2C19] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#30402D] mb-1">
                    Dietary Requirements or Accessibility Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={dietaryNotes}
                    onChange={e => setDietaryNotes(e.target.value)}
                    placeholder="e.g. Vegetarian, wheelchair access note, walking assistance..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white text-sm text-[#1C2C19] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
                  />
                </div>

                {/* Seed Swap or Koha Notes if present */}
                {selectedComponents.some(c => c.pricingType === 'Seed/Produce Swap') && (
                  <div>
                    <label className="block text-xs font-semibold text-[#30402D] mb-1">
                      What seeds or homegrown produce will you bring to swap?
                    </label>
                    <input
                      type="text"
                      value={seedSwapNote}
                      onChange={e => setSeedSwapNote(e.target.value)}
                      placeholder="e.g. Heritage bean seeds, fermented sourdough starter, feijoa chutney..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D5CCBA] bg-white text-sm text-[#1C2C19]"
                    />
                  </div>
                )}
              </div>

              {/* Simple Zero Fees Notice */}
              <div className="p-3.5 bg-[#E8F0E6] rounded-xl border border-[#2D5A27]/20 flex items-center gap-2.5 text-xs text-[#244A1F]">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <p>
                  <strong>Zero fees:</strong> Guest passes, koha, and any payments are handled directly with hosts.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-registration-btn"
                  className="w-full py-3.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Submit Registration & Generate Reference</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: REGISTRATION CONFIRMATION & DIRECT PAYMENT IF APPLICABLE */
            <div className="space-y-6 animate-in fade-in">
              {/* Success Banner */}
              <div className="bg-[#E8F0E6] rounded-2xl p-4 sm:p-5 border border-[#2D5A27]/30 text-center">
                <div className="w-12 h-12 bg-[#2D5A27] text-white rounded-full flex items-center justify-center mx-auto mb-2.5">
                  <CheckCircle2 className="w-7 h-7 text-[#A8D59D]" />
                </div>
                <h3 className="text-xl font-bold font-display text-[#192A17]">
                  {totalNzd > 0 ? 'Registration Submitted!' : 'Guest Pass Confirmed!'}
                </h3>
                <p className="text-xs text-[#4A5E46] mt-1 max-w-lg mx-auto">
                  {totalNzd > 0 ? (
                    <>
                      Your place is reserved in <strong>Pending Payment</strong> status.
                      Host <strong>{property.hostName}</strong> has received your guest registration under{' '}
                      <strong>{createdBooking?.guestName}</strong> ({createdBooking?.guestEmail}, {createdBooking?.guestPhone}).
                      Please complete the direct payment using the details below so the host can confirm your booking.
                    </>
                  ) : (
                    <>
                      Your guest pass is <strong>Confirmed</strong>! Host <strong>{property.hostName}</strong> has received your registration under{' '}
                      <strong>{createdBooking?.guestName}</strong> ({createdBooking?.guestEmail}, {createdBooking?.guestPhone}).
                      Your reference code below is active.
                    </>
                  )}
                </p>
              </div>

              {/* UNIQUE REFERENCE CODE HIGHLIGHT (OR SPLIT POD REFERENCES) */}
              {streamlineMode === 'pods' && isSplitPayment && splitPaymentDetails.length > 0 ? (
                <div className="bg-white rounded-2xl p-5 border-2 border-[#2D5A27] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] flex items-center gap-1.5">
                      <Split className="w-4 h-4" /> 1. Split Pod Payment References ({splitPaymentDetails.length} Slips)
                    </span>
                    <span className="text-[11px] font-semibold text-[#C86446]">
                      Pay separately from individual bank apps
                    </span>
                  </div>
                  <p className="text-xs text-[#52634F]">
                    Both companions can now complete their transfer using their own dedicated reference code below:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {splitPaymentDetails.map((slip, sIdx) => (
                      <div key={sIdx} className="p-3.5 bg-[#FAF8F3] rounded-xl border border-[#DCD4C4] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1C2C19]">{slip.memberName}</span>
                          <span className="font-bold text-xs text-[#2D5A27] font-mono">${slip.amountNzd} NZD</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200">
                          <span className="font-mono font-bold text-sm text-[#1C2C19]">{slip.refCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(slip.refCode, 'split', sIdx)}
                            className="px-2.5 py-1 bg-[#2D5A27] text-white text-[11px] font-semibold rounded-md hover:bg-[#20401B] transition flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSplitRefIndex === sIdx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSplitRefIndex === sIdx ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 border-2 border-[#2D5A27] shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                      {totalNzd > 0 ? '1. Your Unique Payment Reference' : (isUnified ? 'Your Booking Reference' : 'Your Tour Pass Reference')}
                    </span>
                    {!isUnified && streamlineMode === 'caravan' && caravanGroup ? (
                      <span className="text-[11px] font-bold text-[#2D5A27] bg-[#E8F0E6] px-2 py-0.5 rounded-md">
                        Caravan #{caravanGroup.code}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#2D5A27]">
                        {totalNzd > 0 ? 'Enter in bank reference' : 'Present upon arrival'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#FAF8F3] rounded-xl border border-[#DCD4C4] mt-2">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#1C2C19] tracking-wider">
                      {createdBooking?.referenceCode}
                    </span>
                    <button
                      onClick={() => createdBooking && handleCopy(createdBooking.referenceCode, 'ref')}
                      className="px-3 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#20401B] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRef ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#647460] mt-1.5">
                    {totalNzd > 0 ? (
                      <>Enter this code in your banking app&apos;s <strong>Reference</strong> or <strong>Particulars</strong> field.</>
                    ) : (
                      <>Keep this code handy to present to host <strong>{property.hostName}</strong> upon arrival or when offering voluntary koha / seed swaps.</>
                    )}
                  </p>
                </div>
              )}

              {/* HOST BANK ACCOUNT DETAILS (ONLY IF PAID) OR FREE/KOHA NOTICE */}
              {totalNzd > 0 ? (
                <>
                  <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-xs space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#344631] flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#C86446]" />
                      2. Host&apos;s Bank Account Details
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#ECE5D7]">
                        <span className="block text-[#73836F] font-medium">Bank Name</span>
                        <span className="text-sm font-bold text-[#1C2C19]">
                          {property.bankDetails.bankName}
                        </span>
                      </div>

                      <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#ECE5D7]">
                        <span className="block text-[#73836F] font-medium">Account Name</span>
                        <span className="text-sm font-bold text-[#1C2C19] truncate block">
                          {property.bankDetails.accountName}
                        </span>
                      </div>
                    </div>

                    {/* Account Number with copy */}
                    <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#ECE5D7] flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] text-[#73836F] font-medium">Account Number</span>
                        <span className="font-mono text-base sm:text-lg font-bold text-[#1C2C19]">
                          {property.bankDetails.accountNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(property.bankDetails.accountNumber, 'account')}
                        className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-[#FAF8F3] rounded-xl border border-[#ECE5D7] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-[#4D5E4A] block">
                          Amount to Transfer:
                        </span>
                        <span className="text-[11px] text-[#2D5A27] font-medium">
                          Zero fees — handled directly with host
                        </span>
                      </div>
                      <span className="font-bold font-mono text-base text-[#2D5A27]">
                        ${totalNzd} NZD
                      </span>
                    </div>
                  </div>

                  {/* PROOF OF PAYMENT SCREENSHOT UPLOAD */}
                  <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#344631] flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#2D5A27]" />
                        3. Upload Proof of Payment Screenshot (Optional / Speeds Up Approval)
                      </span>
                    </div>
                    <p className="text-xs text-[#63735F] mb-3">
                      Upload a screenshot or PDF receipt of your completed payment.
                      The host will cross-reference this in their dashboard to confirm your spot immediately.
                    </p>

                    {proofPreview ? (
                      <div className="p-3 bg-[#E8F0E6] rounded-xl border border-[#2D5A27]/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#244E1F]">
                          <FileImage className="w-5 h-5 text-[#2D5A27]" />
                          <span className="font-semibold truncate max-w-[200px]">
                            {proofFileName || 'transfer_receipt.png'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#2D5A27]">✓ Attached</span>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#DCD4C4] hover:border-[#2D5A27] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F3] transition">
                        <Upload className="w-6 h-6 text-[#72826F] mb-1.5" />
                        <span className="text-xs font-semibold text-[#2D3E2A]">
                          {isUploadingProof ? 'Attaching...' : 'Click or drop screenshot here'}
                        </span>
                        <span className="text-[10px] text-stone-500 mt-0.5">PNG, JPG, or PDF up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl p-5 border border-[#E2DAC9] shadow-xs space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                    Free / Koha Pass Confirmed
                  </span>
                  <p className="text-xs text-[#52634F] leading-relaxed">
                    No bank transfer is required for this pass. If you wish to offer voluntary koha, produce, or join the seed swap, you can connect directly with <strong>{property.hostName}</strong> when you arrive at the farm gate.
                  </p>
                </div>
              )}

              {/* AUTOMATED EMAIL SIMULATION BANNER */}
              <div className="p-4 bg-[#FAF6EE] rounded-xl border border-[#E2DAC9] flex items-center justify-between text-xs text-[#4F604B]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C86446]" />
                  <span>
                    {totalNzd > 0 ? (
                      <>A payment details email has been dispatched to <strong>{createdBooking?.guestEmail}</strong>.</>
                    ) : (
                      <>A pass confirmation email has been dispatched to <strong>{createdBooking?.guestEmail}</strong>.</>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="text-xs font-bold text-[#2D5A27] underline hover:text-[#1F3E1B] shrink-0 ml-2 cursor-pointer"
                >
                  Preview Email
                </button>
              </div>

              {/* Done & Close button */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                {onOpenGuestPass && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenGuestPass();
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#2D5A27] text-[#2D5A27] bg-white hover:bg-[#F3EFE7] font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                    <span>{streamlineMode === 'unified' ? 'View in Roadtrip' : 'View in My Tour Bookings'}</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D5A27] text-white font-bold text-xs hover:bg-[#20401B] transition cursor-pointer"
                >
                  {totalNzd > 0 ? 'Done (I will transfer now)' : 'Done'}
                </button>
              </div>

              {/* INLINE PREVIEW OF SIMULATED EMAIL */}
              {showEmailModal && createdBooking && (
                <div className="p-5 bg-white rounded-2xl border border-stone-300 shadow-sm text-left space-y-3 text-xs text-stone-800 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#2D5A27]" />
                      <span className="font-bold text-sm text-[#1C2C19]">Simulated Automated Email Dispatch Preview</span>
                    </div>
                    <button onClick={() => setShowEmailModal(false)} className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px] space-y-1">
                    <div><strong>To:</strong> {createdBooking.guestEmail}</div>
                    <div><strong>From:</strong> bookings@greatkiwipermatour.nz</div>
                    <div><strong>Subject:</strong> {totalNzd > 0 ? `[Pending Payment] Your Tour Registration for ${property.name} (${createdBooking.referenceCode})` : (isUnified ? `[Confirmed Booking] Your Reservation for ${property.name} (${createdBooking.referenceCode})` : `[Confirmed Pass] Your Tour Pass for ${property.name} (${createdBooking.referenceCode})`)}</div>
                  </div>

                  <div className="space-y-2.5 text-stone-700 leading-relaxed">
                    <p>Kia ora {createdBooking.guestName},</p>
                    <p>
                      Thank you for registering for <strong>{property.name}</strong> on The Great Kiwi Permaculture Tour 2027!
                    </p>
                    <div className="bg-[#FAF8F3] p-3 rounded-lg border border-[#E8E1D2] space-y-1 text-stone-900 font-medium">
                      <div>• Reference Code: <strong>{createdBooking.referenceCode}</strong></div>
                      <div>• Status: <strong>{createdBooking.status}</strong></div>
                      {totalNzd > 0 && (
                        <>
                          <div>• Total Amount: <strong>${createdBooking.totalNzdDue} NZD</strong></div>
                          <div>• Host Bank: <strong>{property.bankDetails.bankName}</strong></div>
                          <div>• Account Name: <strong>{property.bankDetails.accountName}</strong></div>
                          <div>• Account Number: <strong>{property.bankDetails.accountNumber}</strong></div>
                        </>
                      )}
                    </div>
                    <p>
                      {totalNzd > 0 ? (
                        <>Once your payment clears, your host will mark your booking <strong>Confirmed</strong>, delivering your pin-drop coordinates, gate code, and arrival directions.</>
                      ) : (
                        <>Your pass is confirmed. Present your reference code upon arrival at the farm gate. If you wish to offer voluntary koha or exchange seeds, you can do so directly with the host.</>
                      )}
                    </p>
                    <p>Ngā mihi nui,<br />The Great Kiwi Permaculture Tour Whānau</p>
                  </div>

                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-black transition cursor-pointer"
                  >
                    Hide Email Preview
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
