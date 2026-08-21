import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """  ]);

  const handleFollowProfile = (name: string) => {"""

replacement = """  ]);

  // Load discoverProfiles from IndexedDB on mount
  useEffect(() => {
    let active = true;
    profileStore.getItem(`discoverProfiles_${userProfile?.id || 'guest'}`).then((data: any) => {
      if (active && data && Array.isArray(data) && data.length > 0) {
        setDiscoverProfiles(prev => {
          // Merge saved followed state with current base profiles to keep avatars/info up to date
          return prev.map(p => {
            const saved = data.find((d: any) => d.id === p.id);
            if (saved) {
              return { ...p, followed: saved.followed, followedBack: saved.followedBack, notificationsEnabled: saved.notificationsEnabled };
            }
            return p;
          });
        });
      }
    }).catch(e => console.warn("Failed to load discoverProfiles", e));
    return () => { active = false; };
  }, [userProfile?.id]);

  // Save discoverProfiles to IndexedDB on change
  useEffect(() => {
    profileStore.setItem(`discoverProfiles_${userProfile?.id || 'guest'}`, discoverProfiles).catch(e => console.warn("Failed to save discoverProfiles", e));
  }, [discoverProfiles, userProfile?.id]);

  const handleFollowProfile = (name: string) => {"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed discoverProfiles persistence.")
else:
    print("Target not found.")
