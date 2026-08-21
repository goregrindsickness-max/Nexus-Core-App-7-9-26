const fs = require('fs');

let content = fs.readFileSync('src/components/PromoterDashboardViewV2.tsx', 'utf-8');
content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const lines = content.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.includes('<section')) stack.push('section:' + (i+1));
  
  let cleanLine = line.replace(/<div[^>]*\/>/g, '');
  
  const openDivs = (cleanLine.match(/<div(\s|>)/g) || []).length;
  const closeDivs = (cleanLine.match(/<\/div>/g) || []).length;
  
  for(let j = 0; j < openDivs; j++) stack.push('div:' + (i+1));
  for(let j = 0; j < closeDivs; j++) {
      if (stack.length === 0) {
          console.log(`Extra </div> at line ${i+1}`);
      } else {
          const top = stack.pop();
          if (top.startsWith('section')) {
              console.log(`Mismatch: closed section with </div> at line ${i+1}`);
          }
      }
  }
  
  if (line.includes('</section>')) {
      const top = stack.pop();
      if (!top || !top.startsWith('section')) {
          console.log(`Mismatch: closed ${top} with </section> at line ${i+1}`);
      }
  }
}
console.log('Unclosed tags at end:', stack);
