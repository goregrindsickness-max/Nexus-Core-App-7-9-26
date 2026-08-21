const fs = require('fs');
const file = 'src/components/social/StoriesCarouselSection.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}`,
  `onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400';
                }}`
);

content = content.replace(
  `onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}`,
  `onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150';
                }}`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated StoriesCarouselSection.tsx fallbacks");
