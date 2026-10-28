import React from 'react';
import {
  MapPin,
  Calendar,
  Bed,
  Plus,
  Check,
  Clock,
  User,
  ArrowUpRight,
  Coins,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Ticket,
  Sprout,
  UserPlus,
} from 'lucide-react';
import { PropertyStop, Booking } from '../types';

interface PropertyCardProps {
  property: PropertyStop;
  isInItinerary: boolean;
  onToggleItinerary: (id: string) => void;
  onSelectProperty?: (property: PropertyStop) => void;
  onSelect?: (property: PropertyStop) => void;
  onOpenChat?: (property: PropertyStop) => void;
  hasPass?: boolean;
  matchingBooking?: Booking;
  onBookPass?: (property: PropertyStop) => void;
  isHostProperty?: boolean;
  onAddCompanion?: (property: PropertyStop) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isInItinerary,
  onToggleItinerary,
  onSelectProperty,
  onSelect,
  onOpenChat,
  hasPass = false,
  matchingBooking,
  onBookPass,
  isHostProperty = false,
  onAddCompanion,
}) => {
  const features = property.features || [];
  const eventComponents = property.eventComponents || [];
  const accommodations = property.accommodations || [];

  const handleSelect = () => {
    if (onSelectProperty) onSelectProperty(property);
    else if (onSelect) onSelect(property);
  };

  const isMissingPass = isInItinerary && !hasPass && !isHostProperty;

  return (
    <article
      className={`group bg-white rounded-2xl border shadow-xs hover:shadow-md transition duration-300 flex flex-col overflow-hidden text-left ${
        isMissingPass
          ? 'border-[#F59E0B]/70 ring-1 ring-[#F59E0B]/30'
          : hasPass
          ? 'border-[#2D5A27]/40'
          : 'border-[#E2DAC9] hover:border-[#2D5A27]/40'
      }`}
    >
      {/* Thumbnail Image Header */}
      <div
        onClick={handleSelect}
        className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#E8E1D3] cursor-pointer"
        title={`View ${property.name} event details`}
      >
        <img
          src={property.heroImage}
          alt={property.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

        {/* Region & Island Badge + Pass Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[70%]">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1C2C19]/80 backdrop-blur-md text-[#E8F0E6] border border-white/20">
            {property.region.split('(')[0].trim()}
          </span>

          {isHostProperty && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2D5A27]/95 backdrop-blur-md text-white flex items-center gap-1 shadow-sm border border-white/30">
              <Sprout className="w-3.5 h-3.5 text-[#A8D59D]" />
              <span>Your Hosted Farm</span>
            </span>
          )}

          {isMissingPass && !isHostProperty && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#D97706]/95 backdrop-blur-md text-white flex items-center gap-1 shadow-sm border border-white/30 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pass Needed</span>
            </span>
          )}

          {hasPass && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#15803D]/95 backdrop-blur-md text-white flex items-center gap-1 shadow-sm border border-white/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pass Booked</span>
            </span>
          )}

          {accommodations.length > 0 && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#C86446]/90 backdrop-blur-md text-white flex items-center gap-1 border border-white/20">
              <Bed className="w-3 h-3" />
              <span>Stays</span>
            </span>
          )}
        </div>

        {/* "Add to Roadtrip" Quick Button */}
        <button
          id={`itinerary-btn-${property.id}`}
          onClick={e => {
            e.stopPropagation();
            onToggleItinerary(property.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
            isInItinerary
              ? isMissingPass
                ? 'bg-[#D97706] text-white shadow-sm ring-2 ring-white/60'
                : 'bg-[#2D5A27] text-white shadow-sm ring-2 ring-white/60'
              : 'bg-white/80 hover:bg-white text-[#243521]'
          }`}
          title={
            isInItinerary
              ? isMissingPass
                ? 'In Roadtrip (Pass not yet booked) • Click to remove'
                : 'In Roadtrip (Pass booked) • Click to remove'
              : 'Add to My Roadtrip'
          }
        >
          {isInItinerary ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Bottom Banner on Image: Dates & Acreage */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/95 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#A8D59D]" />
            {property.datesText}
          </span>
          <span className="bg-black/40 px-2 py-0.5 rounded text-[11px] backdrop-blur-xs">
            {property.propertyAcreage}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* District & Location */}
          <div className="flex items-center gap-1 text-xs font-semibold text-[#687965] mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C86446]" />
            <span>{property.district}</span>
          </div>

          {/* Property Title */}
          <h2
            onClick={handleSelect}
            className="text-lg font-bold font-display text-[#1C2C19] group-hover:text-[#2D5A27] transition cursor-pointer line-clamp-1"
          >
            {property.name}
          </h2>

          {/* Host snippet */}
          <div className="flex items-center gap-2 mt-2 text-xs text-[#52624F]">
            <img
              src={property.hostAvatar}
              alt={property.hostName}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover border border-stone-300"
            />
            <span className="truncate">Steward: <strong>{property.hostName}</strong></span>
          </div>

          {/* CLEAR PASS STATUS NOTICES */}
          {isHostProperty ? (
            <div className="mt-3 p-2.5 rounded-xl bg-[#E8F0E6] border border-[#2D5A27]/30 text-xs flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#1C2C19] font-semibold truncate">
                <Sprout className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span className="text-[11px] truncate">
                  Your Farm • <strong>Host Steward (No Pass Needed)</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] bg-white text-[#2D5A27] px-2 py-0.5 rounded-full border border-[#2D5A27]/20 font-bold">
                  Steward Access
                </span>
                {onAddCompanion && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onAddCompanion(property);
                    }}
                    className="px-2 py-0.5 rounded-md bg-[#2D5A27] hover:bg-[#20401B] text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Add companions or whānau to this farm"
                  >
                    <UserPlus className="w-3 h-3 text-[#A8D59D]" />
                    <span>+ Companions</span>
                  </button>
                )}
              </div>
            </div>
          ) : isMissingPass ? (
            <div className="mt-3 p-2.5 rounded-xl bg-[#FFF8EE] border-2 border-[#F59E0B] text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[#92400E]">
                  <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>In Roadtrip • Pass Needed</span>
                </div>
                {onBookPass && (
                  <button
                    id={`card-book-pass-btn-${property.id}`}
                    onClick={e => {
                      e.stopPropagation();
                      onBookPass(property);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-bold shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1"
                    title="Reserve Pass for this stop"
                  >
                    <Ticket className="w-3 h-3" />
                    <span>Get Pass</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#78350F] mt-1 leading-tight">
                Event is on your travel route, but <strong>entry is not yet reserved</strong>. Reserve pass to secure spot with host.
              </p>
            </div>
          ) : null}

          {hasPass && (
            <div className="mt-3 p-2 rounded-xl bg-[#EAF5E7] border border-[#2D5A27]/30 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[#1E3A1A] font-semibold truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                <span className="text-[11px] truncate">
                  Pass Secured: <strong>{matchingBooking?.status || 'Confirmed'}</strong>
                </span>
              </div>
              {matchingBooking?.referenceCode && (
                <span className="font-mono text-[10px] bg-white text-[#2D5A27] px-1.5 py-0.5 rounded border border-[#2D5A27]/20 font-bold shrink-0">
                  #{matchingBooking.referenceCode}
                </span>
              )}
            </div>
          )}

          {/* Permaculture Features (Tags) */}
          <div className="mt-3 flex flex-wrap gap-1">
            {features.slice(0, 3).map(f => (
              <span
                key={f}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EFE9DE] text-[#3F4F3C]"
              >
                {f}
              </span>
            ))}
            {features.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF6EE] text-[#748571]">
                +{features.length - 3} more
              </span>
            )}
          </div>

          {/* Event Components Multi-Part Teaser */}
          <div
            onClick={handleSelect}
            className="mt-4 pt-3 border-t border-[#EBE4D5] space-y-1.5 cursor-pointer hover:bg-[#FAF6EE] transition rounded-xl p-1 -mx-1"
            title="Click to view full day schedule & book tickets"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#63735F] flex items-center justify-between">
              <span>Day Schedule ({eventComponents.length} Sessions)</span>
            </div>
            {eventComponents.slice(0, 2).map(comp => (
              <div
                key={comp.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-[#ECE5D7] shadow-2xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] text-[#6E7E6A] font-semibold">
                    {comp.startTime}
                  </span>
                  <span className="truncate font-medium text-[#223320]">
                    {comp.title}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold shrink-0 ml-1.5 ${
                    comp.pricingType === 'Fixed Paid Ticket'
                      ? 'text-[#2D5A27]'
                      : comp.pricingType === 'Koha'
                      ? 'text-[#C86446]'
                      : 'text-[#4A5B46]'
                  }`}
                >
                  {comp.pricingType === 'Fixed Paid Ticket'
                    ? `$${comp.priceAmount}`
                    : comp.pricingType === 'Koha'
                    ? 'Koha'
                    : comp.pricingType === 'Seed/Produce Swap'
                    ? 'Swap'
                    : 'Free'}
                </span>
              </div>
            ))}
            {eventComponents.length > 2 && (
              <p className="text-[11px] text-[#2D5A27] font-semibold text-center hover:underline">
                + {eventComponents.length - 2} more sessions in schedule • Click to expand
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-[#EAE2D3] flex items-center justify-between gap-2">
          <div className="text-xs text-[#52634F] truncate pr-1">
            <span className="block text-[11px] font-semibold text-[#223320] truncate">
              {property.hostName}
            </span>
            <span className="text-[11px] text-[#657662]">
              {property.acreage} • {eventComponents.length} {eventComponents.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenChat && (
              <button
                id={`card-chat-btn-${property.id}`}
                onClick={e => {
                  e.stopPropagation();
                  onOpenChat(property);
                }}
                className="px-2.5 py-2 rounded-xl border border-[#D5CCBC] bg-[#FAF6EE] hover:bg-[#EFE7D8] text-[#2D5A27] text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                title="Event chat with host & travelers"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}

            <button
              id={`view-details-btn-${property.id}`}
              onClick={handleSelect}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer ${
                isMissingPass
                  ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                  : 'bg-[#2D5A27] hover:bg-[#20401B] text-white'
              }`}
            >
              <span>{isHostProperty ? 'Your Farm' : (isMissingPass ? 'Get Pass' : 'Details')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
