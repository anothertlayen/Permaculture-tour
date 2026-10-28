import React, { useState } from 'react';
import {
  X,
  Users,
  Sprout,
  Check,
  ShieldCheck,
  UserPlus,
  Plus,
  Calendar,
  Sparkles,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PropertyStop,
  Booking,
  SelectedComponentBooking,
  GuestProfile,
} from '../types';
import { generatePaymentReference } from '../utils/storage';

interface HostCompanionModalProps {
  property: PropertyStop;
  guestProfile?: GuestProfile;
  onClose: () => void;
  onAddCompanionBooking: (booking: Booking) => void;
}

const COMPANION_ROLES = [
  'Whānau / Family Member',
  'Farm Apprentice / WWOOFer',
  'Co-Host / Workshop Assistant',
  'Farm Volunteer / Crew',
  'Guest Speaker / Kaumātua',
  'Visiting Friend / Neighbor',
];

export const HostCompanionModal: React.FC<HostCompanionModalProps> = ({
  property,
  guestProfile,
  onClose,
  onAddCompanionBooking,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState(COMPANION_ROLES[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [justAddedName, setJustAddedName] = useState<string | null>(null);

  // Default all sessions to selected
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>(
    () => (property.eventComponents || []).map(c => c.id)
  );

  const toggleSession = (id: string) => {
    setSelectedSessionIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Quick chips from user's traveling party / companions
  const existingPartyMembers = [
    ...(guestProfile?.partyMembers || []),
    ...(guestProfile?.coTravelers?.map(c => c.name) || []),
  ].filter(
    (n, idx, arr) => n && n !== guestProfile?.name && arr.indexOf(n) === idx
  );

  const handleSelectPartyMember = (memberName: string) => {
    setName(memberName);
    const co = guestProfile?.coTravelers?.find(c => c.name === memberName);
    if (co?.email) setEmail(co.email);
    if (co?.phone) setPhone(co.phone);
    if (co?.relationship) {
      const match = COMPANION_ROLES.find(r =>
        r.toLowerCase().includes(co.relationship?.toLowerCase() || '')
      );
      if (match) setRole(match);
    }
  };

  const handleSubmit = (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a companion name.');
      return;
    }
    if (selectedSessionIds.length === 0) {
      setFormError('Please select at least one session for your companion.');
      return;
    }

    const selectedComponents: SelectedComponentBooking[] = (property.eventComponents || [])
      .filter(c => selectedSessionIds.includes(c.id))
      .map(comp => ({
        componentId: comp.id,
        componentTitle: comp.title,
        activityType: comp.activityType,
        pricingType: comp.pricingType,
        priceAmount: 0, // Complimentary for host companion
        attendeeCount: 1,
      }));

    const refCode = `${generatePaymentReference(property.region)}-HOST`;

    const newBooking: Booking = {
      id: `bkg-comp-${Date.now()}`,
      referenceCode: refCode,
      propertyId: property.id,
      propertyName: property.name,
      guestName: name.trim(),
      guestEmail: email.trim() || property.hostEmail || 'companion@host.nz',
      guestPhone: phone.trim() || property.hostPhone,
      dietaryNotes: dietaryNotes.trim() || `${role} • Complimentary Host Pass`,
      components: selectedComponents,
      totalNzdDue: 0,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      isManualOfflineEntry: true,
      isHostCompanion: true,
      companionRole: role,
      partyMembers: [name.trim()],
    };

    onAddCompanionBooking(newBooking);

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

    if (keepOpen) {
      setJustAddedName(name.trim());
      setName('');
      setPhone('');
      setEmail('');
      setDietaryNotes('');
      setFormError(null);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FBF8F3] rounded-3xl p-6 sm:p-7 border border-[#E0D8C8] shadow-2xl max-w-lg w-full space-y-5 text-left animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserPlus className="w-5 h-5 text-[#A8D59D]" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base sm:text-lg text-[#1C2C19] flex items-center gap-1.5">
                <span>Add Companion to Attendee List</span>
                <Sparkles className="w-4 h-4 text-[#D97706]" />
              </h3>
              <p className="text-xs text-[#5E6F5B]">
                Complimentary Pass • {property.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Host Privileges Notice */}
        <div className="p-3.5 rounded-2xl bg-[#E8F0E6] border border-[#2D5A27]/30 text-xs text-[#2D5A27] flex items-start gap-2.5 shadow-2xs">
          <Sprout className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#1C2C19] block">
              Host Steward Privilege • Zero Fees
            </span>
            <p className="text-[#3E523A] text-[11px] leading-relaxed">
              No pass is needed for you as the land steward. You can add your apprentices, whānau members, assistants, or friends directly to the official guest list with zero fees.
            </p>
          </div>
        </div>

        {justAddedName && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Added <strong>{justAddedName}</strong> to the guest list ($0). You can add another companion below, or close when finished.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setJustAddedName(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={e => handleSubmit(e, false)} className="space-y-4 text-xs">
          {/* Quick-Pick from Traveling Companions */}
          {existingPartyMembers.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#546551]">
                Quick-Pick from Your Traveling Party:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {existingPartyMembers.map(mName => (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => handleSelectPartyMember(mName)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#D5CCBA] text-[#1C2C19] text-xs font-semibold hover:bg-[#E8F0E6] hover:border-[#2D5A27] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-[#2D5A27]" />
                    <span>{mName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companion Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#324330] mb-1">
                Companion Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. Liam Blomfield"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs focus:ring-2 focus:ring-[#2D5A27]/20 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#324330] mb-1">
                Companion Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs font-medium focus:ring-2 focus:ring-[#2D5A27]/20 outline-none cursor-pointer"
              >
                {COMPANION_ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#324330] mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="For attendance notice"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs focus:ring-2 focus:ring-[#2D5A27]/20 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#324330] mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Mobile for gate contact"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs focus:ring-2 focus:ring-[#2D5A27]/20 outline-none"
              />
            </div>
          </div>

          {/* Dietary / Special Notes */}
          <div>
            <label className="block font-semibold text-[#324330] mb-1">
              Dietary Requirements / Host Notes
            </label>
            <input
              type="text"
              value={dietaryNotes}
              onChange={e => setDietaryNotes(e.target.value)}
              placeholder="e.g. Vegetarian, assisting with afternoon workbee"
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCBA] bg-white text-xs focus:ring-2 focus:ring-[#2D5A27]/20 outline-none"
            />
          </div>

          {/* Sessions & Workshops to Register For */}
          <div className="space-y-2 pt-1 border-t border-[#EFE8DC]">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#546551]">
                Sessions Included ({selectedSessionIds.length} of{' '}
                {property.eventComponents.length})
              </label>
              <button
                type="button"
                onClick={() => {
                  if (selectedSessionIds.length === property.eventComponents.length) {
                    setSelectedSessionIds([]);
                  } else {
                    setSelectedSessionIds(property.eventComponents.map(c => c.id));
                  }
                }}
                className="text-[11px] font-bold text-[#2D5A27] hover:underline cursor-pointer"
              >
                {selectedSessionIds.length === property.eventComponents.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {property.eventComponents.map(comp => {
                const isSelected = selectedSessionIds.includes(comp.id);
                return (
                  <div
                    key={comp.id}
                    onClick={() => toggleSession(comp.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#E8F0E6] border-[#2D5A27]/40 text-[#1C2C19]'
                        : 'bg-white border-[#E2DAC9] text-stone-500 hover:bg-[#FAF8F3]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] shrink-0 ${
                          isSelected
                            ? 'bg-[#2D5A27] border-[#2D5A27] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-semibold text-xs truncate">
                        {comp.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#4A5D47] shrink-0">
                      {comp.startTime}–{comp.endTime}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Free Total & Confirm Button */}
          <div className="pt-3 border-t border-[#E8DFD0] flex items-center justify-between gap-3">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#6D7D6A]">
                Companion Pass Fee
              </span>
              <span className="text-base font-bold text-[#2D5A27] font-mono">
                $0 NZD (100% Free)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-[#D5CCBA] text-stone-600 font-semibold text-xs hover:bg-[#F2ECE0] transition cursor-pointer"
              >
                {justAddedName ? 'Done' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={e => handleSubmit(e, true)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#2D5A27] text-[#2D5A27] hover:bg-[#E8F0E6] font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                title="Save this companion and register another"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register &amp; Add Another</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#A8D59D]" />
                <span>Confirm &amp; Close</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
