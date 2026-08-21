import fs from 'fs';

const names = ['BandProfileCard', 'ArtistProfileCard', 'LabelProfileCard', 'PromoterProfileCard'];

for (const name of names) {
  let content = fs.readFileSync(`src/components/profile/${name}.tsx`, 'utf8');
  
  // replace ../../../ with ../../
  content = content.replace(/\.\.\/\.\.\/\.\.\//g, '../../');
  
  // replace ../../profile with ./
  content = content.replace(/\.\.\/\.\.\/profile\//g, './');
  
  fs.writeFileSync(`src/components/profile/${name}.tsx`, content);
}
console.log("Imports fixed.");
