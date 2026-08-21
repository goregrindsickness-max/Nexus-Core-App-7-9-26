import fs from 'fs';

let content = fs.readFileSync('src/components/PromoterSettingsTab.tsx', 'utf-8');

// Update Group Headers
content = content.replace(
  '<h3 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Promoter Profile settings</h3>',
  '<h3 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">Profile Settings</h3>'
);

// Add Workspace Management Group Header
const workspaceHeader = `        </div>
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
  '          </V2ExpandableCard>\n\n          {/* 5. ACCORDION TAB: Collaborator Team & Roster */}',
  workspaceHeader
);

// Add Utilities Group Header
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
          {/* 11. ACCORDION TAB: Feedback */}`;

content = content.replace(
  '          </V2ExpandableCard>\n\n          {/* 11. ACCORDION TAB: Feedback */}',
  utilitiesHeader
);


// Update Card Titles
content = content.replace(
  'title="Promoter Profile & Portfolio Media"',
  'title="Promoter Profile & Media"'
);

content = content.replace(
  'title="Dry-Hire Gear Specifications & Tech Inventory"',
  'title="Venue Profiles & Specs"'
);

content = content.replace(
  'title="Promoter Rates, Day Rates & Contracts Setup"',
  'title="Standard Offer Defaults"'
);

content = content.replace(
  'title="Subcultural Genre Specialties & Core Skills"',
  'title="Genre & Booking Preferences"'
);

content = content.replace(
  'title="Collaborators, Co-Op Crew & Seat Licenses"',
  'title="Team Members & Roles"'
);

content = content.replace(
  'title="💸 Payout Settings"',
  'title="Payout Accounts"'
);

content = content.replace(
  'title="Workstation Peripherals & Audio/Video Tools"',
  'title="Ticketing & POS Integrations"'
);

content = content.replace(
  'title="Subscription Tiers & Seat Billing"',
  'title="Subscription & Billing"'
);

content = content.replace(
  'title="System Preferences & Analytics Slates"',
  'title="System Preferences"'
);

content = content.replace(
  'title="Interactive Support Help Desk"',
  'title="Help Desk"'
);

content = content.replace(
  'title="Client Experience Feedback & Reviews"',
  'title="Share Your Experience"'
);

content = content.replace(
  'title="Co-Op Terms of Service & Privacy Shield"',
  'title="Terms of Service"'
);


fs.writeFileSync('src/components/PromoterSettingsTab.tsx', content);
console.log("Done");
