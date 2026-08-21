const fs = require('fs');

let content = fs.readFileSync('subchunk.txt', 'utf-8');
content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
let cleanLine = content.replace(/<div[^>]*\/>/g, '');

const openDivs = (cleanLine.match(/<div(\s|>)/g) || []).length;
const closeDivs = (cleanLine.match(/<\/div>/g) || []).length;

console.log('Subchunk Open:', openDivs, 'Close:', closeDivs);
