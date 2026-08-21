import fs from 'fs';

const names = ['BandProfileCard', 'ArtistProfileCard', 'LabelProfileCard', 'PromoterProfileCard'];

for (const name of names) {
  let content = fs.readFileSync(`src/components/profile/${name}.tsx`, 'utf8');
  
  // Remove the old ProfileCardProps, ProfileCard, and PublicProfileModalProps
  const propsStart = content.indexOf('export interface ProfileCardProps');
  const modalPropsStart = content.indexOf('interface PublicProfileModalProps {');
  const modalPropsEnd = content.indexOf(`export const ${name}: React.FC<PublicProfileModalProps>`);
  
  if (propsStart !== -1 && modalPropsEnd !== -1) {
    const topPart = content.substring(0, propsStart);
    const bottomPart = content.substring(modalPropsEnd);
    
    // add import for PublicProfileModalProps
    const importStr = `import { PublicProfileModalProps } from '../social/modals/PublicProfileModal';\n`;
    
    content = topPart + importStr + bottomPart;
    fs.writeFileSync(`src/components/profile/${name}.tsx`, content);
  }
}
console.log("Profile cards cleaned.");
