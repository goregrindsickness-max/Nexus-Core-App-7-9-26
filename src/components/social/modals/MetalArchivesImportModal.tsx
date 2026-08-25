import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Disc, Download, CheckSquare, Square, Shield, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { scrapeMetalArchivesBand, MetalArchivesScrapeResult } from '../../../services/metalArchivesScraper';
import { upsertReleasesBatchToDatabase, CatalogRelease } from '../../../services/releasesService';

interface MetalArchivesImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bandId: string;
  bandName?: string;
  onImportSuccess?: (count: number) => void;
}

export const MetalArchivesImportModal: React.FC<MetalArchivesImportModalProps> = ({
  isOpen,
  onClose,
  bandId,
  bandName = 'Nexus Artist',
  onImportSuccess
}) => {
  const [queryUrl, setQueryUrl] = useState(bandName && bandName !== 'Nexus Artist' ? bandName : '');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<MetalArchivesScrapeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<Set<string>>(new Set());
  
  // Filter checkboxes for release categories (Full-length, EP, Split checked by default)
  const [filters, setFilters] = useState<Record<string, boolean>>({
    'Full-length': true,
    'EP': true,
    'Split': true,
    'Demo': false,
    'Live': false,
    'Single': false
  });

  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleFetchScrape = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryUrl.trim()) {
      setErrorMsg('Please enter a band name or Metal-Archives URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await scrapeMetalArchivesBand(queryUrl);
      setScrapeResult(result);

      // Auto-select releases matching the default checked filters (Full-length, EP, Split)
      const initialSelected = new Set<string>();
      result.releases.forEach((rel) => {
        const type = rel.type || 'Full-length';
        if (filters[type]) {
          initialSelected.add(rel.id);
        }
      });
      setSelectedReleaseIds(initialSelected);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to scrape Metal-Archives. Please check URL or query.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (type: string) => {
    const nextFilters = { ...filters, [type]: !filters[type] };
    setFilters(nextFilters);

    if (scrapeResult) {
      const nextSelected = new Set<string>(selectedReleaseIds);
      scrapeResult.releases.forEach((rel) => {
        const rType = rel.type || 'Full-length';
        if (rType === type) {
          if (nextFilters[type]) {
            nextSelected.add(rel.id);
          } else {
            nextSelected.delete(rel.id);
          }
        }
      });
      setSelectedReleaseIds(nextSelected);
    }
  };

  const toggleSelectAll = () => {
    if (!scrapeResult) return;
    if (selectedReleaseIds.size === scrapeResult.releases.length) {
      setSelectedReleaseIds(new Set());
    } else {
      const allIds = new Set(scrapeResult.releases.map((r) => r.id));
      setSelectedReleaseIds(allIds);
    }
  };

  const toggleSelectRelease = (id: string) => {
    const next = new Set(selectedReleaseIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedReleaseIds(next);
  };

  const handleImportSelected = async () => {
    if (!scrapeResult || selectedReleaseIds.size === 0) return;

    setIsImporting(true);
    try {
      const releasesToImport = scrapeResult.releases.filter((r) => selectedReleaseIds.has(r.id));
      const res = await upsertReleasesBatchToDatabase(releasesToImport, bandId);

      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('nexus_core_toast', {
              detail: {
                message: `Successfully imported ${releasesToImport.length} releases from Metal-Archives!`,
                type: 'success'
              }
            })
          );
        }
        if (onImportSuccess) {
          onImportSuccess(releasesToImport.length);
        }
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to upsert releases to database.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Critical error during batch import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500">
              <Disc className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-100">Metal-Archives Discography Scraper & Curator</h2>
              <p className="text-xs text-zinc-400">Import verified band discographies straight into your active catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search/URL Form */}
          <form onSubmit={handleFetchScrape} className="space-y-4">
            <label className="block text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Metal-Archives Band URL or Search Query
            </label>
            <div className="space-y-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={queryUrl}
                  onChange={(e) => setQueryUrl(e.target.value)}
                  placeholder="e.g., https://www.metal-archives.com/bands/Necrophagist/240 or Suffocation"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/25 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scraping Metal-Archives...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Fetch Discography</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 pt-0.5">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              Includes polite request throttling and browser header simulation to prevent 403 blocks.
            </p>
          </form>

          {errorMsg && (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="text-xs mt-0.5 text-red-200">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Staged Preview Section */}
          {scrapeResult && (
            <div className="space-y-5 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-100">{scrapeResult.bandName}</h3>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md text-xs font-medium">
                      {scrapeResult.country}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{scrapeResult.genre}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Scraped Releases</p>
                    <p className="text-sm font-bold text-zinc-200">{scrapeResult.releases.length} found</p>
                  </div>
                  <div className="h-8 w-px bg-zinc-800" />
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Selected for Import</p>
                    <p className="text-sm font-bold text-red-400">{selectedReleaseIds.size} ready</p>
                  </div>
                </div>
              </div>

              {/* Filter Checkboxes */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Filter by Release Type</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(filters).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
                        filters[type]
                          ? 'bg-red-600/10 border-red-500/30 text-red-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${filters[type] ? 'bg-red-500' : 'bg-zinc-700'}`} />
                      {type}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Release List / Table */}
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                    >
                      {selectedReleaseIds.size === scrapeResult.releases.length ? (
                        <CheckSquare className="w-4 h-4 text-red-500" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500" />
                      )}
                      <span>Toggle All</span>
                    </button>
                  </div>
                  <span>Release Title, Type & Year</span>
                </div>

                <div className="divide-y divide-zinc-800/60 max-h-80 overflow-y-auto">
                  {scrapeResult.releases.map((rel) => {
                    const isSelected = selectedReleaseIds.has(rel.id);
                    return (
                      <div
                        key={rel.id}
                        onClick={() => toggleSelectRelease(rel.id)}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-zinc-900/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-red-950/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-zinc-400">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-red-500" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </button>
                          <div>
                            <p className="text-sm font-medium text-zinc-100">{rel.title}</p>
                            <p className="text-xs text-zinc-500">{rel.label || 'Underground'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            rel.type === 'Full-length'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : rel.type === 'EP'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {rel.type}
                          </span>
                          <span className="text-xs font-mono text-zinc-400 w-12 text-right">
                            {rel.release_date || rel.releaseDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!scrapeResult || selectedReleaseIds.size === 0 || isImporting}
            onClick={handleImportSelected}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium text-xs rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Importing to Supabase...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Import Selected Releases ({selectedReleaseIds.size})</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
