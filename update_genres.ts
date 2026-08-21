import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = '["Groovy Goregrind", "Cybergrind", "Pornogrind", "Blackened Grindcore", "Noisegrind", "Mathgrind", "Speed Metal", "Thrashcore"]';
const replacement = '["Groovy Goregrind", "Cybergrind", "Pornogrind", "Blackened Grindcore", "Noisegrind", "Mathgrind", "Speed Metal", "Thrashcore", "Miasmic Guttural", "Slam Death Metal", "Cyber Slam", "Goregrind/ Pornogrind"]';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully added genres to master list in UI.");
} else {
  console.log("Target not found.");
}
