import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { usePinchZoom } from '../../../hooks/usePinchZoom';

export interface PhotoLightboxModalProps {
  previewImage: string | null;
  setPreviewImage: (val: string | null) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  previewImage,
  setPreviewImage,
}) => {
  const {
    scale,
    setScale,
    reset,
    zoomIn,
    zoomOut,
    containerProps,
    imageStyle,
  } = usePinchZoom({ minScale: 1, maxScale: 4 });

  useEffect(() => {
    if (previewImage) {
      reset();
    }
  }, [previewImage, reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPreviewImage]);

  return (
    <AnimatePresence>
      {previewImage && (
        <motion.div
          key="photo-lightbox-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999999] bg-black/95 backdrop-blur-md flex flex-col justify-between items-center py-4 px-4 select-none overflow-hidden"
        >
          {/* Top Toolbar */}
          <div className="w-full flex items-center justify-between max-w-4xl z-20 bg-zinc-950/80 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800/80 shadow-xl">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-white">Signal Photo Inspection</span>
              <span className="text-[10px] text-zinc-500 font-mono">Pinch / Scroll to zoom • Drag to pan • Double-tap to toggle</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Close Photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Viewport for Image */}
          <div
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-2 relative"
            {...containerProps}
          >
            <img
              src={previewImage}
              alt="Preview attachment"
              referrerPolicy="no-referrer"
              className={`max-h-[75vh] max-w-[95vw] object-contain select-none ${
                scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
              }`}
              style={imageStyle}
              draggable={false}
            />
          </div>

          {/* Bottom Scale Slider controls */}
          <div className="w-full max-w-md z-20 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-3 flex items-center gap-4 shadow-xl">
            <button
              onClick={() => zoomOut(0.5)}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center font-black text-white hover:text-rose-400 transition-colors border border-zinc-800 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="flex-1 flex flex-col gap-1 items-center">
              <div className="flex justify-between w-full text-[9px] font-mono text-zinc-400 uppercase font-bold">
                <span>ZOOM MAGNIFICATION</span>
                <span className="text-rose-400">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => zoomIn(0.5)}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center font-black text-white hover:text-rose-400 transition-colors border border-zinc-800 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
