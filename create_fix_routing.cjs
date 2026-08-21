const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = '{/* COMPREHENSIVE CURRENT AND UPCOMING SHOWS & DRAFTS LIST */}';
const startIdx = content.indexOf(targetStr);

// Let's find where the ALL SHOWS & DRAFTS div ends.
// It starts at `<div \n                  className="w-full bg-black/60 border border-zinc-900/30 rounded-xl p-4 flex flex-col gap-3 min-h-[300px] max-h-[500px]"`
// We want to extract it... wait, it's easier to move the closing `</div>` of the grid.
// Where is the closing </div> of the grid? It should be right before the "ALL SHOWS & DRAFTS" block? No, it's currently AFTER it! We want to close the `lg:col-span-6` and the `grid` BEFORE the `ALL SHOWS & DRAFTS`.

// Wait, the grid contains:
// 1. SWIPEABLE CALENDAR COLUMN (col-span-6)
// 2. DETAILED EVENT DAY SHEET INFO PANEL (col-span-6)
// Inside the second column is the `ALL SHOWS ...` block.
// We want to close the col-span-6 and the grid right before `ALL SHOWS & DRAFTS`.

const replaceText = '                </div>\n\n                {/* COMPREHENSIVE CURRENT AND UPCOMING SHOWS & DRAFTS LIST */}';
const newText = '                </div>\n              </div>\n            </div>\n\n            {/* COMPREHENSIVE CURRENT AND UPCOMING SHOWS & DRAFTS LIST */}';

content = content.replace(replaceText, newText);

// But we also need to remove the matching closing tags later.
// The grid has two closing tags `</div>\n            </div>` at the end? Let's search for what's after `ALL SHOWS & DRAFTS`.
// Actually, it's safer to just use exact replacement.
fs.writeFileSync('fix_routing.cjs', 'console.log("script ready");');
