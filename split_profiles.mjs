import fs from 'fs';

const fileContent = fs.readFileSync('src/components/social/modals/PublicProfileModal.tsx', 'utf8');

const names = ['BandProfileCard', 'ArtistProfileCard', 'LabelProfileCard', 'PromoterProfileCard'];

for (const name of names) {
  let content = fileContent;
  content = content.replace(/export const PublicProfileModal: React\.FC<PublicProfileModalProps> = \(\{/g, `export const ${name}: React.FC<PublicProfileModalProps> = ({`);
  
  // also change the default export if there is one
  content = content.replace(/export default PublicProfileModal;/g, `export default ${name};`);
  
  fs.writeFileSync(`src/components/profile/${name}.tsx`, content);
}

console.log("Files created.");
