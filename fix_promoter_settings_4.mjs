import fs from 'fs';

let content = fs.readFileSync('src/components/PromoterSettingsTab.tsx', 'utf-8');

const workspaceHeader = `          </V2ExpandableCard>
        </div>
      </div>

      {/* WORKSPACE MANAGEMENT GROUP */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Workspace Management</h3>
        </div>

        <div className="space-y-3">
          {/* 5. ACCORDION TAB: Collaborator Team & Roster */}`;

content = content.replace(
  `        </div>
      </div>

      {/* WORKSPACE MANAGEMENT GROUP */}`,
  `          </V2ExpandableCard>
        </div>
      </div>

      {/* WORKSPACE MANAGEMENT GROUP */}`
);

fs.writeFileSync('src/components/PromoterSettingsTab.tsx', content);
console.log("Done4");
