const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                                const updatedUser = uPrev ? {
                                  ...uPrev,
                                  name: bandInfoName.trim(),
                                  bandName: bandInfoName.trim(),
                                  avatar_url: finalLogo || uPrev.avatar_url,
                                  banner_url: finalCover || uPrev.banner_url
                                } : null;`;

const replacement = `                                const updatedUser = uPrev ? {
                                  ...uPrev,
                                  bandName: bandInfoName.trim(),
                                } : null;`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patch 10 applied!');
} else {
  console.log('Target 10 not found!');
}
