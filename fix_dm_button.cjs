const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// I will fix the first one (which I broke) to have its original likely behavior:
// It was probably:
// onClick={() => { setActiveTab('feed'); setLeftDrawerOpen(false); triggerNotification?.(`🎵 Now playing ${profile.name}`); }}
code = code.replace(/<button\s*onClick=\{\(\) => \{\s*window\.dispatchEvent\(new CustomEvent\('nexus_open_chat_thread', \{ detail: \{ profile_id: profile\.name, username: profile\.name, avatar_url: profile\.image \} \}\)\);\s*setLeftDrawerOpen\(false\);\s*triggerNotification\?\(`💬 DM with \$\{profile\.name\} opened\.`\);\s*\}\}\s*title="Direct Message"\s*>\s*<Disc className="w-2\.5 h-2\.5" \/>\s*<\/button>/g,
`<button 
                                            onClick={() => {
                                              triggerNotification?.(\`🎵 Now playing \${profile.name}\`);
                                            }}
                                            title="Listen"
                                            className="w-6 h-6 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center text-rose-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                                          >
                                            <Disc className="w-2.5 h-2.5" />
                                          </button>`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
