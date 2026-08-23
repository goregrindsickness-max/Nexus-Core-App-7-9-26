import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Disc,
  Music,
  MapPin,
  Globe,
  ExternalLink,
  ShieldCheck,
  Users,
  Sparkles,
  Save,
  Check,
  Search,
  Upload,
  Info,
  Image as ImageIcon,
  Loader2,
  Youtube,
  Play,
  UserPlus,
  Clock,
  Tag,
  ListMusic,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  communityBandManager,
  CommunityBandRecord,
  LineupMember,
  DiscographyRelease,
  DiscographyTrack
} from '../../../lib/communityBands';
import { uploadBase64ToStorage } from '../../../supabase';

interface CommunityBandCuratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBand?: CommunityBandRecord | null;
  userProfile?: any;
  onSaved?: (band: CommunityBandRecord) => void;
}

export const CommunityBandCuratorModal: React.FC<CommunityBandCuratorModalProps> = ({
  isOpen,
  onClose,
  initialBand,
  userProfile,
  onSaved
}) => {
  const [bandsList, setBandsList] = useState<CommunityBandRecord[]>([]);
  const [selectedBand, setSelectedBand] = useState<CommunityBandRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lineup' | 'discography'>('overview');

  // Basic Info Form State
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('Technical Death Metal');
  const [subgenres, setSubgenres] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('USA');
  const [recordLabel, setRecordLabel] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [bandcampUrl, setBandcampUrl] = useState('');
  const [metalArchivesUrl, setMetalArchivesUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [curatorHandle, setCuratorHandle] = useState('@community_archivist');

  // Lineup Editor State
  const [lineup, setLineup] = useState<LineupMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState<'active' | 'past' | 'touring'>('active');
  const [newMemberYears, setNewMemberYears] = useState('');
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);

  // Discography Editor State
  const [albums, setAlbums] = useState<DiscographyRelease[]>([]);
  const [editingAlbumIdx, setEditingAlbumIdx] = useState<number | null>(null);

  // Current working release (for creating or editing)
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [releaseType, setReleaseType] = useState<'album' | 'ep' | 'single' | 'demo'>('album');
  const [releaseLabel, setReleaseLabel] = useState('');
  const [releaseCatalogId, setReleaseCatalogId] = useState('');
  const [releaseImageUrl, setReleaseImageUrl] = useState('');
  const [releaseTracks, setReleaseTracks] = useState<DiscographyTrack[]>([]);

  // Working Track inputs
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('');

  // Upload States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAlbumImg, setIsUploadingAlbumImg] = useState(false);

  const handleDeviceFileUpload = async (
    file: File,
    bucket: string,
    prefix: string,
    onSuccess: (url: string) => void,
    setLoadingState: (loading: boolean) => void
  ) => {
    try {
      setLoadingState(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        if (!base64) {
          setLoadingState(false);
          return;
        }
        try {
          const publicUrl = await uploadBase64ToStorage(
            base64,
            bucket,
            selectedBand?.id || `comm-band-${Date.now()}`,
            prefix
          );
          if (publicUrl) {
            onSuccess(publicUrl);
          } else {
            onSuccess(base64);
          }
        } catch (err) {
          console.warn('Storage upload error, fallback to base64:', err);
          onSuccess(base64);
        } finally {
          setLoadingState(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('File reading failed:', e);
      setLoadingState(false);
    }
  };

  const loadBands = () => {
    const list = communityBandManager.getAll();
    setBandsList(list);
    communityBandManager.fetchFromSupabase().then((remoteList) => {
      if (remoteList && remoteList.length > 0) {
        setBandsList(remoteList);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    if (isOpen) {
      loadBands();
      if (initialBand) {
        populateForm(initialBand);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialBand]);

  const populateForm = (band: CommunityBandRecord) => {
    setSelectedBand(band);
    setIsCreatingNew(false);
    setName(band.name);
    setGenre(band.genre || 'Metal');
    setSubgenres(band.subgenres?.join(', ') || '');
    setFoundedYear(band.founded_year || '');
    setCity(band.city || '');
    setStateProvince(band.state_province || band.state || '');
    setCountry(band.country || 'USA');
    setRecordLabel(band.record_label || band.label || '');
    setBio(band.bio || '');
    setAvatarUrl(band.avatar_url || '');
    setCoverUrl(band.cover_url || '');
    setSpotifyUrl(band.spotify_url || '');
    setBandcampUrl(band.bandcamp_url || '');
    setMetalArchivesUrl(band.metal_archives_url || '');
    setYoutubeUrl(band.youtube_url || band.featured_youtube_url || '');
    setCuratorHandle(band.curated_by || (userProfile?.console_handle || userProfile?.handle || '@community_archivist'));
    setLineup(band.lineup || []);
    setAlbums(band.discography || []);
    setEditingAlbumIdx(null);
    setEditingMemberIdx(null);
    resetReleaseInputs();
  };

  const resetForm = () => {
    setSelectedBand(null);
    setIsCreatingNew(true);
    setName('');
    setGenre('Death Metal');
    setSubgenres('');
    setFoundedYear('');
    setCity('');
    setStateProvince('');
    setCountry('USA');
    setRecordLabel('');
    setBio('');
    setAvatarUrl('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400');
    setCoverUrl('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200');
    setSpotifyUrl('');
    setBandcampUrl('');
    setMetalArchivesUrl('');
    setYoutubeUrl('');
    setCuratorHandle(userProfile?.console_handle || userProfile?.handle || '@community_archivist');
    setLineup([]);
    setAlbums([]);
    setEditingAlbumIdx(null);
    setEditingMemberIdx(null);
    resetReleaseInputs();
  };

  const resetReleaseInputs = () => {
    setReleaseTitle('');
    setReleaseYear(new Date().getFullYear().toString());
    setReleaseType('album');
    setReleaseLabel('');
    setReleaseCatalogId('');
    setReleaseImageUrl('');
    setReleaseTracks([]);
    setNewTrackTitle('');
    setNewTrackDuration('');
    setEditingAlbumIdx(null);
  };

  // Lineup Handlers
  const handleAddOrUpdateMember = () => {
    if (!newMemberName.trim()) return;

    if (editingMemberIdx !== null) {
      const updated = [...lineup];
      updated[editingMemberIdx] = {
        ...updated[editingMemberIdx],
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'Musician',
        status: newMemberStatus,
        years: newMemberYears.trim() || 'Present'
      };
      setLineup(updated);
      setEditingMemberIdx(null);
    } else {
      const newMem: LineupMember = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'Musician',
        status: newMemberStatus,
        years: newMemberYears.trim() || 'Present'
      };
      setLineup([...lineup, newMem]);
    }

    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberYears('');
    setNewMemberStatus('active');
  };

  const handleEditMember = (idx: number) => {
    const mem = lineup[idx];
    setEditingMemberIdx(idx);
    setNewMemberName(mem.name);
    setNewMemberRole(mem.role);
    setNewMemberStatus(mem.status || 'active');
    setNewMemberYears(mem.years || '');
  };

  const handleRemoveMember = (idx: number) => {
    setLineup(lineup.filter((_, i) => i !== idx));
    if (editingMemberIdx === idx) {
      setEditingMemberIdx(null);
      setNewMemberName('');
      setNewMemberRole('');
      setNewMemberYears('');
    }
  };

  // Discography & Tracklist Handlers
  const handleLoadReleaseForEdit = (idx: number) => {
    const alb = albums[idx];
    setEditingAlbumIdx(idx);
    setReleaseTitle(alb.title);
    setReleaseYear(alb.year);
    setReleaseType(alb.type || 'album');
    setReleaseLabel(alb.label || alb.release_info || '');
    setReleaseCatalogId(alb.catalog_id || '');
    setReleaseImageUrl(alb.image_url || '');
    setReleaseTracks(alb.tracks || []);
    setNewTrackTitle('');
    setNewTrackDuration('');
  };

  const handleSaveRelease = () => {
    if (!releaseTitle.trim()) return;

    const releaseData: DiscographyRelease = {
      id: editingAlbumIdx !== null ? albums[editingAlbumIdx].id : `rel-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: releaseTitle.trim(),
      year: releaseYear.trim() || new Date().getFullYear().toString(),
      type: releaseType,
      image_url: releaseImageUrl.trim() || undefined,
      label: releaseLabel.trim() || undefined,
      release_info: releaseLabel.trim() || undefined,
      catalog_id: releaseCatalogId.trim() || undefined,
      tracks: releaseTracks
    };

    if (editingAlbumIdx !== null) {
      const updated = [...albums];
      updated[editingAlbumIdx] = releaseData;
      setAlbums(updated);
    } else {
      setAlbums([...albums, releaseData]);
    }

    resetReleaseInputs();
  };

  const handleRemoveAlbum = (idx: number) => {
    setAlbums(albums.filter((_, i) => i !== idx));
    if (editingAlbumIdx === idx) {
      resetReleaseInputs();
    }
  };

  const handleAddTrackToRelease = () => {
    if (!newTrackTitle.trim()) return;
    const trackNum = releaseTracks.length + 1;
    const newTrack: DiscographyTrack = {
      number: trackNum,
      title: newTrackTitle.trim(),
      duration: newTrackDuration.trim() || '3:30'
    };
    setReleaseTracks([...releaseTracks, newTrack]);
    setNewTrackTitle('');
    setNewTrackDuration('');
  };

  const handleRemoveTrack = (tIdx: number) => {
    const filtered = releaseTracks.filter((_, i) => i !== tIdx).map((t, idx) => ({
      ...t,
      number: idx + 1
    }));
    setReleaseTracks(filtered);
  };

  // Full Save to Supabase and Local Storage
  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);

    try {
      const subgenreArray = subgenres
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const resolvedCreatorId = selectedBand?.creator_id || userProfile?.id || (userProfile?.console_handle ? userProfile.console_handle : undefined);

      const bandPayload: Partial<CommunityBandRecord> & { name: string } = {
        id: selectedBand?.id,
        name: name.trim(),
        genre,
        subgenres: subgenreArray,
        founded_year: foundedYear.trim() || undefined,
        city: city.trim(),
        state: stateProvince.trim(),
        state_province: stateProvince.trim(),
        country: country.trim(),
        record_label: recordLabel.trim() || undefined,
        label: recordLabel.trim() || undefined,
        bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        spotify_url: spotifyUrl,
        bandcamp_url: bandcampUrl,
        metal_archives_url: metalArchivesUrl,
        youtube_url: youtubeUrl,
        featured_youtube_url: youtubeUrl,
        lineup,
        discography: albums,
        creator_id: resolvedCreatorId,
        curated_by: curatorHandle || userProfile?.console_handle || userProfile?.handle || '@fan_archivist',
        curator_name: userProfile?.full_name || userProfile?.name || 'Community Archivist',
        verification_status: selectedBand?.verification_status || 'community_archive'
      };

      const savedRecord = communityBandManager.upsertCommunityBand(bandPayload);

      // Force direct Supabase sync for both bands table and releases table
      await communityBandManager.syncToSupabaseTables(savedRecord);

      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 3000);

      loadBands();
      populateForm(savedRecord);
      onSaved?.(savedRecord);
    } catch (error) {
      console.error('Failed to save archive:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const filteredBands = bandsList.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[1000005] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#090a0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white font-display uppercase tracking-wide">
                  Community Band Archivist Hub
                </h3>
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  SUPABASE SYNCED ARCHIVES
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Curate fan-run discographies, lineups, YouTube video embeds, and album artwork with instant Supabase persistence.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Archives List */}
          <div className="md:col-span-4 border-r border-zinc-850 bg-zinc-950/40 p-4 flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Existing Archives ({bandsList.length})
              </span>
              <button
                onClick={resetForm}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-3 h-3" /> New Archive
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-zinc-600 outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Band Cards */}
            <div className="space-y-2 overflow-y-auto pr-1 max-h-[580px]">
              {filteredBands.map((band, bIdx) => {
                const isSelected = selectedBand?.id === band.id;
                return (
                  <button
                    key={band.id ? `band-${band.id}-${bIdx}` : `band-${bIdx}`}
                    onClick={() => populateForm(band)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-900/50 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <img
                      src={band.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=100'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate font-display">{band.name}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          band.verification_status === 'verified_official'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                        }`}>
                          {band.verification_status === 'verified_official' ? 'VERIFIED' : 'FAN ARCHIVE'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate font-mono mt-0.5">
                        {band.genre} • {band.city || band.country || 'Global'}
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                        <span>💿 {band.discography?.length || 0} releases</span>
                        <span>👥 {band.lineup?.length || 0} members</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Editor Form */}
          <div className="md:col-span-8 p-5 overflow-y-auto space-y-4 max-h-[78vh] flex flex-col">
            {/* Action Bar & Mode Indicator */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div>
                <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  {isCreatingNew ? 'Create New Community Band Profile' : `Editing Archive: ${selectedBand?.name}`}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Direct submission • Pushes data to Supabase bands & releases tables and storage buckets
                </p>
              </div>

              <div className="flex items-center gap-2">
                {savedFeedback && (
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Saved & Synced to Supabase!
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Archive</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sub-Tabs for Clean Organization */}
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Info className="w-3.5 h-3.5" /> Overview & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lineup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'lineup'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Band Lineup ({lineup.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discography')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'discography'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Disc className="w-3.5 h-3.5" /> Discography Catalog ({albums.length})
              </button>
            </div>

            {/* Tab 1: Overview & Media */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Band / Artist Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Gorguts, Dying Fetus..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Primary Genre</label>
                    <input
                      type="text"
                      placeholder="e.g. Technical Death Metal..."
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Founded Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 1991"
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Subgenres & Record Label */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Subgenres (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="Slam, Goregrind, Groove..."
                      value={subgenres}
                      onChange={(e) => setSubgenres(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Record Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Relapse Records, Season of Mist..."
                      value={recordLabel}
                      onChange={(e) => setRecordLabel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Location (City, State/Province, Country) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Upper Marlboro, Montreal..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">State / Province / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. MD, Quebec, Bayern..."
                      value={stateProvince}
                      onChange={(e) => setStateProvince(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Country</label>
                    <input
                      type="text"
                      placeholder="USA, Canada, Germany, UK, JP..."
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Band History & Biography</label>
                  <textarea
                    rows={3}
                    placeholder="Origins, classic lineup, signature sound, label history..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 outline-none font-sans"
                  />
                </div>

                {/* Featured YouTube URL */}
                <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl space-y-2">
                  <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-red-500" />
                      <span>Featured YouTube URL (Official Video / Live Pro-Shot)</span>
                    </span>
                    {youtubeUrl && (
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Play className="w-2.5 h-2.5" /> Test Link
                      </a>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Native Media Uploaders (Avatar & Banner to Supabase Buckets) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 bg-zinc-950/80 border border-zinc-850 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Avatar / Logo Image</span>
                      </label>
                      {isUploadingAvatar && (
                        <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Supabase...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-zinc-750 flex items-center justify-center shrink-0 shadow-inner">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-600 font-mono text-[9px]">NO IMG</span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm">
                          <Upload className="w-3 h-3" />
                          <span>Choose From Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleDeviceFileUpload(file, 'avatars', 'community-avatar', (url) => setAvatarUrl(url), setIsUploadingAvatar);
                              }
                            }}
                          />
                        </label>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="text-[9px] font-mono text-zinc-500 hover:text-red-400 block transition-colors"
                          >
                            Remove image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-zinc-950/80 border border-zinc-850 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cover Banner Image</span>
                      </label>
                      {isUploadingCover && (
                        <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Supabase...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-750 flex items-center justify-center shrink-0 shadow-inner">
                        {coverUrl ? (
                          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-600 font-mono text-[9px]">NO BANNER</span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm">
                          <Upload className="w-3 h-3" />
                          <span>Choose From Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleDeviceFileUpload(file, 'bannersv2', 'community-banner', (url) => setCoverUrl(url), setIsUploadingCover);
                              }
                            }}
                          />
                        </label>

                        {coverUrl && (
                          <button
                            type="button"
                            onClick={() => setCoverUrl('')}
                            className="text-[9px] font-mono text-zinc-500 hover:text-red-400 block transition-colors"
                          >
                            Remove banner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Streaming & Archive Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Spotify Artist URL</label>
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/artist/..."
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Bandcamp URL</label>
                    <input
                      type="text"
                      placeholder="https://band.bandcamp.com"
                      value={bandcampUrl}
                      onChange={(e) => setBandcampUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Metal Archives / Discogs</label>
                    <input
                      type="text"
                      placeholder="https://www.metal-archives.com/..."
                      value={metalArchivesUrl}
                      onChange={(e) => setMetalArchivesUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Lineup & Band Members Editor */}
            {activeTab === 'lineup' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-zinc-950/80 border border-zinc-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      {editingMemberIdx !== null ? `Edit Member #${editingMemberIdx + 1}` : 'Add Band Member / Musician'}
                    </span>
                    {editingMemberIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMemberIdx(null);
                          setNewMemberName('');
                          setNewMemberRole('');
                          setNewMemberYears('');
                          setNewMemberStatus('active');
                        }}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Musician Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Muhammed Suiçmez, Trey Williams..."
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Instruments / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Guitars, Vocals"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Years Active / Era</label>
                      <input
                        type="text"
                        placeholder="e.g. 1992–present"
                        value={newMemberYears}
                        onChange={(e) => setNewMemberYears(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">Status:</span>
                      <div className="flex items-center gap-1">
                        {(['active', 'past', 'touring'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setNewMemberStatus(st)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                              newMemberStatus === st
                                ? 'bg-amber-500 text-black shadow-sm'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddOrUpdateMember}
                      disabled={!newMemberName.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-black text-xs uppercase cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {editingMemberIdx !== null ? 'Update Member' : 'Add to Lineup'}
                    </button>
                  </div>
                </div>

                {/* Lineup List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase">
                    <span>Curated Lineup Roster ({lineup.length})</span>
                    <span className="text-[10px] text-zinc-500">Official band takeover adopts or edits this</span>
                  </div>

                  {lineup.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs font-mono">
                      No band members added yet. Use the form above to add musicians and instrument roles.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {lineup.map((mem, idx) => (
                        <div
                          key={mem.id ? `mem-${mem.id}-${idx}` : `mem-${idx}`}
                          className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-between gap-3 group hover:border-zinc-700 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate font-display">{mem.name}</span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                                mem.status === 'active'
                                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                                  : mem.status === 'touring'
                                  ? 'bg-purple-950/80 text-purple-400 border-purple-500/40'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                              }`}>
                                {mem.status || 'active'}
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-400/90 font-mono truncate mt-0.5">
                              {mem.role || 'Musician'}
                            </div>
                            {mem.years && (
                              <div className="text-[9px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {mem.years}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditMember(idx)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors"
                              title="Edit musician"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(idx)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                              title="Remove musician"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Editable Discography with Tracklist & Images */}
            {activeTab === 'discography' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Working Release Editor Form */}
                <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Disc className="w-4 h-4 text-amber-400" />
                      {editingAlbumIdx !== null ? `Editing Release #${editingAlbumIdx + 1}: ${albums[editingAlbumIdx]?.title}` : 'Add New Discography Release'}
                    </span>
                    {editingAlbumIdx !== null && (
                      <button
                        type="button"
                        onClick={resetReleaseInputs}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white"
                      >
                        Cancel & Switch to New Release
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Release Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Epitaph, Homicidal Ecstasy..."
                        value={releaseTitle}
                        onChange={(e) => setReleaseTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Year Released</label>
                      <input
                        type="text"
                        placeholder="e.g. 2004"
                        value={releaseYear}
                        onChange={(e) => setReleaseYear(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Format Type</label>
                      <select
                        value={releaseType}
                        onChange={(e) => setReleaseType(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-200 outline-none focus:border-amber-500"
                      >
                        <option value="album">Full Album</option>
                        <option value="ep">EP</option>
                        <option value="single">Single</option>
                        <option value="demo">Demo</option>
                      </select>
                    </div>
                  </div>

                  {/* Label / Catalog ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Record Label / Release Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Relapse Records, Willowtip, Century Media..."
                        value={releaseLabel}
                        onChange={(e) => setReleaseLabel(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase">Catalog Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. RR-6623, CM-19439..."
                        value={releaseCatalogId}
                        onChange={(e) => setReleaseCatalogId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Cover Artwork Uploader (to Supabase 'releases' bucket) */}
                  <div className="p-3 bg-black/40 border border-zinc-850 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-750 overflow-hidden flex items-center justify-center shrink-0">
                        {releaseImageUrl ? (
                          <img src={releaseImageUrl} alt="Album Art" className="w-full h-full object-cover" />
                        ) : (
                          <Disc className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-300">Album Cover Artwork</div>
                        <div className="text-[9px] text-zinc-500 font-mono">
                          Saved directly into Supabase 'releases' storage bucket
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-3 h-3" />
                        <span>{isUploadingAlbumImg ? 'Uploading...' : releaseImageUrl ? 'Change Artwork' : 'Upload From Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDeviceFileUpload(file, 'releases', 'album-cover', (url) => setReleaseImageUrl(url), setIsUploadingAlbumImg);
                            }
                          }}
                        />
                      </label>
                      {releaseImageUrl && (
                        <button
                          type="button"
                          onClick={() => setReleaseImageUrl('')}
                          className="text-[9px] font-mono text-zinc-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tracklist Editor for this Release */}
                  <div className="p-3 bg-black/60 border border-zinc-850 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                        <ListMusic className="w-3.5 h-3.5 text-amber-400" /> Tracklist ({releaseTracks.length} tracks)
                      </span>
                    </div>

                    {/* Add Track Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Track title (e.g. Stabwound, Foul Body Autopsy)..."
                        value={newTrackTitle}
                        onChange={(e) => setNewTrackTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTrackToRelease();
                          }
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="3:45"
                        value={newTrackDuration}
                        onChange={(e) => setNewTrackDuration(e.target.value)}
                        className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTrackToRelease}
                        disabled={!newTrackTitle.trim()}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-amber-400 font-mono font-bold text-xs uppercase cursor-pointer"
                      >
                        + Add Track
                      </button>
                    </div>

                    {/* Current tracks list */}
                    {releaseTracks.length > 0 && (
                      <div className="space-y-1 pt-1 max-h-40 overflow-y-auto pr-1">
                        {releaseTracks.map((trk, tIdx) => (
                          <div
                            key={`trk-${tIdx}-${trk.title || 'untitled'}`}
                            className="flex items-center justify-between p-1.5 px-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] text-zinc-500 w-4 font-bold">{tIdx + 1}.</span>
                              <span className="truncate text-white font-medium">{trk.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-zinc-400">{trk.duration || '3:30'}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTrack(tIdx)}
                                className="text-zinc-500 hover:text-red-400 p-0.5"
                                title="Remove track"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Release Action */}
                  <div className="flex justify-end gap-2 pt-1">
                    {editingAlbumIdx !== null && (
                      <button
                        type="button"
                        onClick={resetReleaseInputs}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs uppercase"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveRelease}
                      disabled={!releaseTitle.trim()}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {editingAlbumIdx !== null ? 'Update Release in Catalog' : 'Add Release to Catalog'}
                    </button>
                  </div>
                </div>

                {/* Discography List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase">
                    <span>Curated Discography Catalog ({albums.length})</span>
                    <span className="text-[10px] text-zinc-500">Each entry is editable and pushes to Supabase 'releases' table</span>
                  </div>

                  {albums.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs font-mono">
                      No releases in catalog. Use the form above to add full albums, EPs, singles, or demos with tracklists.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {albums.map((alb, i) => (
                        <div
                          key={alb.id ? `alb-${alb.id}-${i}` : `alb-${i}`}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            editingAlbumIdx === i
                              ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : 'bg-zinc-950/80 border-zinc-850 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-black/60 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0 shadow">
                              {alb.image_url ? (
                                <img src={alb.image_url} alt={alb.title} className="w-full h-full object-cover" />
                              ) : (
                                <Disc className="w-5 h-5 text-zinc-600" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate font-display">{alb.title}</span>
                                <span className="uppercase text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  {alb.type || 'album'}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>{alb.year}</span>
                                {alb.label && <span>• {alb.label}</span>}
                                {alb.catalog_id && <span>• Cat #{alb.catalog_id}</span>}
                              </div>
                              <div className="text-[9px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                                <span>🎵 {alb.tracks?.length || 0} tracks recorded</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleLoadReleaseForEdit(i)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3" /> Edit Release
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveAlbum(i)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 cursor-pointer transition-colors"
                              title="Delete release"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBandCuratorModal;
