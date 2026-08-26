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
  ChevronUp,
  ArrowLeft
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
  const [activePage, setActivePage] = useState<'list' | 'editor'>('list');
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
  const [newTrackLyrics, setNewTrackLyrics] = useState('');
  const [showNewTrackLyricsInput, setShowNewTrackLyricsInput] = useState(false);

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
        setActivePage('editor');
      } else {
        resetForm();
        setActivePage('list');
      }
    }
  }, [isOpen, initialBand]);

  useEffect(() => {
    const handleUpdate = () => {
      const freshList = communityBandManager.getAll();
      if (freshList && freshList.length > 0) {
        setBandsList(freshList);
      }
    };
    window.addEventListener('nexus_community_bands_updated', handleUpdate);
    window.addEventListener('nexus_avatar_updated', handleUpdate);
    return () => {
      window.removeEventListener('nexus_community_bands_updated', handleUpdate);
      window.removeEventListener('nexus_avatar_updated', handleUpdate);
    };
  }, []);

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
    setAvatarUrl(band.avatar_url || band.logo_url || (band as any).avatar || (band as any).image || '');
    setCoverUrl(band.cover_url || band.banner_url || (band as any).cover || (band as any).banner || '');
    setSpotifyUrl(band.spotify_url || '');
    setBandcampUrl(band.bandcamp_url || '');
    setMetalArchivesUrl(band.metal_archives_url || '');
    setYoutubeUrl(band.youtube_url || band.featured_youtube_url || '');
    setCuratorHandle(band.curated_by || (userProfile?.console_handle || userProfile?.handle || '@community_archivist'));
    setLineup(band.lineup || []);
    setAlbums([...(band.discography || [])].sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0')));
    setEditingAlbumIdx(null);
    setEditingMemberIdx(null);
    resetReleaseInputs();
    setActivePage('editor');
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
    setActivePage('editor');
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
    setNewTrackLyrics('');
    setShowNewTrackLyricsInput(false);
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
    setReleaseType((['album', 'ep', 'single', 'demo'].includes((alb.type || '').toLowerCase()) ? (alb.type.toLowerCase() as any) : 'album'));
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

    let updated = [...albums];
    if (editingAlbumIdx !== null) {
      updated[editingAlbumIdx] = releaseData;
    } else {
      updated.push(releaseData);
    }
    updated.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0'));
    setAlbums(updated);

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
      duration: newTrackDuration.trim() || '3:30',
      lyrics: newTrackLyrics.trim() || undefined
    };
    setReleaseTracks([...releaseTracks, newTrack]);
    setNewTrackTitle('');
    setNewTrackDuration('');
    setNewTrackLyrics('');
    setShowNewTrackLyricsInput(false);
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
        logo_url: avatarUrl,
        avatar: avatarUrl,
        image: avatarUrl,
        cover_url: coverUrl,
        banner_url: coverUrl,
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
      
      // Return to archives list after successful save
      setTimeout(() => {
        setActivePage('list');
      }, 1000);
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
    <div className="fixed inset-0 z-[1000005] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#090a0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-[88vh]">
        
        {/* Global Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-850 bg-gradient-to-r from-zinc-950 via-zinc-900/70 to-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wide">
                  Community Band Archivist Hub
                </h3>
                <span className="hidden sm:inline-block text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  SUPABASE SYNCED
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-sans">
                {activePage === 'list' 
                  ? 'Select an existing archive or create a new community band profile.'
                  : (isCreatingNew ? 'Creating New Archive' : `Editing: ${selectedBand?.name || 'Band'}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePage === 'editor' && (
              <button
                onClick={() => setActivePage('list')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-mono text-xs font-bold uppercase flex items-center gap-1.5 border border-zinc-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Archives List</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PAGE 1: EXISTING ARCHIVES LIST (Explorer) */}
        {activePage === 'list' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-950/40">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Existing Archives ({bandsList.length})
                </h4>
                <p className="text-xs text-zinc-400">
                  Tap any archive to open the mobile-optimized editor, or create a brand new fan archive.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Band Archive
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by band name, genre, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white placeholder-zinc-500 outline-none focus:border-amber-500/60 shadow-inner"
              />
            </div>

            {/* Band Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
              {filteredBands.map((band, bIdx) => (
                <button
                  key={band.id ? `band-${band.id}-${bIdx}` : `band-${bIdx}`}
                  onClick={() => populateForm(band)}
                  className="w-full text-left p-3.5 sm:p-4 rounded-xl border bg-zinc-900/60 border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-900 transition-all flex items-center gap-3.5 cursor-pointer shadow-sm group"
                >
                  <img
                    src={band.avatar_url || band.logo_url || (band as any).avatar || (band as any).image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=120'}
                    alt={band.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-750 shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=120';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white truncate font-display group-hover:text-amber-300 transition-colors">
                        {band.name}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        band.verification_status === 'verified_official'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                      }`}>
                        {band.verification_status === 'verified_official' ? 'VERIFIED' : 'FAN ARCHIVE'}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 truncate font-mono mt-1">
                      {band.genre} • {band.city || band.country || 'Global'}
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono mt-1.5 flex items-center gap-3">
                      <span>💿 {band.discography?.length || 0} releases</span>
                      <span>👥 {band.lineup?.length || 0} members</span>
                      <span className="text-amber-400 font-bold ml-auto group-hover:underline">Edit Archive →</span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredBands.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-2xl">
                  No band archives found matching "{searchQuery}". Click "New Band Archive" above to add one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 2: EDITOR & CREATOR PAGE */}
        {activePage === 'editor' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#090a0f]">
            
            {/* Top Sub-navigation Tabs */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-850 bg-zinc-950/80 shrink-0 overflow-x-auto gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" /> Overview
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
                  <Users className="w-3.5 h-3.5" /> Lineup ({lineup.length})
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
                  <Disc className="w-3.5 h-3.5" /> Discography ({albums.length})
                </button>
              </div>

              {savedFeedback && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in shrink-0">
                  <Check className="w-3.5 h-3.5" /> Saved & Synced!
                </span>
              )}
            </div>

            {/* Scrollable Editor Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
              
              {/* TAB 1: OVERVIEW & MEDIA */}
              {activeTab === 'overview' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Band / Artist Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Gorguts, Dying Fetus..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Primary Genre</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical Death Metal..."
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Founded Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 1991"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Subgenres (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="Slam, Goregrind, Groove..."
                        value={subgenres}
                        onChange={(e) => setSubgenres(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Record Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Relapse Records, Season of Mist..."
                        value={recordLabel}
                        onChange={(e) => setRecordLabel(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Montreal..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">State / Province</label>
                      <input
                        type="text"
                        placeholder="e.g. Quebec, MD..."
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Country</label>
                      <input
                        type="text"
                        placeholder="USA, Canada, Germany..."
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Band History & Biography</label>
                    <textarea
                      rows={2}
                      placeholder="Origins, classic lineup, signature sound..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-sans shadow-inner"
                    />
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        <span>Featured YouTube URL</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* Uploaders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1.5 bg-zinc-950 border border-zinc-850 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Avatar / Logo</span>
                        </label>
                        {isUploadingAvatar && (
                          <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Uploading...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-zinc-600 font-mono text-[9px]">NO IMG</span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase cursor-pointer transition-colors shadow-sm">
                            <Upload className="w-3 h-3" />
                            <span>Upload Avatar</span>
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
                              className="text-[9px] font-mono text-zinc-500 hover:text-red-400 text-left"
                            >
                              Remove avatar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-zinc-950 border border-zinc-850 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cover Banner</span>
                        </label>
                        {isUploadingCover && (
                          <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Uploading...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                          {coverUrl ? (
                            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-zinc-600 font-mono text-[9px]">NO BANNER</span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase cursor-pointer transition-colors shadow-sm">
                            <Upload className="w-3 h-3" />
                            <span>Upload Banner</span>
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
                              className="text-[9px] font-mono text-zinc-500 hover:text-red-400 text-left"
                            >
                              Remove banner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Spotify URL</label>
                      <input
                        type="text"
                        placeholder="https://open.spotify.com/artist/..."
                        value={spotifyUrl}
                        onChange={(e) => setSpotifyUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Bandcamp URL</label>
                      <input
                        type="text"
                        placeholder="https://band.bandcamp.com"
                        value={bandcampUrl}
                        onChange={(e) => setBandcampUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Metal Archives URL</label>
                      <input
                        type="text"
                        placeholder="https://metal-archives.com/..."
                        value={metalArchivesUrl}
                        onChange={(e) => setMetalArchivesUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LINEUP */}
              {activeTab === 'lineup' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-amber-400" />
                        {editingMemberIdx !== null ? `Edit Lineup Member #${editingMemberIdx + 1}` : 'Add Band Member'}
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
                          className="text-xs font-mono text-zinc-400 hover:text-white"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Musician Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Trey Williams, Chuck Schuldiner"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Role / Instrument</label>
                        <input
                          type="text"
                          placeholder="e.g. Drums, Vocals"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Years Active</label>
                        <input
                          type="text"
                          placeholder="e.g. 1993–present"
                          value={newMemberYears}
                          onChange={(e) => setNewMemberYears(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">Status:</span>
                        <div className="flex items-center gap-1.5">
                          {(['active', 'past', 'touring'] as const).map((st, idx) => (
                            <button
                              key={`status-${st}-${idx}`}
                              type="button"
                              onClick={() => setNewMemberStatus(st)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-all ${
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
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-black text-xs uppercase cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        {editingMemberIdx !== null ? 'Update Member' : 'Add to Lineup'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Current Lineup List ({lineup.length})</span>
                    {lineup.length === 0 ? (
                      <div className="p-6 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 font-mono text-xs">
                        No lineup members added yet. Use the form above to add members.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lineup.map((mem, mIdx) => (
                          <div
                            key={`mem-${mem.id || 'new'}-${mIdx}`}
                            className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white font-display">{mem.name}</span>
                                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                  mem.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                                  mem.status === 'touring' ? 'bg-blue-950 text-blue-400 border border-blue-500/30' :
                                  'bg-zinc-800 text-zinc-400'
                                }`}>
                                  {mem.status || 'active'}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {mem.role} • {mem.years || 'Present'}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditMember(mIdx)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(mIdx)}
                                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DISCOGRAPHY */}
              {activeTab === 'discography' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5 text-amber-400" />
                        {editingAlbumIdx !== null ? `Edit Release: ${releaseTitle}` : 'Add Album / EP / Demo Release'}
                      </span>
                      {editingAlbumIdx !== null && (
                        <button
                          type="button"
                          onClick={resetReleaseInputs}
                          className="text-[10px] font-mono text-zinc-400 hover:text-white"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Release Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">Release Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Considerated, Effigy of the Forgotten"
                        value={releaseTitle}
                        onChange={(e) => setReleaseTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Release Year & Release Type on the same level */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Release Year</label>
                        <input
                          type="text"
                          placeholder="1991"
                          value={releaseYear}
                          onChange={(e) => setReleaseYear(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Release Type</label>
                        <select
                          value={releaseType}
                          onChange={(e: any) => setReleaseType(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        >
                          <option value="album">Full Album</option>
                          <option value="ep">EP</option>
                          <option value="single">Single</option>
                          <option value="demo">Demo</option>
                        </select>
                      </div>
                    </div>

                    {/* Shrunk Label input & Catalog ID next to it */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Record Label</label>
                        <input
                          type="text"
                          placeholder="Roadrunner"
                          value={releaseLabel}
                          onChange={(e) => setReleaseLabel(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">Catalog ID (Cat #)</label>
                        <input
                          type="text"
                          placeholder="ROAR-019"
                          value={releaseCatalogId}
                          onChange={(e) => setReleaseCatalogId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Album Artwork & Image Uploader */}
                    <div className="space-y-1.5 bg-zinc-900/80 border border-zinc-850 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Release Artwork / Cover Image</span>
                        </label>
                        {isUploadingAlbumImg && (
                          <span className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Uploading...
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                          {releaseImageUrl ? (
                            <img src={releaseImageUrl} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <Disc className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Paste image URL..."
                            value={releaseImageUrl}
                            onChange={(e) => setReleaseImageUrl(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-amber-500"
                          />

                          <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] uppercase cursor-pointer transition-colors shadow-sm">
                            <Upload className="w-3 h-3" />
                            <span>Upload Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleDeviceFileUpload(file, 'releases', 'release-art', (url) => setReleaseImageUrl(url), setIsUploadingAlbumImg);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Tracklist Builder */}
                    <div className="pt-2 border-t border-zinc-850 space-y-2">
                      <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center justify-between">
                        <span>Tracklist ({releaseTracks.length} tracks)</span>
                      </label>

                      {/* Song Title Input Full Width */}
                      <div className="space-y-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850">
                        <input
                          type="text"
                          placeholder="Song Title (Full Width)..."
                          value={newTrackTitle}
                          onChange={(e) => setNewTrackTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />

                        {/* Under it: Duration, Add Lyrics button, Add Track button */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Duration (3:45)"
                            value={newTrackDuration}
                            onChange={(e) => setNewTrackDuration(e.target.value)}
                            className="w-28 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewTrackLyricsInput(!showNewTrackLyricsInput)}
                            className={`px-2.5 py-1.5 rounded-lg border font-mono text-[10px] uppercase font-bold transition-colors ${
                              showNewTrackLyricsInput || newTrackLyrics.trim()
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {newTrackLyrics.trim() ? 'Lyrics Added ✓' : '+ Lyrics'}
                          </button>

                          <button
                            type="button"
                            onClick={handleAddTrackToRelease}
                            disabled={!newTrackTitle.trim()}
                            className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono text-xs uppercase font-bold shadow-sm"
                          >
                            + Track
                          </button>
                        </div>

                        {showNewTrackLyricsInput && (
                          <textarea
                            placeholder="Paste track lyrics here..."
                            value={newTrackLyrics}
                            onChange={(e) => setNewTrackLyrics(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 outline-none focus:border-amber-500"
                          />
                        )}
                      </div>

                      {releaseTracks.length > 0 && (
                        <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto">
                          {releaseTracks.map((tr, tIdx) => (
                            <div key={`track-${tIdx}`} className="bg-zinc-900/60 border border-zinc-800 p-2 rounded-lg text-xs font-mono space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-300 font-bold">{tr.number}. {tr.title} <span className="text-zinc-500 font-normal">({tr.duration})</span></span>
                                <div className="flex items-center gap-2">
                                  {tr.lyrics && <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Lyrics</span>}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTrack(tIdx)}
                                    className="text-zinc-500 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {tr.lyrics && (
                                <p className="text-[10px] text-zinc-400 italic line-clamp-1 pl-3 border-l border-zinc-800">{tr.lyrics}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveRelease}
                        disabled={!releaseTitle.trim()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {editingAlbumIdx !== null ? 'Update Release' : 'Add Release'}
                      </button>
                    </div>
                  </div>

                  {/* Discography List */}
                  <div className="space-y-2 pb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Catalog Releases ({albums.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          // Open Metal Archives Import Modal
                          const event = new CustomEvent('open_metal_archives_import', { detail: { bandId: selectedBand?.id || 'band-1', bandName: name } });
                          window.dispatchEvent(event);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Disc className="w-3.5 h-3.5" /> Import from Metal-Archives
                      </button>
                    </div>
                    {albums.length === 0 ? (
                      <div className="p-6 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs font-mono">
                        No releases added yet. Use the form above to add albums and tracklists.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {albums.map((alb, i) => (
                          <div
                            key={alb.id ? `alb-${alb.id}-${i}` : `alb-${i}`}
                            className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0 shadow">
                                {alb.image_url ? (
                                  <img src={alb.image_url} alt={alb.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Disc className="w-5 h-5 text-zinc-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white truncate font-display">{alb.title}</span>
                                  <span className="uppercase text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    {alb.type || 'album'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                  {alb.year} • {alb.label || 'Independent'} • {alb.tracks?.length || 0} tracks
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleLoadReleaseForEdit(i)}
                                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono uppercase font-bold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAlbum(i)}
                                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Sticky Mobile-First Footer with Save Button */}
            <div className="p-4 border-t border-zinc-850 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-between shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setActivePage('list')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs uppercase font-bold border border-zinc-800"
              >
                ← Back to List
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Sync Archive</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityBandCuratorModal;
