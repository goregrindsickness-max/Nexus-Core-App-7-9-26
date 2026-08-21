const fs = require('fs');
const file = 'src/components/social/TimelineFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
const statePattern = `const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);`;
if (!content.includes('activeBoostPostId')) {
  if (content.includes(statePattern)) {
    content = content.replace(
      statePattern,
      `const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);\n  const [activeBoostPostId, setActiveBoostPostId] = useState<string | null>(null);`
    );
  } else {
    // let's insert it after playingSongId
    content = content.replace(
      `const [playingSongId, setPlayingSongId] = useState<string | null>(null);`,
      `const [playingSongId, setPlayingSongId] = useState<string | null>(null);\n  const [activeBoostPostId, setActiveBoostPostId] = useState<string | null>(null);`
    );
  }
}

// Add menu item
const copyLinkStr = `<Share2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Copy Link</span>
                        </button>
                      </div>`;
if (content.includes(copyLinkStr) && !content.includes('Boost Post')) {
  content = content.replace(
    copyLinkStr,
    `<Share2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>Copy Link</span>
                        </button>
                        {isUserOwnPost && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBoostPostId(post.id);
                              setOpenPostMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors text-left"
                          >
                            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Boost Post</span>
                          </button>
                        )}
                      </div>`
  );
}

// Import Rocket (Wait, Rocket is already imported maybe? Let's check imports later, or just assume it is. It's in lucide-react)

// Add Boost Modal
const endOfComponent = `export default TimelineFeed;`;
const boostModalJSX = `
      {/* Boost Post Modal */}
      {activeBoostPostId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveBoostPostId(null)}>
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveBoostPostId(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-black text-white uppercase tracking-widest">Boost Post</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Amplify your reach across the network</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {[
                { duration: '24 Hours', reach: '+5k Views', price: '500 Coins' },
                { duration: '3 Days', reach: '+20k Views', price: '1,500 Coins' },
                { duration: '1 Week', reach: '+50k Views', price: '4,000 Coins' }
              ].map((opt, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left">
                  <div>
                    <div className="text-sm font-bold text-white">{opt.duration}</div>
                    <div className="text-xs font-mono text-emerald-400 mt-0.5">{opt.reach}</div>
                  </div>
                  <div className="text-xs font-black bg-zinc-800 px-2 py-1 rounded text-zinc-300">{opt.price}</div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => {
                alert("Post boosted!");
                setActiveBoostPostId(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono font-bold uppercase tracking-widest transition-colors shadow-lg"
            >
              Select Package
            </button>
          </div>
        </div>
      )}
`;

content = content.replace(`    </div>\n  );\n};\n`, boostModalJSX + `    </div>\n  );\n};\n`);
// fallback if first replace fails
content = content.replace(`    </div>\n  );\n}\n`, boostModalJSX + `    </div>\n  );\n}\n`);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated TimelineFeed.tsx with Boost Modal");
