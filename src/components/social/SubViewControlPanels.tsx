import React from 'react';
import { ChevronDown, MapPin, Ticket, Filter, Map as MapIcon, SlidersHorizontal, Calendar, Star, Clock } from 'lucide-react';

export interface LiveTonightGig {
  id: string;
  headliner: string;
  venue: string;
  time: string;
  date?: string;
  city?: string;
  distance?: string;
  isFollowed?: boolean;
  ticketUrl?: string;
  price?: string;
}

export interface SubViewControlPanelsProps {
  isLiveTonightOpen: boolean;
  setIsLiveTonightOpen: (open: boolean) => void;
  liveEvents: LiveTonightGig[];
  onSelectLiveTonight: (gig: LiveTonightGig) => void;
  onCheckoutTicket: (gig: LiveTonightGig) => void;
  filterHideTicketPresales?: boolean;
  setFilterHideTicketPresales?: (val: boolean) => void;
  filterShowFollowedOnly?: boolean;
  setFilterShowFollowedOnly?: (val: boolean) => void;
  filterShowMerchDropsOnlyFromFollowed?: boolean;
  setFilterShowMerchDropsOnlyFromFollowed?: (val: boolean) => void;
  onOpenMapModal?: () => void;
}

export const SubViewControlPanels: React.FC<SubViewControlPanelsProps> = ({
  isLiveTonightOpen,
  setIsLiveTonightOpen,
  liveEvents,
  onSelectLiveTonight,
  onCheckoutTicket,
  filterHideTicketPresales = false,
  setFilterHideTicketPresales,
  filterShowFollowedOnly = false,
  setFilterShowFollowedOnly,
  filterShowMerchDropsOnlyFromFollowed = false,
  setFilterShowMerchDropsOnlyFromFollowed,
  onOpenMapModal,
}) => {
  return (
    <div className="w-full bg-black/60 border-b border-zinc-900">
      {/* Upcoming Shows Near You Strip */}
      <div className="py-2.5 pl-1 sm:pl-0 border-t border-zinc-900/60">
        <div
          className="px-4 mb-2 flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsLiveTonightOpen(!isLiveTonightOpen)}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLiveTonightOpen ? 'bg-rose-500 animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                isLiveTonightOpen ? 'text-rose-400' : 'text-zinc-500'
              }`}
            >
              Upcoming Shows Near You
            </span>
            {liveEvents && liveEvents.length > 0 && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hidden sm:inline">
                {liveEvents.length} {liveEvents.length === 1 ? 'Date' : 'Dates'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onOpenMapModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMapModal();
                }}
                className="text-[9px] font-mono uppercase text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer"
              >
                <MapIcon className="w-3 h-3 text-rose-500" /> Gig Map
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                isLiveTonightOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {isLiveTonightOpen && (
          <div className="overflow-x-auto no-scrollbar px-4 flex gap-3 pb-1 animate-in slide-in-from-top-2 fade-in duration-200">
            {liveEvents.map((gig, idx) => {
              const isTonight = gig.date?.toLowerCase() === 'tonight' || (!gig.date && gig.time.toLowerCase().includes('tonight'));
              const isTomorrow = gig.date?.toLowerCase() === 'tomorrow';
              
              return (
                <div
                  key={`gig-${gig.id}-${idx}`}
                  className={`shrink-0 bg-[#0a0c10] border rounded-xl px-3 py-2 flex items-center gap-3 shadow-lg shadow-black/50 transition-all group cursor-pointer ${
                    gig.isFollowed 
                      ? 'border-amber-500/50 hover:border-amber-400/80 bg-gradient-to-r from-amber-950/20 to-[#0a0c10]' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => onSelectLiveTonight(gig)}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="text-xs font-black text-white uppercase tracking-wide group-hover:text-rose-400 transition-colors truncate max-w-[130px] sm:max-w-[170px]">
                        {gig.headliner}
                      </div>

                      {/* Followed Band Badge */}
                      {gig.isFollowed && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Star className="w-2 h-2 fill-amber-300" /> Following
                        </span>
                      )}

                      {/* Date Badge */}
                      {gig.date && (
                        <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          isTonight 
                            ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 animate-pulse' 
                            : isTomorrow
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}>
                          {gig.date}
                        </span>
                      )}
                    </div>

                    {/* Venue & Location */}
                    <div className="text-[9px] text-zinc-400 flex items-center gap-1 font-mono truncate">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" /> 
                      <span className="truncate max-w-[130px] sm:max-w-[160px]">{gig.venue}{gig.city ? ` • ${gig.city}` : ''}</span>
                      {gig.distance && (
                        <span className="text-[#00ffcc] shrink-0">({gig.distance})</span>
                      )}
                    </div>

                    {/* Time / Doors Schedule - Moved to its own line for compact width */}
                    <div className="text-[8.5px] text-zinc-300 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                      <span>{gig.time}</span>
                      {gig.price && (
                        <span className="text-emerald-400 font-bold ml-1">{gig.price}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bg-[#006df9] hover:bg-[#005bc3] text-white p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-1 shadow-md shadow-blue-900/30"
                    title="Get Tickets / Presale"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckoutTicket(gig);
                    }}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feed Filters Control Panel */}
      {(setFilterHideTicketPresales ||
        setFilterShowFollowedOnly ||
        setFilterShowMerchDropsOnlyFromFollowed) && (
        <div className="px-4 py-1.5 bg-zinc-950/80 border-t border-zinc-900/80 flex items-center justify-between text-[9px] font-mono text-zinc-400 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 shrink-0 text-zinc-500 font-bold uppercase tracking-wider">
            <SlidersHorizontal className="w-3 h-3 text-rose-500" /> Filters:
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {setFilterHideTicketPresales && (
              <button
                type="button"
                onClick={() => setFilterHideTicketPresales(!filterHideTicketPresales)}
                className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer font-bold uppercase tracking-wider ${
                  filterHideTicketPresales
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filterHideTicketPresales ? '✓ Hide Tickets' : 'Hide Presales'}
              </button>
            )}

            {setFilterShowFollowedOnly && (
              <button
                type="button"
                onClick={() => setFilterShowFollowedOnly(!filterShowFollowedOnly)}
                className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer font-bold uppercase tracking-wider ${
                  filterShowFollowedOnly
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filterShowFollowedOnly ? '✓ Followed Only' : 'Followed Artists'}
              </button>
            )}

            {setFilterShowMerchDropsOnlyFromFollowed && (
              <button
                type="button"
                onClick={() =>
                  setFilterShowMerchDropsOnlyFromFollowed(!filterShowMerchDropsOnlyFromFollowed)
                }
                className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer font-bold uppercase tracking-wider ${
                  filterShowMerchDropsOnlyFromFollowed
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filterShowMerchDropsOnlyFromFollowed
                  ? '✓ Followed Merch'
                  : 'Followed Merch Drops'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SubViewControlPanels;

