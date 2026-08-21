import fs from 'fs';

let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');
content = content.replace(/top_song_artist: artist/g, 'top_song_artist: profileTopSongArtist');
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content, 'utf8');

let profileCardContent = fs.readFileSync('src/components/profile/ProfileCard.tsx', 'utf8');
profileCardContent = profileCardContent.replace(
  "export { ListenerMetric, calculateListenerMetrics };",
  "export type { ListenerMetric };\nexport { calculateListenerMetrics };"
);
fs.writeFileSync('src/components/profile/ProfileCard.tsx', profileCardContent, 'utf8');

console.log("Fixed lint errors");
