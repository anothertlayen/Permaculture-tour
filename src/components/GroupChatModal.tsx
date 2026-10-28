import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Send,
  Users,
  MapPin,
  Home,
  MessageSquare,
  Info,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { ChatMessage, ChatScope, PropertyStop, GuestProfile, UserRole } from '../types';
import { REGION_TIMELINE } from '../data/mockData';

export interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  properties: PropertyStop[];
  guestProfile?: GuestProfile;
  userRole?: UserRole;
  initialScope?: ChatScope;
  initialTargetId?: string;
  selectedRegionFilter?: string | 'all';
  onSelectPropertyForDetail?: (property: PropertyStop) => void;
}

export const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  properties,
  guestProfile,
  userRole = 'guest',
  initialScope = 'everyone',
  initialTargetId,
  selectedRegionFilter = 'all',
  onSelectPropertyForDetail,
}) => {
  // 1. Channel state
  const [activeScope, setActiveScope] = useState<ChatScope>(initialScope);

  // Default region
  const defaultRegion = useMemo(() => {
    if (initialScope === 'region' && initialTargetId) return initialTargetId;
    if (selectedRegionFilter && selectedRegionFilter !== 'all') return selectedRegionFilter;
    return REGION_TIMELINE[0]?.region || 'Waikato / Coromandel';
  }, [initialScope, initialTargetId, selectedRegionFilter]);

  const [selectedRegion, setSelectedRegion] = useState<string>(defaultRegion);

  // Default event / property
  const defaultPropertyId = useMemo(() => {
    if (initialScope === 'event' && initialTargetId) return initialTargetId;
    return properties[0]?.id || 'prop-wai-01';
  }, [initialScope, initialTargetId, properties]);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(defaultPropertyId);

  // Input state
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize when initial props change
  useEffect(() => {
    if (isOpen) {
      if (initialScope) {
        setActiveScope(initialScope);
      }
      if (initialScope === 'region' && initialTargetId) {
        setSelectedRegion(initialTargetId);
      }
      if (initialScope === 'event' && initialTargetId) {
        setSelectedPropertyId(initialTargetId);
      }
    }
  }, [isOpen, initialScope, initialTargetId]);

  // Find active property object
  const activeProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || properties[0];
  }, [properties, selectedPropertyId]);

  // Filter messages for current channel
  const currentChannelMessages = useMemo(() => {
    return messages.filter(msg => {
      if (activeScope === 'everyone') {
        return msg.scope === 'everyone';
      }
      if (activeScope === 'region') {
        return msg.scope === 'region' && msg.targetId === selectedRegion;
      }
      if (activeScope === 'event') {
        return msg.scope === 'event' && msg.targetId === selectedPropertyId;
      }
      return false;
    });
  }, [messages, activeScope, selectedRegion, selectedPropertyId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, activeScope, selectedRegion, selectedPropertyId, currentChannelMessages.length]);

  if (!isOpen) return null;

  // Handle message sending
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Determine sender details
    const isHost = userRole === 'host';
    const senderName = isHost
      ? activeProperty?.hostName || 'Tour Host'
      : guestProfile?.name || 'Kiwi Roadtripper';

    const senderRoleLabel = isHost
      ? `Host • ${activeProperty ? activeProperty.name.split(' ')[0] : 'Property'}`
      : guestProfile?.groupName
      ? guestProfile.groupName
      : 'Tour Traveler';

    const targetId =
      activeScope === 'region'
        ? selectedRegion
        : activeScope === 'event'
        ? selectedPropertyId
        : undefined;

    const targetName =
      activeScope === 'region'
        ? selectedRegion
        : activeScope === 'event'
        ? activeProperty?.name
        : undefined;

    onSendMessage({
      scope: activeScope,
      targetId,
      targetName,
      senderId: isHost ? `host-${activeProperty?.id || 'main'}` : guestProfile?.id || 'guest-current',
      senderName,
      senderRole: isHost ? 'host' : 'traveler',
      senderRoleLabel,
      senderAvatar: isHost
        ? activeProperty?.hostAvatar
        : guestProfile?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: trimmed,
    });

    setInputText('');
  };

  // Format message timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div id="community-chat-view" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      <div
        id="group-chat-container"
        className="bg-[#FBF8F3] w-full rounded-2xl sm:rounded-3xl shadow-sm border border-[#DED5C4] flex flex-col overflow-hidden text-[#1C2C19]"
      >
        {/* TOP HEADER */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E7DFC8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              id="chat-back-btn"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CCBA] text-xs font-bold text-[#1E2E1A] hover:bg-[#F2ECE0] shadow-2xs transition cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Back to Tour</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5 text-[#A8D59D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-[#1E2E1A]">
                  Kiwi Tour Group Chat
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F0E6] text-[#2D5A27] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-[#637360]">
                Simple community messaging across Everyone, Regions & Events
              </p>
            </div>
          </div>
        </div>

        {/* 3 CHANNELS SELECTOR BAR (Everyone, Region, Event) */}
        <div className="bg-[#F3EFE6] px-4 py-2.5 border-b border-[#E4DCBE] flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 bg-[#E6DFCE] p-1 rounded-xl">
            {/* 1. EVERYONE */}
            <button
              id="chat-tab-everyone"
              type="button"
              onClick={() => setActiveScope('everyone')}
              className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeScope === 'everyone'
                  ? 'bg-white text-[#1C2C19] shadow-xs'
                  : 'text-[#647460] hover:text-[#1C2C19]'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0 text-[#2D5A27]" />
              <span className="truncate">Everyone</span>
            </button>

            {/* 2. REGION */}
            <button
              id="chat-tab-region"
              type="button"
              onClick={() => setActiveScope('region')}
              className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeScope === 'region'
                  ? 'bg-white text-[#1C2C19] shadow-xs'
                  : 'text-[#647460] hover:text-[#1C2C19]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C86446]" />
              <span className="truncate">Region</span>
            </button>

            {/* 3. EVENT */}
            <button
              id="chat-tab-event"
              type="button"
              onClick={() => setActiveScope('event')}
              className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeScope === 'event'
                  ? 'bg-white text-[#1C2C19] shadow-xs'
                  : 'text-[#647460] hover:text-[#1C2C19]'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0 text-[#2D5A27]" />
              <span className="truncate">Event</span>
            </button>
          </div>

          {/* SECONDARY SELECTOR (When Region or Event is chosen) */}
          {activeScope === 'region' && (
            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-[#D8CEBA]">
              <span className="font-bold text-[#71826E] shrink-0">Region Channel:</span>
              <div className="relative flex-1">
                <select
                  id="chat-select-region"
                  value={selectedRegion}
                  onChange={e => setSelectedRegion(e.target.value)}
                  className="w-full bg-transparent font-semibold text-[#1C2C19] pr-6 py-0.5 outline-hidden cursor-pointer appearance-none text-xs truncate"
                >
                  {REGION_TIMELINE.map(r => (
                    <option key={r.region} value={r.region}>
                      {r.region} ({r.datesText})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
              </div>
            </div>
          )}

          {activeScope === 'event' && (
            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-[#D8CEBA]">
              <span className="font-bold text-[#71826E] shrink-0">Event / Stop:</span>
              <div className="relative flex-1">
                <select
                  id="chat-select-event"
                  value={selectedPropertyId}
                  onChange={e => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-transparent font-semibold text-[#1C2C19] pr-6 py-0.5 outline-hidden cursor-pointer appearance-none text-xs truncate"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.district})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
              </div>

              {onSelectPropertyForDetail && activeProperty && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPropertyForDetail(activeProperty);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-[#2D5A27] hover:bg-[#20401B] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                  title={`Inspect ${activeProperty.name} details & schedule`}
                >
                  <span>View Stop</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* CHANNEL BANNER DESCRIPTION */}
        <div className="px-5 py-2 bg-[#EFE9DD] border-b border-[#E4DCBE] text-[11px] text-[#556651] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#71826E]" />
            {activeScope === 'everyone' && (
              <span className="truncate">
                Whole-tour community chat: carpooling, Cook Strait ferries, seed swaps & general Q&A.
              </span>
            )}
            {activeScope === 'region' && (
              <span className="truncate">
                Talking in <strong>{selectedRegion}</strong> • Local roads, weather & regional convo.
              </span>
            )}
            {activeScope === 'event' && activeProperty && (
              <span className="truncate">
                Talking in{' '}
                <button
                  type="button"
                  onClick={() => {
                    onSelectPropertyForDetail?.(activeProperty);
                    onClose();
                  }}
                  className="font-bold underline hover:text-[#2D5A27] cursor-pointer"
                  title="Inspect property details"
                >
                  {activeProperty.name}
                </button>{' '}
                • Chat with host {activeProperty.hostName} & attendees.
              </span>
            )}
          </div>
          <span className="text-[10px] text-stone-500 font-mono ml-2 shrink-0">
            {currentChannelMessages.length} {currentChannelMessages.length === 1 ? 'msg' : 'msgs'}
          </span>
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
          {currentChannelMessages.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EBE5D8] flex items-center justify-center mx-auto text-[#687864]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#2C3B29]">No messages in this channel yet</p>
                <p className="text-xs text-[#71816D] mt-0.5">
                  Be the first to say kia ora, ask a question, or arrange a ride!
                </p>
              </div>
            </div>
          ) : (
            currentChannelMessages.map(msg => {
              const isMe =
                msg.senderId === guestProfile?.id ||
                msg.senderName === guestProfile?.name ||
                (userRole === 'host' && msg.senderRole === 'host');

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Avatar */}
                  <img
                    src={
                      msg.senderAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={msg.senderName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#D5CCBC] shadow-2xs mt-0.5"
                  />

                  {/* Message Bubble & Metadata */}
                  <div className={`max-w-[82%] sm:max-w-[75%] space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {isMe ? (
                        <>
                          <span className="text-[10px] text-stone-500">{formatTime(msg.timestamp)}</span>
                          <span className="font-bold text-[#1C2C19] text-xs">You</span>
                          {msg.senderRoleLabel && (
                            <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#2D5A27]/15 text-[#2D5A27] font-bold">
                              {msg.senderRoleLabel}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-[#1C2C19] text-xs">{msg.senderName}</span>
                          {msg.senderRoleLabel && (
                            <span
                              className={`px-1.5 py-0.2 text-[9px] rounded font-bold ${
                                msg.senderRole === 'host'
                                  ? 'bg-[#C86446]/15 text-[#C86446]'
                                  : msg.senderRole === 'organizer'
                                  ? 'bg-[#2D5A27] text-white'
                                  : 'bg-[#E3DCBD] text-[#42523F]'
                              }`}
                            >
                              {msg.senderRoleLabel}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-500">{formatTime(msg.timestamp)}</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed text-left inline-block shadow-2xs ${
                        isMe
                          ? 'bg-[#2D5A27] text-white rounded-tr-xs'
                          : 'bg-white text-[#1C2C19] border border-[#E2DAC9] rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* MESSAGE INPUT & SENDER INDICATOR */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 bg-white border-t border-[#E2DAC9] shrink-0 space-y-2"
        >
          <div className="flex items-center justify-between text-[11px] text-[#637360]">
            <div className="flex items-center gap-1.5">
              <span>Posting as:</span>
              <span className="font-bold text-[#1C2C19]">
                {userRole === 'host'
                  ? `${activeProperty?.hostName || 'Host'} (Host)`
                  : guestProfile?.name || 'Guest Roadtripper'}
              </span>
              {guestProfile?.groupName && userRole !== 'host' && (
                <span className="text-[10px] text-[#71816D]">({guestProfile.groupName})</span>
              )}
            </div>
            <span className="hidden sm:inline text-[10px] text-stone-400">
              Press Enter to send
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id="group-chat-input"
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                activeScope === 'everyone'
                  ? 'Message Everyone on the Kiwi tour...'
                  : activeScope === 'region'
                  ? `Message #${selectedRegion.split(' ')[0]} region...`
                  : `Message #${activeProperty?.name.split(' ')[0]} event...`
              }
              className="flex-1 bg-[#FAF7F0] border border-[#DDD3C2] rounded-xl px-4 py-2.5 text-base sm:text-xs text-[#1C2C19] placeholder:text-stone-400 focus:outline-hidden focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] transition"
            />
            <button
              id="send-chat-msg-btn"
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center shrink-0 cursor-pointer ${
                inputText.trim()
                  ? 'bg-[#2D5A27] hover:bg-[#20401B] text-white shadow-xs'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
