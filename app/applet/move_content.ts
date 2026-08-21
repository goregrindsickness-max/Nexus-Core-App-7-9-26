import fs from 'fs';

const filePath = 'src/components/TourNotesView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /({\/\* ============================== \*\/}\n\s*{\/\* MUSICIAN'S TACTICAL ROAD KITS \*\/}\n\s*{\/\* ============================== \*\/}\n\s*<div id="musician-tactical-kits"[\s\S]*?)(\s*)(?={\/\* TOP WORKSPACE: INLINE NOTE CREATOR \*\/})/s;

const match = content.match(regex);
if (match) {
  const block = match[1];
  content = content.replace(block, '');
  
  content = content.replace(
    /\s*<\/div>\n\s*<\/div>\n\s*\{\/\* FLOAT ACTION BUTTON FOR NOTES WRAPPER/,
    `\n        </div>\n${block}\n      </div>\n\n      {/* FLOAT ACTION BUTTON FOR NOTES WRAPPER`
  );
  
  fs.writeFileSync(filePath, content);
  console.log("Successfully moved toolkit.");
} else {
  console.log("Failed to find Toolkit block.");
}
