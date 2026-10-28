import {
  PropertyStop,
  Booking,
  GuestProfile,
  ChatMessage,
  CaravanGroup,
  TravelPod,
  ForkedRoadtrip,
  StreamlineMode,
  SharedRoadtripOverlay,
} from '../types';
import { INITIAL_PROPERTIES, INITIAL_BOOKINGS } from '../data/mockData';
import { INITIAL_CHAT_MESSAGES } from '../data/mockChat';

const PROPERTIES_KEY = 'kiwi_perma_properties_2027';
const BOOKINGS_KEY = 'kiwi_perma_bookings_2027';
const ITINERARY_KEY = 'kiwi_perma_itinerary_2027';
const USER_ROLE_KEY = 'kiwi_perma_user_role_2027';
const CURRENT_HOST_PROP_KEY = 'kiwi_perma_current_host_prop';
const GUEST_PROFILE_KEY = 'kiwi_perma_guest_profile_2027';
const CHAT_MESSAGES_KEY = 'kiwi_perma_chat_messages_2027';
const CARAVAN_GROUP_KEY = 'kiwi_perma_caravan_group_2027';
const TRAVEL_POD_KEY = 'kiwi_perma_travel_pod_2027';
const FORKED_ROADTRIP_KEY = 'kiwi_perma_forked_roadtrip_2027';
export const DEMO_DATA_ENABLED_KEY = 'kiwi_perma_demo_data_enabled_2027';

export const DEMO_GUESTS: GuestProfile[] = [
  {
    id: 'guest-demo-1',
    name: 'Jessica Blomfield',
    email: 'jess.blomfield@gmail.com',
    phone: '+64 21 990 2314',
    dietaryNotes: 'Plant-based / Vegetarian',
    groupName: 'Blomfield Whānau Tour Pass',
    partyMembers: ['Aroha Blomfield', 'Liam Blomfield'],
    emergencyContact: 'Aroha Blomfield (+64 21 445 1102)',
    travelStyle: 'Self-Contained Campervan',
    seedSwapOfferings: 'Heirloom Maori purple potatoes, heritage sweet corn, wild rongoā kawakawa cuttings',
    homeRegion: 'Auckland (Tāmaki Makaurau)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T10:00:00Z',
    bookOnBehalfAllowed: true,
    authorizedBookers: ['aroha.blomfield@gmail.com', 'Liam Blomfield'],
    coTravelers: [
      { id: 'cotrav-1', name: 'Aroha Blomfield', email: 'aroha.blomfield@gmail.com', relationship: 'Partner', canBookOnBehalf: true, sharesRoadtrip: true, sharesBookings: true, plannedStopIds: ['prop-wai-01', 'prop-nth-02'] },
      { id: 'cotrav-2', name: 'Liam Blomfield', relationship: 'Whānau / Child', canBookOnBehalf: false, sharesRoadtrip: true, sharesBookings: true, plannedStopIds: ['prop-wai-01'] },
    ],
    plannedStopIds: ['prop-wai-01', 'prop-nth-02'],
  },
  {
    id: 'guest-demo-2',
    name: 'Mark Henderson',
    email: 'mark.henderson@ecotrust.nz',
    phone: '+64 22 882 1099',
    dietaryNotes: 'Gluten-Free, Dairy-Free',
    groupName: 'Mark & Sarah Eco-Tour',
    partyMembers: ['Sarah Henderson'],
    emergencyContact: 'Sarah Henderson (+64 22 114 9822)',
    travelStyle: 'Tent & Car',
    seedSwapOfferings: 'Russian comfrey crowns, self-fertile feijoa cuttings',
    homeRegion: 'Waikato',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-05T14:30:00Z',
    bookOnBehalfAllowed: true,
    authorizedBookers: ['Sarah Henderson'],
    coTravelers: [
      { id: 'cotrav-3', name: 'Sarah Henderson', email: 'sarah.henderson@ecotrust.nz', relationship: 'Companion', canBookOnBehalf: true, sharesRoadtrip: true, sharesBookings: true, plannedStopIds: ['prop-wai-01', 'prop-bop-03'] },
    ],
    plannedStopIds: ['prop-wai-01', 'prop-bop-03', 'prop-hb-04'],
  },
  {
    id: 'guest-demo-3',
    name: 'Alex Rivers',
    email: 'alex.rivers@kiwitour.nz',
    phone: '+64 27 554 9912',
    dietaryNotes: 'Whole food plant-based',
    groupName: 'Alex & Friends Convoy',
    partyMembers: ['Hone Te Rangi'],
    emergencyContact: 'Hone Te Rangi (+64 27 332 1184)',
    travelStyle: 'Self-Contained Campervan',
    seedSwapOfferings: 'Subtropical passionfruit seedlings, heritage kūmara tubers',
    homeRegion: 'Northland (Te Tai Tokerau)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-10T09:00:00Z',
    bookOnBehalfAllowed: true,
    authorizedBookers: ['Hone Te Rangi'],
    coTravelers: [
      { id: 'cotrav-4', name: 'Hone Te Rangi', email: 'hone.terangi@gmail.com', relationship: 'Co-driver', canBookOnBehalf: true, sharesRoadtrip: true, sharesBookings: true, plannedStopIds: ['prop-nth-02', 'prop-wai-01'] },
    ],
    plannedStopIds: ['prop-nth-02', 'prop-wai-01', 'prop-tar-05'],
  },
];

export const CLEAN_GUEST_PROFILE: GuestProfile = {
  id: 'guest-local',
  name: '',
  email: '',
  phone: '',
  dietaryNotes: '',
  groupName: '',
  partyMembers: [],
  travelStyle: 'Self-Contained Campervan',
  seedSwapOfferings: '',
  homeRegion: '',
  createdAt: new Date().toISOString(),
  isCreatedLocally: false,
  bookOnBehalfAllowed: true,
  authorizedBookers: [],
  coTravelers: [],
};

export function isGuestProfileConfigured(profile?: GuestProfile | null): boolean {
  if (!profile) return false;
  const name = (profile.name || '').trim();
  if (!name || name.toLowerCase() === 'guest traveler') return false;
  const hasContact = Boolean(
    (profile.email && profile.email.trim().length > 0) ||
    (profile.phone && profile.phone.trim().length > 0)
  );
  return hasContact || Boolean(profile.isCreatedLocally);
}

export const DEMO_CARAVAN_GROUP: CaravanGroup = {
  code: 'FERN-789',
  name: 'Whānau & Friends Convoy',
  companionName: 'Alex Rivers',
  companionEmail: 'alex.rivers@kiwitour.nz',
  companionStops: ['prop-nth-02', 'prop-bop-03'],
};

export const CLEAN_CARAVAN_GROUP: CaravanGroup = {
  code: 'CONVOY-001',
  name: 'My Roadtrip Convoy',
  companionName: '',
  companionEmail: '',
  companionStops: [],
};

export const DEMO_TRAVEL_POD: TravelPod = {
  name: 'Mahu Hiace Pod',
  vehicleDescription: '1998 Toyota Hiace (Self-contained)',
  members: [
    { id: 'm-1', name: 'Aroha Taiaroa', email: 'aroha.t@kiwitour.nz' },
    { id: 'm-2', name: 'Taylor Quinn', email: 'taylor.q@kiwitour.nz' },
  ],
};

export const CLEAN_TRAVEL_POD: TravelPod = {
  name: 'My Vehicle Pod',
  vehicleDescription: '',
  members: [],
};

export const DEMO_FORKED_ROADTRIP: ForkedRoadtrip = {
  forkCode: 'KT-FORK-504',
  authorName: 'Tane & Pip',
  title: 'Whangārei to Golden Bay Permaculture Circuit',
  stopIds: ['prop-wai-01', 'prop-nth-02', 'prop-nel-06'],
  description: 'A 14-day loop across both islands exploring agroforestry, food forests, and composting systems.',
};

export const CLEAN_FORKED_ROADTRIP: ForkedRoadtrip = {
  forkCode: '',
  authorName: '',
  title: 'Custom Permaculture Circuit',
  stopIds: [],
  description: '',
};

// Demo entity detection helpers
const DEMO_BOOKING_IDS = new Set(['bkg-101', 'bkg-102', 'bkg-103', 'bkg-104']);
const DEMO_REFERENCE_CODES = new Set([
  'PERMA-WAI-9481',
  'PERMA-NTH-2391',
  'PERMA-BOP-7712',
  'PERMA-TAR-4421',
]);

export function isDemoBooking(b: Booking): boolean {
  if (!b) return false;
  if (DEMO_BOOKING_IDS.has(b.id)) return true;
  if (b.referenceCode && DEMO_REFERENCE_CODES.has(b.referenceCode)) return true;
  return false;
}

const DEMO_CHAT_IDS = new Set([
  'msg-1',
  'msg-2',
  'msg-3',
  'msg-4',
  'msg-5',
  'msg-6',
  'msg-7',
  'msg-8',
]);

export function isDemoChatMessage(m: ChatMessage): boolean {
  if (!m) return false;
  if (DEMO_CHAT_IDS.has(m.id)) return true;
  return false;
}

export function isDemoGuestProfile(p: GuestProfile | null | undefined): boolean {
  if (!p) return false;
  return DEMO_GUESTS.some(
    demo =>
      demo.id === p.id ||
      (p.email && demo.email.toLowerCase() === p.email.toLowerCase())
  );
}

export function isDemoCaravanGroup(g: CaravanGroup | null | undefined): boolean {
  if (!g) return false;
  return (
    g.code === DEMO_CARAVAN_GROUP.code ||
    g.companionEmail === DEMO_CARAVAN_GROUP.companionEmail
  );
}

export function isDemoTravelPod(p: TravelPod | null | undefined): boolean {
  if (!p) return false;
  return p.name === DEMO_TRAVEL_POD.name;
}

export function isDemoForkedRoadtrip(f: ForkedRoadtrip | null | undefined): boolean {
  if (!f) return false;
  return f.forkCode === DEMO_FORKED_ROADTRIP.forkCode;
}

export function getCleanPristineProperties(): PropertyStop[] {
  return INITIAL_PROPERTIES.map(p => ({
    ...p,
    eventComponents: (p.eventComponents || []).map(c => ({
      ...c,
      spotsRemaining: c.capacity,
    })),
    accommodations: (p.accommodations || []).map(a => ({
      ...a,
      availableUnits: a.capacity || a.availableUnits,
    })),
  }));
}

export function getStoredProperties(): PropertyStop[] {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(PROPERTIES_KEY);
    if (!raw) {
      const initial = isDemo ? INITIAL_PROPERTIES : getCleanPristineProperties();
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return isDemo ? INITIAL_PROPERTIES : getCleanPristineProperties();
    }
    return parsed.map((p: any) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features : [],
      eventComponents: Array.isArray(p.eventComponents) ? p.eventComponents : [],
      accommodations: Array.isArray(p.accommodations) ? p.accommodations : [],
      galleryImages: Array.isArray(p.galleryImages)
        ? p.galleryImages
        : p.heroImage
        ? [p.heroImage]
        : [],
    }));
  } catch (e) {
    console.error('Failed to parse properties from localStorage', e);
    return getStoredDemoDataEnabled() ? INITIAL_PROPERTIES : getCleanPristineProperties();
  }
}

export function saveProperties(props: PropertyStop[]): void {
  try {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(props));
  } catch (e) {
    console.error('Failed to save properties to localStorage', e);
  }
}

export const MY_HOST_PROPERTIES_KEY = 'kiwi_tour_my_host_property_ids';

export function getStoredMyHostPropertyIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_HOST_PROPERTIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredMyHostPropertyIds(ids: string[]): void {
  try {
    localStorage.setItem(MY_HOST_PROPERTIES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save my host property IDs', e);
  }
}

export function addStoredMyHostPropertyId(id: string): void {
  const current = getStoredMyHostPropertyIds();
  if (!current.includes(id)) {
    saveStoredMyHostPropertyIds([id, ...current]);
  }
}

export function removeStoredMyHostPropertyId(id: string): void {
  const current = getStoredMyHostPropertyIds();
  saveStoredMyHostPropertyIds(current.filter(item => item !== id));
}

export function isMyHostProperty(
  prop: PropertyStop,
  userEmail?: string | null,
  userId?: string | null,
  myPropIds?: string[]
): boolean {
  if (!prop) return false;
  const storedIds = myPropIds || getStoredMyHostPropertyIds();
  if (storedIds.includes(prop.id)) return true;
  if (prop.isUserOwned) return true;
  if (userId && (prop.hostUserId === userId || prop.ownerUserId === userId)) return true;
  const email = userEmail?.toLowerCase().trim();
  if (email) {
    if (prop.createdByEmail && prop.createdByEmail.toLowerCase().trim() === email) return true;
    if (prop.hostEmail && prop.hostEmail.toLowerCase().trim() === email) return true;
  }
  return false;
}

export function getStoredBookings(): Booking[] {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      if (isDemo) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
        return INITIAL_BOOKINGS;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return isDemo ? INITIAL_BOOKINGS : [];
    }
    const mapped = parsed.map((b: any) => ({
      ...b,
      components: Array.isArray(b.components) ? b.components : [],
    }));
    if (!isDemo) {
      return mapped.filter((b: Booking) => !isDemoBooking(b));
    }
    return mapped;
  } catch (e) {
    console.error('Failed to parse bookings from localStorage', e);
    return getStoredDemoDataEnabled() ? INITIAL_BOOKINGS : [];
  }
}

export function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings to localStorage', e);
  }
}

export function addBooking(booking: Booking): void {
  const current = getStoredBookings();
  const updated = [booking, ...current];
  saveBookings(updated);

  // Update spots in properties if relevant
  const properties = getStoredProperties();
  const targetPropIndex = properties.findIndex(p => p.id === booking.propertyId);
  if (targetPropIndex !== -1) {
    const prop = { ...properties[targetPropIndex] };
    booking.components.forEach(bc => {
      const comp = prop.eventComponents.find(c => c.id === bc.componentId);
      if (comp) {
        comp.spotsRemaining = Math.max(0, comp.spotsRemaining - bc.attendeeCount);
      }
    });
    if (booking.accommodationOptionId) {
      const acc = prop.accommodations.find(a => a.id === booking.accommodationOptionId);
      if (acc) {
        acc.availableUnits = Math.max(0, acc.availableUnits - 1);
      }
    }
    properties[targetPropIndex] = prop;
    saveProperties(properties);
  }
}

export function updateBookingStatus(
  bookingId: string,
  newStatus: 'Pending Payment' | 'Confirmed' | 'Cancelled / Unpaid'
): Booking | null {
  const current = getStoredBookings();
  let updatedBooking: Booking | null = null;
  const updated = current.map(b => {
    if (b.id === bookingId) {
      updatedBooking = {
        ...b,
        status: newStatus,
        confirmedAt: newStatus === 'Confirmed' ? new Date().toISOString() : b.confirmedAt,
      };
      return updatedBooking;
    }
    return b;
  });
  saveBookings(updated);
  return updatedBooking;
}

export function attachPaymentProof(bookingId: string, fileDataUrl: string, fileName: string): void {
  const current = getStoredBookings();
  const updated = current.map(b => {
    if (b.id === bookingId) {
      return {
        ...b,
        paymentProofUrl: fileDataUrl,
        paymentProofFileName: fileName,
      };
    }
    return b;
  });
  saveBookings(updated);
}

export function updateBookingPartyMembers(
  bookingId: string,
  partyMembers: string[],
  attendeeCount?: number
): Booking | null {
  const current = getStoredBookings();
  let updatedBooking: Booking | null = null;
  const updated = current.map(b => {
    if (b.id === bookingId) {
      const count = attendeeCount !== undefined ? attendeeCount : Math.max(1, (partyMembers || []).length);
      updatedBooking = {
        ...b,
        partyMembers,
        attendeeCount: count,
      };
      return updatedBooking;
    }
    return b;
  });
  saveBookings(updated);
  return updatedBooking;
}

export function getAvailableSharedOverlays(currentProfileEmail?: string): SharedRoadtripOverlay[] {
  const isDemo = getStoredDemoDataEnabled();
  const allBookings = getStoredBookings();
  const profiles = isDemo ? DEMO_GUESTS : [];
  const colors = ['#2563EB', '#7C3AED', '#D97706', '#059669'];

  return profiles
    .filter(p => !currentProfileEmail || p.email.toLowerCase() !== currentProfileEmail.toLowerCase())
    .map((p, idx) => {
      const profileBookings = allBookings.filter(
        b => b.guestEmail.toLowerCase().trim() === p.email.toLowerCase().trim() && b.status !== 'Cancelled / Unpaid'
      );
      return {
        profileId: p.id,
        profileName: p.name,
        groupName: p.groupName,
        color: colors[idx % colors.length],
        stopIds: p.plannedStopIds || ['prop-wai-01', 'prop-bop-03'],
        bookings: profileBookings.map(b => ({
          bookingId: b.id,
          propertyId: b.propertyId,
          propertyName: b.propertyName,
          status: b.status,
          referenceCode: b.referenceCode,
          attendeeCount: b.attendeeCount || 1,
          partySummary: (b.partyMembers && b.partyMembers.length > 0) ? b.partyMembers.join(', ') : b.guestName,
        })),
      };
    });
}

export function getStoredItinerary(): string[] {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(ITINERARY_KEY);
    if (!raw) return isDemo ? ['prop-wai-01', 'prop-nth-02'] : [];
    const parsed = JSON.parse(raw);
    if (!isDemo) {
      if (Array.isArray(parsed)) {
        if (
          parsed.length === 2 &&
          parsed[0] === 'prop-wai-01' &&
          parsed[1] === 'prop-nth-02'
        ) {
          return [];
        }
        return parsed;
      }
      return [];
    }
    return Array.isArray(parsed) ? parsed : ['prop-wai-01', 'prop-nth-02'];
  } catch (e) {
    return getStoredDemoDataEnabled() ? ['prop-wai-01', 'prop-nth-02'] : [];
  }
}

export function saveItinerary(ids: string[]): void {
  try {
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(ids || []));
  } catch (e) {
    console.error('Failed to save itinerary', e);
  }
}

export function toggleItineraryItem(propertyId: string): string[] {
  const current = getStoredItinerary() || [];
  const exists = current.includes(propertyId);
  const updated = exists ? current.filter(id => id !== propertyId) : [...current, propertyId];
  saveItinerary(updated);
  return updated;
}

export function getStoredUserRole(): 'guest' | 'host' {
  try {
    const r = localStorage.getItem(USER_ROLE_KEY);
    return r === 'host' ? 'host' : 'guest';
  } catch (e) {
    return 'guest';
  }
}

export function setStoredUserRole(role: 'guest' | 'host'): void {
  try {
    localStorage.setItem(USER_ROLE_KEY, role);
  } catch (e) {
    console.error('Failed to set user role', e);
  }
}

export function getStoredHostPropId(): string {
  try {
    return localStorage.getItem(CURRENT_HOST_PROP_KEY) || 'prop-wai-01';
  } catch (e) {
    return 'prop-wai-01';
  }
}

export function setStoredHostPropId(id: string): void {
  try {
    localStorage.setItem(CURRENT_HOST_PROP_KEY, id);
  } catch (e) {
    console.error(e);
  }
}

export function generatePaymentReference(region: string): string {
  const prefix = 'PERMA';
  // 3-letter region code
  let regCode = 'NZ';
  if (region.toLowerCase().includes('waikato')) regCode = 'WAI';
  else if (region.toLowerCase().includes('northland')) regCode = 'NTH';
  else if (region.toLowerCase().includes('bay of plenty')) regCode = 'BOP';
  else if (region.toLowerCase().includes('taranaki')) regCode = 'TAR';
  else if (region.toLowerCase().includes('hawke')) regCode = 'HB';
  else if (region.toLowerCase().includes('nelson')) regCode = 'NEL';
  else if (region.toLowerCase().includes('canterbury')) regCode = 'CAN';
  else if (region.toLowerCase().includes('otago')) regCode = 'OTA';

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${regCode}-${randomDigits}`;
}

export function getStoredGuestProfile(): GuestProfile {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) {
      const defaultGuest = isDemo ? DEMO_GUESTS[0] : CLEAN_GUEST_PROFILE;
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(defaultGuest));
      return defaultGuest;
    }
    const parsed = JSON.parse(raw);
    if (!isDemo && isDemoGuestProfile(parsed)) {
      return CLEAN_GUEST_PROFILE;
    }
    if (parsed && (parsed.name || parsed.email)) {
      const sanitizedName = parsed.name === 'Guest Traveler' ? '' : (parsed.name || '');
      return {
        ...parsed,
        name: sanitizedName,
        isCreatedLocally: parsed.isCreatedLocally ?? Boolean(sanitizedName && parsed.email),
        partyMembers: Array.isArray(parsed.partyMembers)
          ? parsed.partyMembers
          : (isDemo && parsed.email === DEMO_GUESTS[0].email ? DEMO_GUESTS[0].partyMembers : []),
        groupName: parsed.groupName || (isDemo && parsed.email === DEMO_GUESTS[0].email ? DEMO_GUESTS[0].groupName : undefined),
      };
    }
    return isDemo ? DEMO_GUESTS[0] : CLEAN_GUEST_PROFILE;
  } catch (e) {
    console.error('Failed to get stored guest profile', e);
    return getStoredDemoDataEnabled() ? DEMO_GUESTS[0] : CLEAN_GUEST_PROFILE;
  }
}

export function saveStoredGuestProfile(profile: GuestProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(GUEST_PROFILE_KEY);
    }
  } catch (e) {
    console.error('Failed to save guest profile', e);
  }
}

export function getGuestBookings(email: string): Booking[] {
  if (!email) return [];
  const all = getStoredBookings();
  const lower = email.toLowerCase().trim();
  return all.filter(b => b.guestEmail.toLowerCase().trim() === lower);
}

export function cancelBooking(bookingId: string): void {
  const current = getStoredBookings();
  const updated = current.map(b => {
    if (b.id === bookingId) {
      return {
        ...b,
        status: 'Cancelled / Unpaid' as const,
      };
    }
    return b;
  });
  saveBookings(updated);
}

export function exportGuestCalendarIcs(
  guestBookings: Booking[],
  properties: PropertyStop[],
  guestName: string
): void {
  if (guestBookings.length === 0) return;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Great Kiwi Permaculture Tour 2027//Guest Pass//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${guestName}'s Kiwi Permaculture Tour 2027`,
  ];

  guestBookings.forEach(booking => {
    if (booking.status === 'Cancelled / Unpaid') return;
    const prop = properties.find(p => p.id === booking.propertyId);
    const dateFormatted = prop?.startDate ? prop.startDate.replace(/-/g, '') : '20270110';
    const summary = `${booking.propertyName} (${booking.status})`;
    const eventTitles = booking.components.map(c => `${c.componentTitle} (${c.activityType})`).join('; ');
    const desc = `Booking Ref: ${booking.referenceCode}\\nGuest: ${booking.guestName}\\nEvents: ${eventTitles}\\n${
      booking.status === 'Confirmed' && prop?.exactArrivalInstructions
        ? `Arrival Instructions: ${prop.exactArrivalInstructions.replace(/\n/g, ' ')}\\nHost Phone: ${prop.hostPhone}`
        : `Payment Status: ${booking.status}`
    }`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${booking.id}-${Date.now()}@kiwipermatour.nz`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${prop ? `${prop.district}, ${prop.region}, New Zealand` : 'New Zealand'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Kiwi-Permaculture-Tour-Pass-${guestName.replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getStoredChatMessages(): ChatMessage[] {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (!raw) {
      if (isDemo) {
        localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(INITIAL_CHAT_MESSAGES));
        return INITIAL_CHAT_MESSAGES;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return isDemo ? INITIAL_CHAT_MESSAGES : [];
    }
    if (!isDemo) {
      return parsed.filter(m => !isDemoChatMessage(m));
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse chat messages from localStorage', e);
    return getStoredDemoDataEnabled() ? INITIAL_CHAT_MESSAGES : [];
  }
}

export function saveStoredChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat messages to localStorage', e);
  }
}

export function addStoredChatMessage(newMessage: ChatMessage): ChatMessage[] {
  try {
    const existing = getStoredChatMessages();
    const updated = [...existing, newMessage];
    saveStoredChatMessages(updated);
    return updated;
  } catch (e) {
    console.error('Failed to add chat message', e);
    return [newMessage];
  }
}

export function getStoredCaravanGroup(): CaravanGroup {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(CARAVAN_GROUP_KEY);
    if (!raw) {
      return isDemo ? DEMO_CARAVAN_GROUP : CLEAN_CARAVAN_GROUP;
    }
    const parsed = JSON.parse(raw);
    if (!isDemo && isDemoCaravanGroup(parsed)) {
      return CLEAN_CARAVAN_GROUP;
    }
    return parsed;
  } catch (e) {
    return getStoredDemoDataEnabled() ? DEMO_CARAVAN_GROUP : CLEAN_CARAVAN_GROUP;
  }
}

export function saveStoredCaravanGroup(group: CaravanGroup): void {
  try {
    localStorage.setItem(CARAVAN_GROUP_KEY, JSON.stringify(group));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredTravelPod(): TravelPod {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(TRAVEL_POD_KEY);
    if (!raw) {
      return isDemo ? DEMO_TRAVEL_POD : CLEAN_TRAVEL_POD;
    }
    const parsed = JSON.parse(raw);
    if (!isDemo && isDemoTravelPod(parsed)) {
      return CLEAN_TRAVEL_POD;
    }
    return parsed;
  } catch (e) {
    return getStoredDemoDataEnabled() ? DEMO_TRAVEL_POD : CLEAN_TRAVEL_POD;
  }
}

export function saveStoredTravelPod(pod: TravelPod): void {
  try {
    localStorage.setItem(TRAVEL_POD_KEY, JSON.stringify(pod));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredForkedRoadtrip(): ForkedRoadtrip {
  try {
    const isDemo = getStoredDemoDataEnabled();
    const raw = localStorage.getItem(FORKED_ROADTRIP_KEY);
    if (!raw) {
      return isDemo ? DEMO_FORKED_ROADTRIP : CLEAN_FORKED_ROADTRIP;
    }
    const parsed = JSON.parse(raw);
    if (!isDemo && isDemoForkedRoadtrip(parsed)) {
      return CLEAN_FORKED_ROADTRIP;
    }
    return parsed;
  } catch (e) {
    return getStoredDemoDataEnabled() ? DEMO_FORKED_ROADTRIP : CLEAN_FORKED_ROADTRIP;
  }
}

export function saveStoredForkedRoadtrip(fork: ForkedRoadtrip): void {
  try {
    localStorage.setItem(FORKED_ROADTRIP_KEY, JSON.stringify(fork));
  } catch (e) {
    console.error(e);
  }
}

export interface LocalExportPayload {
  version: string;
  exportedAt: string;
  appName: string;
  guestProfile: GuestProfile;
  itinerary: string[];
  bookings: Booking[];
  chatMessages: ChatMessage[];
  caravanGroup?: CaravanGroup;
  travelPod?: TravelPod;
  forkedRoadtrip?: ForkedRoadtrip;
  userRole?: string;
}

export function exportLocalDataAsJSON(): void {
  const payload: LocalExportPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'The Great Kiwi Permaculture Tour 2027',
    guestProfile: getStoredGuestProfile(),
    itinerary: getStoredItinerary(),
    bookings: getStoredBookings(),
    chatMessages: getStoredChatMessages(),
    caravanGroup: getStoredCaravanGroup(),
    travelPod: getStoredTravelPod(),
    forkedRoadtrip: getStoredForkedRoadtrip(),
    userRole: getStoredUserRole(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `kiwi-permaculture-tour-local-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importLocalDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;

    if (data.guestProfile && typeof data.guestProfile === 'object') {
      saveStoredGuestProfile(data.guestProfile);
    }
    if (Array.isArray(data.itinerary)) {
      saveItinerary(data.itinerary);
    }
    if (Array.isArray(data.bookings)) {
      saveBookings(data.bookings);
    }
    if (Array.isArray(data.chatMessages)) {
      saveStoredChatMessages(data.chatMessages);
    }
    if (data.caravanGroup) {
      saveStoredCaravanGroup(data.caravanGroup);
    }
    if (data.travelPod) {
      saveStoredTravelPod(data.travelPod);
    }
    if (data.forkedRoadtrip) {
      saveStoredForkedRoadtrip(data.forkedRoadtrip);
    }
    if (data.userRole) {
      setStoredUserRole(data.userRole);
    }
    return true;
  } catch (e) {
    console.error('Failed to import local data', e);
    return false;
  }
}

export function cleanAllDemoData() {
  saveStoredDemoDataEnabled(false);
  saveBookings([]);
  saveItinerary([]);
  saveStoredChatMessages([]);
  saveStoredGuestProfile(CLEAN_GUEST_PROFILE);
  saveStoredCaravanGroup(CLEAN_CARAVAN_GROUP);
  saveStoredTravelPod(CLEAN_TRAVEL_POD);
  saveStoredForkedRoadtrip(CLEAN_FORKED_ROADTRIP);
  const cleanProps = getCleanPristineProperties();
  saveProperties(cleanProps);

  return {
    cleanedBookings: [] as Booking[],
    cleanedItinerary: [] as string[],
    cleanedChat: [] as ChatMessage[],
    cleanedProfile: CLEAN_GUEST_PROFILE,
    cleanedCaravan: CLEAN_CARAVAN_GROUP,
    cleanedPod: CLEAN_TRAVEL_POD,
    cleanedFork: CLEAN_FORKED_ROADTRIP,
    cleanedProperties: cleanProps,
  };
}

export function seedAllDemoData() {
  saveStoredDemoDataEnabled(true);
  saveBookings(INITIAL_BOOKINGS);
  saveItinerary(['prop-wai-01', 'prop-nth-02']);
  saveStoredChatMessages(INITIAL_CHAT_MESSAGES);
  saveStoredGuestProfile(DEMO_GUESTS[0]);
  saveStoredCaravanGroup(DEMO_CARAVAN_GROUP);
  saveStoredTravelPod(DEMO_TRAVEL_POD);
  saveStoredForkedRoadtrip(DEMO_FORKED_ROADTRIP);
  saveProperties(INITIAL_PROPERTIES);

  return {
    seededBookings: INITIAL_BOOKINGS,
    seededItinerary: ['prop-wai-01', 'prop-nth-02'],
    seededChat: INITIAL_CHAT_MESSAGES,
    seededProfile: DEMO_GUESTS[0],
    seededCaravan: DEMO_CARAVAN_GROUP,
    seededPod: DEMO_TRAVEL_POD,
    seededFork: DEMO_FORKED_ROADTRIP,
    seededProperties: INITIAL_PROPERTIES,
  };
}

export function resetAllLocalData(): void {
  try {
    localStorage.removeItem(BOOKINGS_KEY);
    localStorage.removeItem(ITINERARY_KEY);
    localStorage.removeItem(GUEST_PROFILE_KEY);
    localStorage.removeItem(CHAT_MESSAGES_KEY);
    localStorage.removeItem(CARAVAN_GROUP_KEY);
    localStorage.removeItem(TRAVEL_POD_KEY);
    localStorage.removeItem(FORKED_ROADTRIP_KEY);
    localStorage.removeItem(PROPERTIES_KEY);
    localStorage.removeItem(MY_HOST_PROPERTIES_KEY);
    localStorage.removeItem(DEMO_DATA_ENABLED_KEY);
    localStorage.removeItem(LOCAL_MODE_ENABLED_KEY);
    cleanAllDemoData();
  } catch (e) {
    console.error('Failed to reset local data', e);
  }
}

export const LOCAL_MODE_ENABLED_KEY = 'kiwi_local_mode_enabled';

/**
 * Returns whether local mode is enabled.
 * Default is FALSE (off).
 */
export function getStoredLocalModeEnabled(): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_MODE_ENABLED_KEY);
    if (raw === null) return false; // Default is strictly OFF
    return raw === 'true';
  } catch {
    return false;
  }
}

export function saveStoredLocalModeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(LOCAL_MODE_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save local mode enabled status', e);
  }
}

export function getStoredDemoDataEnabled(): boolean {
  try {
    const raw = localStorage.getItem(DEMO_DATA_ENABLED_KEY);
    if (raw === null) return true; // default to true
    return raw === 'true';
  } catch (e) {
    return true;
  }
}

export function saveStoredDemoDataEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(DEMO_DATA_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save demo data status', e);
  }
}

export const STREAMLINE_MODE_KEY = 'kiwi_streamline_mode_2027';
export const SIMPLIFIED_TRAVEL_GROUP_KEY = 'kiwi_simplified_travel_group_enabled';

/**
 * Returns the active streamline / travel group architecture mode.
 * Options: 'unified' | 'caravan' | 'pods' | 'forking'.
 * Default is 'unified' (single party, merged roadtrip & passes).
 */
export function getStoredStreamlineMode(): StreamlineMode {
  try {
    const raw = localStorage.getItem(STREAMLINE_MODE_KEY);
    if (raw === 'unified' || raw === 'caravan' || raw === 'pods' || raw === 'forking') {
      return raw as StreamlineMode;
    }
    // Backward compatibility with previous simplified travel group key
    const simplified = localStorage.getItem(SIMPLIFIED_TRAVEL_GROUP_KEY);
    if (simplified === 'true') return 'unified';
    if (simplified === 'false') return 'caravan';
    return 'unified';
  } catch {
    return 'unified';
  }
}

export function saveStoredStreamlineMode(mode: StreamlineMode): void {
  try {
    localStorage.setItem(STREAMLINE_MODE_KEY, mode);
    localStorage.setItem(SIMPLIFIED_TRAVEL_GROUP_KEY, mode === 'unified' ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save streamline mode', e);
  }
}

/**
 * Returns whether unified / simplified travel group mode is enabled
 * (current profile and roadtrip only, merging all profile bookings into the roadtrip interface).
 */
export function getStoredSimplifiedTravelGroup(): boolean {
  return getStoredStreamlineMode() === 'unified';
}

export function saveStoredSimplifiedTravelGroup(enabled: boolean): void {
  saveStoredStreamlineMode(enabled ? 'unified' : 'caravan');
}


