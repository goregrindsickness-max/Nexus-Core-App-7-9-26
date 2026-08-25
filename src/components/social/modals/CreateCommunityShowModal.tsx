import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Sparkles, Clock, Ticket, Image as ImageIcon, Upload, Globe, Plus, Trash2 } from 'lucide-react';
import { compressImageInSocialFeed } from '../../../utils/socialFeedUtils';

export interface CreateCommunityShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (showData: any) => void;
  editingShow?: any | null;
  triggerNotification?: (msg: string) => void;
}

export const CreateCommunityShowModal: React.FC<CreateCommunityShowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingShow,
  triggerNotification,
}) => {
  const [name, setName] = useState('');
  const [festivalName, setFestivalName] = useState('');
  const [date, setDate] = useState('');
  const [doorsTime, setDoorsTime] = useState('19:00');
  const [setTime, setSetTime] = useState('20:00');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('United States');
  const [externalTicketUrl, setExternalTicketUrl] = useState('');
  const [flyerUrl, setFlyerUrl] = useState('');
  const [dayOfShowPrice, setDayOfShowPrice] = useState('');
  const [presalePrice, setPresalePrice] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('All Ages');
  const [safetyCode, setSafetyCode] = useState('');
  const [isTime24Hour, setIsTime24Hour] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tour_time_is_24h') === 'true';
    } catch {
      return false;
    }
  });

  // Individual support bands list
  const [supportBands, setSupportBands] = useState<string[]>([]);
  const [newSupportBandInput, setNewSupportBandInput] = useState('');

  const flyerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingShow) {
      setName(editingShow.name || editingShow.headliner || editingShow.show_name || '');
      setFestivalName(editingShow.festival_name || '');
      
      const rawDate = editingShow.date || editingShow.show_date || '';
      setDate(rawDate ? String(rawDate).split('T')[0] : '');

      setDoorsTime(editingShow.doors_time || '19:00');
      setSetTime(editingShow.set_time || '20:00');

      // Separate Venue Name and Street Address
      const rawVName = editingShow.venue_name || (editingShow.venue && !editingShow.venue.toLowerCase().includes('live show') ? editingShow.venue : '') || '';
      const rawVAddr = editingShow.venue_address || (editingShow.venue && editingShow.venue !== rawVName ? editingShow.venue : '') || '';
      setVenueName(rawVName);
      setVenueAddress(rawVAddr);

      const capVal = editingShow.capacity || editingShow.venue_capacity || editingShow.expected_attendance || '';
      setCapacity(capVal ? String(capVal) : '');

      // Clean City and State (prevent duplicate suffixes like "Haltom City, TX, TX")
      let cleanCity = editingShow.city || '';
      let cleanState = editingShow.state_province || '';
      if (cleanCity.includes(',')) {
        const parts = cleanCity.split(',').map((p: string) => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          cleanCity = parts[0];
          if (!cleanState && parts[1]) {
            cleanState = parts[1];
          }
        }
      }
      setCity(cleanCity);
      setStateProvince(cleanState);
      setCountry(editingShow.country || 'United States');

      // Clean Price fields (prevent string corruption like "DOS Presale $30.00 / DOS $35.00")
      let dosP = editingShow.day_of_show_price ? String(editingShow.day_of_show_price) : '';
      let advP = editingShow.presale_price ? String(editingShow.presale_price) : '';
      const combinedPrice = editingShow.price || editingShow.ticket_price || '';

      if (!dosP && !advP && combinedPrice) {
        const priceStr = String(combinedPrice);
        if (priceStr.includes('/')) {
          const [p1, p2] = priceStr.split('/').map(s => s.trim());
          advP = p1.replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
          dosP = (p2 || '').replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
        } else {
          dosP = priceStr.replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
        }
      } else {
        if (dosP) {
          if (dosP.includes('/') || dosP.toLowerCase().includes('presale')) {
            const [p1, p2] = dosP.split('/').map(s => s.trim());
            if (!advP) advP = p1.replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
            dosP = (p2 || p1).replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
          } else {
            dosP = dosP.replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
          }
        }
        if (advP) {
          advP = advP.replace(/^(dos|presale|adv|door)\s*/gi, '').trim();
        }
      }

      setDayOfShowPrice(dosP);
      setPresalePrice(advP);

      setExternalTicketUrl(editingShow.external_ticket_url || editingShow.ticket_url || '');
      setFlyerUrl(editingShow.flyer_url || '');
      setAgeRestriction(editingShow.age_restriction || editingShow.age || 'All Ages');
      setSafetyCode(editingShow.safety_code || editingShow.safetyCode || '');
      if (Array.isArray(editingShow.support_lineup)) {
        setSupportBands(editingShow.support_lineup.map((s: any) => typeof s === 'string' ? s : s.band_name || s.name || ''));
      } else if (typeof editingShow.support_bands === 'string') {
        setSupportBands(editingShow.support_bands.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
    } else {
      setName('');
      setFestivalName('');
      setDate('');
      setDoorsTime('19:00');
      setSetTime('20:00');
      setVenueName('');
      setVenueAddress('');
      setCapacity('');
      setCity('');
      setStateProvince('');
      setCountry('United States');
      setExternalTicketUrl('');
      setFlyerUrl('');
      setDayOfShowPrice('');
      setPresalePrice('');
      setAgeRestriction('All Ages');
      setSafetyCode('');
      setSupportBands([]);
      setNewSupportBandInput('');
    }
  }, [editingShow, isOpen]);

  if (!isOpen) return null;

  const handleFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        triggerNotification?.('⚠️ Flyer image exceeds 10MB limit.');
        return;
      }
      triggerNotification?.('⏳ Processing flyer image...');
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const compressed = await compressImageInSocialFeed(base64, 1024, 1024, 0.8);
          setFlyerUrl(compressed);
          triggerNotification?.('✅ Flyer uploaded successfully!');
        } catch (err) {
          setFlyerUrl(reader.result as string);
          triggerNotification?.('✅ Flyer uploaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSupportBand = () => {
    if (!newSupportBandInput.trim()) return;
    setSupportBands(prev => [...prev, newSupportBandInput.trim()]);
    setNewSupportBandInput('');
  };

  const handleRemoveSupportBand = (index: number) => {
    setSupportBands(prev => prev.filter((_, i) => i !== index));
  };

  const formatTimeToDisplay = (timeStr: string) => {
    if (!timeStr) return '';
    if (isTime24Hour) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const mins = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${mins} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerNotification?.('⚠️ Please enter an event or headliner name.');
      return;
    }
    if (!date) {
      triggerNotification?.('⚠️ Please select a date for the show.');
      return;
    }
    if (!city.trim()) {
      triggerNotification?.('⚠️ Please enter the city.');
      return;
    }

    const trimmedName = name.trim();
    const trimmedFestival = festivalName.trim();
    const headlinerVal = trimmedName || 'Live Show';
    const finalShowName = trimmedFestival || trimmedName || `${headlinerVal} Live`;

    const formattedSupportLineup = supportBands.map(bandName => ({
      band_name: bandName,
      set_duration: '30 mins'
    }));

    const explicitVenueName = venueName.trim();
    const explicitVenueAddress = venueAddress.trim();
    const explicitCapacity = capacity.trim();
    const cleanDos = dayOfShowPrice.trim();
    const cleanPresale = presalePrice.trim();

    let computedPrice = 'Free / Crowdsourced';
    if (cleanPresale && cleanDos) {
      computedPrice = `$${cleanPresale.replace(/^\$/, '')} adv / $${cleanDos.replace(/^\$/, '')} dos`;
    } else if (cleanDos) {
      computedPrice = cleanDos.startsWith('$') || cleanDos.toLowerCase().includes('free') ? cleanDos : `$${cleanDos}`;
    } else if (cleanPresale) {
      computedPrice = `$${cleanPresale.replace(/^\$/, '')} adv`;
    } else if (externalTicketUrl.trim()) {
      computedPrice = 'External Tickets';
    }

    const showPayload = {
      id: editingShow?.id || ('sh_comm_' + Math.random().toString(36).substring(2, 9)),
      name: finalShowName,
      show_name: finalShowName,
      headliner: headlinerVal,
      festival_name: trimmedFestival || undefined,
      date,
      show_date: date,
      doors_time: doorsTime || undefined,
      set_time: setTime || undefined,
      venue_name: explicitVenueName || explicitVenueAddress || 'Live Stage',
      venue_address: explicitVenueAddress || undefined,
      venue: explicitVenueName || explicitVenueAddress || `${headlinerVal} Local Stage`,
      capacity: explicitCapacity || undefined,
      venue_capacity: explicitCapacity || undefined,
      expected_attendance: explicitCapacity || undefined,
      city: city.trim(),
      state_province: stateProvince.trim() || undefined,
      country: country.trim() || undefined,
      day_of_show_price: cleanDos || undefined,
      presale_price: cleanPresale || undefined,
      age_restriction: ageRestriction,
      age: ageRestriction,
      safety_code: safetyCode.trim() || undefined,
      price: computedPrice,
      ticket_price: cleanDos ? parseFloat(cleanDos.replace(/[^0-9.]/g, '')) || undefined : undefined,
      external_ticket_url: externalTicketUrl.trim() || undefined,
      ticket_url: externalTicketUrl.trim() || undefined,
      flyer_url: flyerUrl || undefined,
      support_lineup: formattedSupportLineup,
      support_bands: supportBands.join(', '),
      is_time_24h: isTime24Hour,
      is_community_submitted: true,
      created_at: editingShow?.created_at || new Date().toISOString()
    };

    onSubmit(showPayload);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#0d0f14] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#12151d]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00ffcc]/10 border border-[#00ffcc]/30 flex items-center justify-center text-[#00ffcc]">
                🎟️
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide font-display">
                  {editingShow ? 'Edit Community Show' : 'Post Community Show'}
                </h3>
                <p className="text-[11px] text-zinc-400">Add or update local concert details for the community feed</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Scroll Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Headline / Artist Name */}
            <div>
              <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                Headliner / Event Title <span className="text-[#00ffcc]">*</span>
              </label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cattle Decapitation, Local Showcase, Summer Fest"
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#00ffcc] transition-colors"
              />
            </div>

            {/* Support Bands right under Headliner (Individual Addition) */}
            <div>
              <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                Support Bands / Lineup (Individual)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="text"
                  value={newSupportBandInput}
                  onChange={(e) => setNewSupportBandInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSupportBand(); } }}
                  placeholder="e.g. Local Opener Band"
                  className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                />
                <button
                  type="button"
                  onClick={handleAddSupportBand}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-mono text-xs flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#00ffcc]" />
                  <span>Add Band</span>
                </button>
              </div>

              {supportBands.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 border border-zinc-800 rounded-lg">
                  {supportBands.map((band, idx) => (
                    <span 
                      key={`sup-band-${idx}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-[11px]"
                    >
                      <span>{band}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSupportBand(idx)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Festival / Tour Package (Optional) */}
            <div>
              <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                Festival or Tour Package Name (Optional)
              </label>
              <input 
                type="text"
                value={festivalName}
                onChange={(e) => setFestivalName(e.target.value)}
                placeholder="e.g. North American Slaughterfest Tour"
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
              />
            </div>

            {/* Date & Times Grid with Native Calendar and Clock pickers */}
            <div className="space-y-3 pt-1 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-zinc-300 uppercase tracking-wider font-bold">Schedule & Time Format</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-400 font-mono">
                  <input 
                    type="checkbox"
                    checked={isTime24Hour}
                    onChange={(e) => setIsTime24Hour(e.target.checked)}
                    className="rounded bg-black border-zinc-800 text-[#00ffcc] focus:ring-0 cursor-pointer"
                  />
                  <span>24-Hour Time Format</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-zinc-400 mb-1">
                    Show Date <span className="text-[#00ffcc]">*</span>
                  </label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Doors Time</span>
                    <span className="text-[10px] text-zinc-500">{formatTimeToDisplay(doorsTime)}</span>
                  </label>
                  <input 
                    type="time"
                    value={doorsTime}
                    onChange={(e) => setDoorsTime(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Set Time</span>
                    <span className="text-[10px] text-zinc-500">{formatTimeToDisplay(setTime)}</span>
                  </label>
                  <input 
                    type="time"
                    value={setTime}
                    onChange={(e) => setSetTime(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
              </div>
            </div>

            {/* Show Price Fields: Day of Show and Pre-Sale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80">
              <div>
                <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                  Day of Show Price <span className="text-[#00ffcc]">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={dayOfShowPrice}
                  onChange={(e) => setDayOfShowPrice(e.target.value)}
                  placeholder="e.g. $25, Free, Donation"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                  Pre-Sale Price (Optional)
                </label>
                <input 
                  type="text"
                  value={presalePrice}
                  onChange={(e) => setPresalePrice(e.target.value)}
                  placeholder="e.g. $20 adv"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                />
              </div>
            </div>

            {/* Age Restriction & Safety Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80">
              <div>
                <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                  Age Restriction
                </label>
                <select
                  value={ageRestriction}
                  onChange={(e) => setAgeRestriction(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                >
                  <option value="All Ages">All Ages</option>
                  <option value="18+">18+</option>
                  <option value="21+">21+</option>
                  <option value="16+">16+</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                  Safety Code / Door Policy (Optional)
                </label>
                <input 
                  type="text"
                  value={safetyCode}
                  onChange={(e) => setSafetyCode(e.target.value)}
                  placeholder="e.g. Safe Space / Zero Tolerance"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                />
              </div>
            </div>

            {/* Venue Details: Venue Name, Street Address, Capacity */}
            <div className="space-y-3 pt-1 border-t border-zinc-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                    Venue Name <span className="text-[#00ffcc]">*</span>
                  </label>
                  <input 
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. The Rail Club Live, The Underground"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                    Street Address (Optional)
                  </label>
                  <input 
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. 3101 Joyce Dr, 174 Camden High St"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                  Venue Capacity (Optional)
                </label>
                <input 
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 650, 1200 cap"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                    City <span className="text-[#00ffcc]">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Haltom City, Austin"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                    State / Province
                  </label>
                  <input 
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="e.g. TX, CA, ON"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input 
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
                  />
                </div>
              </div>
            </div>

            {/* External Ticket URL */}
            <div className="pt-1 border-t border-zinc-800/80">
              <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                External Ticketing Link (DICE, Ticketmaster, Resident Advisor, etc.)
              </label>
              <input 
                type="url"
                value={externalTicketUrl}
                onChange={(e) => setExternalTicketUrl(e.target.value)}
                placeholder="https://dice.fm/event/..."
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ffcc]"
              />
            </div>

            {/* Flyer Upload */}
            <div className="pt-1 border-t border-zinc-800/80">
              <label className="block font-mono text-[11px] text-zinc-300 uppercase tracking-wider mb-1">
                Event Flyer or Poster Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => flyerInputRef.current?.click()}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-mono text-xs flex items-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00ffcc]" />
                  <span>Choose Image File</span>
                </button>
                {flyerUrl && (
                  <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]">
                    ✓ Flyer Attached
                  </span>
                )}
                <input 
                  ref={flyerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFlyerUpload}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-mono text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-bold rounded-lg font-mono text-xs transition-colors cursor-pointer shadow-lg shadow-[#00ffcc]/20"
              >
                {editingShow ? 'Update Show Details' : 'Post Community Show'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateCommunityShowModal;
