const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldFollowers = `                  {/* Stats Ledger Row MOVED HERE */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 border border-purple-950/40 rounded-xl p-3 mt-4 text-center">
                    <div 
                      onClick={() => setViewingFollowersOrFollowing('followers')}
                      className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                    >
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Followers</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followersCount || 0).toLocaleString()}</div>
                    </div>
                    <div 
                      onClick={() => setViewingFollowersOrFollowing('following')}
                      className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                    >
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Following</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followingCount || 0).toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg p-1 group/stat">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Reshares</div>
                      <div className="text-sm font-black text-zinc-400 font-mono mt-0.5">{(selectedUserProfile.sharesCount || 0).toLocaleString()}</div>
                    </div>
                  </div>`;

const newFollowers = `                  {/* Stats Ledger Row MOVED HERE */}
                  <div className="relative bg-zinc-950/60 border border-purple-950/40 rounded-xl p-3 mt-4 text-center group/ledger">
                    <div className="grid grid-cols-3 gap-2">
                      <div 
                        onClick={() => setViewingFollowersOrFollowing('followers')}
                        className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                      >
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Followers</div>
                        <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followersCount || 0).toLocaleString()}</div>
                      </div>
                      <div 
                        onClick={() => setViewingFollowersOrFollowing('following')}
                        className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                      >
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Following</div>
                        <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followingCount || 0).toLocaleString()}</div>
                      </div>
                      <div className="rounded-lg p-1 group/stat">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Reshares</div>
                        <div className="text-sm font-black text-zinc-400 font-mono mt-0.5">{(selectedUserProfile.sharesCount || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-0 right-0 text-center opacity-0 group-hover/ledger:opacity-100 transition-opacity">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-mono">Click to see all followers</span>
                    </div>
                  </div>`;

code = code.replace(oldFollowers, newFollowers);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Followers updated");
