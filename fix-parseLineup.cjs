const fs = require('fs');
const files = [
  'src/components/portals/Band/ProfileCard.tsx',
  'src/components/portals/Creative/ProfileCard.tsx',
  'src/components/portals/Label/ProfileCard.tsx',
  'src/components/portals/Promoter/ProfileCard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // if parseLineup is unused we can comment it out to be safe from tsc errors
  // but it's probably fine. Let's just remove parseLineup function
  const parseLineupRegex = /const parseLineup = [\s\S]*?return result;\n  };\n/g;
  content = content.replace(parseLineupRegex, '');
  fs.writeFileSync(file, content, 'utf8');
}
