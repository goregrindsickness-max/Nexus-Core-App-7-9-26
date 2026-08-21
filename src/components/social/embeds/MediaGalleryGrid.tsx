import React from 'react';

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
          className="mb-3 rounded-xl overflow-hidden border border-zinc-800 bg-black max-h-[420px] flex items-center justify-center cursor-pointer"
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
            className="w-full h-full object-cover" 
          />
        </div>
      );
    }
    if (images.length === 2) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-[3/2] cursor-pointer">
          {images.map((img, i) => (
            <div key={i} className="h-full" onClick={() => onOpenLightbox(images, i)}>
              <img 
                src={img} 
                alt={`Media ${i}`} 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
                }}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
              />
            </div>
          ))}
        </div>
      );
    }
    if (images.length === 3) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-square cursor-pointer">
          <div className="h-full" onClick={() => onOpenLightbox(images, 0)}>
            <img 
              src={images[0]} 
              alt="Media 0" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-full">
            {images.slice(1, 3).map((img, i) => (
              <div key={i + 1} className="h-full" onClick={() => onOpenLightbox(images, i + 1)}>
                <img 
                  src={img} 
                  alt={`Media ${i + 1}`} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
                  }}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="mb-3 grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-square cursor-pointer">
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="relative h-full" onClick={() => onOpenLightbox(images, i)}>
            <img 
              src={img} 
              alt={`Media ${i}`} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity" 
            />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center hover:bg-black/60 transition-colors">
                <span className="text-white font-mono font-black text-2xl">+{images.length - 4}</span>
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
        className="mb-3 rounded-xl overflow-hidden border border-zinc-800 bg-black max-h-[420px] flex items-center justify-center cursor-pointer"
        onClick={() => onOpenLightbox([imageUrl], 0)}
      >
        <img 
          src={imageUrl} 
          alt="Broadcast Media" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800';
          }}
          className="w-full h-full object-cover" 
        />
      </div>
    );
  }

  return null;
};
