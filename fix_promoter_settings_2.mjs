import fs from 'fs';

let content = fs.readFileSync('src/components/PromoterSettingsTab.tsx', 'utf-8');

const utilitiesHeader = `          </V2ExpandableCard>
        </div>
      </div>

      {/* UTILITIES GROUP */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Utilities</h3>
        </div>

        <div className="space-y-3">
          {/* 11. ACCORDION TAB: Share Your Experience */}`;

content = content.replace(
  '          </V2ExpandableCard>\n\n          {/* 11. ACCORDION TAB: Share Your Experience */}',
  utilitiesHeader
);

fs.writeFileSync('src/components/PromoterSettingsTab.tsx', content);
console.log("Done2");
