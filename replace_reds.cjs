const fs = require('fs');

let content = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

const replacements = [
  { from: 'text-red-400/80', to: 'text-emerald-400/80' },
  { from: "? 'border-red-500 text-red-400 shadow-[0_0_6px_rgba(239,68,68,0.2)]'", to: "? 'border-emerald-500 text-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.2)]'" },
  { from: 'hover:text-red-400', to: 'hover:text-emerald-400' },
  { from: 'border-red-900/30', to: 'border-emerald-900/30' },
  { from: 'bg-red-950/15', to: 'bg-emerald-950/15' },
  { from: 'hover:bg-red-950/25', to: 'hover:bg-emerald-950/25' },
  { from: 'text-red-400 focus:border-red-500', to: 'text-emerald-400 focus:border-emerald-500' },
  { from: 'accent-red-500', to: 'accent-emerald-500' },
  { from: "? 'bg-red-950 border-red-500 text-red-400 font-bold shadow-[0_0_8px_rgba(239,68,68,0.2)]'", to: "? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'" },
  { from: 'text-red-500 hover:text-red-400', to: 'text-emerald-500 hover:text-emerald-400' } // for the "x" button
];

// We only want to replace inside the BAND section. 
// Find the index of BAND section
const startIdx = content.indexOf("<h3 className=\"text-[11px] font-black tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]\">Band & Solo Artist Portal</h3>");
const endIdx = content.indexOf("Section A: Label Corporate & Distribution Branding", startIdx);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find start or end index");
    process.exit(1);
}

let before = content.substring(0, startIdx);
let bandSection = content.substring(startIdx, endIdx);
let after = content.substring(endIdx);

// Also replace the drop-shadow on the title
bandSection = bandSection.replace("drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]", "drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]");

for (const r of replacements) {
    // replaceAll
    bandSection = bandSection.split(r.from).join(r.to);
}

// wait, there is one text-red-400 focus:border-red-500 without replaceAll?
bandSection = bandSection.replace(/text-red-400 focus:border-red-500/g, "text-emerald-400 focus:border-emerald-500");

fs.writeFileSync('src/components/LoginView.tsx', before + bandSection + after);
console.log("Colors replaced successfully.");
