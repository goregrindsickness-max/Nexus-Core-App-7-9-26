const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `            const parsedPost = JSON.parse(text);
            setFeed(prev => {
              const exists = prev.find(p => p.id === parsedPost.id);`;

const replacement = `            const parsedPost = JSON.parse(text);
            _setFeed(prev => {
              const exists = prev.find(p => p.id === parsedPost.id);`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Fixed setFeed to _setFeed in realtime listener.");
