sed -i '5175c\
    const dbProfile = allProfiles.find(p => \\\
      (p.name && p.name.toLowerCase() === user.name.toLowerCase()) || \\\
      (p.full_name && p.full_name.toLowerCase() === user.name.toLowerCase()) || \\\
      (p.console_handle && p.console_handle.toLowerCase() === user.name.toLowerCase()) || \\\
      (p.label_company_name && p.label_company_name.toLowerCase() === user.name.toLowerCase()) || \\\
      (p.promoter_name && p.promoter_name.toLowerCase() === user.name.toLowerCase()) || \\\
      (p.creative_name && p.creative_name.toLowerCase() === user.name.toLowerCase()) \\\
    );\\\
    const dbBanner = dbProfile?.banner_url || dbProfile?.creative_banner || dbProfile?.promoter_cover_image || dbProfile?.label_banner;\\\
    const banner = (user as any).banner || dbBanner || discoverProf?.banner || registryData.banner || (isYou ? profileCoverUrl : undefined);\
' src/components/UniversalSocialFeed.tsx
