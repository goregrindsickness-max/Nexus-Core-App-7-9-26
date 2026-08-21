import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Send, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { usePinchZoom } from '../../../../hooks/usePinchZoom';

interface FeedMediaLightboxModalProps {
  lightbox: { images: string[]; index: number };
  onClose: () => void;
  onSetIndex: (index: number) => void;
}

export const FeedMediaLightboxModal: React.FC<FeedMediaLightboxModalProps> = ({
  lightbox,
  onClose,
  onSetIndex,
}) => {
  const {
    scale,
    reset,
    zoomIn,
    zoomOut,
    containerProps,
    imageStyle,
  } = usePinchZoom({ minScale: 1, maxScale: 4 });

  // Reset zoom on index or modal change
  useEffect(() => {
    reset();
  }, [lightbox.index, reset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && lightbox.index > 0 && scale <= 1.05) {
        onSetIndex(lightbox.index - 1);
      } else if (e.key === 'ArrowRight' && lightbox.index < lightbox.images.length - 1 && scale <= 1.05) {
        onSetIndex(lightbox.index + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.index, lightbox.images.length, scale, onClose, onSetIndex]);

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full h-full max-w-7xl flex items-center justify-center pointer-events-none">
        {/* Top Control Bar with Close & Zoom Controls */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
          {/* Zoom Controls Bar */}
          <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg">
            <button 
              onClick={() => zoomOut(0.5)}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-zinc-300 px-1 min-w-[34px] text-center select-none">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => zoomIn(0.5)}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {scale > 1.05 && (
              <button 
                onClick={reset}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors border border-white/10 shadow-lg cursor-pointer"
            title="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Button */}
        {lightbox.index > 0 && scale <= 1.1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSetIndex(lightbox.index - 1); }}
            className="absolute left-3 sm:left-6 z-40 p-3 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-white transition-colors border border-white/10 shadow-lg pointer-events-auto cursor-pointer"
            title="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {lightbox.index < lightbox.images.length - 1 && scale <= 1.1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSetIndex(lightbox.index + 1); }}
            className="absolute right-3 sm:right-6 z-40 p-3 rounded-full bg-zinc-900/70 hover:bg-zinc-800 text-white transition-colors border border-white/10 shadow-lg pointer-events-auto cursor-pointer"
            title="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image Stage Container */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden pointer-events-auto"
          {...containerProps}
        >
          <img 
            src={lightbox.images[lightbox.index]} 
            alt={`Lightbox image ${lightbox.index + 1}`} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/High%20energy%20live%20music%20concert%201.png';
            }}
            className={`max-w-full max-h-[82vh] object-contain rounded-sm shadow-2xl select-none ${
              scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
            style={imageStyle}
            draggable={false}
          />
          
          {/* Image Counter */}
          {lightbox.images.length > 1 && scale <= 1.1 && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-white/10 text-white font-mono text-xs tracking-wider shadow-lg">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>

        {/* Comments Panel (Right Side on Desktop, Hidden on Mobile for clean viewing) */}
        <div className="hidden xl:flex absolute right-0 top-16 bottom-16 w-80 bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-2xl flex-col overflow-hidden pointer-events-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-white/10 bg-zinc-900/50">
            <h3 className="text-white font-mono font-bold uppercase tracking-widest text-xs">Signal Discourse</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Live comments feed */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 border border-white/5 flex items-center justify-center font-bold text-xs text-rose-500">M</div>
              <div>
                <span className="text-white text-xs font-bold mr-2">metalhead99</span>
                <span className="text-zinc-500 text-[10px] font-mono">2h ago</span>
                <p className="text-zinc-300 text-xs mt-1">This composition is insane!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 border border-white/5 flex items-center justify-center font-bold text-xs text-purple-500">S</div>
              <div>
                <span className="text-white text-xs font-bold mr-2">shutterbug</span>
                <span className="text-zinc-500 text-[10px] font-mono">1h ago</span>
                <p className="text-zinc-300 text-xs mt-1">What lens did you use for this? The lighting is perfectly captured.</p>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-white/10 bg-zinc-900/50">
            <div className="flex items-center gap-2 bg-black/60 rounded-xl border border-white/10 p-2">
              <input type="text" placeholder="Add a comment..." className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder-zinc-500" />
              <button className="text-rose-500 hover:text-rose-400 p-1">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
