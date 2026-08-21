const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const titles = [
  'title="Shows & Tour Planner"',
  'title="Multi-Band Tour Planner"',
  'title="Upcoming Calendar"',
  'title="Tour Weather Forecast"',
  'title="Driving Directions"',
  'title="Flight Tracker"',
  'title="Core Packing Checklist"',
  'title="Amenities Finder"',
  'title="Black Book Directory"',
  'title="Routing Beacons & Offers"',
  'title="Setlist Manager"',
  'title="Guest List Manager"',
  'title="Tactical Road Tools"'
];

let blocks = {};
let currentContent = content;

// Assuming there's only one instance of each of these titles in this context,
// but to be safe we'll find them within a specific string chunk or we can just extract them using regex.
// Wait, regex might fail with nested tags if not careful, but these are top-level V2ExpandableCards in this section.

for (const t of titles) {
  const startIndex = currentContent.indexOf('<V2ExpandableCard \n                      ' + t);
  let realStartIndex = startIndex;
  if (startIndex === -1) {
     // let's try a regex
     const regex = new RegExp('<V2ExpandableCard\\s+title="' + t.match(/title="(.*?)"/)[1] + '"');
     const match = regex.exec(currentContent);
     if (match) {
        realStartIndex = match.index;
     } else {
        console.log("Could not find", t);
        continue;
     }
  }
  
  // Find matching closing tag </V2ExpandableCard>
  // since these don't contain nested <V2ExpandableCard> (they are just cards), we can just find the next closing tag.
  const closeTag = '</V2ExpandableCard>';
  const endIndex = currentContent.indexOf(closeTag, realStartIndex) + closeTag.length;
  
  const blockContent = currentContent.substring(realStartIndex, endIndex);
  blocks[t.match(/title="(.*?)"/)[1]] = blockContent;
}

console.log("Found blocks:", Object.keys(blocks).length);
