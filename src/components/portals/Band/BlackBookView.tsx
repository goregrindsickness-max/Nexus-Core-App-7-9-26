import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Users, Mail, Star, MessageSquare, Send, ChevronLeft, ChevronRight, ChevronDown, Calendar, Plus, X, Radio, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';
import { Offer, UserReview, Venue } from '../../../types';
import { RoutingBeacon } from '../Promoter/PromoterPortalView';
import { getSupabase } from '../../../supabase';
import { handleSendMessage as sendDbMessage } from '../../../useChatStore';
import VenueReputationCard from './VenueReputationCard';


interface BlackBookViewProps {
  onBack: () => void;
  triggerNotification: (msg: string) => void;
  userProfile: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
  activeBandName: string;
  offers?: Offer[];
  onUpdateOffer?: (offer: Offer) => void;
  userReviews?: UserReview[];
  venues?: Venue[];
  setVenues?: React.Dispatch<React.SetStateAction<Venue[]>>;
  initialTab?: 'directory' | 'beacons';
  hideTabs?: boolean;
  disableScrollToTop?: boolean;
}

const mockVenues = [
  {
    id: 'v1',
    name: 'The Echo',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    capacity: 350,
    email: 'booking@theechola.com',
    genreFit: 92,
    payoutRating: 4.8,
    loadInRating: 3.5,
    buyers: 'Lizzy & Mark',
    intelEntries: [
      "Hard cut off at 11:30PM. Load-in through the back alley, very tight squeeze. Payout is always exact and on time.",
      "The local sound engineer is top-tier. Bring earplugs, it gets very loud inside.",
      "Security is strict but professional. Backstage room is locked during general door opening."
    ]
  },
  {
    id: 'v2',
    name: 'Chain Reaction',
    city: 'Anaheim',
    state: 'CA',
    country: 'USA',
    capacity: 250,
    email: 'chainreactionbooking@gmail.com',
    genreFit: 98,
    payoutRating: 4.5,
    loadInRating: 4.0,
    buyers: 'Jon',
    intelEntries: [
      "Legendary spot for heavy/punk bands. Front door load-in only. Merch area gets incredibly crowded but moves units.",
      "Very friendly venue owners who really care about DIY culture. Soft drinks are on house for artists.",
      "Check with Jon about load-in details before 5 PM to secure easy street parking."
    ]
  },
  {
    id: 'v3',
    name: 'Bottom of the Hill',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    capacity: 246,
    email: 'booking@bottomofthehill.com',
    genreFit: 85,
    payoutRating: 5.0,
    loadInRating: 3.0,
    buyers: 'Lynn',
    intelEntries: [
      "Incredible sound system. Steep stairs for load-in are brutal on cabinets. Ask for the drink tickets early.",
      "Lynn is super busy but will respond if you follow up once after 4 days. Great vegan food nearby."
    ]
  },
  {
    id: 'v4',
    name: 'Neumos',
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    capacity: 650,
    email: 'talent@neumos.com',
    genreFit: 78,
    payoutRating: 4.9,
    loadInRating: 4.5,
    buyers: 'Evan',
    intelEntries: [
      "Highly professional staff. Green room is huge and stocked. Load-in is easy via the side ramp.",
      "Excellent local promotion. Usually books weeks or months in advance.",
      "Merch stand space has its own dedicated power strip. Highly visible to the crowd."
    ]
  },
];

export default function BlackBookView({ onBack, triggerNotification, userProfile, setUserProfile, activeBandName, offers = [], onUpdateOffer, userReviews = [], venues = [], setVenues, initialTab = 'directory', hideTabs = false, disableScrollToTop = false }: BlackBookViewProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'beacons'>(initialTab);
  const [beacons, setBeacons] = useState<RoutingBeacon[]>([]);
  const [offerFilter, setOfferFilter] = useState<'all' | 'pending' | 'accepted' | 'renegotiating'>('all');
  const [localRenegotiateId, setLocalRenegotiateId] = useState<string | null>(null);
  const [counterGuarantee, setCounterGuarantee] = useState<string>('');
  const [counterNotes, setCounterNotes] = useState<string>('');

  // Promoter Messaging Drawer states
  const [selectedPromoter, setSelectedPromoter] = useState<any>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: 'user' | 'promoter'; text: string; time: string }>>>(() => {
    try {
      const saved = localStorage.getItem('nexus_promoter_chats_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const routingGaps = React.useMemo(() => {
    const localShowsStr = localStorage.getItem('nexus_core_shows_offline');
    let showsList = [];
    if (localShowsStr) {
      try {
        showsList = JSON.parse(localShowsStr);
      } catch (e) {}
    }
    if (!showsList || showsList.length === 0) {
      showsList = [];
    }

    const filtered = showsList.filter((s: any) => !activeBandName || s.band_id === '' || s.band_id === activeBandName || !s.band_id);
    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sorted.length < 2) {
      return ["May 27 (Transit Corridor: Chicago -> Brooklyn)"];
    }

    const gaps: string[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].date);
      const d2 = new Date(sorted[i + 1].date);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        const gapDate = new Date(d1);
        gapDate.setDate(d1.getDate() + 1);
        const dateStr = gapDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        gaps.push(`${dateStr} (Transit Corridor: ${sorted[i].city || sorted[i].name} -> ${sorted[i + 1].city || sorted[i + 1].name})`);
      }
    }

    if (gaps.length === 0) {
      return ["May 27 (Transit Corridor: Chicago -> Brooklyn)"];
    }
    return gaps;
  }, [activeBandName]);

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !selectedPromoter) return;
    const msgText = typedMessage.trim();
    const promoterKey = selectedPromoter.name;
    const newMsg = {
      sender: 'user' as const,
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = {
      ...chatMessages,
      [promoterKey]: [...(chatMessages[promoterKey] || []), newMsg]
    };

    setChatMessages(updated);
    localStorage.setItem('nexus_promoter_chats_v1', JSON.stringify(updated));
    setTypedMessage('');
    triggerNotification(`✉️ Message routed directly to ${selectedPromoter.name}!`);

    // Execute uninhibited DB write to Supabase
    const recipientId = selectedPromoter.id || selectedPromoter.email || selectedPromoter.name;
    sendDbMessage(recipientId, msgText);
  };

  // Scroll to top of the page on tab toggle inside BlackBookView
  useEffect(() => {
    if (disableScrollToTop) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const scrollableDivs = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
    scrollableDivs.forEach(div => {
      div.scrollTop = 0;
    });
  }, [activeTab, disableScrollToTop]);

  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarkMutating, setBookmarkMutating] = useState<string | null>(null);

  const toggleSavedVenue = async (venueId: string) => {
    if (!userProfile?.id) {
      triggerNotification("⚠️ PLEASE AUTHENTICATE TO BOOKMARK VENUES.");
      return;
    }

    setBookmarkMutating(venueId);

    const isCreative = userProfile?.account_type === 'creative';
    const metadataKey = isCreative ? 'creative_metadata' : 'promoter_metadata';
    const metadata = userProfile[metadataKey] || {};
    const oldSaved = metadata.saved_venues || [];

    let newSaved: string[];
    const index = oldSaved.indexOf(venueId);
    if (index >= 0) {
      newSaved = oldSaved.filter((id: string) => id !== venueId);
    } else {
      newSaved = [...oldSaved, venueId];
    }

    const updatedMetadata = {
      ...metadata,
      saved_venues: newSaved
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userProfile?.id,
            email: userProfile?.email,
            full_name: userProfile?.name,
            role: userProfile?.role,
            [metadataKey]: updatedMetadata
          });

        if (error) {
          console.error("Supabase upsert bookmark error:", error);
          triggerNotification("⚠️ CLOUD PORTAL SYNC INTERRUPTED. ASSIGNED LOCALLY.");
        } else {
          triggerNotification(index >= 0 ? "🗑️ REMOVED FROM BOOKMARKS" : "⭐ VENUE BOOKMARKED SUCCESSFULLY");
        }
      } catch (err) {
        console.error("Bookmark mutation failed:", err);
        triggerNotification("⚠️ OFFLINE OR DISCONNECTED. SAVED LOCALLY.");
      }
    } else {
      triggerNotification(index >= 0 ? "🗑️ REMOVED FROM LOCAL PROFILE" : "⭐ SAVED TO LOCAL PROFILE");
    }

    if (setUserProfile) {
      setUserProfile((prev: any) => ({
        ...prev,
        [metadataKey]: updatedMetadata
      }));
    }

    setBookmarkMutating(null);
  };

  React.useEffect(() => {
    // Load local beacons
    const localStr = localStorage.getItem('nexus_core_routing_beacons_v1');
    if (localStr) {
      try {
        setBeacons(JSON.parse(localStr).filter((b: any) => b.band_name === activeBandName));
      } catch (e) {}
    }
  }, [activeBandName]);

  const [localVenues, setLocalVenues] = useState<any[]>(mockVenues);
  useEffect(() => {
    // combine mockVenues with any dynamically passed global venues
    const mappedGlobal = (venues || []).map(v => ({
      id: v.id,
      name: v.name,
      city: v.city,
      state: v.state_province || '',
      country: v.country || '',
      capacity: v.capacity || 0,
      email: v.email || '',
      genreFit: v.genre_fit || 50,
      payoutRating: v.payout_rating || 3,
      loadInRating: v.load_in_rating || 3,
      buyers: v.buyers || '',
      intelEntries: v.intel_entries || []
    }));
    
    // Merge but don't duplicate (by id)
    const mockIds = new Set(mockVenues.map(m => m.id));
    const newGlobals = mappedGlobal.filter(mg => !mockIds.has(mg.id));
    setLocalVenues([...mockVenues, ...newGlobals]);
  }, [venues]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pitchText, setPitchText] = useState('');
  
  // New State for contributions
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [newVenueForm, setNewVenueForm] = useState({ 
    name: '', 
    city: '', 
    state: '', 
    country: '', 
    capacity: '', 
    email: '', 
    buyers: '' 
  });
  
  const [intelVenueId, setIntelVenueId] = useState<string | null>(null);
  const [newIntelForm, setNewIntelForm] = useState({ payout: 5, loadIn: 5, notes: '' });

  // Beacon System
  const [beaconForm, setBeaconForm] = useState({ targetRegion: '', radius: '50 MI', startDate: '', endDate: '', contactLocal: userProfile?.email || 'booking@band.com' });
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});
  const [reRequestPanel, setReRequestPanel] = useState<Record<string, boolean>>({});

  // Swipe logic indices tracker and handlers
  const [activeIntelIndex, setActiveIntelIndex] = useState<Record<string, number>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = (venueId: string, entriesLen: number) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setActiveIntelIndex(prev => {
        const activeIdx = prev[venueId] !== undefined ? Math.max(0, Math.min(prev[venueId], entriesLen - 1)) : 0;
        let newIdx = activeIdx;
        if (isLeftSwipe) {
          newIdx = (activeIdx + 1) % entriesLen;
        } else if (isRightSwipe) {
          newIdx = (activeIdx - 1 + entriesLen) % entriesLen;
        }
        return { ...prev, [venueId]: newIdx };
      });
    }
  };

  // Contact Suggestion Tracker
  const [suggestionModalVenue, setSuggestionModalVenue] = useState<any>(null);
  const [suggestionForm, setSuggestionForm] = useState({ buyer_name: '', booking_email: '' });

  const handleOpenSuggestion = (venue: any) => {
    setSuggestionModalVenue(venue);
    setSuggestionForm({ buyer_name: venue.buyers, booking_email: venue.email });
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestionModalVenue) return;
    const supabase = getSupabase();
    if (supabase) {
        try {
            await supabase.from('contact_suggestions').insert([{
                venue_id: suggestionModalVenue.id,
                suggested_buyer_name: suggestionForm.buyer_name,
                suggested_booking_email: suggestionForm.booking_email,
                status: 'pending'
            }]);
            triggerNotification('Correction submitted to verification queue.');
        } catch (e) {
            triggerNotification('Correction submitted to verification queue (local reserve).');
        }
    } else {
        triggerNotification('Correction submitted to verification queue (offline auth).');
    }
    setSuggestionModalVenue(null);
  };

  const handleBroadcastBeacon = async () => {
    if (!beaconForm.targetRegion || !beaconForm.startDate || !beaconForm.endDate) {
      triggerNotification("Please fill required fields (Target Location, Window Start/End).");
      return;
    }
    const supabase = getSupabase();
    try {
      const payload = {
        id: `beacon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        band_name: activeBandName,
        target_region: beaconForm.targetRegion,
        start_date: beaconForm.startDate,
        end_date: beaconForm.endDate,
        booking_email: userProfile?.email || '',
        genre_tags: userProfile?.genre_tags || [],
        created_at: new Date().toISOString()
      };
      
      if (supabase) {
        await supabase.from('routing_beacons_v1').insert([payload]);
      }
      
      setBeacons(prev => {
        const next = [payload as any, ...prev];
        try {
          const localStr = localStorage.getItem('nexus_core_routing_beacons_v1');
          let allBeacons = localStr ? JSON.parse(localStr) : [];
          allBeacons = [payload, ...allBeacons];
          localStorage.setItem('nexus_core_routing_beacons_v1', JSON.stringify(allBeacons));
        } catch (err) {}
        return next;
      });
      triggerNotification(`Beacon broadcasted for ${beaconForm.targetRegion} [${beaconForm.radius} Radius]`);
      setBeaconForm(p => ({ ...p, targetRegion: '', startDate: '', endDate: '' }));
    } catch (e) {
      triggerNotification("Broadcast submitted to queue (local fallback).");
    }
  };

  const isCreativeField = userProfile?.account_type === 'creative';
  const activeMetadata = isCreativeField ? userProfile?.creative_metadata : userProfile?.promoter_metadata;
  const savedVenueIds = activeMetadata?.saved_venues || [];

  const filteredVenues = localVenues.filter(v => {
    if (showBookmarksOnly && !savedVenueIds.includes(v.id)) {
      return false;
    }
    return (
      v.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (v.state && v.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.country && v.country.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleGeneratePitch = (venue: any) => {
    setSelectedVenue(venue);
    setPitchText(getPitchTemplate(venue));
    setIsModalOpen(true);
  };

  const getPitchTemplate = (venue: any) => {
    return `Subject: Booking Inquiry: ${activeBandName} / ${venue.city}, ${venue.state || ''} Routing

Hi ${venue.buyers || 'Booking Team'},

Hope this email finds you well. I'm reaching out regarding potential dates for ${activeBandName} routing through ${venue.city}. We know ${venue.name} is the premier spot for our genre, and we're looking to lock in a date for our upcoming run.

We typically draw solid numbers in the region and believe we'd be a great fit for your calendar. We can provide recent draw history and references upon request.

Let us know if you have any avails coming up.

Best,
${userProfile?.name || 'Manager'}
Representing ${activeBandName}`;
  };

  const handleCopyPitch = () => {
    if (selectedVenue) {
      navigator.clipboard.writeText(pitchText);
      triggerNotification("Pitch copied to clipboard!");
      setIsModalOpen(false);
    }
  };

  const handleAddVenue = () => {
    if (!newVenueForm.name || !newVenueForm.city || !newVenueForm.email) {
      triggerNotification("Please fill required fields (Name, City, Email).");
      return;
    }
    const venue = {
      id: `v${Date.now()}`,
      name: newVenueForm.name,
      city: newVenueForm.city,
      state_province: newVenueForm.state || 'N/A',
      country: newVenueForm.country || 'N/A',
      capacity: parseInt(newVenueForm.capacity) || 0,
      email: newVenueForm.email,
      buyers: newVenueForm.buyers || 'Booking Dept.',
      genre_fit: Math.floor(Math.random() * (99 - 70) + 70), // Random starting fit
      payout_rating: 0,
      load_in_rating: 0,
      intel_entries: ['No intel yet. Be the first to contribute!']
    };
    
    if (setVenues) {
      setVenues(prev => [venue, ...prev]);
    }
    setNewVenueForm({ name: '', city: '', state: '', country: '', capacity: '', email: '', buyers: '' });
    setIsAddVenueOpen(false);
    triggerNotification("Venue added to the community pool.");
  };

  const handleAddIntel = () => {
    if (!intelVenueId) return;
    if (!newIntelForm.notes) {
      triggerNotification("Please add some notes to your intel.");
      return;
    }

    setVenues(prev => prev.map((v: any) => {
      if (v.id === intelVenueId) {
        // Average the old rating with the new rating to mock community sourcing
        const newPayout = v.payoutRating === 0 ? newIntelForm.payout : (v.payoutRating + newIntelForm.payout) / 2;
        const newLoadIn = v.loadInRating === 0 ? newIntelForm.loadIn : (v.loadInRating + newIntelForm.loadIn) / 2;
        
        const currentEntries = v.intelEntries && v.intelEntries[0] !== 'No intel yet. Be the first to contribute!'
          ? v.intelEntries
          : [];

        return {
          ...v,
          payoutRating: newPayout,
          loadInRating: newLoadIn,
          intelEntries: [newIntelForm.notes, ...currentEntries]
        } as any;
      }
      return v;
    }));
    
    // Set active intellectual record to show newest entry first
    setActiveIntelIndex(prev => ({ ...prev, [intelVenueId]: 0 }));
    setIntelVenueId(null);
    setNewIntelForm({ payout: 5, loadIn: 5, notes: '' });
    triggerNotification("Intel contributed to the community.");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] text-white">
      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-[100]">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-red-500/20 hover:border-red-500/50 bg-black/85 flex items-center justify-center transition-all hover:bg-zinc-900 text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer group"
          title="Go Back"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform stroke-[2.5]" />
        </button>
      </div>

      {/* Header */}
      <div className="flex-none pt-6 pb-6 px-5 border-b border-zinc-800 bg-[#0a0a0c]/95 backdrop-blur z-10 sticky top-0 relative">
        {/* Centered Title Lockup */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h1 
              className="text-3xl md:text-5xl font-display font-medium tracking-tight text-white uppercase text-center select-text leading-none"
              style={{
                textShadow: activeTab === 'beacons' ? 'none' : '0 0 12px rgba(245, 158, 11, 0.4), 0 0 25px rgba(217, 119, 6, 0.35), 0 0 50px rgba(245, 158, 11, 0.2)',
                letterSpacing: '0.1em',
                fontWeight: 950,
                fontSize: '22px',
                marginLeft: '0px',
                marginTop: '0px'
              }}
            >
              {activeTab === 'beacons' ? '📡 Routing Beacons & Offers' : 'The Black Book'}
            </h1>
          </motion.div>
          <p 
            className="text-xs md:text-sm text-zinc-400 font-mono tracking-wide max-w-xl leading-relaxed text-center"
            style={{ marginTop: '-6px', fontSize: '11px' }}
          >
            {activeTab === 'directory' 
              ? "A community-sourced and vetted directory providing live, crowd-verified independent venue logistics, contact pipelines, and field intel."
              : "Broadcast your open dates to promoters in target regions, source booking offers, and review deal guarantees."}
          </p>
        </div>

        {/* Tab Controls */}
        {!hideTabs && (
          <div className="mt-4 flex bg-black rounded p-1 border border-zinc-800">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono transition-colors ${
                activeTab === 'directory' 
                  ? 'bg-[#a855f7]/20 text-[#a855f7]' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setActiveTab('beacons')}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono transition-colors ${
                activeTab === 'beacons' 
                  ? 'bg-[#00ffcc]/20 text-[#00ffcc]' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Beacons & Offers
            </button>
          </div>
        )}

        {/* Action Button & Search Bar */}
        {activeTab === 'directory' && (
          <div className="mt-4 flex flex-col gap-3 w-full">
            <button
              onClick={() => setIsAddVenueOpen(true)}
              className="w-full bg-transparent border-2 border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/10 py-3 sm:py-4 rounded-lg flex items-center justify-center font-bold tracking-widest uppercase transition-colors font-mono cursor-pointer shadow-[0_0_15px_rgba(0,255,204,0.15)]"
            >
              <Plus className="w-5 h-5 ml-2 mr-1" />
              Add New Venue to our Directory
            </button>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search city, state, venue, country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#13161a] border border-zinc-800 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/30 transition-all font-sans placeholder:text-zinc-650 text-zinc-200"
                />
              </div>
              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`px-3 py-2.5 rounded-lg border font-mono text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                  showBookmarksOnly 
                    ? 'bg-amber-400/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                    : 'bg-[#13161a] border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle Bookmarked Only"
              >
                <Star className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Bookmarks</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'directory' ? (
          filteredVenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-8 h-8 text-zinc-700 mb-3" />
            <p className="text-zinc-400 font-mono text-xs uppercase">No venues found for routing</p>
          </div>
        ) : (
          filteredVenues.map((venue) => {
            return (
              <VenueReputationCard
                key={venue.id}
                venue={venue}
                userReviews={userReviews}
                savedVenueIds={savedVenueIds}
                bookmarkMutating={bookmarkMutating}
                toggleSavedVenue={toggleSavedVenue}
                handleOpenSuggestion={handleOpenSuggestion}
                handleGeneratePitch={handleGeneratePitch}
                setIntelVenueId={setIntelVenueId}
                activeIntelIndex={activeIntelIndex}
                setActiveIntelIndex={setActiveIntelIndex}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEndHandler={onTouchEndHandler}
                triggerNotification={triggerNotification}
                onBuyerClick={setSelectedPromoter}
              />
            );
          })
        )) : (
          <div className="space-y-6">
            <div className="bg-[#0b0c10] border border-[#00ffcc]/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,255,204,0.15)] animate-[pulse_3s_ease-in-out_infinite] relative overflow-hidden group">
              {/* Radar Sweep Effect */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-transparent via-[#00ffcc]/5 to-[#00ffcc]/10 opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />

              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4 text-left">
                <Radio className="w-5 h-5 text-[#00ffcc] animate-pulse" />
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                  Broadcast Open Dates
                </h3>
              </div>
              
              <div className="mb-4 p-2 bg-black/40 border border-[#00ffcc]/20 rounded font-mono text-[9px] text-zinc-500 text-left">
                <div className="text-[#00ffcc]/80"> {'>'} INITIALIZING BROADCAST...</div>
                <div className="text-[#00ffcc]/80"> {'>'} READY FOR TRANSMISSION</div>
              </div>
              
              <div className="space-y-4 mb-5 text-left font-mono">
                <div>
                  <label className="block text-[10px] uppercase text-[#00ffcc] mb-1.5 tracking-wider">Target Location</label>
                  <input
                    type="text"
                    value={beaconForm.targetRegion}
                    onChange={e => setBeaconForm(p => ({ ...p, targetRegion: e.target.value }))}
                    placeholder="City, State/Province, or Country"
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs focus:outline-none focus:border-[#00ffcc]/50 text-white placeholder:text-zinc-700"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase text-[#00ffcc] mb-1.5 tracking-wider">Search Radius</label>
                  <div className="flex items-center gap-2">
                    {['25 MI', '50 MI', '100 MI', '250 MI'].map(radius => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setBeaconForm(p => ({ ...p, radius }))}
                        className={`flex-1 py-2 rounded text-[10px] font-bold tracking-widest uppercase transition-colors border ${
                          beaconForm.radius === radius
                            ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-orange-500/50 hover:text-orange-300'
                        }`}
                      >
                        {radius}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-[#00ffcc] mb-1.5 tracking-wider">Window Start</label>
                    <input
                      type="date"
                      value={beaconForm.startDate}
                      onChange={e => setBeaconForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 rounded p-2 text-xs focus:outline-none focus:border-[#00ffcc]/50 text-zinc-300 min-h-[34px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#00ffcc] mb-1.5 tracking-wider">Window End</label>
                    <input
                      type="date"
                      value={beaconForm.endDate}
                      onChange={e => setBeaconForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 rounded p-2 text-xs focus:outline-none focus:border-[#00ffcc]/50 text-zinc-300 min-h-[34px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#00ffcc] mb-1.5 tracking-wider">Direct Contact</label>
                  <input
                    type="email"
                    value={beaconForm.contactLocal}
                    onChange={e => setBeaconForm(p => ({ ...p, contactLocal: e.target.value }))}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs focus:outline-none focus:border-[#00ffcc]/50 text-white placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <button
                onClick={handleBroadcastBeacon}
                className="w-full bg-black border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] py-3 rounded-lg font-bold tracking-widest uppercase text-xs transition-all font-mono cursor-pointer shadow-[0_0_10px_rgba(0,255,204,0.1)] mb-4"
              >
                Send Beacon 📡
              </button>

              {beacons.length > 0 && (
                <div className="border-t border-zinc-800/80 pt-3 mt-2 flex items-center gap-3 w-full overflow-hidden select-none">
                  <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase shrink-0 flex items-center gap-1">
                    <span>BEACONS</span>
                    <span className="text-[#00ffcc] animate-pulse">●</span>
                  </div>
                  <div className="flex-1 flex overflow-x-auto space-x-2 py-2 scrollbar-none hide-scrollbar">
                    {beacons.map((beacon, i) => (
                      <div 
                        key={i} 
                        className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Radio className="w-3 h-3 text-[#00ffcc] animate-pulse shrink-0" />
                        <span className="font-bold text-white uppercase">{beacon.target_region}</span>
                        <span className="text-[9px] text-zinc-500 font-mono font-medium">({beacon.start_date} - {beacon.end_date})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0b0c10] border border-amber-500/30 rounded-2xl p-5 shadow-lg">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4 text-left">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-500" />
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    Promoter Offers
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                  {['all', 'pending', 'accepted', 'renegotiating'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOfferFilter(filter as any)}
                      className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                        offerFilter === filter 
                          ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-amber-500/50 hover:text-amber-400'
                      }`}
                    >
                      {filter === 'accepted' ? 'Confirmed' : filter === 'renegotiating' ? 'Countered' : filter}
                    </button>
                  ))}
                </div>
              </div>
              
              {offers.filter(o => offerFilter === 'all' || o.status === offerFilter).length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono text-center py-6">
                  {offers.length === 0 ? "No pending offers from promoters. Broadast your availability via routing beacons." : "No offers match the current filter."}
                </p>
              ) : (
                <div className="space-y-3">
                  {offers.filter(o => offerFilter === 'all' || o.status === offerFilter).map(offer => {
                    let badgeText = '';
                    let badgeStyle = '';
                    let borderStyle = '';

                    const needsAction = offer.last_action_by === 'promoter';
                    const isExpanded = expandedOffers[offer.id] ?? false;
                    const toggleExpand = () => setExpandedOffers(prev => ({ ...prev, [offer.id]: !(expandedOffers[offer.id] ?? false) }));
                    const isConfirmed = offer.status === 'accepted';

                    let cardContainerStyle = 'border border-zinc-800 bg-zinc-950/70 shadow-none';
                    if (offer.status === 'pending') {
                      badgeText = '[ PENDING ]';
                      badgeStyle = 'text-[#00ffff]/80';
                      cardContainerStyle = 'border border-[#00ffff]/20 bg-zinc-950/40 shadow-[0_0_10px_rgba(0,255,255,0.02)]';
                    } else if (offer.status === 'accepted') {
                      badgeText = '[ CONFIRMED ]';
                      badgeStyle = 'text-[#00ff66] font-bold';
                      cardContainerStyle = 'border border-emerald-500/30 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]';
                    } else if (offer.status === 'declined') {
                      badgeText = '[ REJECTED ]';
                      badgeStyle = 'text-[#ff3838]';
                      cardContainerStyle = 'border border-zinc-900 bg-zinc-950/40 opacity-50';
                    } else {
                      badgeText = '[ COUNTERED ]';
                      badgeStyle = 'text-amber-500';
                      cardContainerStyle = 'border border-amber-500/30 bg-amber-950/5';
                    }

                    return (
                      <div 
                        key={offer.id} 
                        className={`font-mono rounded-lg transition-all text-xs overflow-hidden ${cardContainerStyle}`}
                      >
                        <div 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 cursor-pointer select-none"
                          onClick={toggleExpand}
                        >
                          {/* Date & Venue Info */}
                          <div className="flex items-center gap-3 text-left">
                            <div className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 shrink-0 select-none">
                              {offer.date || 'TBD'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-200 select-all truncate uppercase">
                                {offer.venue_name}
                              </div>
                              <div className="text-xs font-mono text-zinc-400 mt-1">
                                Split: 80/20 | Tax: 8.25% | Fees: $0.00
                              </div>
                              <div className="text-[9px] text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-zinc-600 font-bold uppercase">PROMOTER:</span>
                                <span className="text-zinc-400 font-sans font-medium">{offer.promoter_name}</span>
                              </div>
                            </div>
                          </div>

                          {/* Guarantee Amount, Badge & Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-5 border-t border-zinc-900/40 sm:border-0 pt-2 sm:pt-0 shrink-0">
                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[8px] text-zinc-600 block leading-none font-bold uppercase tracking-widest mb-0.5">GUARANTEE</span>
                              <span className="text-white text-xs font-black">${(offer.guarantee_amount || 0).toLocaleString()}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-[10px] ${badgeStyle} tracking-wider font-extrabold select-none shrink-0`}>
                                {badgeText}
                              </span>
                              <div className="w-5 h-5 flex items-center justify-center rounded-full border border-zinc-700 bg-black/40 shrink-0">
                                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Accordion Expansion Panel */}
                        {isExpanded && (
                          <div className="border-t border-zinc-900 bg-zinc-950/90 p-4 text-left">
                            {/* Inline Additional Details */}
                            <div className="text-white font-semibold font-display text-xs mb-2">
                              {offer.city}, {offer.state_province || 'USA'}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-mono font-black tracking-wider uppercase border inline-flex items-center gap-1 leading-none ${
                                offer.show_type === 'festival' 
                                  ? 'bg-[#00ffcc]/10 border-[#00ffcc]/30 text-[#00ffcc]' 
                                  : 'bg-purple-950/40 border-purple-800 text-purple-350'
                              }`}>
                                {offer.show_type === 'festival' ? '🎪 Festival format' : '🎸 Standard Show'}
                              </span>
                            </div>
                            {offer.notes && (
                              <p className="text-[10px] bg-black/40 p-2 rounded border border-purple-950 text-zinc-400 leading-normal italic font-mono mt-1.5 mb-3 break-words">
                                "{offer.notes}"
                              </p>
                            )}
                            {offer.status === 'renegotiating' && (
                              <div className="bg-amber-950/20 border border-amber-900/30 p-2 rounded text-[10px] text-amber-300 mt-2 mb-3">
                                <span className="font-extrabold uppercase text-[9px] block mb-0.5">Renegotiation Info:</span>
                                "{offer.renegotiation_notes || 'Counter-proposal under review.'}"
                              </div>
                            )}

                            {/* Actions Group (Pre-confirmation vs Post-confirmation) */}
                            {!isConfirmed && offer.status !== 'declined' && (
                              <div className="flex items-center gap-2 mb-4">
                                {needsAction ? (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onUpdateOffer && onUpdateOffer({ ...offer, status: 'accepted' }) }}
                                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded py-2 flex items-center justify-center cursor-pointer transition-colors font-bold uppercase text-[9px] md:text-xs"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Accept & Book
                                    </button>
                                    <button
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setLocalRenegotiateId(offer.id);
                                        setCounterGuarantee(offer.guarantee_amount.toString());
                                        setCounterNotes('');
                                      }}
                                      className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded py-2 flex items-center justify-center cursor-pointer transition-colors font-bold uppercase text-[9px] md:text-xs"
                                    >
                                      Re-negotiate
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onUpdateOffer && onUpdateOffer({ ...offer, status: 'declined' }) }}
                                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded py-2 flex items-center justify-center cursor-pointer transition-colors font-bold uppercase text-[9px] md:text-xs"
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Decline
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[9.5px] font-mono text-purple-400/80 italic w-full text-center py-2 block">
                                    Counter-Proposal Dispatched • Awaiting Promoter Review.
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Regenerate Panel */}
                            {localRenegotiateId === offer.id && (
                              <div className="space-y-4 bg-black/50 p-4 rounded-xl border border-amber-500/30 shadow-inner mt-4 mb-4" onClick={e => e.stopPropagation()}>
                                <div>
                                  <p className="font-bold text-[10px] text-amber-400 uppercase tracking-wider block mb-2">Guarantee Counter Fee ($)</p>
                                  <input
                                    id={`counter-fee-${offer.id}`}
                                    type="number"
                                    placeholder="Counter Fee ($)"
                                    value={counterGuarantee}
                                    onChange={(e) => setCounterGuarantee(e.target.value)}
                                    className="w-full bg-zinc-900 border border-amber-500/30 rounded p-2 text-xs text-white max-w-[150px] font-bold"
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-[10px] text-amber-400 uppercase tracking-wider block mb-2">Explanation / Terms Notes</p>
                                  <input
                                    id={`counter-desc-${offer.id}`}
                                    type="text"
                                    placeholder="Explanation / Terms notes..."
                                    value={counterNotes}
                                    onChange={(e) => setCounterNotes(e.target.value)}
                                    className="w-full bg-zinc-900 border border-amber-500/30 rounded p-2 text-xs text-zinc-300"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                  <button
                                    onClick={() => {
                                      if (!counterGuarantee || parseFloat(counterGuarantee) <= 0) return;
                                      onUpdateOffer && onUpdateOffer({ 
                                        ...offer,
                                        status: 'renegotiating',
                                        guarantee_amount: parseFloat(counterGuarantee),
                                        renegotiation_notes: counterNotes,
                                        last_action_by: 'band'
                                      });
                                      setLocalRenegotiateId(null);
                                      setCounterGuarantee('');
                                      setCounterNotes('');
                                      triggerNotification?.(`Counter proposal dispatched back!`);
                                    }}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white font-black text-[10px] uppercase transition-colors"
                                  >
                                    Submit Counter
                                  </button>
                                  <button
                                    onClick={() => {
                                      setLocalRenegotiateId(null);
                                      setCounterGuarantee('');
                                      setCounterNotes('');
                                    }}
                                    className="px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded text-[10px] uppercase transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {isConfirmed && (
                              <div className="mb-4 space-y-2 border border-zinc-800 bg-black/40 rounded-lg p-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); triggerNotification("Advance request ping sent to Promoter."); }}
                                  className="w-full bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-900/80 text-emerald-400 py-2.5 rounded flex items-center justify-center font-black tracking-widest uppercase text-[10px] transition-colors cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                                >
                                  [ ⚡ ASK FOR SHOW DETAILS ADVANCE ]
                                </button>
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setReRequestPanel(p => ({ ...p, [offer.id]: !p[offer.id] }));
                                  }}
                                  className="w-full bg-transparent border border-zinc-800 hover:bg-zinc-900 text-zinc-400 py-2 rounded flex items-center justify-center font-bold tracking-widest uppercase text-[9px] transition-colors cursor-pointer mt-2.5"
                                >
                                  [ ↻ RE-REQUEST SHOW/VENUE ADVANCE ]
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Are you sure you want to request cancellation for this booked show? The promoter will have to sign off.")) {
                                      onUpdateOffer && onUpdateOffer({ ...offer, status: 'declined' });
                                    }
                                  }}
                                  className="w-full bg-red-950 border border-red-500/40 hover:bg-red-900/60 text-red-400 py-2 rounded flex items-center justify-center font-black tracking-widest uppercase text-[10px] transition-colors cursor-pointer mt-2.5"
                                >
                                  [ CANCEL CONFIRMED SHOW ]
                                </button>
                                
                                {reRequestPanel[offer.id] && (
                                  <div className="mt-2.5 pt-2.5 border-t border-zinc-800/60">
                                    <div className="text-[9px] uppercase text-zinc-600 font-bold mb-2 tracking-widest">Flag Missing Info:</div>
                                    <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                                      {['Missing Wi-Fi details', 'Missing Parking/Power specs', 'Curfew/Load-out times', 'Green room access code'].map(flag => (
                                        <label key={flag} className="flex items-center gap-2 cursor-pointer group" onClick={e => e.stopPropagation()}>
                                          <input type="checkbox" className="accent-amber-500 bg-zinc-900 border-zinc-700" />
                                          <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase select-none">{flag}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); triggerNotification("Updated requested details sent."); setReRequestPanel(p => ({ ...p, [offer.id]: false })); }}
                                      className="w-full mt-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 py-2 rounded border border-amber-500/30 uppercase text-[9px] font-bold cursor-pointer transition-colors"
                                    >
                                      Submit Targeted Request
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* View Venue Link */}
                            <div className="mb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchTerm(offer.venue_name);
                                  setActiveTab('directory');
                                }}
                                className="text-[#a855f7] hover:text-[#c084fc] font-bold text-[10px] tracking-widest cursor-pointer uppercase underline underline-offset-4 decoration-[#a855f7]/40 hover:decoration-[#c084fc]"
                              >
                                [ VIEW VENUE PROFILE ↗ ]
                              </button>
                            </div>

                            {/* Counter History Log */}
                            {(offer.status === 'renegotiating' || offer.status === 'accepted' || offer.status === 'declined') && (
                              <div className="mt-3 text-[9px] text-amber-500/70 border border-amber-500/20 bg-amber-950/20 p-2.5 rounded">
                                // HISTORY: Original Offer: ${(offer.guarantee_amount && offer.guarantee_amount * 0.85).toFixed(0)} | Countered Target: ${offer.guarantee_amount} | {offer.status === 'renegotiating' ? 'Awaiting Response.' : 'Resolved.'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pitch Modal with suggestions editor */}
      <AnimatePresence>
        {isModalOpen && selectedVenue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-[#13161a] border border-zinc-800 rounded-xl z-50 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col max-w-2xl mx-auto"
            >
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0a0a0c]">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#a855f7]" /> Route Pitch Composer
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-4 bg-[#0d0f12] flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex flex-col min-h-0">
                  <label className="block text-[10px] uppercase font-mono text-zinc-550 mb-1.5 tracking-wider text-left">Custom pitch payload</label>
                  <textarea
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="w-full flex-grow bg-black border border-zinc-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-zinc-300 focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 resize-y min-h-[160px] leading-relaxed"
                    placeholder="Structure custom touring query details..."
                  />
                </div>
                
                {/* Custom suggestions container */}
                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-900 border-l-2 border-l-purple-500 text-left">
                  <p className="text-[10px] uppercase font-mono text-purple-400 font-bold mb-2 tracking-widest flex items-center gap-1">
                    <span>● Intel Suggestions Checklist:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "+ Add Draw Details", text: "\n\n- Expected Regional Draw: 150-250 heads based on recent ticket sales in nearby metros." },
                      { label: "+ Ask Ticket Splits", text: "\n\n- Room Economics: Inquire about average 80/20 splits or standard local guarantees." },
                      { label: "+ Introduce Opener Bands", text: "\n\n- Show Lineup: We are communicating with local support act [Enter Opener] to complete the night." },
                      { label: "+ Link Audio Session", text: "\n\n- Live Performance Reference: Check our live recording reel here: [ENTER_LINK]" },
                      { label: "+ technical brief", text: "\n\n- Production Specs: We travel with our own front-of-house tech engineer and carry minimal input racks." }
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPitchText(prev => prev + sug.text)}
                        className="px-2.5 py-1.5 bg-purple-950/25 hover:bg-[#a855f7] hover:text-black border border-purple-800/40 hover:border-[#a855f7] text-[9.5px] uppercase font-bold text-purple-300 rounded transition-all cursor-pointer font-mono"
                      >
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-[#0a0a0c] flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 py-3 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyPitch}
                  className="flex-1 bg-white text-black hover:bg-zinc-200 py-3 rounded-lg font-bold tracking-wider uppercase text-xs transition-colors cursor-pointer shadow-lg"
                >
                  Copy pitch & close
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Add Venue Modal */}
        {isAddVenueOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddVenueOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-4 right-4 top-[10%] bg-[#13161a] border border-zinc-800 rounded-xl z-50 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col max-w-lg mx-auto"
            >
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0a0a0c]">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#a855f7]" /> Add Venue
                </h3>
                <button onClick={() => setIsAddVenueOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 bg-[#0d0f12] text-left">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Venue Name</label>
                  <input type="text" value={newVenueForm.name} onChange={e => setNewVenueForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="The Empty Bottle" />
                </div>
                
                {/* State, Province & Country Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">City</label>
                    <input type="text" value={newVenueForm.city} onChange={e => setNewVenueForm(p => ({ ...p, city: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="Chicago" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">State/Province</label>
                    <input type="text" value={newVenueForm.state} onChange={e => setNewVenueForm(p => ({ ...p, state: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="IL" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Country</label>
                    <input type="text" value={newVenueForm.country} onChange={e => setNewVenueForm(p => ({ ...p, country: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="USA" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Capacity</label>
                  <input type="number" value={newVenueForm.capacity} onChange={e => setNewVenueForm(p => ({ ...p, capacity: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="400" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Buyer Email</label>
                  <input type="email" value={newVenueForm.email} onChange={e => setNewVenueForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="talent@venue.com" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Talent Buyer Name</label>
                  <input type="text" value={newVenueForm.buyers} onChange={e => setNewVenueForm(p => ({ ...p, buyers: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#a855f7]/50 text-white" placeholder="John Doe" />
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800 bg-[#0a0a0c]">
                <button onClick={handleAddVenue} className="w-full bg-[#a855f7] text-white hover:bg-[#9333ea] py-3 rounded-lg font-bold tracking-wider uppercase text-sm transition-colors cursor-pointer">Submit to Community</button>
              </div>
            </motion.div>
          </>
        )}

        {/* Add Intel Modal */}
        {intelVenueId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIntelVenueId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-4 right-4 top-[15%] bg-[#13161a] border border-zinc-800 rounded-xl z-50 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col max-w-lg mx-auto"
            >
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0a0a0c]">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" /> Contribute Intel
                </h3>
                <button onClick={() => setIntelVenueId(null)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 bg-[#0d0f12] text-left">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-mono text-amber-500 mb-1.5">Payout Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={`payout-${val}`}
                          type="button"
                          onClick={() => setNewIntelForm(p => ({ ...p, payout: val }))}
                          className={`flex-1 h-8 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                            newIntelForm.payout >= val
                              ? 'bg-orange-500 text-black border-orange-500'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-amber-500/50'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">{val}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-mono text-amber-500 mb-1.5">Load-in Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={`loadin-${val}`}
                          type="button"
                          onClick={() => setNewIntelForm(p => ({ ...p, loadIn: val }))}
                          className={`flex-1 h-8 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                            newIntelForm.loadIn >= val
                              ? 'bg-orange-500 text-black border-orange-500'
                              : 'bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-amber-500/50'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">{val}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-amber-500 mb-1">Intel Notes (Staff, rules, tips)</label>
                  <textarea rows={4} value={newIntelForm.notes} onChange={e => setNewIntelForm(p => ({ ...p, notes: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-amber-500/50 text-white resize-none" placeholder="Sound guy was named Dave, super helpful..." />
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800 bg-[#0a0a0c]">
                <button onClick={handleAddIntel} className="w-full bg-[#primary] bg-amber-500 text-black hover:bg-amber-400 py-3 rounded-lg font-bold tracking-wider uppercase text-sm transition-colors cursor-pointer">Submit Intel</button>
              </div>
            </motion.div>
          </>
        )}
        {/* Contact Suggestion Modal */}
        {suggestionModalVenue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuggestionModalVenue(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed left-4 right-4 top-[15%] bg-[#13161a] border border-zinc-800 rounded-xl z-50 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col max-w-lg mx-auto"
            >
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0a0a0c]">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#00ffcc]" /> Suggest Contact Data Correction
                </h3>
                <button onClick={() => setSuggestionModalVenue(null)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 bg-[#0d0f12] text-left">
                <div className="text-[10px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 p-3 rounded-lg leading-relaxed">
                  <span className="text-[#00ffcc] font-bold uppercase tracking-widest">// NETWORK PROTOCOL:</span> Submitted contact updates are routed through a verification queue to prevent dead links. Live sync occurs upon network confirmation.
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">New Talent Buyer Name</label>
                  <input type="text" value={suggestionForm.buyer_name} onChange={e => setSuggestionForm(p => ({ ...p, buyer_name: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#00ffcc]/50 text-white" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">New Booking Email Address</label>
                  <input type="email" value={suggestionForm.booking_email} onChange={e => setSuggestionForm(p => ({ ...p, booking_email: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm focus:outline-none focus:border-[#00ffcc]/50 text-white" placeholder="booking@venue.com" />
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800 bg-[#0a0a0c]">
                <button onClick={handleSubmitSuggestion} className="w-full bg-orange-500 text-black hover:bg-orange-400 py-3 rounded-lg font-bold tracking-wider uppercase text-sm transition-colors cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.3)]">Submit Correction</button>
              </div>
            </motion.div>
          </>
        )}

        {/* Interaction Drawer: Direct Promoter Pipeline */}
        {selectedPromoter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPromoter(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-900 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950 text-left">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-purple-900/60 text-purple-200 border-2 border-purple-500/30 flex items-center justify-center font-bold font-display tracking-wider text-sm select-none shadow-[0_0_15px_rgba(168,85,247,0.25)] relative">
                    {selectedPromoter.avatar}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white tracking-wide uppercase select-all flex items-center space-x-1.5">
                      <span>{selectedPromoter.name}</span>
                    </h4>
                    <p className="text-[10px] text-purple-400 font-mono tracking-widest uppercase mt-0.5 select-text">
                      Promoter @ {selectedPromoter.venue}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPromoter(null)}
                  className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contextual Attachment Block */}
              <div className="p-4 bg-zinc-900/20 border-b border-zinc-900/60 text-left">
                <div className="bg-[#a855f7]/5 border border-[#a855f7]/20 rounded-xl p-3 shadow-inner">
                  <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest block mb-1">
                    ⚡ CURRENT ACTIVE UNBOOKED ROUTING GAPS:
                  </span>
                  <div className="space-y-1.5 mt-2">
                    {routingGaps.map((gap, gIdx) => (
                      <div key={gIdx} className="inline-flex bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold leading-normal w-full items-center space-x-1.5 shadow-[0_0_10px_rgba(168,85,247,0.05)] select-all">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="truncate">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-950/40 flex flex-col text-left">
                <div className="text-[10px] text-zinc-500 font-mono text-center select-none uppercase tracking-widest border-b border-zinc-900/60 pb-2.5">
                  🔐 END-TO-END NATIVE MESSAGE ROUTER
                </div>

                <div className="flex-1 space-y-4">
                  {(!chatMessages[selectedPromoter.name] || chatMessages[selectedPromoter.name].length === 0) ? (
                    <div className="text-center text-zinc-600 font-mono text-xs py-16 select-none max-w-xs mx-auto">
                      No transmission history recorded. Initiate immediate pipeline message below to bypass email lag.
                    </div>
                  ) : (
                    chatMessages[selectedPromoter.name].map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed font-sans shadow-md ${
                            msg.sender === 'user'
                              ? 'bg-purple-650 text-white rounded-tr-none font-medium'
                              : 'bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-zinc-600 font-mono mt-1 select-none">
                          {msg.time} {msg.sender === 'user' && '│ Transmitted'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Input Matrix */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex flex-col gap-2.5 text-left">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={e => setTypedMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder={`Direct message to ${selectedPromoter.name}...`}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded focus:border-purple-500 text-sm p-3 text-zinc-100 outline-none placeholder:text-zinc-600 transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="h-11 w-11 bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center justify-center transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0 active:scale-95"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[9px] text-zinc-600 font-mono select-none uppercase text-center tracking-widest">
                  Secure Direct Promoter Link Established
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
