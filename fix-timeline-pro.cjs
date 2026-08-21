const fs = require('fs');
const file = 'src/components/social/TimelineFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const isIndustryPro = (post.authorRole || '').toUpperCase().includes('INDUSTRY');",
  "const isIndustryPro = (post.authorRole || '').toUpperCase().includes('INDUSTRY') || (post.authorRole || '').toUpperCase() === 'PRO' || (post.authorRole || '').toUpperCase() === 'INDUSTRY_PRO';"
);

content = content.replace(
  `<p className="text-[11px] font-mono font-semibold text-zinc-400 tracking-wide mt-0.5 truncate">`,
  `<p className={\`text-[11px] font-mono font-semibold tracking-wide mt-0.5 truncate \${isIndustryPro ? 'text-purple-400' : 'text-zinc-400'}\`}>`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated TimelineFeed.tsx");
