import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = "const [profileMicroGenres, setProfileMicroGenres] = useState<string[]>(['Groovy Goregrind', 'Cybergrind']);";
const replacement = `const [profileMicroGenres, setProfileMicroGenres] = useState<string[]>(['Groovy Goregrind', 'Cybergrind']);

  // Cleanup effect to remove requested micro-genres
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

if (content.includes(target) && !content.includes('const toRemove = ["goregrind/ pornogrind"')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully added cleanup effect.");
} else {
  console.log("Target not found or already added.");
}
