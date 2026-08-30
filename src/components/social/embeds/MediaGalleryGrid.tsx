import React from 'react';
import { Camera, Maximize2, Sparkles } from 'lucide-react';

interface MediaGalleryGridProps {
  images?: string[];
  imageUrl?: string;
  onOpenLightbox: (images: string[], index: number) => void;
}

export const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({
  images,
  imageUrl,
  onOpenLightbox,
}) => {
  if (images && images.length > 0) {
    if (images.length === 1) {
      return (
        <div 
          className="mb-3 relative group rounded-2xl overflow-hidden border border-zinc-800 bg-black max-h-[440px] flex items-center justify-center cursor-pointer shadow-xl transition-all"
          onClick={() => onOpenLightbox(images, 0)}
        >
          <img 
            src={images[0]} 
            alt="Media" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
            }}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
          />

          {/* High-Res Tag & Zoom Hint */}
          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 shadow-md">
            <Camera className="w-3 h-3 text-purple-400" />
            <span className="font-bold">4K Pit Master</span>
          </div>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-white font-mono text-xs shadow-2xl">
              <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Inspect High-Res & EXIF</span>
            </div>
          </div>
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-[3/2] cursor-pointer shadow-xl">
          {images.map((img, i) => (
            <div key={`mg-2-${i}-${img.slice(0, 15)}`} className="relative h-full group overflow-hidden" onClick={() => onOpenLightbox(images, i)}>
              <img 
                src={img} 
                alt={`Media ${i}`} 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
                #{i + 1}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-square cursor-pointer shadow-xl">
          <div className="relative h-full group overflow-hidden" onClick={() => onOpenLightbox(images, 0)}>
            <img 
              src={images[0]} 
              alt="Media 0" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
              #1
            </div>
          </div>
          <div className="grid grid-rows-2 gap-1.5 h-full">
            {images.slice(1, 3).map((img, i) => (
              <div key={`mg-3-${i + 1}-${img.slice(0, 15)}`} className="relative h-full group overflow-hidden" onClick={() => onOpenLightbox(images, i + 1)}>
                <img 
                  src={img} 
                  alt={`Media ${i + 1}`} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
                  #{i + 2}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3 grid grid-cols-2 grid-rows-2 gap-1.5 rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-square cursor-pointer shadow-xl">
        {images.slice(0, 4).map((img, i) => (
          <div key={`mg-4-${i}-${img.slice(0, 15)}`} className="relative h-full group overflow-hidden" onClick={() => onOpenLightbox(images, i)}>
            <img 
              src={img} 
              alt={`Media ${i}`} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
              #{i + 1}
            </div>
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center hover:bg-black/65 transition-colors">
                <span className="text-white font-mono font-black text-2xl">+{images.length - 4}</span>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest mt-0.5 font-bold">More Shots</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div 
        className="mb-3 relative group rounded-2xl overflow-hidden border border-zinc-800 bg-black max-h-[440px] flex items-center justify-center cursor-pointer shadow-xl transition-all"
        onClick={() => onOpenLightbox([imageUrl], 0)}
      >
        <img 
          src={imageUrl} 
          alt="Media" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
          }}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
        />
        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 shadow-md">
          <Camera className="w-3 h-3 text-purple-400" />
          <span className="font-bold">4K Pit Master</span>
        </div>
      </div>
    );
  }

  return null;
};
