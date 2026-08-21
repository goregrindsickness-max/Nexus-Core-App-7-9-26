import React from 'react';
import { BarChart2, Clock, ChevronRight, Lock, Trophy, CheckCircle, Check } from 'lucide-react';
import { FeedPost, PollEmbedData, PollOption } from '../TimelineFeed';

export interface PollWidgetProps {
  post: FeedPost;
  pollVote?: { optionId: string; totalVotes: number; options: PollOption[] };
  onVote: (optionId: string, pollData: PollEmbedData) => void;
}

export const PollWidget: React.FC<PollWidgetProps> = ({
  post,
  pollVote,
  onVote,
}) => {
  if (!post.pollData) return null;

  const pollVotes: Record<string, { optionId: string; totalVotes: number; options: PollOption[] }> = pollVote 
    ? { [post.id]: pollVote } 
    : {};

  const handleVotePoll = (postId: string, optionId: string, pollData: PollEmbedData) => {
    onVote(optionId, pollData);
  };

  return (
    <div className="bg-[#07080a] border border-amber-500/30 rounded-xl p-3.5 sm:p-4 my-2.5 space-y-3 shadow-inner relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-black uppercase tracking-wider min-w-0 flex-1 overflow-hidden">
          <BarChart2 className="w-4 h-4 text-amber-400 shrink-0" />
          {post.pollData.question.length > 28 ? (
            <div className="overflow-hidden flex items-center min-w-0 flex-1">
              <div className="animate-marquee-smooth gap-3 shrink-0">
                <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">{post.pollData.question}</span>
                <span className="text-xs font-mono font-black text-amber-600 uppercase tracking-wider">•</span>
                <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">{post.pollData.question}</span>
                <span className="text-xs font-mono font-black text-amber-600 uppercase tracking-wider">•</span>
              </div>
            </div>
          ) : (
            <span className="truncate">{post.pollData.question}</span>
          )}
        </div>

        {/* Poll Badges: Timed Countdown + Unbiased / Live status */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(() => {
            const nowMs = Date.now();
            const expiresAtMs = post.pollData.expiresAt ? new Date(post.pollData.expiresAt).getTime() : null;
            const isExpired = Boolean(expiresAtMs && nowMs >= expiresAtMs);

            const getRemainingText = (isoStr?: string) => {
              if (!isoStr) return null;
              const diff = new Date(isoStr).getTime() - Date.now();
              if (diff <= 0) return 'CLOSED';
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const days = Math.floor(hours / 24);
              const remHours = hours % 24;
              const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              if (days > 0) return `${days}d ${remHours}h left`;
              if (hours > 0) return `${hours}h ${mins}m left`;
              return `${mins}m left`;
            };

            return (
              <>
                {/* Timed poll status badge */}
                {post.pollData.expiresAt && (
                  <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                    isExpired
                      ? 'text-rose-400 bg-rose-950/80 border border-rose-500/50'
                      : 'text-amber-300 bg-amber-950/90 border border-amber-500/60 animate-pulse'
                  }`}>
                    <Clock className="w-2.5 h-2.5" />
                    {isExpired ? 'CLOSED' : getRemainingText(post.pollData.expiresAt)}
                  </span>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {(() => {
        const currentVote = pollVotes[post.id];
        const hasVoted = Boolean(currentVote);
        const nowMs = Date.now();
        const expiresAtMs = post.pollData.expiresAt ? new Date(post.pollData.expiresAt).getTime() : null;
        const isExpired = Boolean(expiresAtMs && nowMs >= expiresAtMs);
        const revealResults = hasVoted || isExpired;

        const optionsList = currentVote ? currentVote.options : post.pollData.options;
        const totalVotes = currentVote ? currentVote.totalVotes : (post.pollData.totalVotes || optionsList.reduce((a, b) => a + b.votes, 0));

        // Calculate max votes for leading indicator (#1 in yellow/amber)
        const maxVotes = Math.max(...optionsList.map(o => o.votes));

        return (
          <div className="space-y-2">
            {/* If NOT voted and NOT expired, show clean unbiased voting buttons */}
            {!revealResults ? (
              <div className="space-y-2">
                {optionsList.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleVotePoll(post.id, opt.id, post.pollData!)}
                    className="w-full relative group overflow-hidden rounded-xl border border-purple-900/30 bg-zinc-950/90 hover:bg-amber-950/20 hover:border-amber-500/70 p-3 text-left transition-all cursor-pointer shadow hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-600 group-hover:border-amber-400 flex items-center justify-center shrink-0 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-amber-400 transition-colors" />
                        </div>
                        <span className="text-zinc-200 group-hover:text-white transition-colors truncate">{opt.text}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 group-hover:text-amber-400 font-mono uppercase tracking-wider font-bold transition-colors flex items-center gap-1 shrink-0">
                        Cast Vote <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>
                ))}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Lock className="w-3 h-3 text-amber-500/80" /> Results hidden to prevent voting bias
                  </span>
                  <span>{totalVotes} total votes</span>
                </div>
              </div>
            ) : (
              /* If VOTED or EXPIRED, reveal live results with animations & leading answer in yellow! */
              <div className="space-y-2 animate-in fade-in duration-500">
                {optionsList.map((opt) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const isVoted = currentVote?.optionId === opt.id;
                  const isLeading = opt.votes === maxVotes && maxVotes > 0;

                  return (
                    <div
                      key={opt.id}
                      className={`w-full relative overflow-hidden rounded-xl border text-left p-3 transition-all ${
                        isLeading
                          ? 'bg-[#0f0d06] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : isVoted
                          ? 'bg-rose-950/40 border-rose-500/80'
                          : 'bg-zinc-950/80 border-purple-900/30 text-zinc-300'
                      }`}
                    >
                      {/* Animated progress bar fill — NO white stroke for unpicked options */}
                      <div
                        className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out ${
                          isLeading
                            ? 'bg-amber-500/35 border-r-2 border-amber-400'
                            : isVoted
                            ? 'bg-rose-500/25 border-r-2 border-rose-400/50'
                            : 'bg-zinc-800/30'
                        }`}
                        style={{ width: `${pct}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between font-mono text-xs font-bold gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {isLeading ? (
                            <Trophy className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                          ) : isVoted ? (
                            <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : (
                            <BarChart2 className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className={`truncate ${isLeading ? 'text-amber-200 font-extrabold' : 'text-zinc-200'}`}>
                            {opt.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isLeading && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/80 text-amber-300 text-[9px] font-mono font-black uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-in zoom-in-75 duration-300">
                              <Trophy className="w-2.5 h-2.5 text-amber-400 fill-amber-400/30" /> #1 LEADER
                            </span>
                          )}
                          {isVoted && !isLeading && (
                            <span className="text-[9px] font-mono font-bold text-rose-300 bg-rose-950 border border-rose-500/60 px-1.5 py-0.5 rounded">
                              YOUR VOTE
                            </span>
                          )}
                          <span className={`text-xs font-mono font-black ${isLeading ? 'text-amber-400' : 'text-zinc-300'}`}>
                            {pct}% ({opt.votes})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60 animate-in fade-in duration-700">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    {isExpired ? (
                      <>
                        <Lock className="w-3 h-3 text-rose-400" /> Voting deadline passed • Final tally
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" /> Vote recorded • Live results revealed
                      </>
                    )}
                  </span>
                  <span className="text-zinc-400">{totalVotes} total network votes</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
