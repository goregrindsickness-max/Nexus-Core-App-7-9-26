const fs = require('fs');
const files = [
  '/app/applet/src/components/portals/Creative/ProfileCard.tsx',
  '/app/applet/src/components/portals/Label/ProfileCard.tsx',
  '/app/applet/src/components/portals/Promoter/ProfileCard.tsx'
];

const oldBandLogic = `                       if (p.lineup && Array.isArray(p.lineup) && targetName && p.lineup.some((m: any) => m?.name?.includes(targetName) || m?.member?.includes(targetName))) return true;
                       return false;
                     });`;

const newBandLogic = `                       if (p.lineup && Array.isArray(p.lineup) && targetName && p.lineup.some((m: any) => m?.name?.includes(targetName) || m?.member?.includes(targetName))) return true;
                       if (effTarget.band_id && p.id === effTarget.band_id) return true;
                       if (effTarget.band_name && (p.name === effTarget.band_name || p.band_name === effTarget.band_name)) return true;
                       return false;
                     });`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldBandLogic)) {
      content = content.replace(oldBandLogic, newBandLogic);
      fs.writeFileSync(file, content, 'utf8');
      console.log("Updated", file);
    } else {
      console.log("Could not find block in", file);
    }
  }
}
