import React from 'react';
import { StorefrontView } from './StorefrontView';
import { InboxTerminal } from '../messaging/InboxTerminal';
import { CreatePostCard } from './CreatePostCard';
import { TimelineFeed } from './TimelineFeed';
import { PhotoPitView } from './PhotoPitView';
import { ForumView } from './ForumView';
import { StoriesCarouselSection } from './StoriesCarouselSection';
import { ClipsView } from './ClipsView';
import { formatPostTimestamp } from '../../utils/socialFeedUtils';

export const FeedViewRouter: React.FC<any> = (props) => {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    setUserProfile,
    postIdentity,
    setPostIdentity,
    newPostText,
    setNewPostText,
    mediaUrl,
    setMediaUrl,
    selectedMediaFiles,
    setSelectedMediaFiles,
    handleMediaUpload,
    newPostTag,
    setNewPostTag,
    handleCreatePost,
    youtubeUrl,
    setYoutubeUrl,
    taggedVenue,
    setTaggedVenue,
    setShowPollModal,
    pollQuestion,
    setPollQuestion,
    pollVariant,
    setPollVariant,
    pollOptions,
    setPollOptions,
    pollIsTimed,
    setPollIsTimed,
    pollTimerDays,
    setPollTimerDays,
    pollTimerHours,
    setPollTimerHours,
    setShowMerchDropModal,
    merchDropName,
    setMerchDropName,
    merchDropPrice,
    setMerchDropPrice,
    setShowSongModal,
    attachedSong,
    setAttachedSong,
    taggedBands,
    setTaggedBands,
    tapeTitle,
    setTapeTitle,
    tapeBand,
    setTapeBand,
    tapeDate,
    setTapeDate,
    tapeDuration,
    setTapeDuration,
    tapeAudioUrl,
    setTapeAudioUrl,
    tapeAudioFileName,
    isUploadingTapeAudio,
    handleTapeAudioUpload,
    tapeFileInputRef,
    triggerNotification,
    stories,
    setShowUploadStoryModal,
    setActiveStory,
    filterHideTicketPresales,
    filterShowFollowedOnly,
    filterShowMerchDropsOnlyFromFollowed,
    discoverProfiles,
    profileFullLegalName,
    feed,
    setFeed,
    labelPosts,
    setLabelPosts,
    handleReaction,
    handleAddComment,
    setEditingPostId,
    setEditingPostText,
    handleSaveEdit,
    handleDeletePost,
    setCheckoutItem,
    setSelectedUserProfile,
    setActiveEventData,
    setIsEventModeActive,
    setBottomSheetOpen,
    handleVotePoll,
    shopBrandFilter,
    setShopBrandFilter,
    portalRole,
    shopSearchQuery,
    setShopSearchQuery,
    shopCategory,
    setShopCategory,
    shopItems,
    setShopItems,
    selectedMerch,
    setSelectedMerch,
    selectedMerchSize,
    setSelectedMerchSize,
    selectedMerchQty,
    setSelectedMerchQty,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    checkoutSuccess,
    setCheckoutSuccess,
    getSupabase,
    profileAvatarUrl,
    allProfiles,
    syncPostToSupabase,
    uploadBase64ToStorage,
    compressImageInSocialFeed,
    triggerPictureViewer,
    clips,
    setClips,
    deleteClip,
    getProfileForUser,
    getPostAuthorDisplayName,
  } = props;

  return (
    <>
          {activeTab === 'feed' && (
            <>
              {/* Scene Creator Box */}
              <div className="max-w-2xl mx-auto px-4 pt-3 pb-0 sm:px-4">
                <CreatePostCard
                  roleTheme={props.roleTheme || props.portalRole}
                  portalRole={props.portalRole}
                  activeBand={props.activeBand}
                  profileFullLegalName={props.profileFullLegalName}
                  profileHandle={props.profileHandle}
                  profileAvatarUrl={props.profileAvatarUrl}
                  userProfile={userProfile}
                  postIdentity={postIdentity}
                  setPostIdentity={setPostIdentity}
                  newPostText={newPostText}
                  setNewPostText={setNewPostText}
                  newPostImageUrl={mediaUrl}
                  setNewPostImageUrl={setMediaUrl}
                  selectedMediaFiles={selectedMediaFiles}
                  setSelectedMediaFiles={setSelectedMediaFiles}
                  handleMediaUpload={handleMediaUpload}
                  newPostCategory={newPostTag}
                  setNewPostCategory={setNewPostTag}
                  handleCreatePost={handleCreatePost}
                  availableIdentities={userProfile?.bands || []}
                  youtubeUrl={youtubeUrl}
                  setYoutubeUrl={setYoutubeUrl}
                  taggedVenue={taggedVenue}
                  setTaggedVenue={setTaggedVenue}
                  setShowPollModal={setShowPollModal}
                  pollQuestion={pollQuestion}
                  setPollQuestion={setPollQuestion}
                  pollVariant={pollVariant}
                  setPollVariant={setPollVariant}
                  pollOptions={pollOptions}
                  setPollOptions={setPollOptions}
                  pollIsTimed={pollIsTimed}
                  setPollIsTimed={setPollIsTimed}
                  pollTimerDays={pollTimerDays}
                  setPollTimerDays={setPollTimerDays}
                  pollTimerHours={pollTimerHours}
                  setPollTimerHours={setPollTimerHours}
                  setShowMerchDropModal={setShowMerchDropModal}
                  merchDropName={merchDropName}
                  setMerchDropName={setMerchDropName}
                  merchDropPrice={merchDropPrice}
                  setMerchDropPrice={setMerchDropPrice}
                  setShowSongModal={setShowSongModal}
                  attachedSong={attachedSong}
                  setAttachedSong={setAttachedSong}
                  taggedBands={taggedBands}
                  setTaggedBands={setTaggedBands}
                  tapeTitle={tapeTitle}
                  setTapeTitle={setTapeTitle}
                  tapeBand={tapeBand}
                  setTapeBand={setTapeBand}
                  tapeDate={tapeDate}
                  setTapeDate={setTapeDate}
                  tapeDuration={tapeDuration}
                  setTapeDuration={setTapeDuration}
                  tapeAudioUrl={tapeAudioUrl}
                  setTapeAudioUrl={setTapeAudioUrl}
                  tapeAudioFileName={tapeAudioFileName}
                  isUploadingTapeAudio={isUploadingTapeAudio}
                  handleTapeAudioUpload={handleTapeAudioUpload}
                  tapeFileInputRef={tapeFileInputRef}
                  triggerNotification={triggerNotification}
                  setShowEventModal={props.setShowEventModal}
                  eventTitle={props.eventTitle}
                  setEventTitle={props.setEventTitle}
                  eventType={props.eventType}
                  setEventType={props.setEventType}
                  eventData={props.eventData}
                  setEventData={props.setEventData}
                />
              </div>

      {/* Stories Carousel */}
      <StoriesCarouselSection
        stories={stories}
        onAddStory={() => setShowUploadStoryModal(true)}
        onSelectStory={(story) => setActiveStory(story)}
      />

      {/* Dynamic Filtered Feed */}
      {(() => {
        const filteredFeed = feed.filter(post => {
          // Hide quiet vault uploads / gallery-only items from the public feed
          if (post.is_gallery_only === true || post.post_to_feed === false || post.hidden_from_feed === true || post.gallery_only === true) {
            return false;
          }

          if (filterHideTicketPresales) {
            const isTicket = 
              post.tag?.toLowerCase().includes('ticket') || 
              post.tag?.toLowerCase().includes('presale') ||
              post.content?.toLowerCase().includes('ticket presale') ||
              post.content?.toLowerCase().includes('presale');
            if (isTicket) return false;
          }

          if (filterShowFollowedOnly) {
            const authorName = (post?.author?.name || (post as any)?.profile?.name || (post as any)?.author_name || 'Anonymous User').toLowerCase();
            const isAuthorFollowed = (discoverProfiles || []).some(p => (p?.name || "User").toLowerCase() === authorName && p.followed);
            const isSelf = (post?.author?.name || '') === profileFullLegalName || (userProfile && (post?.author?.name || '') === userProfile?.name);
            if (!isAuthorFollowed && !isSelf) return false;
          }

          if (filterShowMerchDropsOnlyFromFollowed) {
            const isMerch = 
              post.tag?.toLowerCase().includes('merch') || 
              post.content?.toLowerCase().includes('merch drop') ||
              post.content?.toLowerCase().includes('merch alert') ||
              post.songData;
            
            if (isMerch) {
              const authorName = (post?.author?.name || (post as any)?.profile?.name || (post as any)?.author_name || 'Anonymous User').toLowerCase();
              const inDiscoverList = (discoverProfiles || []).some(p => (p?.name || "User").toLowerCase() === authorName);
              if (inDiscoverList) {
                const isFollowed = (discoverProfiles || []).some(p => (p?.name || "User").toLowerCase() === authorName && p.followed);
                if (!isFollowed) return false;
              }
            }
          }
          return true;
        }).map(post => {
          const isBoostActive = !!post.is_boosted && !!post.boost_expires_at && new Date(post.boost_expires_at).getTime() > Date.now();
          return { ...post, effective_boost: isBoostActive };
        }).sort((a, b) => {
          if (a.effective_boost && !b.effective_boost) return -1;
          if (!a.effective_boost && b.effective_boost) return 1;
          return 0;
        });

        const liveUserAvatar = profileAvatarUrl || userProfile?.avatar || userProfile?.avatar_url || userProfile?.profile_avatar;

        const postsToPass = filteredFeed.length > 0 ? filteredFeed.map((p: any) => {
          const isSelf = Boolean(
            p.author?.isYou ||
            p.isYou ||
            (userProfile?.id && (p.author?.id === userProfile.id || p.profile_id === userProfile.id || p.user_id === userProfile.id)) ||
            (userProfile?.console_handle && p.author?.name && (
              p.author.name.toLowerCase().includes(userProfile.console_handle.toLowerCase().replace(/^@/, '')) ||
              (p.authorName && p.authorName.toLowerCase().includes(userProfile.console_handle.toLowerCase().replace(/^@/, '')))
            ))
          );

          const rawAvatar = typeof p.author?.avatar === 'string' ? p.author.avatar : (typeof p.authorAvatar === 'string' ? p.authorAvatar : undefined);
          const isGenericUiAvatar = rawAvatar && (rawAvatar.includes('ui-avatars.com') || rawAvatar === 'U' || rawAvatar === 'Anon');
          const resolvedAuthorAvatar = isSelf
            ? (liveUserAvatar || (!isGenericUiAvatar ? rawAvatar : undefined))
            : (!isGenericUiAvatar ? rawAvatar : undefined);

          return {
            id: p.id,
            type: p.type || 'post',
            timestamp: p.timestamp || p.created_at || (p.timeAgo && p.timeAgo !== 'Just now' ? p.timeAgo : undefined) || new Date().toISOString(),
            created_at: p.created_at || p.timestamp || new Date().toISOString(),
            timeAgo: p.timeAgo,
            authorId: p.author?.id || p.author_id || (isSelf ? (userProfile?.id || 'current_user') : (p.id ? `mock_author_${p.id}` : `author_${Math.random()}`)),
            authorName: getPostAuthorDisplayName(p.author || { name: p.authorName, legalName: p.legalName || p.realName }),
            legalName: p.legalName || p.realName || p.author?.legalName || p.author?.realName,
            authorAvatar: resolvedAuthorAvatar,
            authorRole: p.authorRole || p.author?.role || (
              p.author?.account_type === 'industry pro' || p.author?.account_type === 'industry_pro'
                ? 'Industry Pro'
                : (p.albumData || p.tag === 'ALBUM RELEASE' ? 'ARTIST' : 'FAN')
            ),
            location: p.location || p.venue || p.scraped_location || p.tagged_venue || p.author?.location || p.author_location,
            message: p.content || p.message || '',
            image_url: p.image || p.image_url || (p.images && p.images[0]),
            images: p.images || (p.image ? [p.image] : p.image_url ? [p.image_url] : undefined),
            youtubeId: p.youtubeId,
            tag: p.tag || (p.songData ? 'SONG SHARE' : p.albumData ? 'ALBUM RELEASE' : p.pollData ? 'SLAM DISCUSSION' : p.tapeData ? 'LIVE BOOTLEG' : undefined),
            songData: p.songData,
            albumData: p.albumData,
            pollData: p.pollData,
            tapeData: p.tapeData,
            tourData: p.tourData,
            merchData: p.merchData,
            ticketData: p.ticketData,
            isVipExclusive: p.isVipExclusive || p.is_vip_exclusive,
            requiredTier: p.requiredTier || p.required_tier,
            vipDiscountPct: p.vipDiscountPct || p.vip_discount_pct,
            likes_count: p.likes || p.likes_count || (Array.isArray(p.reactions) ? p.reactions.reduce((acc: number, r: any) => acc + (r.count || 0), 0) : 0),
            user_liked: p.liked || p.user_liked || false,
            reactions: {
              likes: Array.isArray(p.reactions) ? p.reactions.find((r: any) => ['likes', 'heart', 'thumbs'].includes(r.type))?.count || 0 : p.reactions?.likes || p.reactions?.heart || p.reactions?.thumbs || 0,
              horns: Array.isArray(p.reactions) ? p.reactions.find((r: any) => r.type === 'horns')?.count || 0 : p.reactions?.horns || 0,
              hype: Array.isArray(p.reactions) ? p.reactions.find((r: any) => ['hype', 'flame', 'rocket'].includes(r.type))?.count || 0 : p.reactions?.hype || p.reactions?.flame || p.reactions?.rocket || 0,
              brutal: Array.isArray(p.reactions) ? p.reactions.find((r: any) => ['brutal', 'heavy', 'skull', 'grim'].includes(r.type))?.count || 0 : p.reactions?.brutal || p.reactions?.heavy || p.reactions?.skull || p.reactions?.grim || 0,
              respect: Array.isArray(p.reactions) ? p.reactions.find((r: any) => r.type === 'respect')?.count || 0 : p.reactions?.respect || 0,
              crushed: Array.isArray(p.reactions) ? p.reactions.find((r: any) => r.type === 'crushed')?.count || 0 : p.reactions?.crushed || 0,
            },
            user_reactions: Array.isArray(p.reactions) ? p.reactions.reduce((acc: Record<string, boolean>, r: any) => {
              if (r.active) acc[r.type] = true;
              return acc;
            }, {}) : (p.user_reactions || {}),
            comments: (p.comments || []).map((c: any) => ({
              id: c.id,
              username: typeof c.author === 'object' ? c.author?.name : (c.author || c.username || 'User'),
              text: c.content || c.text || '',
              time: c.created_at ? formatPostTimestamp(c.created_at) : (c.time && c.time !== 'Just now' ? c.time : (c.timeAgo && c.timeAgo !== 'Just now' ? c.timeAgo : 'Recently')),
              created_at: c.created_at,
              parent_comment_id: c.parent_comment_id || c.parentCommentId || null,
            })),
            is_pinned: p.is_pinned,
          };
        }) : labelPosts;

        return (
          <div className="max-w-2xl mx-auto pt-2 pb-2 px-4">
            <TimelineFeed
              posts={postsToPass}
              currentUserId={userProfile?.id}
              currentUserName={userProfile?.name}
              userProfile={userProfile}
              portalRole={portalRole}
              onShareToTimeline={(sharedPost) => {
                const newPost: any = {
                  id: `share_${Date.now()}`,
                  authorId: userProfile?.id || 'user',
                  authorName: userProfile?.name || 'You',
                  authorAvatar: userProfile?.avatar || '',
                  legal_name: userProfile?.name,
                  timestamp: new Date().toISOString(),
                  message: `Reposted from @${sharedPost.authorName}: "${sharedPost.message}"`,
                  tag: sharedPost.tag || 'COMMUNITY',
                  songData: sharedPost.songData,
                  albumData: sharedPost.albumData,
                  likes_count: 0,
                  comments: [],
                };
                setLabelPosts(prev => [newPost, ...prev]);
                setFeed(prev => [newPost, ...prev]);
              }}
              onToggleLike={(postId) => {
                handleReaction(postId, 'heart');
                setLabelPosts(prev => prev.map(p => p.id === postId ? { ...p, user_liked: !p.user_liked, likes_count: p.user_liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1 } : p));
              }}
              onEmojiReact={(postId, type) => {
                handleReaction(postId, type);
                setLabelPosts(prev => prev.map(p => {
                  if (p.id !== postId) return p;
                  const newReacts = { ...p.user_reactions };
                  Object.keys(newReacts).forEach(k => newReacts[k] = false);
                  newReacts[type] = !p.user_reactions?.[type];
                  return { ...p, user_reactions: newReacts };
                }));
              }}
              onAddComment={(postId, text, parentCommentId) => {
                handleAddComment(postId, text, parentCommentId);
                setLabelPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), { id: 'c_' + Date.now(), post_id: postId, parent_comment_id: parentCommentId || null, username: userProfile?.name || 'Fan', text, time: 'Just now' }] } : p));
              }}
              onTogglePin={(postId) => {
                setFeed(prev => prev.map(p => p.id === postId ? { ...p, is_pinned: !(p as any).is_pinned } : p));
                setLabelPosts(prev => prev.map(p => p.id === postId ? { ...p, is_pinned: !p.is_pinned } : p));
              }}
              onEditPost={(postId, newText) => {
                setEditingPostId(postId);
                setEditingPostText(newText);
                handleSaveEdit(postId);
                setFeed(prev => prev.map(p => p.id === postId ? { ...p, content: newText, message: newText } : p));
                setLabelPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newText, message: newText } : p));
              }}
              onDeletePost={(postId) => {
                handleDeletePost(postId, true);
                setFeed(prev => prev.filter(p => p.id !== postId));
                setLabelPosts(prev => prev.filter(p => p.id !== postId));
              }}
              onAddToCart={(item) => {
                setCheckoutItem({
                  type: 'music',
                  data: [{
                    id: `release_${Date.now()}`,
                    title: item.title,
                    bandName: item.bandName,
                    price: item.price,
                    type: item.format,
                    image: 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Suffocation%20Human%20Waste.jpg'
                  }]
                });
              }}
              onOpenProfile={(authorId, authorName) => {
                setSelectedUserProfile(getProfileForUser({
                  name: authorName,
                  avatar: authorName.charAt(0),
                  role: 'Fan'
                }));
              }}
              onOpenTicketModal={(ticketData) => {
                setActiveEventData({
                  id: `ticket_${Date.now()}`,
                  venue: ticketData.venue,
                  headliner: ticketData.headliner || 'Event',
                  time: `Doors ${ticketData.doorTime}`
                });
                setIsEventModeActive(true);
              }}
              onOpenMerchModal={(merchData) => {
                setCheckoutItem({ type: 'merch', data: merchData });
                setBottomSheetOpen(true);
              }}
              onVotePoll={handleVotePoll}
              discoverProfiles={discoverProfiles}
              onFollowProfile={props.handleFollowProfile}
              onTriggerNotification={triggerNotification}
            />
          </div>
        );
      })()}
      </>
      )}

      {/* SHOP VIEW */}
      <StorefrontView
        activeTab={activeTab}
        shopBrandFilter={shopBrandFilter}
        setShopBrandFilter={setShopBrandFilter}
        portalRole={portalRole}
        shopSearchQuery={shopSearchQuery}
        setShopSearchQuery={setShopSearchQuery}
        shopCategory={shopCategory}
        setShopCategory={setShopCategory}
        shopItems={shopItems}
        setShopItems={setShopItems}
        selectedMerch={selectedMerch}
        setSelectedMerch={setSelectedMerch}
        selectedMerchSize={selectedMerchSize}
        setSelectedMerchSize={setSelectedMerchSize}
        selectedMerchQty={selectedMerchQty}
        setSelectedMerchQty={setSelectedMerchQty}
        isCheckoutModalOpen={isCheckoutModalOpen}
        setIsCheckoutModalOpen={setIsCheckoutModalOpen}
        checkoutSuccess={checkoutSuccess}
        setCheckoutSuccess={setCheckoutSuccess}
        userProfile={userProfile}
        triggerNotification={triggerNotification}
        getSupabase={getSupabase}
        openCheckout={props.openCheckout}
        addToCart={props.addToCart}
        cartItems={props.cartItems}
        setCartItems={props.setCartItems}
        isCartOpen={props.isCartOpen}
        setIsCartOpen={props.setIsCartOpen}
        chats={props.chats}
        setChats={props.setChats}
        allProfiles={allProfiles}
      />

      {/* FORUM VIEW */}
      {activeTab === 'forum' && (
        <ForumView
          userProfile={userProfile}
          profileHandle={props.profileHandle}
          triggerNotification={triggerNotification}
          profileAvatarUrl={profileAvatarUrl}
          discoverProfiles={discoverProfiles}
          allProfiles={allProfiles}
        />
      )}


      {/* MESSENGER INBOX VIEW */}
      {activeTab === 'messages' && (
        <div className="w-full h-[calc(100dvh-125px)] sm:h-[calc(100dvh-70px)] animate-in fade-in duration-300 flex flex-col">
          <InboxTerminal
            onBack={() => setActiveTab('feed')}
            userProfile={userProfile}
            allProfiles={allProfiles}
            discoverProfiles={discoverProfiles}
            onSelectProfile={setSelectedUserProfile}
          />
        </div>
      )}

      {/* MEDIA GALLERY / PHOTO PIT VIEW */}
      {(activeTab === 'gallery' || activeTab === 'photopit') && (
        <PhotoPitView
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          feed={feed}
          setFeed={setFeed}
          triggerNotification={triggerNotification}
          profileFullLegalName={profileFullLegalName}
          profileAvatarUrl={profileAvatarUrl}
          portalRole={portalRole}
          syncPostToSupabase={syncPostToSupabase}
          uploadBase64ToStorage={uploadBase64ToStorage}
          compressImageInSocialFeed={compressImageInSocialFeed}
          triggerPictureViewer={triggerPictureViewer}
          setActiveTab={setActiveTab}
        />
      )}




















      {/* REELS / CLIPS VIEW */}
      {activeTab === 'reels' && (
        <ClipsView
          userProfile={userProfile}
          clips={clips}
          setClips={setClips}
          triggerNotification={triggerNotification}
          setActiveTab={setActiveTab}
          portalRole={portalRole}
          deleteClip={deleteClip}
          getSupabase={getSupabase}
          onSelectProfile={(userPayload) => setSelectedUserProfile(getProfileForUser(userPayload))}
        />
      )}
      </>
  );
};
