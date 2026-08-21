const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const tourTabStart = `                  {profileActiveTab === 'shop'`;
const tourTabNew = `                  {profileActiveTab === 'tour' && (
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 text-center">
                      <MapPin className="w-8 h-8 text-emerald-500 mx-auto mb-3 opacity-50" />
                      <h4 className="text-zinc-300 font-mono text-sm uppercase tracking-widest font-black mb-1">Live Itinerary</h4>
                      <p className="text-zinc-500 text-[10px] uppercase font-mono max-w-[200px] mx-auto">Routing schedules and confirmed dates are managed via the professional backend.</p>
                    </div>
                  )}
                  {profileActiveTab === 'shop'`;

content = content.replace(tourTabStart, tourTabNew);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Tour tab content added!");
