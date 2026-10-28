import React, { useState } from 'react';
import {
  MapPin,
  Sprout,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Check,
  Bed,
  Sparkles,
  Info,
  AlertCircle,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { PropertyStop, PermacultureFeature, Booking } from '../types';

interface InteractiveTourMapProps {
  properties: PropertyStop[];
  onSelectProperty: (property: PropertyStop) => void;
  itineraryIds: string[];
  onToggleItinerary: (id: string) => void;
  selectedRegion: string | 'all';
  onSelectRegion: (region: string | 'all') => void;
  bookings?: Booking[];
  onBookPass?: (property: PropertyStop) => void;
  hostPropertyIds?: string[];
}

export const InteractiveTourMap: React.FC<InteractiveTourMapProps> = ({
  properties,
  onSelectProperty,
  itineraryIds,
  onToggleItinerary,
  selectedRegion,
  onSelectRegion,
  bookings = [],
  onBookPass,
  hostPropertyIds = [],
}) => {
  const [activeProperty, setActiveProperty] = useState<PropertyStop | null>(properties[0] || null);
  const [featureHighlight, setFeatureHighlight] = useState<PermacultureFeature | 'all'>('all');

  // Convert NZ lat/lng (-34 to -47 lat, 166 to 179 lng) to SVG viewBox coordinates (width: 600, height: 800)
  const projectCoords = (lat: number, lng: number) => {
    const minLat = -47.2;
    const maxLat = -34.2;
    const minLng = 166.0;
    const maxLng = 179.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * 520 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 720 + 40;
    return { x, y };
  };

  // Filter properties by region & feature
  const filteredProps = (properties || []).filter(p => {
    const matchReg = selectedRegion === 'all' || p.region === selectedRegion;
    const matchFeat = featureHighlight === 'all' || (p.features || []).includes(featureHighlight);
    return matchReg && matchFeat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      <div className="bg-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#E2DAC9] shadow-xs">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-[#E8F0E6] text-[#2D5A27] rounded-md">
                Interactive Map
              </span>
              <span className="text-xs text-[#6B7B68] font-medium">Aotearoa Tour Route 2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#1C2C19] mt-1">
              Permaculture Tour Map
            </h1>
            <p className="text-xs sm:text-sm text-[#52634F] mt-0.5">
              Click pins to inspect multi-part schedules, soil micro-climates, and off-grid stays.
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRegion}
              onChange={e => onSelectRegion(e.target.value)}
              className="py-2 px-3 rounded-xl border border-[#D5CCBA] bg-white text-xs font-semibold text-[#1C2C19]"
            >
              <option value="all">All Tour Regions</option>
              <option value="Northland (Te Tai Tokerau)">Northland</option>
              <option value="Waikato / Coromandel">Waikato / Coromandel</option>
              <option value="Bay of Plenty (Te Moana-a-Toi)">Bay of Plenty</option>
              <option value="Taranaki / Whanganui">Taranaki</option>
              <option value="Nelson / Tasman & Golden Bay">Nelson / Golden Bay</option>
              <option value="Central Otago & Southland">Central Otago</option>
            </select>

            <select
              value={featureHighlight}
              onChange={e => setFeatureHighlight(e.target.value as any)}
              className="py-2 px-3 rounded-xl border border-[#D5CCBA] bg-white text-xs font-semibold text-[#1C2C19]"
            >
              <option value="all">All Permaculture Features</option>
              <option value="Syntropic Agroforestry">Syntropic Agroforestry</option>
              <option value="Food Forests">Food Forests</option>
              <option value="Natural Building/Strawbale">Natural Building</option>
              <option value="Earthworks/Swales">Earthworks/Swales</option>
              <option value="Rongoā Māori">Rongoā Māori</option>
              <option value="Bio-intensive Market Gardens">Bio-intensive Gardens</option>
            </select>
          </div>
        </div>

        {/* Map Layout Grid: SVG Map on Left, Active Stop Detail Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SVG Map Canvas Container */}
          <div className="lg:col-span-7 bg-[#EBF0E6] rounded-2xl border border-[#D6E2D1] p-4 relative overflow-hidden flex items-center justify-center min-h-[520px]">
            {/* Compass rose */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[11px] font-bold text-[#3B4E38] bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>North Island &rarr; South Island</span>
            </div>

            {/* Offline ready badge */}
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-medium text-[#4B5E48]">
              Vector Offline Cartography • Fully PWA Cached
            </div>

            <svg
              viewBox="0 0 600 800"
              className="w-full h-auto max-h-[640px] drop-shadow-md select-none"
            >
              {/* Stylized New Zealand Island Outlines */}
              <defs>
                <linearGradient id="nzLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D9E6D3" />
                  <stop offset="100%" stopColor="#C9DBC2" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Ocean currents / subtle contour rings */}
              <circle cx="300" cy="400" r="360" fill="none" stroke="#DDE7D8" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="300" cy="400" r="280" fill="none" stroke="#DDE7D8" strokeWidth="1" strokeDasharray="4 4" />

              {/* NORTH ISLAND (Te Ika-a-Māui) Stylized Geographical Shape */}
              <path
                d="M 380 70 
                   C 420 120, 430 180, 420 220 
                   C 460 230, 490 270, 480 320 
                   C 450 360, 420 400, 390 430 
                   C 360 450, 340 440, 330 410 
                   C 300 420, 270 380, 280 340 
                   C 260 300, 290 260, 310 240 
                   C 300 200, 320 150, 350 110 Z"
                fill="url(#nzLandGrad)"
                stroke="#AEC7A5"
                strokeWidth="2.5"
                filter="url(#shadow)"
              />

              {/* SOUTH ISLAND (Te Wai Pounamu) Stylized Geographical Shape */}
              <path
                d="M 310 435 
                   C 330 450, 320 480, 300 520 
                   C 280 570, 250 620, 210 670 
                   C 170 700, 140 680, 130 640 
                   C 140 590, 170 540, 200 490 
                   C 230 450, 270 430, 310 435 Z"
                fill="url(#nzLandGrad)"
                stroke="#AEC7A5"
                strokeWidth="2.5"
                filter="url(#shadow)"
              />

              {/* Stewart Island */}
              <circle cx="160" cy="710" r="14" fill="#C9DBC2" stroke="#AEC7A5" strokeWidth="2" />

              {/* Regional labels */}
              <text x="390" y="140" fill="#6A8064" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Northland</text>
              <text x="400" y="270" fill="#6A8064" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Waikato / Bay of Plenty</text>
              <text x="240" y="360" fill="#6A8064" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Taranaki</text>
              <text x="290" y="470" fill="#6A8064" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Nelson / Tasman</text>
              <text x="180" y="620" fill="#6A8064" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Central Otago</text>

              {/* Route Connecting Path */}
              <path
                d="M 405 135 L 375 255 L 435 270 L 320 370 L 315 470 L 220 635"
                fill="none"
                stroke="#2D5A27"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.5"
              />

              {/* Tour Property Pins */}
              {properties.map(p => {
                const { x, y } = projectCoords(p.coordinates.lat, p.coordinates.lng);
                const isSelected = activeProperty?.id === p.id;
                const isMatchingFilter = filteredProps.some(fp => fp.id === p.id);

                return (
                  <g
                    key={p.id}
                    onClick={() => setActiveProperty(p)}
                    className="cursor-pointer transition-all duration-300"
                    opacity={isMatchingFilter ? 1 : 0.25}
                  >
                    {/* Pulsing ring if active */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        fill="none"
                        stroke="#2D5A27"
                        strokeWidth="2.5"
                        className="animate-ping"
                        opacity="0.75"
                      />
                    )}

                    {/* Outer pin halo */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 14 : 10}
                      fill={isSelected ? '#2D5A27' : '#FFFFFF'}
                      stroke={isSelected ? '#FFFFFF' : '#2D5A27'}
                      strokeWidth="2"
                      className="shadow-sm hover:scale-125 transition duration-200"
                    />

                    {/* Core icon / dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? '#A8D59D' : '#C86446'}
                    />

                    {/* Property Label Pill on hover / active */}
                    {isSelected && (
                      <g transform={`translate(${x + 16}, ${y - 12})`}>
                        <rect
                          width="160"
                          height="32"
                          rx="6"
                          fill="#1C2C19"
                          opacity="0.95"
                        />
                        <text
                          x="8"
                          y="15"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {(p.name || '').length > 22 ? p.name.substring(0, 22) + '...' : p.name}
                        </text>
                        <text
                          x="8"
                          y="26"
                          fill="#A8D59D"
                          fontSize="9"
                          fontFamily="sans-serif"
                        >
                          {p.datesText}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right Selected Stop Preview Pane */}
          <div className="lg:col-span-5">
            {activeProperty ? (
              <div className="bg-white rounded-2xl border border-[#E2DAC9] shadow-md p-5 sm:p-6 space-y-4 animate-in fade-in">
                <div
                  onClick={() => onSelectProperty(activeProperty)}
                  className="relative h-44 rounded-xl overflow-hidden bg-stone-200 cursor-pointer group"
                  title={`Click to view ${activeProperty.name} details`}
                >
                  <img
                    src={activeProperty.heroImage}
                    alt={activeProperty.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-1 z-10">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectRegion(activeProperty.region);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1C2C19]/90 hover:bg-[#1C2C19] text-white cursor-pointer transition"
                      title="Filter map to this region"
                    >
                      {activeProperty.region.split('(')[0]}
                    </button>
                    {(activeProperty.accommodations || []).length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#C86446] text-white flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        <span>Stays</span>
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium bg-black/50 backdrop-blur-xs p-1.5 rounded flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#A8D59D]" />
                      {activeProperty.datesText}
                    </span>
                    <span>{activeProperty.propertyAcreage}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#687864] flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C86446]" />
                    <span>{activeProperty.district}</span>
                  </div>
                  <h3
                    onClick={() => onSelectProperty(activeProperty)}
                    className="text-lg font-bold font-display text-[#1C2C19] hover:text-[#2D5A27] transition cursor-pointer"
                    title="Click to view full schedule & stays"
                  >
                    {activeProperty.name}
                  </h3>
                  <p className="text-xs text-[#52624F] mt-1 leading-relaxed line-clamp-3">
                    {activeProperty.landVision}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#63725F] mb-1.5">
                    Permaculture Systems
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(activeProperty.features || []).map(f => (
                      <span
                        key={f}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#E8F0E6] text-[#244A1F]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Event Schedule preview */}
                <div
                  onClick={() => onSelectProperty(activeProperty)}
                  className="bg-[#FAF8F3] hover:bg-[#F5EFE4] p-3 rounded-xl border border-[#ECE5D7] space-y-1 text-xs cursor-pointer transition"
                  title="Click to view full event schedule"
                >
                  <div className="flex items-center justify-between">
                    <span className="block font-bold text-[#2D5A27] text-[11px] uppercase">
                      Schedule ({(activeProperty.eventComponents || []).length} sessions)
                    </span>
                    <span className="text-[10px] text-[#2D5A27] font-semibold underline">Expand</span>
                  </div>
                  {(activeProperty.eventComponents || []).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-[11px] text-[#2E3E2B]">
                      <span>{c.startTime} {c.title}</span>
                      <span className="font-bold text-[#C86446]">{c.pricingType}</span>
                    </div>
                  ))}
                </div>

                {/* Pass Status Callout if in Roadtrip */}
                {(() => {
                  const inItinerary = (itineraryIds || []).includes(activeProperty.id);
                  const isHost = hostPropertyIds.includes(activeProperty.id);
                  const matchingBooking = bookings.find(b => b.propertyId === activeProperty.id);
                  const hasPass = Boolean(matchingBooking);

                  if (isHost) {
                    return (
                      <div className="p-2.5 rounded-xl bg-[#E8F0E6] border border-[#2D5A27]/30 text-xs flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[#1C2C19] font-semibold">
                          <Sprout className="w-4 h-4 text-[#2D5A27] shrink-0" />
                          <span className="text-[11px]">Your Farm • <strong>Host Steward (No Pass Needed)</strong></span>
                        </div>
                        <span className="text-[10px] bg-white text-[#2D5A27] px-2 py-0.5 rounded-full border border-[#2D5A27]/20 font-bold shrink-0">
                          Steward Access
                        </span>
                      </div>
                    );
                  }

                  if (inItinerary && !hasPass) {
                    return (
                      <div className="p-2.5 rounded-xl bg-[#FFF8EE] border-2 border-[#F59E0B] text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-[#92400E]">
                            <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                            <span>In Roadtrip • Pass Needed</span>
                          </div>
                          {onBookPass && (
                            <button
                              onClick={() => onBookPass(activeProperty)}
                              className="px-2 py-1 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-bold shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1"
                            >
                              <Ticket className="w-3 h-3" />
                              <span>Get Pass</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-[#78350F] mt-1 leading-tight">
                          Added to your route, but <strong>no entry pass reserved yet</strong>.
                        </p>
                      </div>
                    );
                  }

                  if (hasPass) {
                    return (
                      <div className="p-2 rounded-xl bg-[#EAF5E7] border border-[#2D5A27]/30 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[#1E3A1A] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                          <span className="text-[11px]">Pass Secured: <strong>{matchingBooking?.status}</strong></span>
                        </div>
                        {matchingBooking?.referenceCode && (
                          <span className="font-mono text-[10px] bg-white text-[#2D5A27] px-1.5 py-0.5 rounded border border-[#2D5A27]/20 font-bold shrink-0">
                            #{matchingBooking.referenceCode}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#ECE5D7]">
                  {(() => {
                    const inItinerary = (itineraryIds || []).includes(activeProperty.id);
                    return (
                      <button
                        onClick={() => onToggleItinerary(activeProperty.id)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          inItinerary
                            ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                            : 'bg-white text-[#2C3C29] border-[#D5CCBA] hover:bg-[#F4EFE6]'
                        }`}
                      >
                        {inItinerary ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{inItinerary ? 'In Roadtrip' : 'Add to Roadtrip'}</span>
                      </button>
                    );
                  })()}

                  <button
                    onClick={() => onSelectProperty(activeProperty)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D5A27] hover:bg-[#20401B] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Event Sessions & Stays</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-500 border border-[#E2DAC9]">
                <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm">Click any property pin on the Aotearoa map to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
