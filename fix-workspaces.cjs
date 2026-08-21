const fs = require('fs');
const files = [
  'src/components/portals/Band/ProfileCard.tsx',
  'src/components/portals/Creative/ProfileCard.tsx',
  'src/components/portals/Label/ProfileCard.tsx',
  'src/components/portals/Promoter/ProfileCard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // find index of "// 1. BAND / ARTIST WORKSPACE" and "// 2. PROMOTER WORKSPACE"
  const startIdx = content.indexOf('// 1. BAND / ARTIST WORKSPACE');
  const endIdx = content.indexOf('// 2. PROMOTER WORKSPACE');
  
  if (startIdx !== -1 && endIdx !== -1) {
    const newBandLogic = `// 1. BAND / ARTIST WORKSPACE
                  let matchingBandProfile: any = null;
                  if (typeof bandWsRef === 'object' && bandWsRef?.workspace_id) {
                     matchingBandProfile = allProfiles.find((p: any) => p.id === bandWsRef.workspace_id);
                  }
                  if (!matchingBandProfile && typeof bandWsRef === 'object' && bandWsRef?.name) {
                     matchingBandProfile = allProfiles.find((p: any) => (p.type === 'band' || p.isBandProfile) && p.name === bandWsRef.name);
                  }
                  if (!matchingBandProfile) {
                     matchingBandProfile = allProfiles.find((p: any) => {
                       const isBandType = p.type === 'band' || p.isBandProfile || p.role === 'Band' || p.portalRole === 'band';
                       if (!isBandType) return false;
                       if (p.user_id && p.user_id === effTarget.id) return true;
                       if (p.email && p.email === effTarget.email) return true;
                       const isMiguel = (prof: any) => {
                         if (!prof) return false;
                         const s = (typeof prof === 'string' ? prof : (prof?.name || prof?.full_name || prof?.email || '')).toLowerCase();
                         return s.includes('miguel') || s.includes('goregrinder') || s.includes('goregrindsickness');
                       };
                       if (effTarget.isYou && isMiguel(effTarget) && isMiguel(p)) return true;
                       const targetName = effTarget.name || effTarget.full_name || effTarget.console_handle;
                       if (p.lineup && typeof p.lineup === 'string' && targetName && p.lineup.includes(targetName)) return true;
                       if (p.lineup && Array.isArray(p.lineup) && targetName && p.lineup.some((m: any) => m?.name?.includes(targetName) || m?.member?.includes(targetName))) return true;
                       return false;
                     });
                  }

                  const hasBand = !isArtistOrBand && !!(
                    matchingBandProfile ||
                    (typeof fetchedBandData !== 'undefined' && fetchedBandData) || 
                    bandWsRef ||
                    hasRegisteredWorkspace(registeredWorkspaces, 'band') ||
                    (effTarget.band_id && effTarget.band_name && String(effTarget.band_name).trim() !== '')
                  );

                  if (hasBand) {
                    const lbd = matchingBandProfile || (typeof fetchedBandData !== 'undefined' ? fetchedBandData : null);
                    const name = lbd?.band_name || lbd?.name || effTarget.band_name || effTarget.bandName || (typeof bandWsRef === 'object' ? bandWsRef?.name : null) || 'Artist Workspace';
                    const logo = lbd?.logo_url || lbd?.avatar_url || lbd?.cover_url || lbd?.avatar || effTarget.avatar_url || effTarget.avatar || 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Icon%20Circuits.png';
                    const subtitle = lbd?.genre || (lbd?.micro_genres && Array.isArray(lbd.micro_genres) && lbd.micro_genres.length > 0 ? lbd.micro_genres.join(' • ') : 'Metal / Hardcore');

                    entities.push({
                      key: 'band',
                      icon: '🎸',
                      badgeClass: 'bg-purple-950/80 border border-purple-500/50 text-purple-300',
                      borderHoverClass: 'hover:border-purple-400/80',
                      typeLabel: 'Band',
                      name,
                      logo,
                      subtitle,
                      onClick: () => {
                        const bandProfileObj = matchingBandProfile || {
                          id: lbd?.id || effTarget.band_id || \`band_\${Date.now()}\`,
                          name,
                          band_name: name,
                          bandName: name,
                          type: 'band',
                          role: 'Band',
                          portalRole: 'band',
                          isBandProfile: true,
                          avatar: logo,
                          avatar_url: logo,
                          banner: lbd?.cover_url || lbd?.banner_url || effTarget.banner_url,
                          banner_url: lbd?.cover_url || lbd?.banner_url || effTarget.banner_url,
                          cover_url: lbd?.cover_url,
                          logo_url: logo,
                          genre: subtitle,
                          micro_genres: lbd?.micro_genres || [],
                          homebase: lbd?.homebase || effTarget.homebase || 'Global Scene',
                          bio: lbd?.bio || lbd?.description || \`Official Nexus Artist Profile for \${name}.\`
                        };
                        setSelectedUserProfile(bandProfileObj);
                        triggerNotification?.(\`🎸 Opening Public Band Profile for \${name}...\`);
                      }
                    });
                  }

                  `;
    content = content.substring(0, startIdx) + newBandLogic + content.substring(endIdx);
    fs.writeFileSync(file, content, 'utf8');
  }
}
