const fs = require('fs');

const files = [
  'src/components/portals/Band/ProfileCard.tsx',
  'src/components/portals/Creative/ProfileCard.tsx',
  'src/components/portals/Label/ProfileCard.tsx',
  'src/components/portals/Promoter/ProfileCard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Restore the 2x2 Grid block
  const gridBlock = `
                {/* ASSOCIATED ENTITIES (2x2 GRID) */}
                {(() => {
                  const registeredWorkspaces = effTarget?.registered_workspaces || (effTarget?.isYou ? userProfile?.registered_workspaces : []) || [];
                  
                  const bandWsRef = Array.isArray(registeredWorkspaces) ? registeredWorkspaces.find((w: any) => typeof w === 'object' && w?.type === 'band') : null;
                  const promoterWsRef = Array.isArray(registeredWorkspaces) ? registeredWorkspaces.find((w: any) => typeof w === 'object' && w?.type === 'promoter') : null;
                  const creativeWsRef = Array.isArray(registeredWorkspaces) ? registeredWorkspaces.find((w: any) => typeof w === 'object' && w?.type === 'creative') : null;
                  const labelWsRef = Array.isArray(registeredWorkspaces) ? registeredWorkspaces.find((w: any) => typeof w === 'object' && w?.type === 'label') : null;

                  const entities: Array<{
                    key: string;
                    icon: string;
                    badgeClass: string;
                    borderHoverClass: string;
                    typeLabel: string;
                    name: string;
                    logo: string;
                    subtitle: string;
                    onClick: () => void;
                  }> = [];

                  // 1. BAND / ARTIST WORKSPACE
                  const hasBand = !isArtistOrBand && !!(
                    (typeof fetchedBandData !== 'undefined' ? fetchedBandData : null) || 
                    bandWsRef ||
                    hasRegisteredWorkspace(registeredWorkspaces, 'band') ||
                    (effTarget.band_id && effTarget.band_name && String(effTarget.band_name).trim() !== '')
                  );
                  if (hasBand) {
                    const lbd = typeof fetchedBandData !== 'undefined' ? fetchedBandData : null;
                    const name = lbd?.band_name || lbd?.name || effTarget.band_name || effTarget.bandName || (typeof bandWsRef === 'object' ? bandWsRef?.name : null) || 'Artist Workspace';
                    const logo = lbd?.logo_url || lbd?.avatar_url || lbd?.cover_url || effTarget.avatar_url || effTarget.avatar || 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Icon%20Circuits.png';
                    const subtitle = lbd?.genre || (lbd?.micro_genres && lbd.micro_genres.length > 0 ? lbd.micro_genres.join(' • ') : 'Metal / Hardcore');

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
                        const bandProfileObj = {
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

                  // 2. PROMOTER WORKSPACE
                  const hasPromoter = (targetRole !== 'promoter' && effTarget.account_type !== 'promoter') && !!(
                    promoterWsRef ||
                    hasRegisteredWorkspace(registeredWorkspaces, 'promoter') ||
                    (effTarget.agency_name && String(effTarget.agency_name).trim() !== '')
                  );
                  if (hasPromoter) {
                    const name = effTarget.agency_name || effTarget.promoter_name || effTarget.promoterName || (typeof promoterWsRef === 'object' ? promoterWsRef?.name : null) || 'Promoter Agency';
                    const logo = effTarget.avatar_url || effTarget.avatar || 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Icon%20Circuits.png';
                    const subtitle = effTarget.venue || effTarget.location || 'Promoter & Venue Booking';

                    entities.push({
                      key: 'promoter',
                      icon: '🎪',
                      badgeClass: 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300',
                      borderHoverClass: 'hover:border-emerald-400/80',
                      typeLabel: 'Promoter',
                      name,
                      logo,
                      subtitle,
                      onClick: () => {
                        const promoterProfileObj = {
                          id: effTarget.id || \`promoter_\${Date.now()}\`,
                          name,
                          agency_name: name,
                          type: 'promoter',
                          role: 'Promoter',
                          portalRole: 'promoter',
                          account_type: 'promoter',
                          avatar: logo,
                          avatar_url: logo,
                          location: subtitle,
                          bio: effTarget.bio || \`Official Promoter & Booking entity for \${name}.\`
                        };
                        setSelectedUserProfile(promoterProfileObj);
                        triggerNotification?.(\`🎪 Opening Promoter Profile for \${name}...\`);
                      }
                    });
                  }

                  // 3. CREATIVE WORKSPACE
                  const hasCreative = (targetRole !== 'creative' && effTarget.account_type !== 'creative') && !!(
                    creativeWsRef ||
                    hasRegisteredWorkspace(registeredWorkspaces, 'creative') ||
                    (effTarget.business_name && String(effTarget.business_name).trim() !== '')
                  );
                  if (hasCreative) {
                    const name = effTarget.business_name || effTarget.creative_name || (typeof creativeWsRef === 'object' ? creativeWsRef?.name : null) || 'Creative Studio';
                    const logo = effTarget.avatar_url || effTarget.avatar || 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Icon%20Circuits.png';
                    const subtitle = effTarget.primary_specialty || effTarget.specialty || 'Creative Media & Sound Design';

                    entities.push({
                      key: 'creative',
                      icon: '🎨',
                      badgeClass: 'bg-amber-950/80 border border-amber-500/50 text-amber-300',
                      borderHoverClass: 'hover:border-amber-400/80',
                      typeLabel: 'Creative',
                      name,
                      logo,
                      subtitle,
                      onClick: () => {
                        const creativeProfileObj = {
                          id: effTarget.id || \`creative_\${Date.now()}\`,
                          name,
                          business_name: name,
                          type: 'creative',
                          role: 'Creative',
                          portalRole: 'creative',
                          account_type: 'creative',
                          avatar: logo,
                          avatar_url: logo,
                          specialty: subtitle,
                          bio: effTarget.bio || \`Official Creative Specialist Profile for \${name}.\`
                        };
                        setSelectedUserProfile(creativeProfileObj);
                        triggerNotification?.(\`🎨 Opening Creative Profile for \${name}...\`);
                      }
                    });
                  }

                  // 4. RECORD LABEL WORKSPACE
                  const hasLabel = (targetRole !== 'label' && effTarget.account_type !== 'label') && !!(
                    labelWsRef ||
                    hasRegisteredWorkspace(registeredWorkspaces, 'label') ||
                    (effTarget.label_name && String(effTarget.label_name).trim() !== '')
                  );
                  if (hasLabel) {
                    const name = effTarget.label_name || effTarget.labelName || (typeof labelWsRef === 'object' ? labelWsRef?.name : null) || 'Record Label';
                    const logo = effTarget.avatar_url || effTarget.avatar || 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Icon%20Circuits.png';
                    const subtitle = effTarget.label_region || effTarget.location || 'Independent Label Group';

                    entities.push({
                      key: 'label',
                      icon: '🏷️',
                      badgeClass: 'bg-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-300',
                      borderHoverClass: 'hover:border-fuchsia-400/80',
                      typeLabel: 'Record Label',
                      name,
                      logo,
                      subtitle,
                      onClick: () => {
                        const labelProfileObj = {
                          id: effTarget.id || \`label_\${Date.now()}\`,
                          name,
                          label_name: name,
                          labelName: name,
                          type: 'label',
                          role: 'Label',
                          portalRole: 'label',
                          account_type: 'label',
                          avatar: logo,
                          avatar_url: logo,
                          location: subtitle,
                          bio: effTarget.bio || \`Official Record Label Profile for \${name}.\`
                        };
                        setSelectedUserProfile(labelProfileObj);
                        triggerNotification?.(\`🏷️ Opening Record Label Profile for \${name}...\`);
                      }
                    });
                  }

                  if (entities.length === 0) return null;

                  return (
                    <div className="mt-4 text-left">
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-800/80">
                        <span className="text-[10px] font-mono font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                          Associated Entities
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                          {entities.length} {entities.length === 1 ? 'Workspace' : 'Workspaces'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entities.map((item) => (
                          <div
                            key={item.key}
                            onClick={item.onClick}
                            className={\`p-2 bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-zinc-800 \${item.borderHoverClass} rounded-xl transition-all cursor-pointer group relative overflow-hidden flex items-center gap-2.5 shadow-md hover:shadow-purple-950/30 hover:scale-[1.01]\`}
                          >
                            {/* Logo */}
                            <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-700/60 overflow-hidden shrink-0 group-hover:border-purple-400/80 transition-colors shadow-inner flex items-center justify-center">
                              <img
                                src={item.logo}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <span className={\`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded \${item.badgeClass}\`}>
                                  {item.icon} {item.typeLabel}
                                </span>
                              </div>
                              <h5 className="text-xs font-black text-white group-hover:text-purple-300 truncate tracking-tight mt-0.5 font-display">
                                {item.name}
                              </h5>
                              <p className="text-[9px] font-mono text-zinc-400 truncate leading-tight">
                                {item.subtitle}
                              </p>
                            </div>

                            {/* Arrow */}
                            <div className="shrink-0 pr-1 text-zinc-500 group-hover:text-purple-300 transition-colors text-xs font-bold">
                              →
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
`;
  
  if (!content.includes('ASSOCIATED ENTITIES (2x2 GRID)')) {
    content = content.replace('{/* Custom badges */}', gridBlock + '\n\n                {/* Custom badges */}');
  }

  // 2. Remove the Associated Pages / Label Roster / Band Members block
  const oldBlockRegex = /\{\/\*\s*Associated Pages \/ Label Roster \/ Band Members\s*\*\/\}[\s\S]*?(?=\{\/\*\s*Label specific: Upcoming Tours\/Shows\s*\*\/\}|\{\/\*\s*VIBE ENDORSEMENTS)/g;
  
  content = content.replace(oldBlockRegex, '');

  fs.writeFileSync(file, content, 'utf8');
}
