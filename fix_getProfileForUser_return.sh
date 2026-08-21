sed -i '5250,5260c\
      isYou,\
      isFollowed,\
      legalName: resolvedLegalName,\
      handle: resolvedHandle,\
      ...registryData,\
      banner,\
      followersCount,\
      followingCount,\
      genres: finalGenres,\
      favoriteSong: finalFavoriteSong,\
      rosterTicker: finalRosterTicker,\
      hasProAccess,\
      musicCatalog,\
      associatedProfiles\
' src/components/UniversalSocialFeed.tsx
