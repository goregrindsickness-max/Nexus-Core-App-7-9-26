import re

with open('src/components/social/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

second_modal = """
      {/* SECONDARY PROFILE VIEW MODAL */}
      <AnimatePresence>
        {selectedSecondaryUserProfile && (
          <PublicProfileModal
            selectedUserProfile={selectedSecondaryUserProfile}
            setSelectedUserProfile={setSelectedSecondaryUserProfile}
            targetProfile={targetProfile}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            portalRole={portalRole}
            profileActiveTab={profileActiveTab}
            setProfileActiveTab={setProfileActiveTab}
            triggerPictureViewer={triggerPictureViewer}
            triggerNotification={triggerNotification}
            allProfiles={allProfiles}
            handleFollowProfile={handleFollowProfile}
            setViewingFollowersOrFollowing={setViewingFollowersOrFollowing}
            openFloatingChat={openFloatingChat}
            bandJoinRequests={bandJoinRequests}
            setBandJoinRequests={setBandJoinRequests}
            setLeftDrawerOpen={setLeftDrawerOpen}
            setDrawerCurrentView={setDrawerCurrentView}
            openCheckout={openCheckout}
            setShowReportModal={setShowReportModal}
            setShowSubmitEpkModal={setShowSubmitEpkModal}
            setShowAddItemModal={setShowAddItemModal}
            setShopBrandFilter={setShopBrandFilter}
            setActiveTab={setActiveTab}
            profileBlurb={profileBlurb}
            setProfileBlurb={setProfileBlurb}
            saveProfileData={saveProfileData}
            labelRosterTicker={labelRosterTicker}
            profilePrimaryGenres={profilePrimaryGenres}
            profileMicroGenres={profileMicroGenres}
            profileGenres={profileGenres}
            profileTopSongArtist={profileTopSongArtist}
            setProfileTopSongArtist={setProfileTopSongArtist}
            profileTopSongTitle={profileTopSongTitle}
            setProfileTopSongTitle={setProfileTopSongTitle}
          />
        )}
      </AnimatePresence>
"""

content = re.sub(r'(<PublicProfileModal[^>]*?profileTopSongTitle=\{profileTopSongTitle\}\n\s*setProfileTopSongTitle=\{setProfileTopSongTitle\}\n\s*/>\n\s*\)}?\n?)', r'\1\n' + second_modal, content)

with open('src/components/social/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)

print("SUCCESS")
