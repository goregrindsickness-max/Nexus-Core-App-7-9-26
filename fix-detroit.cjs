const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldDetroit = `  const [profileLocation, setProfileLocation] = useState(() => {
    if (portalRole === 'label' && userProfile?.label_headquarters) {
      return userProfile.label_headquarters;
    }
    return 'Detroit, MI';
  });`;

const newDetroit = `  const [profileLocation, setProfileLocation] = useState(() => {
    if (portalRole === 'label' && userProfile?.label_headquarters) {
      return userProfile.label_headquarters;
    }
    if (userProfile?.email === 'goregrindsickness@gmail.com' || (userProfile?.email || '').toLowerCase() === 'goregrindsickness@gmail.com') {
      return 'Denison, TX';
    }
    return 'Detroit, MI';
  });`;

code = code.replace(oldDetroit, newDetroit);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Detroit updated");
