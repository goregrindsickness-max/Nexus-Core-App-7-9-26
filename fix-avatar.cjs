const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldHeader = `                {/* Avatar section */}
                <div className="flex justify-between items-end -mt-12 mb-4">
                  <div className="relative group/avatar">
                    <div className=\`w-20 h-20 rounded-full bg-zinc-950 flex items-center justify-center text-3xl font-black text-white shrink-0 overflow-hidden border-4 relative \${`;

const newHeader = `                {/* Avatar section */}
                <div className="flex justify-between items-end -mt-12 mb-4">
                  <div className="relative group/avatar flex items-end gap-3">
                    <div className=\`w-24 h-24 rounded-full bg-zinc-950 flex items-center justify-center text-3xl font-black text-white shrink-0 overflow-hidden border-[3px] relative \${`;

code = code.replace(oldHeader, newHeader);

const oldDevBadge = `                      if (isPro && (!r.includes('artist') && !r.includes('band') && !r.includes('promoter') && !r.includes('label') && !r.includes('creative'))) {
                        return (
                          <span className="absolute -bottom-1 -right-1 text-[10px] font-mono bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded">
                            {r.includes('operator') ? '⚡ OPERATOR' : '🛠️ DEVELOPER'}
                          </span>
                        );
                      }
                      return (
                        <span className={\`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border \${`;

const newDevBadge = `                      if (isPro && (!r.includes('artist') && !r.includes('band') && !r.includes('promoter') && !r.includes('label') && !r.includes('creative'))) {
                        return (
                          <span className="text-[10px] font-mono bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded mb-2">
                            {r.includes('operator') ? '⚡ OPERATOR' : '💼 PROFESSIONAL'}
                          </span>
                        );
                      }
                      return (
                        <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mb-2 \${`;

code = code.replace(oldDevBadge, newDevBadge);

const oldCoverBanner = `<div className="h-32 w-full bg-gradient-to-r from-rose-950/60 via-zinc-900 to-purple-950/60 relative overflow-hidden flex items-center justify-center group">`;
const newCoverBanner = `<div className="h-40 w-full bg-gradient-to-r from-rose-950/60 via-zinc-900 to-purple-950/60 relative overflow-hidden flex items-center justify-center group">`;
code = code.replace(oldCoverBanner, newCoverBanner);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Avatar and Cover updated");
