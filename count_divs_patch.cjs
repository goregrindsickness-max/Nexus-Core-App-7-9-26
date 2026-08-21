const fs = require('fs');

let content = fs.readFileSync('patch_v2_routing.py', 'utf-8');
let newContentMatch = content.match(/new_content = """([\s\S]*?)"""/);
if (!newContentMatch) {
    console.log("no match"); process.exit(1);
}
let newContent = newContentMatch[1];
newContent = newContent.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
let cleanLine = newContent.replace(/<div[^>]*\/>/g, '');

const openDivs = (cleanLine.match(/<div(\s|>)/g) || []).length;
const closeDivs = (cleanLine.match(/<\/div>/g) || []).length;

console.log('Open:', openDivs, 'Close:', closeDivs);
