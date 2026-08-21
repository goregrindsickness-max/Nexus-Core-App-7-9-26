import React, { useState, useEffect, useCallback } from 'react';
import { FeedItem } from '../../../data/socialFeedMockData';
import { loadFeedCache, saveFeedCache, getDeletedPostIdsLocal } from '../utils/feedCacheUtils';
import { getSupabase, subscribeToTable } from '../../../supabase';
import { extractYouTubeId } from '../utils/postSyncUtils';

interface UseFeedLocalCacheOptions {
  portalRole: string;
  userProfile?: any;
  defaultFeed?: FeedItem[];
}

export function useFeedLocalCache({
  portalRole,
  userProfile,
  defaultFeed = []
}: UseFeedLocalCacheOptions) {
  const [feed, _setFeed] = useState<FeedItem[]>([]);

  const setFeed = useCallback((action: React.SetStateAction<FeedItem[]>) => {
    _setFeed(prev => {
      return typeof action === 'function' ? (action as Function)(prev) : action;
    });
  }, []);

  // Load feed posts from IndexedDB on mount / user change, then sync with Supabase
  useEffect(() => {
    let active = true;
    const loadFeed = async () => {
      try {
        const storedFeed = await loadFeedCache(portalRole, userProfile?.id);
        if (!active) return;
        let finalFeed = storedFeed || [];

        // Fetch from Supabase
        const supabaseClient = getSupabase();
        if (supabaseClient) {
          try {
            const { data, error } = await supabaseClient
              .from('nexus_posts')
              .select('*, profiles:profile_id(*)')
              .order('created_at', { ascending: false })
              .limit(100);

            if (!error && data) {
              const deletedPosts = getDeletedPostIdsLocal();
              const filteredData = data.filter((item: any) => !deletedPosts.includes(item.id));

              if (filteredData.length > 0) {
                const remoteFeed = filteredData.map((item: any) => {
                  try {
                    const postObj = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});

                    const isSelf = userProfile?.id && (userProfile.id === item.profiles?.id || userProfile.id === item.profile_id);
                    const liveSelfAvatar = isSelf ? (userProfile?.avatar || userProfile?.avatar_url || userProfile?.profile_avatar) : null;
                    const resolvedAvatar = liveSelfAvatar ||
                      item.profiles?.avatar_url ||
                      item.profiles?.avatar ||
                      item.profiles?.profile_avatar ||
                      item.profiles?.profile_image ||
                      postObj.author?.avatar ||
                      postObj.authorAvatar ||
                      (postObj.author?.isYou ? (userProfile?.avatar || userProfile?.avatar_url) : null);

                    const author = item.profiles ? {
                      name: item.profiles.console_handle || item.profiles.full_name || 'Anonymous',
                      avatar: resolvedAvatar || undefined,
                      role: (item.profiles.account_type === 'industry pro' || item.profiles.account_type === 'industry_pro' || item.profiles.console_handle?.toLowerCase().includes('ceo') || item.profiles.full_name?.toLowerCase().includes('goregrinder'))
                        ? 'Industry Pro'
                        : (item.profiles.role || item.profiles.account_type?.toUpperCase() || 'FAN'),
                      isYou: isSelf
                    } : {
                      name: postObj.author?.name || 'Anonymous',
                      avatar: resolvedAvatar || undefined,
                      role: postObj.author?.role || 'FAN',
                      isYou: postObj.author?.isYou || false
                    };

                    const rxObj = typeof item.reactions === 'object' && item.reactions !== null && !Array.isArray(item.reactions)
                      ? item.reactions
                      : typeof postObj.reactions === 'object' && postObj.reactions !== null && !Array.isArray(postObj.reactions)
                        ? postObj.reactions
                        : { likes: 0, horns: 0, hype: 0, brutal: 0, respect: 0, crushed: 0 };

                    const normalizedReactions = {
                      likes: Number(rxObj.likes || rxObj.thumbs || rxObj.heart || 0),
                      horns: Number(rxObj.horns || 0),
                      hype: Number(rxObj.hype || rxObj.flame || 0),
                      brutal: Number(rxObj.brutal || rxObj.heavy || 0),
                      respect: Number(rxObj.respect || 0),
                      crushed: Number(rxObj.crushed || 0)
                    };

                    const contentText = item.content || postObj.content || postObj.text || '';
                    const rawMediaUrl = item.media_url || postObj.media_url || postObj.mediaUrl || postObj.image || (postObj.images && postObj.images[0]) || null;

                    const ytId = postObj.youtubeId || postObj.youtube_id || extractYouTubeId(postObj.youtubeUrl || postObj.youtube_url || rawMediaUrl || contentText);
                    const ytUrl = postObj.youtubeUrl || postObj.youtube_url || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : null);

                    const resolvedMediaUrl = rawMediaUrl || ytUrl || postObj.tapeData?.audioUrl || postObj.songData?.audioUrl || null;
                    const imagesArr = postObj.images && postObj.images.length > 0
                      ? postObj.images
                      : (resolvedMediaUrl ? [resolvedMediaUrl] : []);

                    return {
                      ...postObj,
                      id: item.id || postObj.id,
                      timestamp: item.created_at || postObj.timestamp || postObj.created_at || new Date().toISOString(),
                      created_at: item.created_at || postObj.created_at || postObj.timestamp || new Date().toISOString(),
                      content: contentText,
                      image: resolvedMediaUrl,
                      mediaUrl: resolvedMediaUrl,
                      media_url: resolvedMediaUrl,
                      images: imagesArr,
                      youtubeId: ytId || postObj.youtubeId,
                      youtube_id: ytId || postObj.youtube_id,
                      youtubeUrl: ytUrl || postObj.youtubeUrl,
                      youtube_url: ytUrl || postObj.youtube_url,
                      tapeData: postObj.tapeData,
                      songData: postObj.songData,
                      pollData: postObj.pollData,
                      merchData: postObj.merchData,
                      reactions: normalizedReactions,
                      likes_count: normalizedReactions.likes,
                      author: author,
                      type: postObj.type || (postObj.tapeData ? 'tape_share' : postObj.songData ? 'song' : postObj.pollData ? 'poll' : postObj.merchData ? 'merch_drop' : 'post')
                    };
                  } catch (err) {
                    console.warn("Failed to parse remote post JSON:", err);
                    return null;
                  }
                }).filter(Boolean) as FeedItem[];

                finalFeed = remoteFeed;

                // Query comments
                try {
                  const { data: commentsRows } = await supabaseClient
                    .from('nexus_post_comments')
                    .select('*')
                    .order('created_at', { ascending: true });

                  if (commentsRows && commentsRows.length > 0) {
                    const commentsByPost: Record<string, any[]> = {};
                    commentsRows.forEach((c: any) => {
                      if (!c.post_id) return;
                      if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
                      commentsByPost[c.post_id].push({
                        id: c.id,
                        post_id: c.post_id,
                        user_id: c.user_id,
                        parent_comment_id: c.parent_comment_id || null,
                        username: c.user_id || 'Fan',
                        author: c.user_id || 'Fan',
                        text: c.content,
                        content: c.content,
                        time: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                        created_at: c.created_at
                      });
                    });

                    finalFeed = finalFeed.map(p => ({
                      ...p,
                      comments: commentsByPost[p.id] || p.comments || []
                    }));
                  }
                } catch (commErr) {
                  console.warn("Notice querying nexus_post_comments:", commErr);
                }

                // Query polls
                try {
                  const { data: pollsRows } = await supabaseClient.from('nexus_polls').select('*');
                  const { data: votesRows } = await supabaseClient.from('nexus_poll_votes').select('*');

                  if (pollsRows && pollsRows.length > 0) {
                    const pollsByPost = pollsRows.reduce((acc, p) => { acc[p.post_id] = p; return acc; }, {} as Record<string, any>);
                    const votesByPoll = votesRows ? votesRows.reduce((acc, v) => {
                      if (!acc[v.poll_id]) acc[v.poll_id] = [];
                      acc[v.poll_id].push(v);
                      return acc;
                    }, {} as Record<string, any[]>) : {};

                    finalFeed = finalFeed.map(post => {
                      if (pollsByPost[post.id]) {
                        const p = pollsByPost[post.id];
                        const pollVotes = votesByPoll[p.id] || [];
                        const optionsWithVotes = p.options.map((opt: any, idx: number) => {
                          const optionVotes = pollVotes.filter((v: any) => v.selected_option_index === idx).length;
                          return { ...opt, votes: optionVotes };
                        });

                        return {
                          ...post,
                          type: 'poll',
                          pollData: {
                            pollId: p.id,
                            question: p.question,
                            variant: p.category,
                            isTimed: !p.is_unbiased,
                            expiresAt: p.expires_at,
                            options: optionsWithVotes,
                            totalVotes: pollVotes.length
                          }
                        };
                      }
                      return post;
                    });
                  }
                } catch (pollErr) {
                  console.warn("Notice querying nexus_polls:", pollErr);
                }

                // Sort posts by descending timestamp
                finalFeed.sort((a: any, b: any) => {
                  const timeA = new Date(a.timestamp || 0).getTime();
                  const timeB = new Date(b.timestamp || 0).getTime();
                  return timeB - timeA;
                });
              } else {
                finalFeed = defaultFeed;
              }
            } else if (!error && !data) {
              finalFeed = defaultFeed;
            }
          } catch (e) {
            console.warn("Failed to sync feed from Supabase", e);
          }
        }

        if (finalFeed.length < 10 && defaultFeed.length > 0) {
          const existingIds = new Set(finalFeed.map((item: any) => item.id));
          const toAppend = defaultFeed.filter(item => !existingIds.has(item.id));
          finalFeed = [...finalFeed, ...toAppend];
        }

        if (active) {
          _setFeed(finalFeed);
        }
      } catch (e) {
        console.warn("Failed to load feed from IndexedDB:", e);
      }
    };

    loadFeed();
    return () => {
      active = false;
    };
  }, [portalRole, userProfile?.id, defaultFeed]);

  // Real-time syncing for posts and comments
  useEffect(() => {
    let active = true;
    const unsub1 = subscribeToTable('nexus_posts', async (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        try {
          const newItem = payload.new;
          let parsedPost = typeof newItem.data === 'string' ? JSON.parse(newItem.data) : (newItem.data || {});

          let profile = newItem.profiles;
          if (!profile && newItem.profile_id) {
            const supabaseClient = getSupabase();
            if (supabaseClient) {
              const { data: profData } = await supabaseClient.from('profiles').select('*').eq('id', newItem.profile_id).single();
              profile = profData;
            }
          }

          const isSelf = userProfile?.id && (userProfile.id === profile?.id || userProfile.id === newItem.profile_id);
          const liveSelfAvatar = isSelf ? (userProfile?.avatar || userProfile?.avatar_url || userProfile?.profile_avatar) : null;
          const resolvedAvatar = liveSelfAvatar ||
            profile?.avatar_url ||
            profile?.avatar ||
            profile?.profile_avatar ||
            profile?.profile_image ||
            parsedPost.author?.avatar ||
            parsedPost.authorAvatar ||
            (parsedPost.author?.isYou ? (userProfile?.avatar || userProfile?.avatar_url) : null);

          const author = profile ? {
            name: profile.console_handle || profile.full_name || 'Anonymous',
            avatar: resolvedAvatar || undefined,
            role: (profile.account_type === 'industry pro' || profile.account_type === 'industry_pro' || profile.console_handle?.toLowerCase().includes('ceo') || profile.full_name?.toLowerCase().includes('goregrinder'))
              ? 'Industry Pro'
              : (profile.role || profile.account_type?.toUpperCase() || 'FAN'),
            isYou: isSelf
          } : {
            name: parsedPost.author?.name || 'Anonymous',
            avatar: resolvedAvatar || undefined,
            role: parsedPost.author?.role || 'FAN',
            isYou: parsedPost.author?.isYou || false
          };

          const contentText = newItem.content || parsedPost.content || parsedPost.text || '';
          const rawMediaUrl = newItem.media_url || parsedPost.media_url || parsedPost.mediaUrl || parsedPost.image || (parsedPost.images && parsedPost.images[0]) || null;

          const ytId = parsedPost.youtubeId || parsedPost.youtube_id || extractYouTubeId(parsedPost.youtubeUrl || parsedPost.youtube_url || rawMediaUrl || contentText);
          const ytUrl = parsedPost.youtubeUrl || parsedPost.youtube_url || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : null);

          const resolvedMediaUrl = rawMediaUrl || ytUrl || parsedPost.tapeData?.audioUrl || parsedPost.songData?.audioUrl || null;
          const imagesArr = parsedPost.images && parsedPost.images.length > 0
            ? parsedPost.images
            : (resolvedMediaUrl ? [resolvedMediaUrl] : []);

          parsedPost = {
            ...parsedPost,
            id: newItem.id || parsedPost.id,
            timestamp: newItem.created_at || parsedPost.timestamp || parsedPost.created_at || new Date().toISOString(),
            created_at: newItem.created_at || parsedPost.created_at || parsedPost.timestamp || new Date().toISOString(),
            content: contentText,
            image: resolvedMediaUrl,
            mediaUrl: resolvedMediaUrl,
            media_url: resolvedMediaUrl,
            images: imagesArr,
            youtubeId: ytId || parsedPost.youtubeId,
            youtube_id: ytId || parsedPost.youtube_id,
            youtubeUrl: ytUrl || parsedPost.youtubeUrl,
            youtube_url: ytUrl || parsedPost.youtube_url,
            tapeData: parsedPost.tapeData,
            songData: parsedPost.songData,
            pollData: parsedPost.pollData,
            merchData: parsedPost.merchData,
            author: author,
            type: parsedPost.type || (parsedPost.tapeData ? 'tape_share' : parsedPost.songData ? 'song' : parsedPost.pollData ? 'poll' : parsedPost.merchData ? 'merch_drop' : 'post')
          };

          const deletedPosts = getDeletedPostIdsLocal();
          if (deletedPosts.includes(parsedPost.id)) return;

          _setFeed(prev => {
            let nextPrev = prev;
            if (nextPrev.some(p => p.id.startsWith('mock_'))) {
              nextPrev = nextPrev.filter(p => !p.id.startsWith('mock_'));
            }

            // Check exact ID match
            let matchIdx = nextPrev.findIndex(p => p.id === parsedPost.id || p.id === `nexus_post_${parsedPost.id}`);

            // If no exact ID match, check for optimistic duplicate created recently
            if (matchIdx === -1) {
              matchIdx = nextPrev.findIndex(p => {
                const sameAuthor = p.author?.name === parsedPost.author?.name || p.author?.isYou;
                const sameContent = (p.content || '').trim() === (parsedPost.content || '').trim();
                const pImg = p.image || p.images?.[0];
                const newImg = parsedPost.image || parsedPost.images?.[0];
                const sameImage = pImg === newImg || !pImg || !newImg;
                const isRecent = p.timestamp === 'Just now' || Math.abs(new Date(p.timestamp || 0).getTime() - new Date(parsedPost.timestamp || 0).getTime()) < 30000;
                return sameAuthor && sameContent && sameImage && isRecent;
              });
            }

            if (matchIdx !== -1) {
              const updated = [...nextPrev];
              updated[matchIdx] = {
                ...updated[matchIdx],
                ...parsedPost,
                id: parsedPost.id,
                image: parsedPost.image || updated[matchIdx].image || updated[matchIdx].images?.[0],
                images: (parsedPost.images && parsedPost.images.length > 0) ? parsedPost.images : (updated[matchIdx].images || (updated[matchIdx].image ? [updated[matchIdx].image] : []))
              };
              return updated;
            } else {
              return [parsedPost, ...nextPrev].sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
            }
          });
        } catch (e) { }
      } else if (payload.eventType === 'DELETE') {
        const { id } = payload.old;
        if (id) {
          const postId = id.startsWith('nexus_post_') ? id.replace('nexus_post_', '') : id;
          _setFeed(prev => prev.filter(p => p.id !== postId && p.id !== id));
        }
      }
    });

    const unsubComments = subscribeToTable('nexus_post_comments', (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT') {
        const c = payload.new;
        if (!c.post_id) return;
        setFeed(prev => prev.map(post => {
          if (post.id === c.post_id || post.id === `nexus_post_${c.post_id}`) {
            const newComm = {
              id: c.id,
              post_id: c.post_id,
              user_id: c.user_id,
              parent_comment_id: c.parent_comment_id || null,
              username: c.user_id || 'Fan',
              author: c.user_id || 'Fan',
              text: c.content,
              content: c.content,
              time: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              timeAgo: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              created_at: c.created_at
            };
            const existing = post.comments || [];
            if (existing.some((x: any) => x.id === c.id)) return post;
            return {
              ...post,
              comments: [...existing, newComm]
            };
          }
          return post;
        }));
      }
    });

    const handlePostDeletedSync = (e: any) => {
      if (!active) return;
      const deletedId = e.detail?.id || e.detail;
      if (deletedId) {
        _setFeed(prev => prev.filter(p => p.id !== deletedId && p.id !== `nexus_post_${deletedId}`));
      }
    };
    window.addEventListener('nexus_post_deleted', handlePostDeletedSync as EventListener);

    return () => {
      active = false;
      if (unsub1) unsub1();
      if (unsubComments) unsubComments();
      window.removeEventListener('nexus_post_deleted', handlePostDeletedSync as EventListener);
    };
  }, [userProfile?.id, setFeed]);

  // Save feed posts to IndexedDB whenever feed state updates
  useEffect(() => {
    if (feed && feed.length > 0) {
      saveFeedCache(portalRole, feed, userProfile?.id);
    }
  }, [feed, portalRole, userProfile?.id]);

  return {
    feed,
    setFeed,
    _setFeed
  };
}
