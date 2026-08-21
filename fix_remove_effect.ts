import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetEffect = `  // Cleanup effect to remove requested micro-genres
  useEffect(() => {
    const toRemove = ["goregrind/ pornogrind", "pornogrind", "goregrind/pornogrind", "miasmic guttural", "slam death metal", "cyber slam"];
    const cleanGenres = (genres: string[]) => {
      if (!genres) return [];
      return genres.filter(g => {
        const lower = g.toLowerCase().trim();
        return !toRemove.some(w => lower.includes(w));
      });
    };
    
    setProfilePrimaryGenres(prev => cleanGenres(prev));
    setProfileMicroGenres(prev => cleanGenres(prev));
    setProfileGenres(prev => cleanGenres(prev));
    
    if (userProfile && userProfile.genre_tags) {
       setUserProfile((prev: any) => ({
         ...prev,
         genre_tags: cleanGenres(prev.genre_tags)
       }));
    }
  }, [userProfile?.id]);`;

if (content.includes(targetEffect)) {
  content = content.replace(targetEffect, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully removed cleanup effect.");
} else {
  console.log("Target effect not found.");
}
