import React from 'react';
import { Music, MessageSquare, Heart, Share2, Repeat, Sparkles } from 'lucide-react';
import { formatPostTimestamp } from '../../utils/socialFeedUtils';

export interface FeedPost {
  id: string;
  author?: {
    name?: string;
    avatar?: string;
    role?: string;
    consoleHandle?: string;
  };
  content?: string;
  text?: string;
  media_url?: string;
  image?: string;
  images?: string[];
  timestamp?: string;
  timeAgo?: string;
  created_at?: string;
  likes?: number;
  commentsCount?: number;
  comments?: any[];
  tag?: string;
}

export const isAudioUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return (
    cleanUrl.endsWith('.mp3') ||
    cleanUrl.endsWith('.wav') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.m4a') ||
    cleanUrl.endsWith('.flac') ||
    cleanUrl.includes('audio') ||
    cleanUrl.includes('audio/')
  );
};

interface FeedItemProps {
  post: FeedPost;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (post: FeedPost) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({
  post,
  onLike,
  onComment,
  onShare
}) => {
  const mediaUrl = post.media_url || post.image || (post.images && post.images.length > 0 ? post.images[0] : undefined);
  const textContent = post.content || post.text || '';
  const authorName = post.author?.name || 'Operator';
  const authorAvatar = post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  const timeDisplay = formatPostTimestamp(post, post.created_at || post.timestamp);

  return (
    <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 shadow-lg mb-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border border-zinc-800"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-zinc-100">{authorName}</span>
              {post.author?.role && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-900/50 uppercase font-bold">
                  {post.author.role}
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-zinc-500">{timeDisplay}</p>
          </div>
        </div>

        {post.tag && (
          <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 uppercase">
            {post.tag}
          </span>
        )}
      </div>

      {/* Content */}
      {textContent && (
        <p className="text-xs text-zinc-200 leading-relaxed mb-3 whitespace-pre-line font-sans">
          {textContent}
        </p>
      )}

      {/* Media Attachment */}
      {mediaUrl && (
        <>
          {isAudioUrl(mediaUrl) ? (
            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg my-2 flex items-center gap-3">
              <Music className="w-5 h-5 text-rose-500 shrink-0" />
              <audio controls className="w-full h-8 rounded accent-rose-500">
                <source src={mediaUrl} />
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-zinc-900/80 bg-zinc-950 my-2">
              <img
                src={mediaUrl}
                alt="Post Media"
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}
        </>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-900/80 text-zinc-500 text-xs mt-3">
        <button
          onClick={() => onLike && onLike(post.id)}
          className="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4" />
          <span className="text-[11px] font-mono">{post.likes || 0}</span>
        </button>

        <button
          onClick={() => onComment && onComment(post.id)}
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[11px] font-mono">
            {post.commentsCount || (post.comments ? post.comments.length : 0)}
          </span>
        </button>

        <button
          onClick={() => onShare && onShare(post)}
          className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FeedItem;
