const fs = require('fs');
let file = fs.readFileSync('./src/components/UniversalSocialFeed.tsx', 'utf8');

// 1. Add fields to FeedItem
file = file.replace(/interface FeedItem \{/, `interface FeedItem {\n  is_boosted?: boolean;\n  boost_expires_at?: string;\n  boost_duration?: '24h' | '72h';\n  effective_boost?: boolean;`);

// 2. Add state
file = file.replace(/const \[bottomSheetOpen, setBottomSheetOpen\] = useState\(false\);/, `const [bottomSheetOpen, setBottomSheetOpen] = useState(false);\n  const [boostMenuPostId, setBoostMenuPostId] = useState<string | null>(null);`);

// 3. Modify filteredFeed sorting
file = file.replace(/const filteredFeed = feed\.filter\(post => \{([\s\S]*?)return true;\n        \}\);/m, 
`const filteredFeed = feed.filter(post => {$1return true;\n        }).map(post => {
          const isBoostActive = !!post.is_boosted && !!post.boost_expires_at && new Date(post.boost_expires_at).getTime() > Date.now();
          return { ...post, effective_boost: isBoostActive };
        }).sort((a, b) => {
          if (a.effective_boost && !b.effective_boost) return -1;
          if (!a.effective_boost && b.effective_boost) return 1;
          return 0;
        });`);

// 4. Modify Delete/Edit section
file = file.replace(/<button onClick=\{\(\) => handleEditPost\(post\.id, post\.content\)\} className="text-zinc-500 hover:text-white p-1 transition-colors">/,
`<button onClick={() => setBoostMenuPostId(post.id)} className="text-zinc-500 hover:text-yellow-400 p-1 transition-colors" title="Boost Post">
                          <Zap className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditPost(post.id, post.content)} className="text-zinc-500 hover:text-white p-1 transition-colors">`);

// 5. Update Post Container class
file = file.replace(/<div className="bg-\[#121214\] sm:border border-y border-zinc-900\/80 sm:rounded-2xl pb-3 pt-4 space-y-3 sm:shadow-xl">/,
`<div className={\`bg-[#121214] sm:border border-y sm:rounded-2xl pb-3 pt-4 space-y-3 relative sm:shadow-xl \${
                    post.effective_boost 
                      ? post.boost_duration === '72h'
                        ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                        : 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                      : 'border-zinc-900/80'
                  }\`}>
                  {post.effective_boost && (
                    <div className={\`absolute -top-3 right-4 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border \${
                      post.boost_duration === '72h'
                        ? 'bg-red-950/80 text-red-400 border-red-500/50'
                        : 'bg-purple-950/80 text-purple-400 border-purple-500/50'
                    }\`}>
                      ⚡ Priority Announcement
                    </div>
                  )}`);

// 6. Add Overlay Menu
const overlayCode = `
      {/* Boost Post Overlay */}
      {boostMenuPostId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setBoostMenuPostId(null)}>
          <div className="bg-[#0a0c10] border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Priority Feed Boost
              </h3>
              <button onClick={() => setBoostMenuPostId(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <button 
                onClick={() => {
                  setFeed(prev => prev.map(p => {
                    if (p.id === boostMenuPostId) {
                      return { 
                        ...p, 
                        is_boosted: true, 
                        boost_duration: '24h', 
                        boost_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
                      };
                    }
                    return p;
                  }));
                  setBoostMenuPostId(null);
                  triggerNotification?.('⚡ 24-Hour Show Blast Activated');
                }}
                className="w-full text-left p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-center mb-1">
                  <span className="font-bold text-purple-400 tracking-wider">⚡ 24-Hour Show Blast</span>
                  <span className="font-mono text-xs text-purple-500">1 Token / $3.99</span>
                </div>
                <p className="relative text-xs text-zinc-400">Pin to the top of followers' feeds for 24 hours.</p>
              </button>

              <button 
                onClick={() => {
                  setFeed(prev => prev.map(p => {
                    if (p.id === boostMenuPostId) {
                      return { 
                        ...p, 
                        is_boosted: true, 
                        boost_duration: '72h', 
                        boost_expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() 
                      };
                    }
                    return p;
                  }));
                  setBoostMenuPostId(null);
                  triggerNotification?.('🔥 72-Hour Tour Announcement Activated');
                }}
                className="w-full text-left p-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex justify-between items-center mb-1">
                  <span className="font-bold text-red-400 tracking-wider">🔥 72-Hour Tour Announcement</span>
                  <span className="font-mono text-xs text-red-500">2 Tokens / $7.99</span>
                </div>
                <p className="relative text-xs text-zinc-400">Maximum visibility and priority placement for a full weekend.</p>
              </button>
            </div>
            
            <div className="px-4 py-3 bg-black/40 text-[10px] text-zinc-500 font-mono text-center">
              Boosted announcements bypass standard chronological feed indexing.
            </div>
          </div>
        </div>
      )}
`;

file = file.replace(/\{bottomSheetOpen && checkoutItem && \(/, overlayCode + '\n      {bottomSheetOpen && checkoutItem && (');


fs.writeFileSync('./src/components/UniversalSocialFeed.tsx', file);
console.log('Fixed UniversalSocialFeed.tsx');
