export type UserRole = 'guest' | 'host';

/**
 * Core User Account Profile - strictly user identity, contact & account metadata.
 * Kept lean and decoupled from transient or tour-specific preferences.
 */
export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  managedPropertyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dedicated Tour & Travel Preferences - stored separately in tour_preferences collection.
 * Manages travel style, vehicle, party members, dietary requirements, and tour notes.
 */
export interface UserTourPreferences {
  userId: string;
  travelStyle?: TravelStyle;
  dietaryNotes?: string;
  homeRegion?: string;
  groupName?: string;
  partyMembers?: string[];
  seedSwapOfferings?: string;
  emergencyContact?: string;
  bookOnBehalfAllowed?: boolean;
  updatedAt?: string;
}

export type PermacultureFeature =
  | 'Syntropic Agroforestry'
  | 'Food Forests'
  | 'Zone 0–5 Designs'
  | 'Bio-intensive Market Gardens'
  | 'Earthworks/Swales'
  | 'Natural Building/Strawbale'
  | 'Animal Integration'
  | 'Greywater/Composting Toilets'
  | 'Rongoā Māori';

export type ActivityType =
  | 'Guided Tour'
  | 'Hands-on Workbee'
  | 'Interactive Workshop'
  | 'Open Garden'
  | 'Shared Meal (Potluck / Guest Harvest & Cook / Hosted Meal)';

export type PricingType =
  | 'Free'
  | 'Koha'
  | 'Fixed Paid Ticket'
  | 'Seed/Produce Swap';

export interface EventSession {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  activityType: ActivityType;
  pricingType: PricingType;
  priceAmount?: number; // In NZD if Fixed Paid Ticket or suggested Koha
  description: string;
  capacity: number;
  spotsRemaining: number;
}

export type EventComponent = EventSession;

export type AccommodationType =
  | 'Off-grid RV/Caravan Parking'
  | 'Tent Sites'
  | 'Cabin/Tiny House'
  | 'Homestay';

export interface AccommodationOption {
  id: string;
  type: AccommodationType;
  title: string;
  nightlyCost: number; // NZD
  capacity: number;
  availableUnits: number;
  amenities: string[];
  description: string;
}

export interface HostBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string; // Standard NZ format e.g. 12-3456-7890123-00
  instructions?: string;
}

export interface TourEvent {
  id: string;
  slug: string;
  name: string;
  region: string;
  district: string;
  datesText: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  coordinates: {
    lat: number;
    lng: number;
  };
  addressDescription: string;
  exactArrivalInstructions: string; // Revealed upon confirmation
  hostName: string;
  hostAvatar: string;
  hostBio: string;
  hostPhone: string;
  hostEmail: string;
  hostUserId?: string;
  ownerUserId?: string;
  createdByEmail?: string;
  isUserOwned?: boolean;
  landVision: string;
  landHistory: string;
  propertyAcreage: string;
  acreage?: string;
  heroImage: string;
  galleryImages: string[];
  features: PermacultureFeature[];
  eventComponents: EventSession[];
  sessions?: EventSession[];
  accommodations: AccommodationOption[];
  bankDetails: HostBankDetails;
}

export type PropertyStop = TourEvent;

export type BookingStatus = 'Pending Payment' | 'Confirmed' | 'Cancelled / Unpaid';

export interface SelectedSessionBooking {
  componentId: string;
  componentTitle: string;
  activityType: ActivityType;
  pricingType: PricingType;
  priceAmount: number;
  attendeeCount: number;
}

export type SelectedComponentBooking = SelectedSessionBooking;

export interface Booking {
  id: string;
  referenceCode: string; // e.g. PERMA-WAI-8492
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  dietaryNotes?: string;
  components: SelectedComponentBooking[];
  accommodationOptionId?: string;
  accommodationTitle?: string;
  accommodationNights?: number;
  accommodationCostTotal?: number;
  totalNzdDue: number;
  kohaNotes?: string;
  seedSwapDescription?: string;
  status: BookingStatus;
  paymentProofUrl?: string;
  paymentProofFileName?: string;
  createdAt: string;
  confirmedAt?: string;
  isManualOfflineEntry?: boolean;
  isHostCompanion?: boolean;
  companionRole?: string;
  attendeeCount?: number;
  partyMembers?: string[];
  groupName?: string;
}

export interface RegionTourTimeline {
  region: string;
  datesText: string;
  startDate: string;
  endDate: string;
  description: string;
  island: 'North Island' | 'South Island';
}

export type TravelStyle =
  | 'Self-Contained Campervan'
  | 'Tent & Car'
  | 'Carpooler / Hitchhiker'
  | 'Public Transport / Bicycle'
  | 'Homestay Traveler';

export interface CoTraveler {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  canBookOnBehalf?: boolean;
  sharesRoadtrip?: boolean;
  sharesBookings?: boolean;
  relationship?: string;
  isPrimary?: boolean;
  plannedStopIds?: string[]; // IDs of specific itinerary stops this traveler is planning / going to
}

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dietaryNotes: string;
  partyMembers?: string[]; // Names of additional travelers in this profile/party
  groupName?: string; // e.g. "Blomfield Whānau Roadtrip"
  emergencyContact?: string;
  travelStyle?: TravelStyle;
  seedSwapOfferings?: string;
  homeRegion?: string;
  avatar?: string;
  createdAt?: string;
  isCreatedLocally?: boolean;
  bookOnBehalfAllowed?: boolean; // Whether authorized co-travelers can book sessions & stays on behalf of this profile
  authorizedBookers?: string[]; // List of emails or names authorized to book
  coTravelers?: CoTraveler[]; // Structured traveling party members
  plannedStopIds?: string[]; // Specific itinerary stops lead traveler is planning
}

export interface OverlaidBookingInfo {
  bookingId: string;
  propertyId: string;
  propertyName: string;
  status: BookingStatus;
  referenceCode: string;
  attendeeCount?: number;
  partySummary?: string;
}

export interface SharedRoadtripOverlay {
  profileId: string;
  profileName: string;
  groupName?: string;
  color: string;
  stopIds: string[];
  bookings?: OverlaidBookingInfo[];
}

export type ChatScope = 'everyone' | 'region' | 'event';

export interface ChatMessage {
  id: string;
  scope: ChatScope;
  targetId?: string; // Region name (e.g. "Waikato / Coromandel") or Property ID (e.g. "prop-wai-01")
  targetName?: string; // Display title for the channel (e.g. "Kōwhai Valley Food Forest")
  senderId: string;
  senderName: string;
  senderRole?: 'host' | 'traveler' | 'organizer';
  senderRoleLabel?: string; // e.g. "Host • Kōwhai Valley" or "Lead Traveler"
  senderAvatar?: string;
  senderGroup?: string;
  text: string;
  timestamp: string; // ISO string
}

// STREAMLINED PROFILES, TRIPS & BOOKINGS ARCHITECTURE EXPERIMENT
export type StreamlineMode = 'unified' | 'caravan' | 'pods' | 'forking';

export interface CaravanGroup {
  code: string; // e.g. "FERN-789"
  name: string; // e.g. "Whānau & Friends Convoy"
  companionName: string; // e.g. "Alex Rivers"
  companionEmail: string;
  companionStops: string[]; // Property IDs that companion has planned
}

export interface TravelPodMember {
  id: string;
  name: string;
  email: string;
  dietaryNotes?: string;
}

export interface TravelPod {
  name: string; // e.g. "Mahu Hiace Pod"
  vehicleDescription: string; // e.g. "Toyota Hiace Campervan"
  members: TravelPodMember[];
}

export interface SplitPaymentDetail {
  memberId: string;
  memberName: string;
  amountDue: number;
  referenceCode: string;
  itemsSummary: string;
  isPaid?: boolean;
}

export interface ForkedRoadtrip {
  forkCode: string; // e.g. "KT-FORK-504"
  authorName: string; // e.g. "Tane & Pip"
  title: string; // e.g. "14-Day Regenerative Heartland Loop"
  stopIds: string[];
  description: string;
}

