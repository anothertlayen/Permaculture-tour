import React, { useState, useEffect, useMemo } from 'react';
import {
  PropertyStop,
  Booking,
  UserRole,
  PermacultureFeature,
  AccommodationType,
  PricingType,
  SelectedComponentBooking,
  AccommodationOption,
  BookingStatus,
  GuestProfile,
  ChatMessage,
  ChatScope,
  StreamlineMode,
  CaravanGroup,
  TravelPod,
  ForkedRoadtrip,
} from './types';
import {
  getStoredProperties,
  saveProperties,
  getStoredBookings,
  saveBookings,
  getStoredItinerary,
  saveItinerary,
  getStoredUserRole,
  setStoredUserRole,
  getStoredGuestProfile,
  saveStoredGuestProfile,
  DEMO_GUESTS,
  getStoredChatMessages,
  addStoredChatMessage,
  getStoredDemoDataEnabled,
  saveStoredDemoDataEnabled,
  getStoredLocalModeEnabled,
  saveStoredLocalModeEnabled,
  resetAllLocalData,
  cleanAllDemoData,
  seedAllDemoData,
  getStoredCaravanGroup,
  saveStoredCaravanGroup,
  getStoredTravelPod,
  saveStoredTravelPod,
  getStoredForkedRoadtrip,
  saveStoredForkedRoadtrip,
  CLEAN_GUEST_PROFILE,
  CLEAN_CARAVAN_GROUP,
  CLEAN_TRAVEL_POD,
  CLEAN_FORKED_ROADTRIP,
  isDemoBooking,
  isDemoChatMessage,
  getCleanPristineProperties,
  getStoredMyHostPropertyIds,
  saveStoredMyHostPropertyIds,
  addStoredMyHostPropertyId,
  isMyHostProperty,
  getStoredSimplifiedTravelGroup,
  saveStoredSimplifiedTravelGroup,
  getStoredStreamlineMode,
  saveStoredStreamlineMode,
} from './utils/storage';
import { INITIAL_PROPERTIES, INITIAL_BOOKINGS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BankTransferCheckoutModal } from './components/BankTransferCheckoutModal';
import { HostDashboard } from './components/HostDashboard';
import { InteractiveTourMap } from './components/InteractiveTourMap';
import { RoadtripItineraryDrawer } from './components/RoadtripItineraryDrawer';
import { HostRegistrationModal } from './components/HostRegistrationModal';
import { HostCompanionModal } from './components/HostCompanionModal';
import { GuestProfileModal } from './components/GuestProfileModal';
import { GroupChatModal } from './components/GroupChatModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DemoDataControlsModal } from './components/DemoDataControlsModal';
import { FooterSettingsModal } from './components/FooterSettingsModal';
import { AuthModal } from './components/AuthModal';
import { LocalModeExplanationPage } from './components/LocalModeExplanationPage';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useAuth } from './contexts/AuthContext';
import {
  subscribeToCloudBookings,
  syncBookingToCloud,
  updateCloudBookingStatus,
  syncItineraryToCloud,
  subscribeToCloudChats,
  sendCloudChatMessage,
  deleteCloudDemoData,
  syncPropertyToCloud,
  subscribeToCloudProperties,
  syncAllCustomPropertiesToCloud,
} from './services/cloudService';
import { MapPin, Calendar, Heart, ShieldCheck, Sprout, MessageSquare, Database, Sliders, HardDrive } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [isDemoDataOn, setIsDemoDataOn] = useState<boolean>(() => getStoredDemoDataEnabled());
  const [isLocalModeEnabled, setIsLocalModeEnabled] = useState<boolean>(() => getStoredLocalModeEnabled());
  const [isSimplifiedTravelGroup, setIsSimplifiedTravelGroup] = useState<boolean>(() => getStoredSimplifiedTravelGroup());
  const [isFooterSettingsOpen, setIsFooterSettingsOpen] = useState(false);
  const [properties, setProperties] = useState<PropertyStop[]>(() => getStoredProperties());
  const [bookings, setBookings] = useState<Booking[]>(() => getStoredBookings());
  const [itineraryIds, setItineraryIds] = useState<string[]>(() => getStoredItinerary());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStoredChatMessages());
  const [userRole, setUserRole] = useState<UserRole>(() => getStoredUserRole());
  const [activeTab, setActiveTab] = useState<'explore' | 'map' | 'host' | 'local-guide'>('explore');
  const [myHostPropertyIds, setMyHostPropertyIds] = useState<string[]>(() => getStoredMyHostPropertyIds());

  // Guest Profile & Auth State
  const {
    user,
    profile: cloudProfile,
    tourPreferences,
    updateCloudProfile,
    updateTourPreferences,
  } = useAuth();
  const [guestProfile, setGuestProfile] = useState<GuestProfile>(() => getStoredGuestProfile());
  const [isGuestProfileModalOpen, setIsGuestProfileModalOpen] = useState(false);
  const [guestProfileInitialTab, setGuestProfileInitialTab] = useState<'bookings' | 'settings'>('bookings');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [companionProperty, setCompanionProperty] = useState<PropertyStop | null>(null);

  // Sync cloud core profile & dedicated tour preferences into local guest profile state when user signs in
  useEffect(() => {
    if (user) {
      setGuestProfile(prev => ({
        ...prev,
        id: user.uid || prev.id,
        email: user.email || cloudProfile?.email || prev.email,
        name: user.displayName || cloudProfile?.displayName || prev.name,
        avatar: user.photoURL || cloudProfile?.photoURL || prev.avatar,
        phone: cloudProfile?.phone || prev.phone,
        travelStyle: tourPreferences?.travelStyle || prev.travelStyle,
        dietaryNotes: tourPreferences?.dietaryNotes !== undefined ? tourPreferences.dietaryNotes : prev.dietaryNotes,
        homeRegion: tourPreferences?.homeRegion || prev.homeRegion,
        groupName: tourPreferences?.groupName || prev.groupName,
        partyMembers: tourPreferences?.partyMembers || prev.partyMembers,
        seedSwapOfferings: tourPreferences?.seedSwapOfferings || prev.seedSwapOfferings,
        emergencyContact: tourPreferences?.emergencyContact || prev.emergencyContact,
        bookOnBehalfAllowed: tourPreferences?.bookOnBehalfAllowed !== undefined ? tourPreferences.bookOnBehalfAllowed : prev.bookOnBehalfAllowed,
      }));
    }
  }, [user, cloudProfile, tourPreferences]);

  // Clean decoupled updater: separates core user identity from tour preferences
  const handleUpdateGuestProfile = (updated: GuestProfile) => {
    setGuestProfile(updated);
    if (user) {
      // 1. Sync core account identity to users/{uid}
      updateCloudProfile({
        displayName: updated.name,
        email: updated.email,
        phone: updated.phone,
      }).catch(err => console.warn('Could not sync user identity to cloud:', err));

      // 2. Sync tour & travel preferences to tour_preferences/{uid}
      updateTourPreferences({
        travelStyle: updated.travelStyle,
        dietaryNotes: updated.dietaryNotes,
        homeRegion: updated.homeRegion,
        groupName: updated.groupName,
        partyMembers: updated.partyMembers,
        seedSwapOfferings: updated.seedSwapOfferings,
        emergencyContact: updated.emergencyContact,
        bookOnBehalfAllowed: updated.bookOnBehalfAllowed,
      }).catch(err => console.warn('Could not sync tour preferences to cloud:', err));
    }
  };

  // Real-time Cloud Sync for Bookings (Only when authenticated per Firebase skill)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCloudBookings(
      cloudBookings => {
        setBookings(prev => {
          const validCloud = isDemoDataOn
            ? cloudBookings
            : (cloudBookings || []).filter(b => !isDemoBooking(b));
          const validPrev = isDemoDataOn
            ? prev
            : (prev || []).filter(b => !isDemoBooking(b));

          const combinedMap = new Map<string, Booking>();
          validPrev.forEach(b => combinedMap.set(b.id, b));
          validCloud.forEach(b => combinedMap.set(b.id, b));
          return Array.from(combinedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      },
      user.email || guestProfile?.email,
      isDemoDataOn
    );
    return () => unsubscribe();
  }, [user, guestProfile?.email, isDemoDataOn]);

  // Real-time Cloud Sync for Chat Messages (Only when authenticated per Firebase skill)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCloudChats(
      cloudMsgs => {
        setChatMessages(prev => {
          const validCloud = isDemoDataOn
            ? cloudMsgs
            : (cloudMsgs || []).filter(m => !isDemoChatMessage(m));
          const validPrev = isDemoDataOn
            ? prev
            : (prev || []).filter(m => !isDemoChatMessage(m));

          const map = new Map<string, ChatMessage>();
          validPrev.forEach(m => map.set(m.id, m));
          validCloud.forEach(m => map.set(m.id, m));
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      },
      isDemoDataOn
    );
    return () => unsubscribe();
  }, [user, isDemoDataOn]);

  // Real-time Cloud Sync for Properties & Events from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToCloudProperties(cloudProps => {
      if (!cloudProps || cloudProps.length === 0) return;
      setProperties(prev => {
        const propMap = new Map<string, PropertyStop>();
        // Add existing local stops
        (prev || []).forEach(p => propMap.set(p.id, p));
        // Merge cloud properties
        cloudProps.forEach(cp => {
          const existing = propMap.get(cp.id);
          propMap.set(cp.id, {
            ...(existing || {}),
            ...cp,
            eventComponents: Array.isArray(cp.eventComponents) && cp.eventComponents.length > 0
              ? cp.eventComponents
              : existing?.eventComponents || [],
          });
        });
        const merged = Array.from(propMap.values());
        saveProperties(merged);
        return merged;
      });
    });
    return () => unsubscribe();
  }, []);

  // Sync any locally saved user-owned / custom properties to Firestore
  useEffect(() => {
    if (properties.some(p => p.isUserOwned || p.id.startsWith('prop-custom-'))) {
      syncAllCustomPropertiesToCloud(properties).catch(err => {
        console.warn('Could not sync local custom properties to cloud:', err);
      });
    }
  }, [user]);

  // Streamlining: Unified vs Caravan Pass vs Travel Pods vs Follow My Roadtrip
  const [streamlineMode, setStreamlineMode] = useState<StreamlineMode>(() => getStoredStreamlineMode());
  const [activeCaravanGroup, setActiveCaravanGroup] = useState<CaravanGroup>(() => getStoredCaravanGroup());
  const [activeTravelPod, setActiveTravelPod] = useState<TravelPod>(() => getStoredTravelPod());
  const [activeForkedRoadtrip, setActiveForkedRoadtrip] = useState<ForkedRoadtrip>(() => getStoredForkedRoadtrip());

  // 2. Modals & Drawers State
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<PropertyStop | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    property: PropertyStop;
    components: SelectedComponentBooking[];
    accommodation?: {
      option: AccommodationOption;
      nights: number;
    };
  } | null>(null);
  const [isItineraryDrawerOpen, setIsItineraryDrawerOpen] = useState(false);
  const [isHostRegisterModalOpen, setIsHostRegisterModalOpen] = useState(false);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState(false);

  // Demo Data Handlers
  const handleToggleDemoData = (enabled: boolean) => {
    setIsDemoDataOn(enabled);
    if (!enabled) {
      const cleaned = cleanAllDemoData();
      setBookings(cleaned.cleanedBookings);
      setItineraryIds(cleaned.cleanedItinerary);
      setChatMessages(cleaned.cleanedChat);
      setGuestProfile(cleaned.cleanedProfile);
      setActiveCaravanGroup(cleaned.cleanedCaravan);
      setActiveTravelPod(cleaned.cleanedPod);
      setActiveForkedRoadtrip(cleaned.cleanedFork);
      setProperties(cleaned.cleanedProperties);
      setCheckoutData(null);
      setIsCheckoutOpen(false);
      deleteCloudDemoData().catch(err => {
        console.warn('Error clearing cloud demo data:', err);
      });
    } else {
      const seeded = seedAllDemoData();
      setBookings(seeded.seededBookings);
      setProperties(seeded.seededProperties);
      setItineraryIds(seeded.seededItinerary);
      setChatMessages(seeded.seededChat);
      setGuestProfile(seeded.seededProfile);
      setActiveCaravanGroup(seeded.seededCaravan);
      setActiveTravelPod(seeded.seededPod);
      setActiveForkedRoadtrip(seeded.seededFork);
    }
  };

  const handleSeedDemoData = () => {
    setIsDemoDataOn(true);
    const seeded = seedAllDemoData();
    setBookings(seeded.seededBookings);
    setProperties(seeded.seededProperties);
    setItineraryIds(seeded.seededItinerary);
    setChatMessages(seeded.seededChat);
    setGuestProfile(seeded.seededProfile);
    setActiveCaravanGroup(seeded.seededCaravan);
    setActiveTravelPod(seeded.seededPod);
    setActiveForkedRoadtrip(seeded.seededFork);
  };

  const handleCleanAllDemoData = () => {
    setIsDemoDataOn(false);
    const cleaned = cleanAllDemoData();
    setBookings(cleaned.cleanedBookings);
    setItineraryIds(cleaned.cleanedItinerary);
    setChatMessages(cleaned.cleanedChat);
    setGuestProfile(cleaned.cleanedProfile);
    setActiveCaravanGroup(cleaned.cleanedCaravan);
    setActiveTravelPod(cleaned.cleanedPod);
    setActiveForkedRoadtrip(cleaned.cleanedFork);
    setProperties(cleaned.cleanedProperties);
    setCheckoutData(null);
    setIsCheckoutOpen(false);
    deleteCloudDemoData().catch(err => {
      console.warn('Error clearing cloud demo data:', err);
    });
  };

  const handleClearAllPropertiesAndEvents = () => {
    setProperties([]);
    saveProperties([]);
    setItineraryIds([]);
    saveItinerary([]);
    setBookings([]);
    saveBookings([]);
    setMyHostPropertyIds([]);
    saveStoredMyHostPropertyIds([]);
  };

  const handleRestoreCleanCatalog = () => {
    const clean = getCleanPristineProperties();
    setProperties(clean);
    saveProperties(clean);
  };

  const totalEventsCount = useMemo(() => {
    return properties.reduce((acc, p) => acc + (p.eventComponents?.length || 0), 0);
  }, [properties]);

  const handleClearAllBookings = () => {
    setBookings([]);
    saveBookings([]);
  };

  const handleToggleLocalMode = (enabled: boolean) => {
    setIsLocalModeEnabled(enabled);
    saveStoredLocalModeEnabled(enabled);
    if (!enabled && activeTab === 'local-guide') {
      closeAllInPageViews();
      setActiveTab('explore');
    }
  };

  const handleSelectStreamlineMode = (mode: StreamlineMode) => {
    setStreamlineMode(mode);
    saveStoredStreamlineMode(mode);
    const isSimplified = mode === 'unified';
    setIsSimplifiedTravelGroup(isSimplified);
    saveStoredSimplifiedTravelGroup(isSimplified);
  };

  const handleToggleSimplifiedTravelGroup = (enabled: boolean) => {
    setIsSimplifiedTravelGroup(enabled);
    saveStoredSimplifiedTravelGroup(enabled);
    const newMode: StreamlineMode = enabled ? 'unified' : 'caravan';
    setStreamlineMode(newMode);
    saveStoredStreamlineMode(newMode);
  };

  // Guard activeTab if local mode is disabled
  useEffect(() => {
    if (!isLocalModeEnabled && activeTab === 'local-guide') {
      closeAllInPageViews();
      setActiveTab('explore');
    }
  }, [isLocalModeEnabled, activeTab]);

  const handleResetAllData = () => {
    resetAllLocalData();
    setIsDemoDataOn(false);
    setIsLocalModeEnabled(false);
    saveStoredLocalModeEnabled(false);
    setIsSimplifiedTravelGroup(false);
    saveStoredSimplifiedTravelGroup(false);
    setStreamlineMode('caravan');
    saveStoredStreamlineMode('caravan');
    setBookings([]);
    setItineraryIds([]);
    setChatMessages([]);
    setGuestProfile(CLEAN_GUEST_PROFILE);
    setActiveCaravanGroup(CLEAN_CARAVAN_GROUP);
    setActiveTravelPod(CLEAN_TRAVEL_POD);
    setActiveForkedRoadtrip(CLEAN_FORKED_ROADTRIP);
    setProperties(INITIAL_PROPERTIES);
    setMyHostPropertyIds([]);
    setCheckoutData(null);
    setIsCheckoutOpen(false);
    if (activeTab === 'local-guide') {
      setActiveTab('explore');
    }
  };

  const handleOpenCheckoutDemo = () => {
    const sampleProp = properties[0] || INITIAL_PROPERTIES[0];
    const sampleComp = sampleProp?.eventComponents[0];
    if (sampleProp && sampleComp) {
      setCheckoutData({
        property: sampleProp,
        components: [
          {
            componentId: sampleComp.id,
            componentTitle: sampleComp.title,
            activityType: sampleComp.activityType,
            pricingType: sampleComp.pricingType,
            priceAmount: sampleComp.priceAmount || 25,
            attendeeCount: 2,
          },
        ],
      });
      closeAllInPageViews();
      setIsCheckoutOpen(true);
    }
  };

  // Active host managed property (defaults to first stop)
  const [hostManagedPropertyId, setHostManagedPropertyId] = useState<string>(() => properties[0]?.id || 'prop-1');

  // 4. Group Chat State (Simple: Everyone, Region, Event)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatScope, setChatScope] = useState<ChatScope>('everyone');
  const [chatTargetId, setChatTargetId] = useState<string | undefined>(undefined);

  const handleOpenChat = (scope: ChatScope = 'everyone', targetId?: string) => {
    setChatScope(scope);
    setChatTargetId(targetId);
    setIsChatOpen(true);
  };

  const handleSendChatMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = addStoredChatMessage(newMsg);
    setChatMessages(updated);
    // Sync to Firestore
    sendCloudChatMessage(newMsg).catch(err => console.warn('Cloud chat sync error:', err));
  };

  // 3. Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | 'all'>('all');
  const [selectedFeature, setSelectedFeature] = useState<PermacultureFeature | 'all'>('all');
  const [hasAccommodationOnly, setHasAccommodationOnly] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<PricingType | 'all'>('all');
  const [roadtripFilter, setRoadtripFilter] = useState<'all' | 'in-itinerary' | 'missing-pass' | 'has-pass'>('all');

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveProperties(properties);
  }, [properties]);

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveStoredGuestProfile(guestProfile);
  }, [guestProfile]);

  useEffect(() => {
    saveItinerary(itineraryIds);
  }, [itineraryIds]);

  useEffect(() => {
    setStoredUserRole(userRole);
  }, [userRole]);

  // Support direct deep link to roadtrip or bookings view
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = (urlParams.get('view') || '').toLowerCase();
      const hashParam = window.location.hash.toLowerCase();

      if (viewParam === 'roadtrip' || hashParam.includes('roadtrip')) {
        closeAllInPageViews();
        setIsItineraryDrawerOpen(true);
      } else if (viewParam === 'bookings') {
        closeAllInPageViews();
        setGuestProfileInitialTab('bookings');
        setIsGuestProfileModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle switching role
  const handleRoleChange = (role: UserRole) => {
    closeAllInPageViews();
    setUserRole(role);
    if (role === 'host') {
      setActiveTab('host');
    } else if (activeTab === 'host') {
      setActiveTab('explore');
    }
  };

  // Merge stops from a forked or shared route
  const handleMergeForkedStops = (stopIds: string[]) => {
    setItineraryIds(prev => {
      const merged = new Set([...(prev || []), ...stopIds]);
      return Array.from(merged);
    });
  };

  // 1-Click checkout start for any property
  const handleStartCheckoutForProperty = (property: PropertyStop) => {
    setIsItineraryDrawerOpen(false);
    closeAllInPageViews();
    setUserRole('guest');
    const partySize = Math.max(1, 1 + (guestProfile?.partyMembers?.length || 0));
    const componentsToUse = (property.eventComponents || []).map(c => ({
      componentId: c.id,
      componentTitle: c.title,
      activityType: c.activityType,
      pricingType: c.pricingType,
      priceAmount: c.priceAmount || 0,
      attendeeCount: partySize,
    }));
    setCheckoutData({
      property,
      components: componentsToUse,
    });
    setIsCheckoutOpen(true);
  };

  // Itinerary toggling
  const handleToggleItinerary = (propId: string) => {
    setItineraryIds(prev => {
      const current = prev || [];
      return current.includes(propId) ? current.filter(id => id !== propId) : [...current, propId];
    });
  };

  // Count active bookings for current guest
  const myGuestBookings = useMemo(() => {
    const emailLower = guestProfile?.email?.toLowerCase().trim();
    const nameLower = guestProfile?.name?.toLowerCase().trim();
    return bookings.filter(b => {
      if (b.status === 'Cancelled / Unpaid') return false;
      if (emailLower && b.guestEmail && b.guestEmail.toLowerCase().trim() === emailLower) return true;
      if (nameLower && b.guestName && b.guestName.toLowerCase().trim() === nameLower) return true;
      return false;
    });
  }, [bookings, guestProfile]);

  const myBookingsCount = myGuestBookings.length;

  // Restrict host portal to strictly offer the host's own stops and events
  const myHostProperties = useMemo(() => {
    const userEmail = user?.email || (guestProfile?.email !== 'jessica@permatour.co.nz' ? guestProfile?.email : null);
    const userId = user?.uid;

    const owned = (properties || []).filter(p => isMyHostProperty(p, userEmail, userId, myHostPropertyIds));
    if (owned.length > 0) {
      return owned;
    }

    // In demo mode without custom registered stops, allocate the designated demo host stop
    // (Kaitiaki Farm / prop-wai-01) and strictly ONLY that stop—never leaking the other 5 stops in the national tour
    if (isDemoDataOn && properties.length > 0) {
      const demoHostStop = properties.find(p => p.id === 'prop-wai-01') || properties[0];
      return demoHostStop ? [demoHostStop] : [];
    }

    // Clean slate mode with no registered properties
    return [];
  }, [properties, user?.email, user?.uid, guestProfile?.email, myHostPropertyIds, isDemoDataOn]);

  const myHostPropertyIdsList = useMemo(() => myHostProperties.map(p => p.id), [myHostProperties]);

  const activeHostProperty = useMemo(() => {
    if (myHostProperties.length === 0) return null;
    const found = myHostProperties.find(p => p.id === hostManagedPropertyId);
    return found || myHostProperties[0];
  }, [myHostProperties, hostManagedPropertyId]);

  const handleOpenHostCompanionModal = (property: PropertyStop) => {
    setCompanionProperty(property);
  };

  const handleRemoveCompanionBooking = (bookingId: string) => {
    setBookings(prev => {
      const next = prev.filter(b => b.id !== bookingId);
      saveBookings(next);
      return next;
    });
    updateCloudBookingStatus(bookingId, 'Cancelled / Unpaid').catch(err => {
      console.warn('Could not update companion booking in cloud:', err);
    });
  };

  const itineraryProperties = useMemo(() => {
    return (properties || []).filter(p => (itineraryIds || []).includes(p.id));
  }, [properties, itineraryIds]);

  // Roadtrip stops that do not yet have a reserved pass (host-owned farms require no pass)
  const missingPassesCount = useMemo(() => {
    return itineraryProperties.filter(
      p => !myHostProperties.some(hp => hp.id === p.id) && !myGuestBookings.some(b => b.propertyId === p.id)
    ).length;
  }, [itineraryProperties, myHostProperties, myGuestBookings]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return (properties || []).filter(prop => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prop.name?.toLowerCase().includes(q);
        const matchesDistrict = prop.district?.toLowerCase().includes(q);
        const matchesHost = prop.hostName?.toLowerCase().includes(q);
        const matchesDesc = prop.landVision?.toLowerCase().includes(q);
        const matchesComp = (prop.eventComponents || []).some(c =>
          c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDistrict && !matchesHost && !matchesDesc && !matchesComp) {
          return false;
        }
      }

      // Region
      if (selectedRegion !== 'all' && prop.region !== selectedRegion) {
        return false;
      }

      // Feature
      if (selectedFeature !== 'all' && !(prop.features || []).includes(selectedFeature)) {
        return false;
      }

      // Accommodation
      if (hasAccommodationOnly && (!prop.accommodations || prop.accommodations.length === 0)) {
        return false;
      }

      // Pricing
      if (selectedPricing !== 'all') {
        const hasPricingType = (prop.eventComponents || []).some(c => c.pricingType === selectedPricing);
        if (!hasPricingType) return false;
      }

      // Roadtrip route & pass status filter
      if (roadtripFilter === 'in-itinerary') {
        if (!(itineraryIds || []).includes(prop.id)) return false;
      } else if (roadtripFilter === 'missing-pass') {
        const inItin = (itineraryIds || []).includes(prop.id);
        const isHost = myHostProperties.some(hp => hp.id === prop.id);
        const hasPass = myGuestBookings.some(b => b.propertyId === prop.id);
        if (!inItin || hasPass || isHost) return false;
      } else if (roadtripFilter === 'has-pass') {
        const isHost = myHostProperties.some(hp => hp.id === prop.id);
        const hasPass = myGuestBookings.some(b => b.propertyId === prop.id);
        if (!hasPass && !isHost) return false;
      }

      return true;
    });
  }, [properties, searchQuery, selectedRegion, selectedFeature, hasAccommodationOnly, selectedPricing, roadtripFilter, itineraryIds, myGuestBookings, myHostProperties]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedFeature('all');
    setHasAccommodationOnly(false);
    setSelectedPricing('all');
    setRoadtripFilter('all');
  };

  // Booking Flow: from Property Detail -> Checkout Modal
  const handleStartCheckout = (
    property: PropertyStop,
    components: SelectedComponentBooking[],
    accommodation?: { option: AccommodationOption; nights: number }
  ) => {
    setSelectedPropertyForDetail(null); // Close detail modal
    setCheckoutData({ property, components, accommodation });
    setIsCheckoutOpen(true);
  };

  // Booking Complete
  const handleBookingComplete = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);

    // Also automatically add property to Roadtrip itinerary if not already there
    if (!(itineraryIds || []).includes(newBooking.propertyId)) {
      setItineraryIds(prev => [...(prev || []), newBooking.propertyId]);
    }

    // Persist to Firestore cloud database
    syncBookingToCloud(newBooking, user?.uid).catch(err =>
      console.warn('Could not sync booking to cloud Firestore:', err)
    );
  };

  // Host Action: Update status
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: newStatus,
            confirmedAt: newStatus === 'Confirmed' ? new Date().toISOString() : b.confirmedAt,
          };
        }
        return b;
      })
    );

    // Sync status change to Firestore cloud
    updateCloudBookingStatus(bookingId, newStatus).catch(err =>
      console.warn('Could not update booking status in cloud Firestore:', err)
    );
  };

  // Host Action: Add manual booking or companion
  const handleAddManualBooking = (manualBooking: Booking) => {
    setBookings(prev => {
      const next = [manualBooking, ...prev];
      saveBookings(next);
      return next;
    });
    syncBookingToCloud(manualBooking, user?.uid).catch(err => {
      console.warn('Could not sync companion booking to cloud:', err);
    });
  };

  // Host Action: Update property bank details or event sessions
  const handleUpdatePropertyBankDetails = (updatedProp: PropertyStop) => {
    setProperties(prev => {
      const next = prev.map(p => (p.id === updatedProp.id ? updatedProp : p));
      saveProperties(next);
      return next;
    });
    // Persist to cloud database as well if available
    syncPropertyToCloud(updatedProp).catch(err => {
      console.warn('Could not sync property bank details to cloud:', err);
    });
  };

  // New Host Registration
  const handleRegisterNewProperty = (newProp: PropertyStop) => {
    const propWithOwner: PropertyStop = {
      ...newProp,
      isUserOwned: true,
      hostUserId: user?.uid,
      ownerUserId: user?.uid,
      createdByEmail: newProp.hostEmail || user?.email || (guestProfile?.email !== 'jessica@permatour.co.nz' ? guestProfile?.email : undefined),
    };
    addStoredMyHostPropertyId(newProp.id);
    setMyHostPropertyIds(prev => [newProp.id, ...prev]);
    setProperties(prev => {
      const next = [propWithOwner, ...prev];
      saveProperties(next);
      return next;
    });
    // Link to user profile in Firestore
    if (user?.uid) {
      updateCloudProfile({ managedPropertyId: newProp.id }).catch(err => {
        console.warn('Could not link managedPropertyId to cloud user profile:', err);
      });
    }
    // Immediately persist user-entered event and property to Cloud Firestore database
    syncPropertyToCloud(propWithOwner).catch(err => {
      console.warn('Could not sync newly registered event property to cloud Firestore:', err);
    });
    setHostManagedPropertyId(newProp.id);
    setUserRole('host');
    setActiveTab('host');
  };

  // Smooth scroll to top whenever an in-page view opens
  useEffect(() => {
    if (
      selectedPropertyForDetail ||
      isCheckoutOpen ||
      isItineraryDrawerOpen ||
      isHostRegisterModalOpen ||
      isGuestProfileModalOpen ||
      isChatOpen
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [
    selectedPropertyForDetail,
    isCheckoutOpen,
    isItineraryDrawerOpen,
    isHostRegisterModalOpen,
    isGuestProfileModalOpen,
    isChatOpen,
  ]);

  const closeAllInPageViews = () => {
    setSelectedPropertyForDetail(null);
    setIsCheckoutOpen(false);
    setCheckoutData(null);
    setIsItineraryDrawerOpen(false);
    setIsHostRegisterModalOpen(false);
    setIsGuestProfileModalOpen(false);
    setIsChatOpen(false);
  };

  // Screen-correlated role: guarantees that toggle and display are fully synchronized
  const isHostOnScreen =
    (activeTab === 'host' || isHostRegisterModalOpen) &&
    !isGuestProfileModalOpen &&
    !isItineraryDrawerOpen &&
    !selectedPropertyForDetail &&
    !isCheckoutOpen;
  const currentScreenRole: UserRole = isHostOnScreen ? 'host' : 'guest';

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#1C2C19] flex flex-col antialiased selection:bg-[#2D5A27] selection:text-white">
      {/* Offline Status Bar */}
      <OfflineIndicator isLocalModeEnabled={isLocalModeEnabled} />

      {/* Main App Navigation */}
      <Navbar
        userRole={currentScreenRole}
        onRoleChange={role => {
          closeAllInPageViews();
          handleRoleChange(role);
        }}
        activeTab={activeTab}
        onTabChange={tab => {
          closeAllInPageViews();
          setActiveTab(tab);
          if (tab === 'host') {
            setUserRole('host');
          } else {
            setUserRole('guest');
          }
        }}
        itineraryCount={itineraryIds.length}
        isItineraryOpen={isItineraryDrawerOpen}
        onOpenItinerary={() => {
          if (isItineraryDrawerOpen) {
            setIsItineraryDrawerOpen(false);
          } else {
            closeAllInPageViews();
            setUserRole('guest');
            setIsItineraryDrawerOpen(true);
          }
        }}
        onOpenHostRegister={() => {
          closeAllInPageViews();
          setUserRole('host');
          setIsHostRegisterModalOpen(true);
        }}
        guestProfile={guestProfile}
        isGuestProfileOpen={isGuestProfileModalOpen}
        onOpenGuestProfile={(tab = 'bookings') => {
          if (isGuestProfileModalOpen && guestProfileInitialTab === tab) {
            setIsGuestProfileModalOpen(false);
          } else {
            closeAllInPageViews();
            setUserRole('guest');
            setGuestProfileInitialTab(tab);
            setIsGuestProfileModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        guestBookingsCount={myBookingsCount}
        isChatOpen={isChatOpen}
        onOpenGroupChat={() => {
          if (isChatOpen) {
            setIsChatOpen(false);
          } else {
            closeAllInPageViews();
            handleOpenChat('everyone');
          }
        }}
        isLocalModeEnabled={isLocalModeEnabled}
        isSimplifiedTravelGroup={isSimplifiedTravelGroup}
        streamlineMode={streamlineMode}
        hasHostEvents={myHostProperties.length > 0}
        onOpenHostPortal={() => handleRoleChange('host')}
        onNavigateToLocalGuide={
          isLocalModeEnabled
            ? () => {
                closeAllInPageViews();
                setUserRole('guest');
                setActiveTab('local-guide');
              }
            : undefined
        }
      />

      {/* PRIMARY VIEW ROUTING: IN-PAGE VIEWS (No popups / modals) */}
      {selectedPropertyForDetail ? (
        <main className="flex-1 pb-16">
          <PropertyDetailModal
            property={selectedPropertyForDetail}
            onClose={() => setSelectedPropertyForDetail(null)}
            onStartCheckout={handleStartCheckout}
            isInItinerary={(itineraryIds || []).includes(selectedPropertyForDetail.id)}
            onToggleItinerary={handleToggleItinerary}
            guestProfile={guestProfile}
            onOpenChat={(scope, targetId) => handleOpenChat(scope, targetId)}
            hasPass={myGuestBookings.some(b => b.propertyId === selectedPropertyForDetail.id)}
            matchingBooking={myGuestBookings.find(b => b.propertyId === selectedPropertyForDetail.id)}
            streamlineMode={streamlineMode}
            isSimplifiedTravelGroup={isSimplifiedTravelGroup}
            isHostProperty={myHostProperties.some(p => p.id === selectedPropertyForDetail.id)}
            propertyBookings={bookings.filter(b => b.propertyId === selectedPropertyForDetail.id)}
            onAddCompanionBooking={handleAddManualBooking}
            onRemoveCompanion={handleRemoveCompanionBooking}
            onManageHostProperty={() => {
              const propId = selectedPropertyForDetail.id;
              setSelectedPropertyForDetail(null);
              setUserRole('host');
              setActiveTab('host');
              setHostManagedPropertyId(propId);
            }}
          />
        </main>
      ) : isCheckoutOpen && checkoutData ? (
        <main className="flex-1 pb-16">
          <BankTransferCheckoutModal
            property={checkoutData.property}
            selectedComponents={checkoutData.components}
            selectedAccommodation={checkoutData.accommodation}
            guestProfile={guestProfile}
            onOpenGuestPass={() => {
              setIsCheckoutOpen(false);
              setIsGuestProfileModalOpen(true);
            }}
            streamlineMode={streamlineMode}
            caravanGroup={activeCaravanGroup}
            travelPod={activeTravelPod}
            forkedRoadtrip={activeForkedRoadtrip}
            isDemoDataOn={isDemoDataOn}
            isLocalModeEnabled={isLocalModeEnabled}
            isSimplifiedTravelGroup={isSimplifiedTravelGroup}
            onClose={() => {
              setIsCheckoutOpen(false);
              setCheckoutData(null);
            }}
            onBookingComplete={handleBookingComplete}
            onUpdateGuestProfile={handleUpdateGuestProfile}
          />
        </main>
      ) : isItineraryDrawerOpen ? (
        <main className="flex-1 pb-16">
          <RoadtripItineraryDrawer
            isOpen={isItineraryDrawerOpen}
            onClose={() => setIsItineraryDrawerOpen(false)}
            itineraryProperties={itineraryProperties}
            onRemoveFromItinerary={handleToggleItinerary}
            onAddPropertyToItinerary={id => {
              if (!(itineraryIds || []).includes(id)) {
                handleToggleItinerary(id);
              }
            }}
            onMergeForkedStops={handleMergeForkedStops}
            onStartCheckoutForProperty={handleStartCheckoutForProperty}
            onSelectProperty={setSelectedPropertyForDetail}
            allProperties={properties}
            bookings={myGuestBookings}
            allBookings={bookings}
            guestName={guestProfile?.name || 'Kiwi Traveler'}
            guestEmail={guestProfile?.email}
            guestProfile={guestProfile}
            streamlineMode={streamlineMode}
            caravanGroup={activeCaravanGroup}
            travelPod={activeTravelPod}
            forkedRoadtrip={activeForkedRoadtrip}
            isSimplifiedTravelGroup={isSimplifiedTravelGroup}
            isLocalModeEnabled={isLocalModeEnabled}
            onOpenProfileBookings={() => {
              setIsItineraryDrawerOpen(false);
              closeAllInPageViews();
              setUserRole('guest');
              setGuestProfileInitialTab('bookings');
              setIsGuestProfileModalOpen(true);
            }}
            onUpdateGuestProfile={handleUpdateGuestProfile}
            onOpenGuestProfile={tab => {
              setIsItineraryDrawerOpen(false);
              closeAllInPageViews();
              setUserRole('guest');
              setGuestProfileInitialTab(tab || 'profile');
              setIsGuestProfileModalOpen(true);
            }}
            hostPropertyIds={myHostPropertyIdsList}
            onAddCompanionForProperty={handleOpenHostCompanionModal}
            onAddCompanionStop={stop => {
              if (!(itineraryIds || []).includes(stop.id)) {
                handleToggleItinerary(stop.id);
              }
            }}
          />
        </main>
      ) : isHostRegisterModalOpen ? (
        <main className="flex-1 pb-16">
          <HostRegistrationModal
            onClose={() => setIsHostRegisterModalOpen(false)}
            onRegisterProperty={handleRegisterNewProperty}
            defaultHostName={user?.displayName || (guestProfile?.name !== 'Jessica Blomfield' ? guestProfile?.name : '')}
            defaultHostEmail={user?.email || (guestProfile?.email !== 'jessica@permatour.co.nz' ? guestProfile?.email : '')}
          />
        </main>
      ) : isGuestProfileModalOpen ? (
        <main className="flex-1 pb-16">
          <GuestProfileModal
            isOpen={isGuestProfileModalOpen}
            initialTab={guestProfileInitialTab}
            onClose={() => setIsGuestProfileModalOpen(false)}
            guestProfile={guestProfile}
            onUpdateProfile={handleUpdateGuestProfile}
            onSwitchGuest={setGuestProfile}
            bookings={bookings}
            properties={properties}
            onRefreshBookings={() => setBookings(getStoredBookings())}
            streamlineMode={streamlineMode}
            onSelectStreamlineMode={handleSelectStreamlineMode}
            caravanGroup={activeCaravanGroup}
            travelPod={activeTravelPod}
            forkedRoadtrip={activeForkedRoadtrip}
            isDemoDataOn={isDemoDataOn}
            isLocalModeEnabled={isLocalModeEnabled}
            isSimplifiedTravelGroup={isSimplifiedTravelGroup}
            onToggleSimplifiedTravelGroup={handleToggleSimplifiedTravelGroup}
            onOpenItinerary={() => {
              setIsGuestProfileModalOpen(false);
              setIsItineraryDrawerOpen(true);
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateToLocalGuide={
              isLocalModeEnabled
                ? () => {
                    setIsGuestProfileModalOpen(false);
                    closeAllInPageViews();
                    setActiveTab('local-guide');
                  }
                : undefined
            }
            onOpenCheckoutForProperty={(property, customComponents) => {
              const partySize = Math.max(1, 1 + (guestProfile?.coTravelers?.length || guestProfile?.partyMembers?.length || 0));
              const componentsToUse =
                customComponents && customComponents.length > 0
                  ? customComponents
                  : (property.eventComponents || []).map(c => ({
                      componentId: c.id,
                      componentTitle: c.title,
                      activityType: c.activityType,
                      pricingType: c.pricingType,
                      priceAmount: c.priceAmount || 0,
                      attendeeCount: partySize,
                    }));

              setIsGuestProfileModalOpen(false);
              setCheckoutData({
                property,
                components: componentsToUse,
              });
              setIsCheckoutOpen(true);
            }}
            onSelectPropertyForDetail={prop => {
              setIsGuestProfileModalOpen(false);
              setSelectedPropertyForDetail(prop);
            }}
            myHostProperties={myHostProperties}
            onAddCompanionForProperty={handleOpenHostCompanionModal}
          />
        </main>
      ) : isChatOpen ? (
        <main className="flex-1 pb-16">
          <GroupChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            properties={properties}
            guestProfile={guestProfile}
            userRole={userRole}
            initialScope={chatScope}
            initialTargetId={chatTargetId}
            selectedRegionFilter={selectedRegion}
            onSelectPropertyForDetail={setSelectedPropertyForDetail}
          />
        </main>
      ) : (
        /* STANDARD TAB VIEWS */
        <>
          {/* VIEW: EXPLORE STOPS (GUEST & ALL) */}
          {activeTab === 'explore' && (
            <main className="flex-1 pb-16">
              {/* Hero Section with countdown and regional rollout timeline */}
              <HeroSection
                onExploreClick={() => {
                  const el = document.getElementById('explore-stops-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onJoinAsGuest={() => {
                  const el = document.getElementById('explore-stops-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onHostAStop={() => setIsHostRegisterModalOpen(true)}
                selectedRegion={selectedRegion}
                onSelectRegion={reg => {
                  setSelectedRegion(reg);
                  const el = document.getElementById('explore-stops-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectRegionFilter={reg => {
                  setSelectedRegion(reg);
                  const el = document.getElementById('explore-stops-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Anchor for Smooth Scrolling */}
              <div id="explore-stops-anchor" />

              {/* Multi-Facet Filter Bar */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                selectedFeature={selectedFeature}
                onFeatureChange={setSelectedFeature}
                hasAccommodationOnly={hasAccommodationOnly}
                onToggleAccommodation={() => setHasAccommodationOnly(!hasAccommodationOnly)}
                selectedPricing={selectedPricing}
                onPricingChange={setSelectedPricing}
                totalCount={properties.length}
                filteredCount={filteredProperties.length}
                onResetFilters={handleResetFilters}
                onOpenRegionChat={reg => handleOpenChat('region', reg)}
                roadtripFilter={roadtripFilter}
                onRoadtripFilterChange={setRoadtripFilter}
                itineraryCount={itineraryIds.length}
                missingPassesCount={missingPassesCount}
              />

              {/* Property Cards Grid */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {filteredProperties.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#E0D8C8] shadow-xs my-8 space-y-4">
                    <Sprout className="w-12 h-12 text-[#687964] mx-auto opacity-70" />
                    <h3 className="text-xl font-bold font-display text-[#1C2C19]">
                      No permaculture events found
                    </h3>
                    <p className="text-sm text-[#5D6E5A] max-w-md mx-auto">
                      Try adjusting your region, keyword, or permaculture feature tags to discover open properties.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#20401B] transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                    {filteredProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onSelect={setSelectedPropertyForDetail}
                        onSelectProperty={setSelectedPropertyForDetail}
                        isInItinerary={(itineraryIds || []).includes(property.id)}
                        onToggleItinerary={handleToggleItinerary}
                        onOpenChat={prop => handleOpenChat('event', prop.id)}
                        hasPass={myGuestBookings.some(b => b.propertyId === property.id)}
                        matchingBooking={myGuestBookings.find(b => b.propertyId === property.id)}
                        onBookPass={handleStartCheckoutForProperty}
                        isHostProperty={myHostProperties.some(p => p.id === property.id)}
                        onAddCompanion={handleOpenHostCompanionModal}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Simple Zero Fees Direct Payment Banner */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2DAC9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="w-11 h-11 rounded-xl bg-[#E8F0E6] text-[#2D5A27] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-display text-[#1C2C19]">
                        Zero Fees • Free Passes, Koha & Direct Support
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4E5E4B] mt-0.5">
                        Zero fees — guest passes, koha, and any payments are handled directly with hosts.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeAllInPageViews();
                      setIsHostRegisterModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs shrink-0 self-stretch sm:self-auto text-center"
                  >
                    Register Your Land
                  </button>
                </div>
              </div>
            </main>
          )}

          {/* VIEW: INTERACTIVE TOUR MAP */}
          {activeTab === 'map' && (
            <main className="flex-1 pb-16">
              <InteractiveTourMap
                properties={properties}
                onSelectProperty={setSelectedPropertyForDetail}
                itineraryIds={itineraryIds}
                onToggleItinerary={handleToggleItinerary}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                bookings={myGuestBookings}
                onBookPass={handleStartCheckoutForProperty}
              />
            </main>
          )}

          {/* VIEW: HOST DASHBOARD */}
          {activeTab === 'host' && (
            <main className="flex-1 pb-16">
              <HostDashboard
                property={activeHostProperty}
                allProperties={myHostProperties}
                onSelectHostProperty={setHostManagedPropertyId}
                bookings={bookings}
                onUpdateStatus={handleUpdateBookingStatus}
                onAddManualBooking={handleAddManualBooking}
                onUpdatePropertyBankDetails={handleUpdatePropertyBankDetails}
                onUpdateProperty={handleUpdatePropertyBankDetails}
                onViewPropertyListing={setSelectedPropertyForDetail}
                onRegisterNewProperty={() => setIsHostRegisterModalOpen(true)}
                travelerBookingsCount={myBookingsCount}
                onOpenTravelerBookings={() => {
                  closeAllInPageViews();
                  setUserRole('guest');
                  setGuestProfileInitialTab('bookings');
                  setIsGuestProfileModalOpen(true);
                }}
              />
            </main>
          )}

          {/* VIEW: LOCAL-ONLY MODE & PRIVACY EXPLANATION (Hidden by default behind footer settings toggle) */}
          {isLocalModeEnabled && activeTab === 'local-guide' && (
            <main className="flex-1 pb-16">
              <LocalModeExplanationPage
                onBackToExplore={() => {
                  closeAllInPageViews();
                  setActiveTab('explore');
                }}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenItinerary={() => {
                  closeAllInPageViews();
                  setIsItineraryDrawerOpen(true);
                }}
                onOpenProfile={() => {
                  closeAllInPageViews();
                  setIsGuestProfileModalOpen(true);
                }}
                onRefreshData={() => {
                  setProperties(getStoredProperties());
                  setBookings(getStoredBookings());
                  setItineraryIds(getStoredItinerary());
                  setGuestProfile(getStoredGuestProfile());
                }}
              />
            </main>
          )}
        </>
      )}

      {/* FOOTER */}
      <footer className="bg-[#1C2C19] text-[#DFE7DD] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#293B26] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
              <span className="font-display font-bold text-base text-white">
                The Great Kiwi Permaculture Tour 2027
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2D5A27] text-[#A8D59D] rounded">
                Aotearoa
              </span>
            </div>
            <p className="text-[#A8B7A4] max-w-lg">
              Connecting regenerative soil stewards, food foresters, and eco-builders with conscious travelers
              from Cape Reinga to Bluff. Free passes, koha & direct host connections with zero platform fees.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#DFE7DD]">
            <button
              onClick={() => {
                closeAllInPageViews();
                setActiveTab('explore');
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Explore Stops
            </button>
            <span>•</span>
            <button
              onClick={() => {
                closeAllInPageViews();
                setActiveTab('map');
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Interactive Map
            </button>
            <span>•</span>
            <button
              onClick={() => {
                closeAllInPageViews();
                setIsItineraryDrawerOpen(true);
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Roadtrip ({itineraryIds.length})
            </button>
            <span>•</span>
            <button
              onClick={() => {
                closeAllInPageViews();
                setIsGuestProfileModalOpen(true);
              }}
              className="text-[#E8F0E6] hover:text-white font-medium transition cursor-pointer"
            >
              {isSimplifiedTravelGroup || streamlineMode === 'unified'
                ? `Profile${myBookingsCount > 0 ? ` (${myBookingsCount})` : ''}`
                : `Guest Passes & Profile (${myBookingsCount})`}
            </button>
            <span>•</span>
            <button
              onClick={() => {
                closeAllInPageViews();
                setUserRole('host');
                setActiveTab('host');
              }}
              className="text-[#A8D59D] hover:underline transition cursor-pointer"
            >
              Host Portal
            </button>
            {/* Local & Privacy Link: Hidden by default behind footer settings toggle */}
            {isLocalModeEnabled && (
              <>
                <span>•</span>
                <button
                  id="footer-local-guide-link"
                  onClick={() => {
                    closeAllInPageViews();
                    setActiveTab('local-guide');
                  }}
                  className="text-[#DFE7DD] hover:text-white transition cursor-pointer flex items-center gap-1 font-semibold"
                  title="Learn how Local-Only Mode works with zero registration"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A8D59D]" />
                  <span>Local & Privacy</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#2A3F26] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#869982]">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2027 The Great Kiwi Permaculture Tour. Built for rural low-bandwidth resilience.</span>
            <PWAInstallButton variant="minimal" />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span>Designed with earth tones, deep sage, and warm terracotta.</span>

            {/* Quick Toggle in Footer for Local Mode (Only shown if ON so user can turn off) */}
            {isLocalModeEnabled && (
              <button
                id="footer-local-mode-quick-toggle"
                type="button"
                onClick={() => handleToggleLocalMode(false)}
                className="px-2 py-0.5 rounded text-[10px] border transition flex items-center gap-1.5 cursor-pointer font-mono bg-[#2D5A27]/40 text-[#A8D59D] border-[#2D5A27]"
                title="Local Mode is Active (Click to turn off)"
              >
                <HardDrive className="w-3 h-3" />
                <span>local mode: on</span>
              </button>
            )}

            {/* Footer Settings Button */}
            <button
              id="footer-settings-btn"
              type="button"
              onClick={() => setIsFooterSettingsOpen(true)}
              className="px-2 py-0.5 rounded text-[10px] text-stone-300 hover:text-white hover:bg-white/10 border border-white/20 transition flex items-center gap-1.5 cursor-pointer font-sans font-medium"
              title="Settings & Preferences"
            >
              <Sliders className="w-3 h-3 text-[#A8D59D]" />
              <span>Settings</span>
            </button>

            {/* OBSCURE BUTTON IN FOOTER FOR DEMO DATA ON / OFF / SEEDED */}
            <button
              id="obscure-demo-data-btn"
              type="button"
              onClick={() => setIsDemoControlsOpen(true)}
              className="px-2 py-0.5 rounded text-[10px] text-stone-400/80 hover:text-stone-200 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5 cursor-pointer font-mono"
              title="Demo & Seed Data Controls (Toggle ON/OFF, Re-seed, Architecture Modes)"
            >
              <Database className="w-3 h-3 text-stone-400" />
              <span>demo data: {isDemoDataOn ? 'on' : 'off'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTON: GROUP CHAT (hidden when chat view is active) */}
      {!isChatOpen && (
        <button
          id="floating-group-chat-btn"
          onClick={() => {
            closeAllInPageViews();
            handleOpenChat('everyone');
          }}
          className="fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-[#2D5A27] hover:bg-[#20401B] text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer group border border-white/20 hover:scale-105 active:scale-95"
          title="Open Group Chat (Everyone, Region, Event)"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-[#A8D59D]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C86446] rounded-full ring-2 ring-white" />
          </div>
          <span>Group Chat</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] text-white/90">
            Everyone · Region · Event
          </span>
        </button>
      )}

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isLocalModeEnabled={isLocalModeEnabled}
        onNavigateToLocalGuide={
          isLocalModeEnabled
            ? () => {
                setIsAuthModalOpen(false);
                closeAllInPageViews();
                setActiveTab('local-guide');
              }
            : undefined
        }
      />

      {/* Footer Settings Modal */}
      <FooterSettingsModal
        isOpen={isFooterSettingsOpen}
        onClose={() => setIsFooterSettingsOpen(false)}
        isLocalModeEnabled={isLocalModeEnabled}
        onToggleLocalMode={handleToggleLocalMode}
        onNavigateToLocalGuide={() => {
          setIsFooterSettingsOpen(false);
          closeAllInPageViews();
          setActiveTab('local-guide');
        }}
        isDemoDataOn={isDemoDataOn}
        onOpenDemoControls={() => {
          setIsFooterSettingsOpen(false);
          setIsDemoControlsOpen(true);
        }}
        isSimplifiedTravelGroup={isSimplifiedTravelGroup}
        onToggleSimplifiedTravelGroup={handleToggleSimplifiedTravelGroup}
        streamlineMode={streamlineMode}
        onSelectStreamlineMode={handleSelectStreamlineMode}
        onOpenRoadtripBookings={() => {
          setIsFooterSettingsOpen(false);
          closeAllInPageViews();
          setIsItineraryDrawerOpen(true);
        }}
      />

      {/* Obscure Demo Data Controls Modal */}
      <DemoDataControlsModal
        isOpen={isDemoControlsOpen}
        onClose={() => setIsDemoControlsOpen(false)}
        isDemoDataOn={isDemoDataOn}
        onToggleDemoData={handleToggleDemoData}
        isLocalModeEnabled={isLocalModeEnabled}
        onToggleLocalMode={handleToggleLocalMode}
        onSeedDemoData={handleSeedDemoData}
        onCleanAllDemoData={handleCleanAllDemoData}
        onClearAllBookings={handleClearAllBookings}
        onResetAllData={handleResetAllData}
        currentStreamlineMode={streamlineMode}
        onSelectStreamlineMode={handleSelectStreamlineMode}
        caravanGroup={activeCaravanGroup}
        travelPod={activeTravelPod}
        forkedRoadtrip={activeForkedRoadtrip}
        onOpenCheckoutDemo={handleOpenCheckoutDemo}
        onOpenItinerary={() => {
          closeAllInPageViews();
          setIsItineraryDrawerOpen(true);
        }}
        onOpenProfile={() => {
          closeAllInPageViews();
          setIsGuestProfileModalOpen(true);
        }}
        bookingsCount={bookings.length}
        propertiesCount={properties.length}
        totalEventsCount={totalEventsCount}
        onClearAllPropertiesAndEvents={handleClearAllPropertiesAndEvents}
        onRestoreCleanCatalog={handleRestoreCleanCatalog}
      />

      {/* Host Companion Registration Modal */}
      {companionProperty && (
        <HostCompanionModal
          property={companionProperty}
          guestProfile={guestProfile}
          onClose={() => setCompanionProperty(null)}
          onAddCompanionBooking={handleAddManualBooking}
        />
      )}
    </div>
  );
}
