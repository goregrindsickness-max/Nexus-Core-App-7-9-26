const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `<Ticket className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                            onClick={() => triggerNotification?.(\`🎵 \${profile.name} added to queue\`)}
                                            title="Listen"
                                            className="w-6 h-6 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center text-rose-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                                          >
                                            <Disc className="w-2.5 h-2.5" />
                                          </button>
                                        )}`;

const rep = `<Ticket className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                        {profile.role?.toLowerCase().includes('artist') && (
                                          <button 
                                            onClick={() => triggerNotification?.(\`🎵 \${profile.name} added to queue\`)}
                                            title="Listen"
                                            className="w-6 h-6 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center text-rose-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                                          >
                                            <Disc className="w-2.5 h-2.5" />
                                          </button>
                                        )}`;

code = code.replace(target, rep);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
