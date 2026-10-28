import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  MapPin,
  Calendar,
  Compass,
  User,
  KeyRound,
  Sparkles,
  Check,
  X,
  CheckCircle2,
  MessageSquare,
  Cloud,
  LogIn,
  LogOut,
  ChevronDown,
  HardDrive,
  UserPlus,
  ShieldCheck,
  Users,
  Ticket,
} from 'lucide-react';
import { UserRole, GuestProfile, StreamlineMode } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface NavbarProps {
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  currentRole?: 'guest' | 'host';
  onRoleToggle?: (role: 'guest' | 'host') => void;
  activeTab?: 'explore' | 'map' | 'host' | 'local-guide';
  onTabChange?: (tab: 'explore' | 'map' | 'host' | 'local-guide') => void;
  activeView?: 'explore' | 'map' | 'host-dashboard';
  setActiveView?: (v: 'explore' | 'map' | 'host-dashboard') => void;
  itineraryCount: number;
  onOpenItinerary: () => void;
  isItineraryOpen?: boolean;
  onOpenHostRegister?: () => void;
  onOpenHostRegisterModal?: () => void;
  guestUserEmail?: string | null;
  onOpenAuthModal?: () => void;
  guestProfile?: GuestProfile;
  onOpenGuestProfile?: (tab?: 'bookings' | 'settings') => void;
  isGuestProfileOpen?: boolean;
  guestBookingsCount?: number;
  onOpenGroupChat?: () => void;
  isChatOpen?: boolean;
  onNavigateToLocalGuide?: () => void;
  isLocalModeEnabled?: boolean;
  isSimplifiedTravelGroup?: boolean;
  streamlineMode?: StreamlineMode;
  hasHostEvents?: boolean;
  onOpenHostPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  onRoleChange,
  currentRole,
  onRoleToggle,
  activeTab,
  onTabChange,
  activeView,
  setActiveView,
  itineraryCount,
  onOpenItinerary,
  isItineraryOpen = false,
  onOpenHostRegister,
  onOpenHostRegisterModal,
  guestUserEmail,
  onOpenAuthModal,
  guestProfile,
  onOpenGuestProfile,
  isGuestProfileOpen = false,
  guestBookingsCount = 0,
  onOpenGroupChat,
  isChatOpen = false,
  onNavigateToLocalGuide,
  isLocalModeEnabled = false,
  isSimplifiedTravelGroup = true,
  streamlineMode = 'unified',
  hasHostEvents = false,
  onOpenHostPortal,
}) => {
  const isUnified = isSimplifiedTravelGroup || streamlineMode === 'unified';
  const { user, profile: authProfile, logout } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close nested account dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const effectiveRole: UserRole = userRole || (currentRole as UserRole) || 'guest';
  const effectiveTab: 'explore' | 'map' | 'host' | 'local-guide' =
    effectiveRole === 'host'
      ? 'host'
      : (activeTab === 'host' ? 'explore' : activeTab) || 'explore';

  // Coordinated active navigation selection across entire app
  type NavSelection = 'explore' | 'map' | 'roadtrip' | 'chat' | 'host' | 'local-guide';
  const activeNav: NavSelection = (() => {
    if (isItineraryOpen) return 'roadtrip';
    if (isChatOpen) return 'chat';
    if (effectiveRole === 'host' || activeTab === 'host') return 'host';
    if (activeTab === 'map') return 'map';
    if (isLocalModeEnabled && activeTab === 'local-guide') return 'local-guide';
    return 'explore';
  })();

  const handleRole = (newRole: UserRole) => {
    if (onRoleChange) onRoleChange(newRole);
    if (onRoleToggle) onRoleToggle(newRole as 'guest' | 'host');
    if (newRole === 'host') {
      handleTab('host');
    } else if (effectiveTab === 'host') {
      handleTab('explore');
    }
  };

  const handleTab = (newTab: 'explore' | 'map' | 'host' | 'local-guide') => {
    if (onTabChange) onTabChange(newTab);
    if (setActiveView) {
      setActiveView(newTab === 'host' ? 'host-dashboard' : (newTab as any));
    }
    if (newTab === 'host') {
      if (onRoleChange && effectiveRole !== 'host') onRoleChange('host');
      if (onRoleToggle) onRoleToggle('host');
    } else {
      if (onRoleChange && effectiveRole !== 'guest') onRoleChange('guest');
      if (onRoleToggle) onRoleToggle('guest');
    }
  };

  const handleAuthClick = () => {
    if (onOpenGuestProfile) {
      onOpenGuestProfile();
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      onOpenItinerary();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#E7E0D3] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          {/* Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => handleTab('explore')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2D5A27] flex items-center justify-center text-[#E8F0E6] shadow-sm group-hover:bg-[#1E3E1A] transition shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-[#A8D59D]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-bold text-sm sm:text-lg md:text-xl text-[#1E2E1A] tracking-tight truncate">
                  The Great Kiwi Permaculture Tour
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-bold bg-[#C86446] text-white rounded-md tracking-wider shrink-0">
                  2027
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation - All primary views in coordinated segmented nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#EFE9DE] p-1 rounded-xl border border-[#E0D8C8] shadow-2xs">
            <button
              id="nav-explore-btn"
              onClick={() => {
                handleTab('explore');
                if (effectiveRole !== 'guest') handleRole('guest');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeNav === 'explore'
                  ? 'bg-[#2D5A27] text-white shadow-xs'
                  : 'text-[#5E6D59] hover:text-[#1C2C19] hover:bg-[#E2D8C5]/60'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${activeNav === 'explore' ? 'text-white' : 'text-[#5E6D59]'}`} />
              <span>Tour Events</span>
            </button>
            <button
              id="nav-map-btn"
              onClick={() => {
                handleTab('map');
                if (effectiveRole !== 'guest') handleRole('guest');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeNav === 'map'
                  ? 'bg-[#2D5A27] text-white shadow-xs'
                  : 'text-[#5E6D59] hover:text-[#1C2C19] hover:bg-[#E2D8C5]/60'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${activeNav === 'map' ? 'text-white' : 'text-[#5E6D59]'}`} />
              <span>Interactive Map</span>
            </button>
            <button
              id="open-itinerary-btn"
              onClick={onOpenItinerary}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeNav === 'roadtrip'
                  ? 'bg-[#2D5A27] text-white shadow-xs'
                  : 'text-[#5E6D59] hover:text-[#1C2C19] hover:bg-[#E2D8C5]/60'
              }`}
              title={isUnified ? "View roadtrip itinerary and bookings" : "View my Permaculture Roadtrip events, sessions, and passes"}
            >
              <Calendar className={`w-3.5 h-3.5 ${activeNav === 'roadtrip' ? 'text-white' : 'text-[#C86446]'}`} />
              <span>Roadtrip</span>
              {(itineraryCount > 0 || guestBookingsCount > 0) && (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.2 min-w-4.5 h-4.5 text-[10px] font-bold rounded-full transition ${
                    activeNav === 'roadtrip'
                      ? 'bg-white text-[#2D5A27] shadow-2xs'
                      : 'bg-[#C86446] text-white'
                  }`}
                >
                  {itineraryCount + guestBookingsCount}
                </span>
              )}
            </button>
            {onOpenGroupChat && (
              <button
                id="nav-open-chat-btn"
                onClick={onOpenGroupChat}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeNav === 'chat'
                    ? 'bg-[#2D5A27] text-white shadow-xs'
                    : 'text-[#5E6D59] hover:text-[#1C2C19] hover:bg-[#E2D8C5]/60'
                }`}
                title="Open Community Chat (Everyone, Region, Event)"
              >
                <MessageSquare className={`w-3.5 h-3.5 ${activeNav === 'chat' ? 'text-white' : 'text-[#2D5A27]'}`} />
                <span>Community Chat</span>
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      activeNav === 'chat' ? 'bg-white' : 'bg-[#2D5A27]'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      activeNav === 'chat' ? 'bg-emerald-300 ring-1 ring-white' : 'bg-[#2D5A27]'
                    }`}
                  ></span>
                </span>
              </button>
            )}
          </nav>

          {/* Right Action Stack */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role switch toggle (desktop) */}
            <div className="hidden sm:flex items-center bg-[#EFE9DE] rounded-xl p-1 border border-[#E0D8C8] shadow-2xs">
              <button
                id="role-switch-guest"
                type="button"
                onClick={() => handleRole('guest')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  effectiveRole === 'guest' && activeNav !== 'host'
                    ? 'bg-[#2D5A27] text-white shadow-xs'
                    : 'text-[#5E6D59] hover:text-[#1C2C19] hover:bg-[#E2D8C5]/60'
                }`}
                title="Tour: Browse events, sessions, map & plan roadtrip"
              >
                <Compass className={`w-3.5 h-3.5 ${effectiveRole === 'guest' && activeNav !== 'host' ? 'text-white' : 'text-[#2D5A27]'}`} />
                <span>Tour</span>
              </button>
              <button
                id="role-switch-host"
                type="button"
                onClick={() => handleRole('host')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeNav === 'host'
                    ? 'bg-[#2D5A27] text-white shadow-xs'
                    : 'text-[#5E6D59] hover:text-[#1C2C19] hover:bg-[#E2D8C5]/60'
                }`}
                title="Host Portal: Manage land listings & guest bookings"
              >
                <Sprout className={`w-3.5 h-3.5 ${activeNav === 'host' ? 'text-white' : 'text-[#5E6D59]'}`} />
                <span>Host Portal</span>
              </button>
            </div>

            {/* Mobile role switch toggle in header */}
            <div className="flex sm:hidden items-center bg-[#EFE9DE] rounded-lg p-0.5 border border-[#E0D8C8]">
              <button
                type="button"
                onClick={() => handleRole('guest')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                  effectiveRole === 'guest' && activeNav !== 'host'
                    ? 'bg-[#2D5A27] text-white shadow-2xs'
                    : 'text-[#5E6D59]'
                }`}
              >
                Tour
              </button>
              <button
                type="button"
                onClick={() => handleRole('host')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                  activeNav === 'host'
                    ? 'bg-[#2D5A27] text-white shadow-2xs'
                    : 'text-[#5E6D59]'
                }`}
              >
                Host
              </button>
            </div>

            {/* Unified Nested Guest & Sign In Navigation */}
            <div className="relative" ref={accountMenuRef}>
              {(() => {
                const isLocalGuestConfigured = Boolean(
                  guestProfile?.name &&
                  guestProfile.name.trim().length > 0 &&
                  guestProfile.name !== 'Guest Traveler'
                );

                return (
                  <button
                    id="sign-in-btn"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs select-none ${
                      isGuestProfileOpen || isAccountMenuOpen
                        ? 'border-[#2D5A27] bg-[#E8F1E5] text-[#1C2C19] ring-2 ring-[#2D5A27]/25 shadow-xs'
                        : user
                        ? 'border-[#2D5A27]/30 text-[#1C2C19] bg-[#F2F7F0] hover:bg-[#E5F0E2]'
                        : isLocalGuestConfigured
                        ? 'border-[#2D5A27]/30 text-[#1C2C19] bg-[#F7FAF6] hover:bg-[#EDF5EB]'
                        : 'border-[#E8D0C3] text-[#8C4A32] bg-[#FDF8F5] hover:bg-[#FAF0EA]'
                    }`}
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="true"
                    title={
                      user
                        ? `Account: ${user.email} (Cloud Synced)`
                        : isLocalGuestConfigured
                        ? `Profile: ${guestProfile?.name}`
                        : 'Sign In or Set Up Profile'
                    }
                  >
                    {user ? (
                      <>
                        {user.photoURL || guestProfile?.avatar ? (
                          <img
                            src={user.photoURL || guestProfile?.avatar}
                            alt={user.displayName || guestProfile?.name || 'User'}
                            className="w-5 h-5 rounded-full object-cover border border-[#2D5A27]/40"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-[10px] font-bold">
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="hidden sm:inline max-w-[85px] truncate font-bold text-[#1C2C19]">
                          {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                        </span>
                        <Cloud className="w-3 h-3 text-[#2D5A27] shrink-0" />
                      </>
                    ) : isLocalGuestConfigured ? (
                      <>
                        {guestProfile?.avatar ? (
                          <img
                            src={guestProfile.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-[#2D5A27]/30"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-[10px] font-bold">
                            {(guestProfile?.name || 'G')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="inline max-w-[90px] truncate font-bold text-[#1C2C19]">
                          {guestProfile?.name?.split(' ')[0]}
                        </span>
                        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#2D5A27]/10 text-[#2D5A27] rounded-md">
                          Profile
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span className="inline max-w-[90px] truncate font-bold text-[#1C2C19]">
                          Profile
                        </span>
                        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#2D5A27]/10 text-[#2D5A27] rounded-md">
                          Sign In
                        </span>
                      </>
                    )}

                    {guestBookingsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#2D5A27] text-white text-[10px] font-bold">
                        {guestBookingsCount}
                      </span>
                    )}

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                        isAccountMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                );
              })()}

              {/* Nested Dropdown Menu */}
              {isAccountMenuOpen && (
                <div
                  id="guest-account-menu"
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[#FDFBF7] border border-[#DDD5C5] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Account Header */}
                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E7DEC9] mb-1.5">
                    {user ? (
                      <div className="flex items-center gap-2.5">
                        {user.photoURL || guestProfile?.avatar ? (
                          <img
                            src={user.photoURL || guestProfile?.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-[#2D5A27]/40"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-sm font-bold">
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1C2C19] truncate">
                            {user.displayName || user.email?.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-[#63735F] truncate">{user.email}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-[#2D5A27]">
                            <Cloud className="w-3 h-3" />
                            <span>Registered Cloud Account</span>
                          </div>
                        </div>
                      </div>
                    ) : guestProfile?.name && guestProfile.name !== 'Guest Traveler' ? (
                      <div className="flex items-center gap-2.5">
                        {guestProfile.avatar ? (
                          <img
                            src={guestProfile.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-[#2D5A27]/30"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-sm font-bold">
                            {(guestProfile.name || 'G')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1C2C19] truncate">
                            {guestProfile.name}
                          </p>
                          <p className="text-[11px] text-[#63735F] truncate">
                            {guestProfile.email || (isLocalModeEnabled ? 'Saved on device' : 'Traveler Profile')}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-[#2D5A27]">
                            <User className="w-3 h-3" />
                            <span>Traveler Profile</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white border border-[#D5CCBA] flex items-center justify-center text-[#2D5A27] shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#1C2C19]">
                              Traveler Profile
                            </p>
                            <p className="text-[11px] text-[#63735F] leading-snug mt-0.5">
                              Set your contact details and preferences for farm host reservations.
                            </p>
                          </div>
                        </div>
                        {onOpenGuestProfile && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              onOpenGuestProfile('settings');
                            }}
                            className="w-full mt-1 px-3 py-1.5 bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Set Up Profile</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions List */}
                  <div className="space-y-0.5">
                    {!user && onOpenAuthModal && (
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onOpenAuthModal();
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-[#EFE8DA] transition cursor-pointer text-xs font-medium text-[#2C3B29]"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#2D5A27] flex items-center justify-center text-white shrink-0">
                          <LogIn className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold block text-[#2D5A27]">Sign In / Register</span>
                          <span className="text-[11px] text-[#73826F] block truncate">
                            Sync bookings &amp; itinerary across devices
                          </span>
                        </div>
                      </button>
                    )}

                    {onOpenGuestProfile && (
                      <>
                        <button
                          id="dropdown-my-bookings-btn"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            onOpenGuestProfile('bookings');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#EFE8DA] transition cursor-pointer text-xs font-medium text-[#2C3B29]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#E8F0E6] flex items-center justify-center text-[#2D5A27] shrink-0 shadow-2xs">
                              <Ticket className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold block text-[#1C2C19] truncate">
                                My Bookings
                              </span>
                              <span className="text-[11px] text-[#73826F] block truncate">
                                Confirmed farm reservations &amp; tickets
                              </span>
                            </div>
                          </div>
                          {guestBookingsCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-bold shrink-0 ml-1">
                              {guestBookingsCount}
                            </span>
                          )}
                        </button>

                        <button
                          id="dropdown-guest-profile-btn"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            onOpenGuestProfile('settings');
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#EFE8DA] transition cursor-pointer text-xs font-medium text-[#2C3B29]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#D5CCBA] flex items-center justify-center text-[#2D5A27] shrink-0">
                              {guestProfile?.coTravelers && guestProfile.coTravelers.length > 0 ? (
                                <Users className="w-3.5 h-3.5 text-[#C86446]" />
                              ) : (
                                <User className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold block text-[#1C2C19] truncate">
                                {guestProfile?.coTravelers && guestProfile.coTravelers.length > 0
                                  ? 'Traveler & Companions'
                                  : 'Traveler Profile'}
                              </span>
                              <span className="text-[11px] text-[#73826F] block truncate">
                                {guestProfile?.coTravelers && guestProfile.coTravelers.length > 0
                                  ? `${guestProfile.coTravelers.length} companion${guestProfile.coTravelers.length === 1 ? '' : 's'} & preferences`
                                  : 'Contact details, dietary & preferences'}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Host Portal - ONLY if they have host events already listed */}
                        {hasHostEvents && (
                          <button
                            id="dropdown-host-portal-btn"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              if (onOpenHostPortal) {
                                onOpenHostPortal();
                              } else {
                                handleRole('host');
                              }
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#EFE8DA] transition cursor-pointer text-xs font-medium text-[#2C3B29]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-[#FAF0E6] border border-[#DECDBB] flex items-center justify-center text-[#C86446] shrink-0 shadow-2xs">
                                <Sprout className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold block text-[#1C2C19] truncate">
                                  Host Portal
                                </span>
                                <span className="text-[11px] text-[#73826F] block truncate">
                                  Manage your listed farm events &amp; reservations
                                </span>
                              </div>
                            </div>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Sign Out for logged in user */}
                  {user && (
                    <div className="mt-1.5 pt-1.5 border-t border-[#E7DEC9]">
                      <button
                        id="dropdown-sign-out-btn"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-red-50 text-red-700 transition cursor-pointer text-xs font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary tab bar - perfectly coordinated active states */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[#ECE5D7] bg-[#FBF8F3]/95 backdrop-blur-md text-xs font-medium text-[#5B6A56]">
          <button
            id="mobile-nav-explore-btn"
            onClick={() => {
              handleTab('explore');
              if (effectiveRole !== 'guest') handleRole('guest');
            }}
            className={`min-h-[44px] min-w-[60px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl transition cursor-pointer ${
              activeNav === 'explore'
                ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                : 'text-[#5E6D59] hover:text-[#1C2C19] active:bg-[#E2D8C5]/50'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeNav === 'explore' ? 'text-white' : 'text-[#5E6D59]'}`} />
            <span>Tour Events</span>
          </button>
          <button
            id="mobile-nav-map-btn"
            onClick={() => {
              handleTab('map');
              if (effectiveRole !== 'guest') handleRole('guest');
            }}
            className={`min-h-[44px] min-w-[60px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl transition cursor-pointer ${
              activeNav === 'map'
                ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                : 'text-[#5E6D59] hover:text-[#1C2C19] active:bg-[#E2D8C5]/50'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeNav === 'map' ? 'text-white' : 'text-[#5E6D59]'}`} />
            <span>Map</span>
          </button>
          <button
            id="mobile-nav-itinerary-btn"
            onClick={onOpenItinerary}
            className={`min-h-[44px] min-w-[60px] flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl transition cursor-pointer ${
              activeNav === 'roadtrip'
                ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                : 'text-[#5E6D59] hover:text-[#1C2C19] active:bg-[#E2D8C5]/50'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeNav === 'roadtrip' ? 'text-white' : 'text-[#C86446]'}`} />
            <span>Roadtrip</span>
            {(itineraryCount > 0 || guestBookingsCount > 0) && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeNav === 'roadtrip'
                    ? 'bg-white text-[#2D5A27]'
                    : 'bg-[#C86446] text-white'
                }`}
              >
                {itineraryCount + guestBookingsCount}
              </span>
            )}
          </button>
          {/* Host in sub nav: Only shown when host role is active, removed if guest is selected */}
          {effectiveRole !== 'guest' && (
            <button
              id="mobile-nav-host-btn"
              type="button"
              onClick={() => {
                handleRole('host');
                handleTab('host');
              }}
              className={`min-h-[44px] min-w-[56px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition cursor-pointer ${
                activeNav === 'host'
                  ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                  : 'text-[#5E6D59] hover:text-[#1C2C19] active:bg-[#E2D8C5]/50'
              }`}
            >
              <Sprout className={`w-4 h-4 ${activeNav === 'host' ? 'text-white' : 'text-[#5E6D59]'}`} />
              <span>Host</span>
            </button>
          )}
          {onOpenGroupChat ? (
            <button
              id="mobile-nav-chat-btn"
              onClick={onOpenGroupChat}
              className={`min-h-[44px] min-w-[56px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition cursor-pointer ${
                activeNav === 'chat'
                  ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                  : 'text-[#5E6D59] hover:text-[#1C2C19] active:bg-[#E2D8C5]/50'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeNav === 'chat' ? 'text-white' : 'text-[#2D5A27]'}`} />
              <span>Chat</span>
            </button>
          ) : (
            <button
              id="mobile-nav-profile-btn"
              onClick={handleAuthClick}
              className={`min-h-[44px] min-w-[56px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition cursor-pointer ${
                isGuestProfileOpen
                  ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                  : 'text-[#5E6D59] hover:text-[#1C2C19] active:bg-[#E2D8C5]/50'
              }`}
            >
              <User className={`w-4 h-4 ${isGuestProfileOpen ? 'text-white' : 'text-[#2D5A27]'}`} />
              <span>{isUnified ? 'Profile' : 'Pass'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
