const fs = require('fs');
const file = '/app/applet/src/components/portals/Band/ProfileCard.tsx';

let content = fs.readFileSync(file, 'utf8');

const oldBandLogic = `                       if (p.lineup && Array.isArray(p.lineup) && targetName && p.lineup.some((m: any) => m?.name?.includes(targetName) || m?.member?.includes(targetName))) return true;
                       return false;
                     });`;

const newBandLogic = `                       if (p.lineup && Array.isArray(p.lineup) && targetName && p.lineup.some((m: any) => m?.name?.includes(targetName) || m?.member?.includes(targetName))) return true;
                       if (effTarget.band_id && p.id === effTarget.band_id) return true;
                       if (effTarget.band_name && (p.name === effTarget.band_name || p.band_name === effTarget.band_name)) return true;
                       return false;
                     });`;

if (content.includes(oldBandLogic)) {
  content = content.replace(oldBandLogic, newBandLogic);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Updated", file);
} else {
  console.log("Could not find block in", file);
}
