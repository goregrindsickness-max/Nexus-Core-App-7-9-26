const fs = require('fs');
let content = fs.readFileSync('src/data/mockDatabase.ts', 'utf8');

// Replace everything after SEED PLAYGROUND DATABASE ARRAYS with empty arrays
const splitPoint = "/* ==========================================\n * SEED PLAYGROUND DATABASE ARRAYS\n * ========================================== */";
if (content.includes(splitPoint)) {
  const newContent = content.substring(0, content.indexOf(splitPoint) + splitPoint.length) + `
export const dbBands: DBBand[] = [];
export const dbShows: DBShow[] = [];
export const dbInventoryItems: DBInventoryItem[] = [];
export const dbSales: DBSale[] = [];
export const dbInventoryAudits: DBInventoryAudit[] = [];
export const dbTourNotes: DBTourNote[] = [];
export const dbChecklistItems: DBChecklistItem[] = [];
export const dbFlights: DBFlight[] = [];
export const dbUserReviews: DBUserReview[] = [];
`;
  fs.writeFileSync('src/data/mockDatabase.ts', newContent);
  console.log("Patched mockDatabase.ts");
} else {
  console.log("Split point not found");
}
