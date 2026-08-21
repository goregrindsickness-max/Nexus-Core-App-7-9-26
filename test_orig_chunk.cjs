const fs = require('fs');

let content = fs.readFileSync('temp_routing.txt', 'utf-8');
content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
let cleanLine = content.replace(/<div[^>]*\/>/g, '');

const openDivs = (cleanLine.match(/<div(\s|>)/g) || []).length;
const closeDivs = (cleanLine.match(/<\/div>/g) || []).length;

console.log('Original tab Open:', openDivs, 'Close:', closeDivs);
