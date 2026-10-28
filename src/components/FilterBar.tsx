import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Check, Bed, Tag, Filter, MessageSquare, Compass, AlertCircle, Ticket } from 'lucide-react';
import { PermacultureFeature, ActivityType, PricingType } from '../types';

export const ALL_FEATURES: PermacultureFeature[] = [
  'Syntropic Agroforestry',
  'Food Forests',
  'Zone 0–5 Designs',
  'Bio-intensive Market Gardens',
  'Earthworks/Swales',
  'Natural Building/Strawbale',
  'Animal Integration',
  'Greywater/Composting Toilets',
  'Rongoā Māori',
];

export const ALL_ACTIVITIES: ActivityType[] = [
  'Guided Tour',
  'Hands-on Workbee',
  'Interactive Workshop',
  'Open Garden',
  'Shared Meal (Potluck / Guest Harvest & Cook / Hosted Meal)',
];

export const ALL_PRICINGS: PricingType[] = [
  'Free',
  'Koha',
  'Fixed Paid Ticket',
  'Seed/Produce Swap',
];

export interface FilterBarProps {
  searchTerm?: string;
  searchQuery?: string;
  onSearchChange: (val: string) => void;
  selectedRegion: string | 'all';
  onRegionChange: (region: string | 'all') => void;
  selectedFeatures?: PermacultureFeature[];
  onToggleFeature?: (feature: PermacultureFeature) => void;
  selectedFeature?: PermacultureFeature | 'all';
  onFeatureChange?: (feature: PermacultureFeature | 'all') => void;
  selectedActivity?: ActivityType | 'all';
  onActivityChange?: (activity: ActivityType | 'all') => void;
  selectedPricing?: PricingType | 'all';
  onPricingChange?: (pricing: PricingType | 'all') => void;
  hasAccommodationOnly?: boolean;
  onToggleAccommodationOnly?: () => void;
  onToggleAccommodation?: () => void;
  onResetFilters: () => void;
  totalResultsCount?: number;
  totalCount?: number;
  filteredCount?: number;
  onOpenRegionChat?: (region: string) => void;
  roadtripFilter?: 'all' | 'in-itinerary' | 'missing-pass' | 'has-pass';
  onRoadtripFilterChange?: (filter: 'all' | 'in-itinerary' | 'missing-pass' | 'has-pass') => void;
  itineraryCount?: number;
  missingPassesCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  searchQuery,
  onSearchChange,
  selectedRegion = 'all',
  onRegionChange,
  selectedFeatures = [],
  onToggleFeature,
  selectedFeature,
  onFeatureChange,
  selectedActivity = 'all',
  onActivityChange,
  selectedPricing = 'all',
  onPricingChange,
  hasAccommodationOnly = false,
  onToggleAccommodationOnly,
  onToggleAccommodation,
  onResetFilters,
  totalResultsCount,
  totalCount,
  filteredCount,
  onOpenRegionChat,
  roadtripFilter = 'all',
  onRoadtripFilterChange,
  itineraryCount = 0,
  missingPassesCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize inputs
  const currentSearch = searchTerm ?? searchQuery ?? '';
  const currentFeatures: PermacultureFeature[] = Array.isArray(selectedFeatures) && selectedFeatures.length > 0
    ? selectedFeatures
    : selectedFeature && selectedFeature !== 'all'
    ? [selectedFeature]
    : [];

  const handleToggleAcc = () => {
    if (onToggleAccommodationOnly) {
      onToggleAccommodationOnly();
    } else if (onToggleAccommodation) {
      onToggleAccommodation();
    }
  };

  const handleFeatureClick = (feat: PermacultureFeature) => {
    if (onToggleFeature) {
      onToggleFeature(feat);
    } else if (onFeatureChange) {
      if (selectedFeature === feat) {
        onFeatureChange('all');
      } else {
        onFeatureChange(feat);
      }
    }
  };

  const displayCount = filteredCount ?? totalResultsCount ?? totalCount ?? 0;

  const hasActiveFilters =
    currentSearch.trim() !== '' ||
    selectedRegion !== 'all' ||
    currentFeatures.length > 0 ||
    selectedActivity !== 'all' ||
    selectedPricing !== 'all' ||
    hasAccommodationOnly;

  return (
    <div className="bg-white rounded-2xl border border-[#E4DCCF] shadow-xs p-4 sm:p-5 mb-8">
      {/* Primary Row: Search + Region + Accommodation Toggle + Expand Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#788874] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={currentSearch}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search events, sessions, hosts, rongoā, strawbale, syntropic, towns..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#DCD5C6] bg-[#FAF8F3] text-sm text-[#1E2E1A] placeholder:text-[#889785] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27]"
          />
          {currentSearch && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region dropdown */}
        <div className="w-full md:w-56">
          <select
            id="filter-region-select"
            value={selectedRegion}
            onChange={e => onRegionChange(e.target.value)}
            aria-label="Filter by Tour Region"
            className="w-full py-2.5 px-3 rounded-xl border border-[#DCD5C6] bg-[#FAF8F3] text-xs font-semibold text-[#223320] focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] cursor-pointer"
          >
            <option value="all">All Regions (Aotearoa)</option>
            <option value="Northland (Te Tai Tokerau)">Northland (Te Tai Tokerau)</option>
            <option value="Waikato / Coromandel">Waikato / Coromandel</option>
            <option value="Bay of Plenty (Te Moana-a-Toi)">Bay of Plenty</option>
            <option value="Taranaki / Whanganui">Taranaki / Whanganui</option>
            <option value="Hawke's Bay">Hawke's Bay</option>
            <option value="Nelson / Tasman & Golden Bay">Nelson / Tasman & Golden Bay</option>
            <option value="Canterbury Plains & Banks Peninsula">Canterbury Plains</option>
            <option value="Central Otago & Southland">Central Otago & Southland</option>
          </select>
        </div>

        {/* Stay Toggle */}
        <button
          id="filter-accommodation-toggle"
          onClick={handleToggleAcc}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
            hasAccommodationOnly
              ? 'bg-[#E8F0E6] text-[#244E1F] border-[#2D5A27]/30'
              : 'bg-[#FAF8F3] text-[#556551] border-[#DCD5C6] hover:bg-[#F2ECE0]'
          }`}
        >
          <Bed className="w-3.5 h-3.5 text-[#C86446]" />
          <span>Has On-Site Stay</span>
          {hasAccommodationOnly && <Check className="w-3 h-3 text-[#2D5A27]" />}
        </button>

        {/* Expand Advanced Filters */}
        <button
          id="filter-expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
            isExpanded || currentFeatures.length > 0 || selectedActivity !== 'all' || selectedPricing !== 'all'
              ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
              : 'bg-[#FAF8F3] text-[#556551] border-[#DCD5C6] hover:bg-[#F2ECE0]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters {currentFeatures.length > 0 ? `(${currentFeatures.length})` : ''}</span>
        </button>
      </div>

      {/* Quick Roadtrip & Pass Filter Strip */}
      {itineraryCount > 0 && onRoadtripFilterChange && (
        <div className="mt-3 pt-3 border-t border-[#EFE8DC] flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#596A55] font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Route Filter:</span>
            </span>

            <button
              onClick={() => onRoadtripFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs ${
                roadtripFilter === 'all'
                  ? 'bg-[#2D5A27] text-white shadow-2xs'
                  : 'bg-[#FAF8F3] text-[#4A5B46] border border-[#DED7C8] hover:bg-[#F2ECE0]'
              }`}
            >
              All Events ({totalCount || displayCount})
            </button>

            <button
              onClick={() => onRoadtripFilterChange('in-itinerary')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center gap-1 ${
                roadtripFilter === 'in-itinerary'
                  ? 'bg-[#2D5A27] text-white shadow-2xs'
                  : 'bg-[#FAF8F3] text-[#4A5B46] border border-[#DED7C8] hover:bg-[#F2ECE0]'
              }`}
            >
              <span>In Roadtrip ({itineraryCount})</span>
            </button>

            {missingPassesCount > 0 && (
              <button
                onClick={() => onRoadtripFilterChange('missing-pass')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs flex items-center gap-1 ${
                  roadtripFilter === 'missing-pass'
                    ? 'bg-[#D97706] text-white shadow-2xs ring-2 ring-[#D97706]/20'
                    : 'bg-[#FFF3D9] text-[#92400E] border border-[#F59E0B]/50 hover:bg-[#FDE68A]'
                }`}
                title="Filter to roadtrip events that haven't booked a pass yet"
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Pass Needed ({missingPassesCount})</span>
              </button>
            )}

            {itineraryCount > missingPassesCount && (
              <button
                onClick={() => onRoadtripFilterChange('has-pass')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer text-xs flex items-center gap-1 ${
                  roadtripFilter === 'has-pass'
                    ? 'bg-[#15803D] text-white shadow-2xs'
                    : 'bg-[#EAF5E7] text-[#1E3A1A] border border-[#2D5A27]/25 hover:bg-[#DCEFD6]'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Pass Secured ({itineraryCount - missingPassesCount})</span>
              </button>
            )}
          </div>

          {roadtripFilter !== 'all' && (
            <button
              onClick={() => onRoadtripFilterChange('all')}
              className="text-[11px] font-semibold text-[#667761] hover:text-[#2D5A27] underline cursor-pointer"
            >
              Clear Route Filter
            </button>
          )}
        </div>
      )}

      {/* Expanded Multi-Filter section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#E8E0D2] space-y-4 text-xs animate-in fade-in">
          {/* Permaculture Feature Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[#354632] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2D5A27]" />
                Permaculture Features (Design & Ecology)
              </span>
              {currentFeatures.length > 0 && (
                <span className="text-[11px] text-[#2D5A27] font-semibold">
                  {currentFeatures.length} selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_FEATURES.map(feat => {
                const active = currentFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    onClick={() => handleFeatureClick(feat)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                      active
                        ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-2xs'
                        : 'bg-[#FAF8F3] text-[#42523E] border-[#DED7C8] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Type & Pricing Type sub-row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <span className="block font-bold uppercase tracking-wider text-[#354632] mb-1.5">
                Session Activity Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onActivityChange?.('all')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                    selectedActivity === 'all'
                      ? 'bg-[#3F6B38] text-white border-[#3F6B38]'
                      : 'bg-[#FAF8F3] text-[#4A5B46] border-[#DED7C8]'
                  }`}
                >
                  All Types
                </button>
                {ALL_ACTIVITIES.map(act => (
                  <button
                    key={act}
                    onClick={() => onActivityChange?.(selectedActivity === act ? 'all' : act)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                      selectedActivity === act
                        ? 'bg-[#3F6B38] text-white border-[#3F6B38]'
                        : 'bg-[#FAF8F3] text-[#4A5B46] border-[#DED7C8] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    {act.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block font-bold uppercase tracking-wider text-[#354632] mb-1.5">
                Pricing Model
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onPricingChange?.('all')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                    selectedPricing === 'all'
                      ? 'bg-[#C86446] text-white border-[#C86446]'
                      : 'bg-[#FAF8F3] text-[#4A5B46] border-[#DED7C8]'
                  }`}
                >
                  All Pricing
                </button>
                {ALL_PRICINGS.map(prc => (
                  <button
                    key={prc}
                    onClick={() => onPricingChange?.(selectedPricing === prc ? 'all' : prc)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                      selectedPricing === prc
                        ? 'bg-[#C86446] text-white border-[#C86446]'
                        : 'bg-[#FAF8F3] text-[#4A5B46] border-[#DED7C8] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    {prc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active status indicator & reset */}
      <div className="mt-3 pt-2.5 border-t border-[#EFE8DC] flex items-center justify-between text-xs text-[#63725F]">
        <div>
          Showing <strong className="text-[#1E2E1A]">{displayCount}</strong> permaculture events
          {selectedRegion !== 'all' && (
            <span>
              {' '}
              in{' '}
              <button
                type="button"
                onClick={() => onRegionChange('all')}
                className="text-[#2D5A27] font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-[#E8F0E6] px-1.5 py-0.5 rounded-md"
                title="Click to clear region filter"
              >
                <span>{selectedRegion.split('(')[0]}</span>
                <X className="w-3 h-3 text-[#2D5A27]/70 hover:text-[#2D5A27]" />
              </button>
              {onOpenRegionChat && (
                <button
                  id="filter-chat-region-btn"
                  onClick={() => onOpenRegionChat(selectedRegion)}
                  className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#2D5A27] bg-[#E8F0E6] hover:bg-[#DCE7DA] px-2 py-0.5 rounded-md transition cursor-pointer"
                  title={`Open group chat for ${selectedRegion}`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat in Region</span>
                </button>
              )}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-[#C86446] hover:text-[#A74B32] font-semibold flex items-center gap-1 cursor-pointer transition"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
};
