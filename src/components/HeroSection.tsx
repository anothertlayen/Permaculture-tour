import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight, Clock, MapPin, Compass, Sprout, ChevronRight, ShieldCheck } from 'lucide-react';
import { REGION_TIMELINE } from '../data/mockData';
import { RegionTourTimeline } from '../types';

interface HeroSectionProps {
  onJoinAsGuest?: () => void;
  onExploreClick?: () => void;
  onHostAStop?: () => void;
  selectedRegion?: string | 'all';
  onSelectRegion?: (region: string | 'all') => void;
  onSelectRegionFilter?: (region: string | 'all') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onJoinAsGuest,
  onExploreClick,
  onHostAStop,
  selectedRegion = 'all',
  onSelectRegion,
  onSelectRegionFilter,
}) => {
  // Tour starts in Jan 2027. Let's calculate countdown to Jan 10, 2027
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 118,
    hours: 14,
    minutes: 32,
    seconds: 10,
  });

  const handleExplore = () => {
    if (onJoinAsGuest) onJoinAsGuest();
    else if (onExploreClick) onExploreClick();
    else {
      const el = document.getElementById('explore-stops-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHost = () => {
    if (onHostAStop) onHostAStop();
  };

  const handleRegion = (region: string | 'all') => {
    if (onSelectRegion) onSelectRegion(region);
    if (onSelectRegionFilter) onSelectRegionFilter(region);
    const el = document.getElementById('explore-stops-anchor');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Target date: Jan 10, 2027 09:00 NZDT
    const target = new Date('2027-01-10T09:00:00+13:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const nextStop = REGION_TIMELINE[0]; // Northland

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pb-16 bg-radial from-[#F6F0E4] via-[#FBF8F3] to-[#F3EDE0] border-b border-[#E7E0D3]">
      {/* Subtle organic background foliage shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#E5ECE3]/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#F4E3DD]/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0E6] text-[#244A20] text-xs font-semibold mb-5 border border-[#2D5A27]/20">
            <Sprout className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>Aotearoa New Zealand • Summer & Autumn 2027</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-[#192716] tracking-tight leading-[1.15]">
            The Great Kiwi <br className="hidden sm:inline" />
            <span className="text-[#2D5A27] italic font-serif">Permaculture Tour</span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-base sm:text-lg text-[#4E5C4A] leading-relaxed max-w-2xl mx-auto">
            Journey across thriving food forests, syntropic agroforestry trials, strawbale homes, and bio-intensive gardens.
            Choose workshops, free community visits, koha sessions, and stays — with zero platform fees.
          </p>

          {/* Simple Zero Fees Pill */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#E0D8C8] shadow-xs text-xs text-[#2A3A26]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
            <span className="font-bold text-[#2D5A27]">Zero fees</span>
            <span className="text-stone-300">•</span>
            <span className="text-[#4E5E4B]">Guest passes, koha, and any payments are handled directly with hosts.</span>
          </div>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="cta-join-guest"
              onClick={handleExplore}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-[#A8D59D]" />
              <span>Join as Guest (Explore Tour)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              id="cta-host-stop"
              onClick={handleHost}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F5EFE6] text-[#283824] border border-[#D5CCBA] font-semibold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-[#C86446]" />
              <span>Host an Event on the Tour</span>
            </button>
          </div>
        </div>

        {/* "Next Up on Tour" Highlight Banner with live countdown */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div
            onClick={() => handleRegion(nextStop.region)}
            className="bg-white rounded-2xl border border-[#E2DAC9] hover:border-[#2D5A27]/50 shadow-sm hover:shadow-md transition duration-200 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden cursor-pointer group"
            title="Click to view Region 01 (Northland) events on tour"
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleRegion(nextStop.region);
              }
            }}
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C86446]" />

            <div className="flex-1 pl-2">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#F9ECE7] text-[#C86446] rounded-md">
                  Next Up on Tour
                </span>
                <span className="text-xs font-semibold text-[#667761] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {nextStop.datesText}
                </span>
                <span className="text-xs font-bold text-[#2D5A27] hidden sm:inline-flex items-center gap-1 group-hover:underline ml-auto">
                  <span>Explore Northland Events</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#1E2E1A] group-hover:text-[#2D5A27] transition">
                Leg 01: {nextStop.region}
              </h2>
              <p className="text-xs sm:text-sm text-[#546250] mt-1 max-w-xl">
                {nextStop.description}
              </p>
              <div className="mt-2 text-xs font-bold text-[#2D5A27] sm:hidden flex items-center gap-1">
                <span>Tap to view Northland tour events</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="bg-[#FAF6EF] rounded-xl p-3 border border-[#E7DFCE] flex items-center gap-3 shrink-0">
              <div className="text-center px-2">
                <span className="block text-lg sm:text-2xl font-bold font-mono text-[#2D5A27]">
                  {timeLeft.days}
                </span>
                <span className="block text-[10px] uppercase font-semibold text-[#768573]">Days</span>
              </div>
              <span className="text-stone-400 font-bold">:</span>
              <div className="text-center px-2">
                <span className="block text-lg sm:text-2xl font-bold font-mono text-[#2D5A27]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[10px] uppercase font-semibold text-[#768573]">Hours</span>
              </div>
              <span className="text-stone-400 font-bold">:</span>
              <div className="text-center px-2">
                <span className="block text-lg sm:text-2xl font-bold font-mono text-[#2D5A27]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[10px] uppercase font-semibold text-[#768573]">Mins</span>
              </div>
              <span className="text-stone-400 font-bold">:</span>
              <div className="text-center px-2">
                <span className="block text-lg sm:text-2xl font-bold font-mono text-[#2D5A27]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[10px] uppercase font-semibold text-[#768573]">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Region Date Selector Timeline */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2D5A27]" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#3D4C3A]">
                2027 Regional Tour Rollout Timeline
              </h2>
            </div>
            <button
              onClick={() => handleRegion('all')}
              className={`text-xs font-semibold cursor-pointer transition ${
                selectedRegion === 'all'
                  ? 'text-[#2D5A27] underline'
                  : 'text-[#6C7B68] hover:text-[#2D5A27]'
              }`}
            >
              View All Regions
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {REGION_TIMELINE.map((item, idx) => {
              const isSelected = selectedRegion === item.region;
              return (
                <button
                  key={item.region}
                  id={`region-timeline-btn-${idx}`}
                  onClick={() => handleRegion(isSelected ? 'all' : item.region)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm ring-2 ring-[#2D5A27]/20'
                      : 'bg-white hover:bg-[#F5F0E6] text-[#293825] border-[#E2DAC9]'
                  }`}
                >
                  <div>
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#EDE7D9] text-[#63725F]'
                      }`}
                    >
                      {item.datesText.split(',')[0]}
                    </span>
                    <p
                      className={`text-xs font-bold font-display mt-1 leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : 'text-[#1E2E1A]'
                      }`}
                    >
                      {item.region.split('(')[0].trim()}
                    </p>
                  </div>
                  <div
                    className={`text-[10px] flex items-center justify-between ${
                      isSelected ? 'text-white/80' : 'text-[#667761]'
                    }`}
                  >
                    <span>{item.island === 'North Island' ? 'North Is.' : 'South Is.'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
