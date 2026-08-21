const fs = require('fs');
const file = 'src/components/social/StoriesCarouselSection.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<img
                src={story.image || 'https://images.unsplash.com/photo-1540039155732-d6741b687c22?q=80&w=600'}
                alt={story.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />`,
  `<img
                src={story.image || 'https://images.unsplash.com/photo-1540039155732-d6741b687c22?q=80&w=600'}
                alt={story.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />`
);

content = content.replace(
  `<img src={story?.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />`,
  `<img src={story?.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} />`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated StoriesCarouselSection.tsx");
