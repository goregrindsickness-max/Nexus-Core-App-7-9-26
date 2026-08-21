const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `                        } else if (selectedUserProfile.isYou) {
                          return (
                            <div className="text-center py-12 px-4 bg-zinc-950/20 border border-zinc-900/40 rounded-xl w-full">
                              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                                No posts have been made by this account yet
                              </p>
                            </div>
                          );
                        } else {
                          // Dynamic fallback timeline posts for other profiles so they look high quality
                          const fallbacks: Record<string, { type: string, time: string, content: string }[]> = {
                            'jungle rot': [
                              { type: 'post', time: '1d ago', content: 'Pre-production for the next full-length record is officially underway. Stamped with pure Midwest brutality.' },
                              { type: 'merch', time: '3d ago', content: 'New Skull Crusher long-sleeves are in stock now. Printed on premium heavy-weight cotton.' }
                            ],
                            'testament': [
                              { type: 'post', time: '2h ago', content: 'Bay Area thrash family! We are stoked to announce our return to the stage. Get ready for absolute thrash carnage!' },
                              { type: 'post', time: '1d ago', content: 'Spiritual Metal Crusade live dates updated on our central tour itinerary map.' }
                            ],
                            'dark funeral': [
                              { type: 'post', time: '12h ago', content: 'The shadows are gathering... Prepare for the next blackened ritual. Live dates announced.' },
                              { type: 'album', time: '2d ago', content: 'The Secrets of the Black Arts remastered vinyl drops next week.' }
                            ],
                            'morbid angel': [
                              { type: 'post', time: '5h ago', content: 'Altars of Madness is forever. Stream our absolute classic tracks in high bitrate stereo in our Music tab.' }
                            ]
                          };
                          const key = selectedUserProfile.name.toLowerCase();
                          const customPosts = fallbacks[Object.keys(fallbacks).find(k => key.includes(k)) || ''] || [
                            { type: 'post', time: '1d ago', content: \`Welcome to the official \${selectedUserProfile.name} space node on the Nexus Network!\` },
                            { type: 'post', time: '3d ago', content: 'Preparing next level extreme music drops and exclusive merch runs for our network followers.' }
                          ];
                          return customPosts.map((post, i) => (
                            <div key={i} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 text-left w-full">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">{post.time}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold uppercase">{post.type}</span>
                              </div>
                              <p className="text-sm text-zinc-300">{post.content}</p>
                            </div>
                          ));
                        }`;

const rep = `                        } else {
                          return (
                            <div className="text-center py-12 px-4 bg-zinc-950/20 border border-zinc-900/40 rounded-xl w-full">
                              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                                No posts have been made by this account yet
                              </p>
                            </div>
                          );
                        }`;

code = code.replace(target, rep);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
