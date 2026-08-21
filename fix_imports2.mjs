import fs from 'fs';

const names = ['BandProfileCard', 'ArtistProfileCard', 'LabelProfileCard', 'PromoterProfileCard'];

for (const name of names) {
  let content = fs.readFileSync(`src/components/profile/${name}.tsx`, 'utf8');
  
  content = content.replace(/from '\.\.\/\.\.\/MarqueeText'/g, "from '../MarqueeText'");
  content = content.replace(/from '\.\.\/\.\.\/hooks/g, "from '../hooks");
  content = content.replace(/from '\.\.\/\.\.\/supabase'/g, "from '../../supabase'");
  
  fs.writeFileSync(`src/components/profile/${name}.tsx`, content);
}
console.log("Imports fixed again.");
