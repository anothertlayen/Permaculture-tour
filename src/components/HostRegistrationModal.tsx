import React, { useState, useEffect } from 'react';
import {
  X,
  Sprout,
  Building,
  Calendar,
  Check,
  Plus,
  Trash2,
  Bed,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PropertyStop, PermacultureFeature, EventComponent, AccommodationOption } from '../types';
import { ALL_FEATURES } from './FilterBar';

interface HostRegistrationModalProps {
  onClose: () => void;
  onRegisterProperty: (newProperty: PropertyStop) => void;
  defaultHostName?: string;
  defaultHostEmail?: string;
}

const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Northland': { lat: -35.72, lng: 174.32 },
  'Auckland': { lat: -36.85, lng: 174.76 },
  'Waikato / Coromandel': { lat: -37.78, lng: 175.28 },
  'Bay of Plenty': { lat: -37.68, lng: 176.16 },
  'Gisborne': { lat: -38.66, lng: 178.02 },
  'Hawke\'s Bay': { lat: -39.49, lng: 176.91 },
  'Taranaki': { lat: -39.06, lng: 174.07 },
  'Manawatū-Whanganui': { lat: -40.35, lng: 175.61 },
  'Wellington': { lat: -41.28, lng: 174.77 },
  'Tasman / Nelson': { lat: -41.27, lng: 173.28 },
  'Marlborough': { lat: -41.51, lng: 173.95 },
  'West Coast': { lat: -42.45, lng: 171.21 },
  'Canterbury': { lat: -43.53, lng: 172.63 },
  'Otago': { lat: -45.03, lng: 168.66 },
  'Southland': { lat: -46.41, lng: 168.35 },
};

export const HostRegistrationModal: React.FC<HostRegistrationModalProps> = ({
  onClose,
  onRegisterProperty,
  defaultHostName = '',
  defaultHostEmail = '',
}) => {
  const [propertyName, setPropertyName] = useState('');
  const [region, setRegion] = useState('Waikato / Coromandel');
  const [district, setDistrict] = useState('');
  const [datesText, setDatesText] = useState('Jan 25–27, 2027');
  const [acreage, setAcreage] = useState('10 Acres');
  const [hostName, setHostName] = useState(defaultHostName);
  const [hostEmail, setHostEmail] = useState(defaultHostEmail);
  const [hostPhone, setHostPhone] = useState('');
  const [hostBio, setHostBio] = useState('');
  const [landVision, setLandVision] = useState('');
  const [addressDesc, setAddressDesc] = useState('');
  const [arrivalSecret, setArrivalSecret] = useState('');

  // Features
  const [selectedFeatures, setSelectedFeatures] = useState<PermacultureFeature[]>([
    'Food Forests',
    'Earthworks/Swales',
  ]);

  // Bank details
  const [bankName, setBankName] = useState('Kiwibank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('38-9000-0000000-00');
  const [formError, setFormError] = useState<string | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Multi-part sessions
  const [components, setComponents] = useState<EventComponent[]>([
    {
      id: 'comp-new-1',
      startTime: '09:30',
      endTime: '11:30',
      title: 'Food Forest & Homestead Guided Tour',
      activityType: 'Guided Tour',
      pricingType: 'Fixed Paid Ticket',
      priceAmount: 20,
      description: 'Guided tour of mature canopy polycultures and animal guilds.',
      capacity: 30,
      spotsRemaining: 30,
    },
    {
      id: 'comp-new-2',
      startTime: '12:00',
      endTime: '14:30',
      title: 'Swale Digging & Tree Planting Workbee',
      activityType: 'Hands-on Workbee',
      pricingType: 'Koha',
      priceAmount: 10,
      description: 'Hands-on workbee restoring soil organic matter with biochar.',
      capacity: 25,
      spotsRemaining: 25,
    },
  ]);

  const toggleFeature = (f: PermacultureFeature) => {
    setSelectedFeatures(prev =>
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const handleAddComponent = () => {
    const newC: EventComponent = {
      id: 'comp-new-' + Date.now(),
      startTime: '14:30',
      endTime: '16:00',
      title: 'Potluck & Seed Swap',
      activityType: 'Shared Meal (Potluck / Guest Harvest & Cook / Hosted Meal)',
      pricingType: 'Seed/Produce Swap',
      priceAmount: 0,
      description: 'Community meal and heirloom seed exchange.',
      capacity: 40,
      spotsRemaining: 40,
    };
    setComponents([...components, newC]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim() || !hostName.trim() || !district.trim()) {
      setFormError('Please fill in your property name, steward name, and district.');
      return;
    }
    setFormError(null);

    const newStop: PropertyStop = {
      id: 'prop-custom-' + Date.now(),
      slug: propertyName.toLowerCase().replace(/\s+/g, '-'),
      name: propertyName,
      region,
      district,
      datesText,
      startDate: '2027-01-25',
      endDate: '2027-01-27',
      coordinates: REGION_COORDINATES[region] || {
        lat: -37.78,
        lng: 175.28,
      },
      addressDescription: addressDesc || `${district}, ${region}`,
      exactArrivalInstructions:
        arrivalSecret || 'Drive slowly up the driveway past the timber barn. Park on the grass terrace.',
      hostName,
      hostAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      hostBio: hostBio || 'Passionate permaculturist and steward of regenerating land in Aotearoa.',
      hostPhone: hostPhone || '+64 21 000 0000',
      hostEmail: hostEmail || defaultHostEmail || 'host@permatour.co.nz',
      createdByEmail: hostEmail || defaultHostEmail || 'host@permatour.co.nz',
      isUserOwned: true,
      landVision: landVision || 'Creating ecological abundance and resilience for future generations.',
      landHistory: 'Established with regenerative principles and chemical-free soils.',
      propertyAcreage: acreage,
      heroImage:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      ],
      features: selectedFeatures,
      eventComponents: components,
      accommodations: [
        {
          id: 'acc-cust-1',
          type: 'Tent Sites',
          title: 'Orchard Meadow Tent Pitch',
          nightlyCost: 15,
          capacity: 2,
          availableUnits: 6,
          amenities: ['Compost Toilet', 'Spring Water Tap'],
          description: 'Camping spot on soft grass among fruit trees.',
        },
      ],
      bankDetails: {
        bankName,
        accountName: accountName || `${hostName} Permaculture`,
        accountNumber,
        instructions: 'Please enter your PERMA reference code for manual verification.',
      },
    };

    onRegisterProperty(newStop);
    try {
      confetti({ particleCount: 50 });
    } catch (e) {}
    onClose();
  };

  return (
    <div id="host-register-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full rounded-2xl sm:rounded-3xl border border-[#E0D8C8] shadow-sm overflow-hidden flex flex-col text-left">
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-[#FAF6EE] border-b border-[#E7E0D3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="host-register-back-btn"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CCBA] text-xs font-bold text-[#1E2E1A] hover:bg-[#F2ECE0] shadow-2xs transition cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Back to Tour</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#A8D59D]" />
            </div>
            <div>
              <h2 className="font-bold font-display text-base sm:text-lg text-[#1C2C19]">
                Host an Event on The Great Kiwi Permaculture Tour 2027
              </h2>
              <span className="text-xs text-[#5E6F5A]">
                Open your gates to eager permaculture travelers across Aotearoa
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {formError}
              </div>
            )}

          {/* Section 1: Property & Location */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DAC9] space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-[#2D5A27] text-xs">
              1. Property & Tour Event Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Property Name *</label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={e => setPropertyName(e.target.value)}
                  placeholder="e.g. Pohutukawa Ridge Sanctuary"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Tour Region</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="Northland (Te Tai Tokerau)">Northland (Te Tai Tokerau)</option>
                  <option value="Waikato / Coromandel">Waikato / Coromandel</option>
                  <option value="Bay of Plenty (Te Moana-a-Toi)">Bay of Plenty</option>
                  <option value="Taranaki / Whanganui">Taranaki / Whanganui</option>
                  <option value="Hawke's Bay">Hawke&apos;s Bay</option>
                  <option value="Nelson / Tasman & Golden Bay">Nelson / Tasman & Golden Bay</option>
                  <option value="Canterbury Plains & Banks Peninsula">Canterbury Plains</option>
                  <option value="Central Otago & Southland">Central Otago & Southland</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">District / Town *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Matakana / Coromandel"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Tour Dates</label>
                <input
                  type="text"
                  value={datesText}
                  onChange={e => setDatesText(e.target.value)}
                  placeholder="e.g. Jan 24–26, 2027"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Property Acreage</label>
                <input
                  type="text"
                  value={acreage}
                  onChange={e => setAcreage(e.target.value)}
                  placeholder="e.g. 12 Acres"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Demonstrated Permaculture Systems (Features)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_FEATURES.map(feat => {
                  const active = selectedFeatures.includes(feat);
                  return (
                    <button
                      type="button"
                      key={feat}
                      onClick={() => toggleFeature(feat)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                        active
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {active && '✓ '}
                      {feat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Steward Details & Bank Account */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DAC9] space-y-3">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[#C86446] text-xs flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                <span>2. Steward Contact & Bank Details (For Direct Guest Payments)</span>
              </h3>
              <div className="mt-2 p-2.5 bg-[#E8F0E6] rounded-xl border border-[#2D5A27]/25 text-xs text-[#244A1F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <p className="text-[11px]">
                  <strong>Zero fees:</strong> Guest passes, koha, and any payments are handled directly with you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Steward / Host Alias *</label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="e.g. Mere & Dan"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Host Email *</label>
                <input
                  type="email"
                  required
                  value={hostEmail}
                  onChange={e => setHostEmail(e.target.value)}
                  placeholder="host@example.co.nz"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={hostPhone}
                  onChange={e => setHostPhone(e.target.value)}
                  placeholder="+64 21..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Host Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Kiwibank / ANZ"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Pohutukawa Permaculture"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  NZ Account Number (16-digits)
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="38-9000-0000000-00"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Multi-Part Schedule Builder */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2DAC9] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-[#2D5A27] text-xs">
                3. Event Sessions Schedule ({components.length} Sessions)
              </h3>
              <button
                type="button"
                onClick={handleAddComponent}
                className="text-xs font-semibold text-[#2D5A27] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Session</span>
              </button>
            </div>

            <div className="space-y-2">
              {components.map((c, i) => (
                <div key={c.id} className="p-3 bg-[#FAF8F3] rounded-xl border border-[#ECE5D7] flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-mono font-bold text-[#2D5A27] mr-2">
                      {c.startTime} - {c.endTime}
                    </span>
                    <strong className="text-stone-900">{c.title}</strong>
                    <span className="ml-2 text-stone-500">
                      ({c.pricingType} {c.priceAmount ? '$' + c.priceAmount : ''})
                    </span>
                  </div>
                  {components.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(c.id)}
                      className="text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-t border-[#E7E0D3] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#20401B] shadow-sm transition cursor-pointer"
          >
            Publish Property Stop
          </button>
        </div>
      </form>
    </div>
  </div>
);
};
