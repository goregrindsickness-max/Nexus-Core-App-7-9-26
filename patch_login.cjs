const fs = require('fs');

let content = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

// 1. Add new state variables right after setBandSectionCOpen
const stateToAdd = `
  const [bandSubGenres, setBandSubGenres] = useState<string[]>([]);
  const [bandBookingEmail, setBandBookingEmail] = useState('');
  const [bandBookingPhone, setBandBookingPhone] = useState('');
  const [bandTechRider, setBandTechRider] = useState('');
  const [bandHeadcount, setBandHeadcount] = useState(1);
  const [bandRoster, setBandRoster] = useState<{name: string, role: string, access: string}[]>([]);
  const [newRosterName, setNewRosterName] = useState('');
  const [newRosterRole, setNewRosterRole] = useState('');
  const [newRosterAccess, setNewRosterAccess] = useState('Level 1');
  const [bandStripeConnected, setBandStripeConnected] = useState(false);
  const [bandPaypalConnected, setBandPaypalConnected] = useState(false);
`;

content = content.replace(
  "const [bandSectionCOpen, setBandSectionCOpen] = useState(false);",
  "const [bandSectionCOpen, setBandSectionCOpen] = useState(false);\n" + stateToAdd
);

// 2. Locate Band Portal start line
const bandStartIdx = content.indexOf("<h3 className=\"text-[11px] font-black tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]\">Band & Solo Artist Portal</h3>");
const labelStartIdx = content.indexOf("labelSectionAOpen(!labelSectionAOpen)"); // Next section

let beforeBand = content.substring(0, bandStartIdx);
let bandSection = content.substring(bandStartIdx, labelStartIdx);
let afterBand = content.substring(labelStartIdx);

// Perform red -> emerald replacements in the band section
bandSection = bandSection.replace(/rgba\(239,68,68,/g, 'rgba(16,185,129,');
bandSection = bandSection.replace(/text-red-400/g, 'text-emerald-400 font-mono uppercase tracking-wider');
bandSection = bandSection.replace(/text-red-500/g, 'text-emerald-500');
bandSection = bandSection.replace(/bg-red-950/g, 'bg-emerald-950/40');
bandSection = bandSection.replace(/border-red-900/g, 'border-emerald-900');
bandSection = bandSection.replace(/border-red-500/g, 'border-emerald-500/30 focus:border-emerald-400');
bandSection = bandSection.replace(/accent-red-500/g, 'accent-emerald-500');
bandSection = bandSection.replace(/hover:bg-red-950/g, 'hover:bg-emerald-950/60');
bandSection = bandSection.replace(/shadow-\[0_0_6px_rgba\(239,68,68,0\.2\)\]/g, 'shadow-[0_0_6px_rgba(16,185,129,0.2)]');

// Replace Custom URL Slug section to add Booking info
const urlSlugReplacement = `
                                <div className="space-y-1.5 text-left">
                                  <label className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase">Custom URL Slug (For EPK/Profile)</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. my-awesome-band"
                                    value={profileSlug}
                                    onChange={(e) => setProfileSlug(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs font-mono text-emerald-400 font-mono uppercase tracking-wider focus:border-emerald-500/30 focus:border-emerald-400 outline-none placeholder-zinc-700"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5 text-left">
                                  <label className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase">Booking Representative Email</label>
                                  <input 
                                    type="email" 
                                    placeholder="Booking Agent / Manager Email"
                                    value={bandBookingEmail}
                                    onChange={(e) => setBandBookingEmail(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-sans focus:border-emerald-500 outline-none placeholder-zinc-700"
                                  />
                                </div>
                                <div className="space-y-1.5 text-left">
                                  <label className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase">Booking Representative Phone</label>
                                  <input 
                                    type="tel" 
                                    placeholder="Contact Phone"
                                    value={bandBookingPhone}
                                    onChange={(e) => setBandBookingPhone(e.target.value.replace(/[^0-9+-() ]/g, ''))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-sans focus:border-emerald-500 outline-none placeholder-zinc-700"
                                  />
                                </div>
`;

bandSection = bandSection.replace(/<div className="space-y-1\.5 text-left">\s*<label className="text-\[8px\] font-mono tracking-wider text-zinc-500 uppercase">Custom URL Slug \(For EPK\/Profile\)<\/label>\s*<input[^>]+>\s*<\/div>\s*<\/div>/, urlSlugReplacement);


// Replace Subgenre dropdown with multi-select chip tags
const subgenreRegex = /<div className="space-y-1\.5 text-left">\s*<label className="text-\[8px\] font-mono tracking-wider text-zinc-500 uppercase">Specific Subgenre \/ Style<\/label>[\s\S]*?<\/select>\s*<\/div>/;

const subgenreReplacement = `
                              <div className="space-y-1.5 text-left">
                                <label className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase">Specific Subgenre / Style (Select up to 3)</label>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {MASTER_GENRES.find(c => c.name === bandGenre)?.tags.map(tag => {
                                    const isSelected = bandSubGenres.includes(tag.label);
                                    return (
                                      <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setBandSubGenres(prev => prev.filter(t => t !== tag.label));
                                          } else if (bandSubGenres.length < 3) {
                                            setBandSubGenres(prev => [...prev, tag.label]);
                                          }
                                        }}
                                        className={\`text-[9px] font-mono px-2.5 py-1.5 rounded transition-colors \${isSelected ? 'bg-emerald-500/20 text-emerald-400 font-mono uppercase tracking-wider border border-emerald-500/40 shadow-sm' : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700'}\`}
                                      >
                                        {tag.label.toUpperCase()}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
`;

bandSection = bandSection.replace(subgenreRegex, subgenreReplacement);

// Production Spec URL Input
const audioHubRegex = /<div className="space-y-1\.5 text-left">\s*<label className="text-\[8px\] font-mono tracking-wider text-zinc-500 uppercase">Bandcamp \/ Spotify \/ SoundCloud Audio Hub URL<\/label>\s*<input[^>]+>\s*<\/div>/;

const prodSpecReplacement = `$&
                            <div className="space-y-1.5 text-left mt-4">
                              <label className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">PRODUCTION SPECIFICATIONS</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Technical Rider / Stage Plot Link" 
                                  value={bandTechRider}
                                  onChange={(e) => setBandTechRider(e.target.value)}
                                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-sans text-emerald-400 font-mono uppercase tracking-wider focus:border-emerald-500/30 focus:border-emerald-400 outline-none placeholder-zinc-700" 
                                />
                                <div className="relative overflow-hidden shrink-0 cursor-pointer">
                                  <button type="button" className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] px-3 py-3 rounded-lg uppercase transition-colors tracking-widest">
                                    Attach File
                                  </button>
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                              </div>
                            </div>
`;
bandSection = bandSection.replace(audioHubRegex, prodSpecReplacement);


// Headcount Quantification Node
const touringVehicleRegex = /<div className="space-y-1\.5 text-left">\s*<label className="text-\[8px\] font-mono tracking-wider text-zinc-500 uppercase">Primary Touring \/ Gigging Vehicle<\/label>[\s\S]*?<\/select>\s*<\/div>/;

const headcountReplacement = `$&
                              <div className="space-y-1.5 text-left">
                                <label className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase">Total Touring Party Headcount</label>
                                <input 
                                  type="number" 
                                  min="1"
                                  value={bandHeadcount}
                                  onChange={(e) => setBandHeadcount(parseInt(e.target.value) || 1)}
                                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-sm text-emerald-400 font-mono uppercase tracking-wider focus:border-emerald-500/30 focus:border-emerald-400 outline-none" 
                                />
                                <p className="text-[9px] font-sans text-zinc-600 mt-1">Includes all performing musicians, merch managers, and traveling crew members for contract catering calculations.</p>
                              </div>
`;

bandSection = bandSection.replace(touringVehicleRegex, headcountReplacement);

// Dynamic Roster Deck Matrix
const apparelRegex = /<div className="space-y-1\.5 text-left">\s*<label className="text-\[8px\] font-mono tracking-wider text-zinc-500 uppercase">Apparel \/ Merch Size Requirements<\/label>[\s\S]*?<\/div>\s*<\/div>/;

const rosterReplacement = `$&
                            <div className="space-y-2 pt-4 text-left">
                              <label className="text-[10px] font-mono tracking-wider text-emerald-400 font-mono uppercase tracking-wider font-bold">👥 BAND ROSTER & ACCESS LEVELS</label>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                                <input 
                                  type="text" 
                                  placeholder="Name" 
                                  value={newRosterName}
                                  onChange={(e) => setNewRosterName(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-xs text-white outline-none" 
                                />
                                <input 
                                  type="text" 
                                  placeholder="e.g., Drums / Vocals" 
                                  value={newRosterRole}
                                  onChange={(e) => setNewRosterRole(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-xs text-white outline-none" 
                                />
                                <select 
                                  value={newRosterAccess}
                                  onChange={(e) => setNewRosterAccess(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg text-xs text-zinc-400 outline-none"
                                >
                                  <option value="Level 1">Level 1 (View Only)</option>
                                  <option value="Level 2">Level 2 (Finance)</option>
                                  <option value="Level 3">Level 3 (Manager)</option>
                                  <option value="Level 4">Level 4 (Admin)</option>
                                  <option value="Level 5">Level 5 (Owner)</option>
                                </select>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    if (newRosterName && newRosterRole) {
                                      setBandRoster(prev => [...prev, { name: newRosterName, role: newRosterRole, access: newRosterAccess }]);
                                      setNewRosterName('');
                                      setNewRosterRole('');
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] rounded-lg transition-colors py-2.5"
                                >
                                  [ ➕ ADD MEMBER ]
                                </button>
                              </div>

                              <div className="space-y-1">
                                {bandRoster.map((member, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded p-2 text-xs">
                                    <div className="flex items-center gap-3">
                                      <span className="font-bold text-white">{member.name}</span>
                                      <span className="text-zinc-500 font-mono text-[10px]">{member.role}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-emerald-400 font-mono uppercase tracking-wider text-[9px] px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-500/30">{member.access}</span>
                                      <button 
                                        type="button" 
                                        className="text-red-500 hover:text-red-400"
                                        onClick={() => setBandRoster(prev => prev.filter((_, i) => i !== idx))}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
`;

bandSection = bandSection.replace(apparelRegex, rosterReplacement);

// Secure Business OAuth Controllers
const financialRoutingRegex = /<label className="text-\[8px\] font-mono tracking-wider text-zinc-500 uppercase">FINANCIAL SETTLEMENT ROUTING<\/label>\s*<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">[\s\S]*?<\/div>\s*<\/div>/;

const oauthReplacement = `
                              <label className="text-[8px] font-mono tracking-wider text-zinc-500 uppercase">FINANCIAL SETTLEMENT ROUTING</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/auth/stripe/url');
                                      if (!response.ok) throw new Error('Failed to fetch Stripe auth URL');
                                      const { url } = await response.json();
                                      const width = 600, height = 700;
                                      const left = window.screen.width / 2 - width / 2;
                                      const top = window.screen.height / 2 - height / 2;
                                      const win = window.open(url, 'stripe_oauth_popup', \`width=\${width},height=\${height},top=\${top},left=\${left}\`);
                                      if (!win) {
                                        triggerNotification?.("⚠️ POPUP BLOCKED: Please enable popups.");
                                      } else {
                                        setBandStripeConnected(true);
                                      }
                                    } catch (err) {
                                      triggerNotification?.(\`⚠️ STRIPE CONNECT ERROR\`);
                                    }
                                  }}
                                  className="w-full bg-[#635bff] hover:bg-[#7a73ff] text-white font-sans text-xs py-3 rounded-lg font-bold uppercase tracking-wider text-center cursor-pointer"
                                >
                                  {bandStripeConnected ? '[ STRIPE MERCHANT CONNECTED ]' : '[ 💳 CONNECT WITH STRIPE ]'}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/auth/paypal/url');
                                      if (!response.ok) throw new Error('Failed to fetch PayPal auth URL');
                                      const { url } = await response.json();
                                      const width = 600, height = 700;
                                      const left = window.screen.width / 2 - width / 2;
                                      const top = window.screen.height / 2 - height / 2;
                                      const win = window.open(url, 'paypal_oauth_popup', \`width=\${width},height=\${height},top=\${top},left=\${left}\`);
                                      if (!win) {
                                        triggerNotification?.("⚠️ POPUP BLOCKED: Please enable popups.");
                                      } else {
                                        setBandPaypalConnected(true);
                                      }
                                    } catch (err) {
                                      triggerNotification?.(\`⚠️ PAYPAL CONNECT ERROR\`);
                                    }
                                  }}
                                  className="w-full bg-[#0070ba] hover:bg-[#0079c1] text-white font-sans text-xs py-3 rounded-lg font-bold uppercase tracking-wider text-center cursor-pointer"
                                >
                                  {bandPaypalConnected ? '[ PAYPAL MERCHANT CONNECTED ]' : '[ 🟦 LINK PAYPAL BUSINESS ]'}
                                </button>
                              </div>
`;

bandSection = bandSection.replace(financialRoutingRegex, oauthReplacement);


// Lastly, ensure Checkbox for DEFER HIGH-QUALITY WAV MUSIC uses emerald-500
bandSection = bandSection.replace(/accent-red-500/g, 'accent-emerald-500');

fs.writeFileSync('src/components/LoginView.tsx', beforeBand + bandSection + afterBand);
console.log("Patched LoginView successfully");
