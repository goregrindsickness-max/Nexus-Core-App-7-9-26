import re

with open('src/App.tsx', 'r') as f:
    app = f.read()

# Let's find exactly the block to replace.
# It starts at:
#         {/* BRAND NAVIGATION HEADER */}
#         <BrandNavigationHeader ... />
#         ) : activeTab === 'home-v2' ? (

# and we will change it to:
#         {/* BRAND NAVIGATION HEADER */}
#         <BrandNavigationHeader ... />
#         ) : activeTab === 'home' ? (
#           <HomeDashboardView ... />
#         ) : activeTab === 'home-v2' ? (

# Let's extract the actual string from the stdout dump of patch_app_header.py
home_view = """        ) : activeTab === 'home' ? (
          <HomeDashboardView dashboardRef={dashboardRef} dashboardScrollPos={dashboardScrollPos} setActiveTab={setActiveTab} triggerNotification={triggerNotification} addLog={addLog} musicTrackCount={musicTrackCount} isRosterOwner={isRosterOwner} setDistroDeckSubTab={setDistroDeckSubTab} userProfile={userProfile} activeBand={activeBand} isSyncBadgeExpanded={isSyncBadgeExpanded} setIsOfflineSimActive={setIsOfflineSimActive} isOfflineSimActive={isOfflineSimActive} isOnline={isOnline} setIsSyncBadgeExpanded={setIsSyncBadgeExpanded} status={status} setIsMetricCarouselPaused={setIsMetricCarouselPaused} setCurrentMetricIndex={setCurrentMetricIndex} metrics={metrics} currentMetricIndex={currentMetricIndex} setIsHoveringTourStatus={setIsHoveringTourStatus} registerTourStatusInteraction={registerTourStatusInteraction} handleStatusTouchStart={handleStatusTouchStart} handleStatusTouchMove={handleStatusTouchMove} handleStatusTouchEnd={handleStatusTouchEnd} hasSettleReminder={hasSettleReminder} firstShowToSettle={firstShowToSettle} setAutoExpandShowId={setAutoExpandShowId} shows={shows} setTourStatusIndex={setTourStatusIndex} tourStatusIndex={tourStatusIndex} activeShowDisplay={activeShowDisplay} currentOrNextShow={currentOrNextShow} countdownString={countdownString} inventory={inventory} isCritical={isCritical} totalTableStock={totalTableStock} totalVanStock={totalVanStock} notes={notes} showSpecificNotes={showSpecificNotes} localWeather={localWeather} weatherLoading={weatherLoading} weatherError={weatherError} currentCoords={currentCoords} customNavDestination={customNavDestination} setCustomNavDestination={setCustomNavDestination} venues={venues} fetchLocalWeather={fetchLocalWeather} setIsWeatherForecastExpanded={setIsWeatherForecastExpanded} isWeatherForecastExpanded={isWeatherForecastExpanded} isEditingBusCall={isEditingBusCall} isTime24Hour={isTime24Hour} setIsTime24Hour={setIsTime24Hour} tempBusCallTime={tempBusCallTime} setTempBusCallTime={setTempBusCallTime} tempLockupTime={tempLockupTime} setTempLockupTime={setTempLockupTime} setIsEditingBusCall={setIsEditingBusCall} setBusCallTime={setBusCallTime} setLockupTime={setLockupTime} renderTime={renderTime} busCallTime={busCallTime} lockupTime={lockupTime} checklistItems={checklistItems} toggleChecklistItem={toggleChecklistItem} flights={flights} tableStockPercent={tableStockPercent} handleRestock={handleRestock} handleNewSaleClick={handleNewSaleClick} handleNewSalePointerDown={handleNewSalePointerDown} handleNewSalePointerUp={handleNewSalePointerUp} setIsGlobalHoverPaused={setIsGlobalHoverPaused} setDashboardCarouselIndex={setDashboardCarouselIndex} dashboardCarouselIndex={dashboardCarouselIndex} getNextShow={getNextShow} getSetlistDetailsForShow={getSetlistDetailsForShow} selectedGuestlistShowId={selectedGuestlistShowId} setSelectedGuestlistShowId={setSelectedGuestlistShowId} sales={sales} setModalType={setModalType} setIsModalOpen={setIsModalOpen} sortedShows={sortedShows} setPromoCardActiveSlot={setPromoCardActiveSlot} promoCardActiveSlot={promoCardActiveSlot} setIsNotificationDrawerOpen={setIsNotificationDrawerOpen} setDashboardV2ActiveNav={setDashboardV2ActiveNav} alliancePosts={alliancePosts} previewReactionMenuOpenFor={previewReactionMenuOpenFor} setPreviewReactionMenuOpenFor={setPreviewReactionMenuOpenFor} handleAlliancePostReaction={handleAlliancePostReaction} setAlliancePosts={setAlliancePosts} previewFollowedActs={previewFollowedActs} setPreviewFollowedActs={setPreviewFollowedActs} filteredInventory={filteredInventory} setPromoHubSelectedItemId={setPromoHubSelectedItemId} setPromoHubSubTab={setPromoHubSubTab} loyaltyMembers={loyaltyMembers} reviewLeft={reviewLeft} userReviews={userReviews} setReviewLeft={setReviewLeft} setReviewText={setReviewText} setReviewScore={setReviewScore} reviewScore={reviewScore} reviewText={reviewText} reviewerName={reviewerName} setReviewerName={setReviewerName} reviewerGroup={reviewerGroup} setReviewerGroup={setReviewerGroup} setUserReviews={setUserReviews} />
"""

app = app.replace("        ) : activeTab === 'home-v2' ? (", home_view + "        ) : activeTab === 'home-v2' ? (")

with open('src/App.tsx', 'w') as f:
    f.write(app)

