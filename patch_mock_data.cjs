const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove imports from mockDatabase
content = content.replace(/import\s*\{\s*dbBands,\s*dbShows,\s*dbInventoryItems,\s*dbSales,\s*dbInventoryAudits,\s*dbTourNotes,\s*dbChecklistItems,\s*dbFlights,\s*dbUserReviews\s*\}\s*from\s*'\.\/data\/mockDatabase';/g, '');
content = content.replace(/import\s*\{\s*dbBands,\s*dbShows,\s*dbInventoryItems,\s*dbSales,\s*dbInventoryAudits,\s*dbFlights,\s*dbUserReviews\s*\}\s*from\s*'\.\/data\/mockDatabase';/g, '');


// Replace variable usages
content = content.replace(/dbBands/g, '[]');
content = content.replace(/dbShows/g, '[]');
content = content.replace(/dbInventoryItems/g, '[]');
content = content.replace(/dbSales/g, '[]');
content = content.replace(/dbInventoryAudits/g, '[]');
content = content.replace(/dbTourNotes/g, '[]');
content = content.replace(/dbChecklistItems/g, '[]');
content = content.replace(/dbFlights/g, '[]');
content = content.replace(/dbUserReviews/g, '[]');

fs.writeFileSync('src/App.tsx', content);
console.log("Patched mock data in App.tsx");
