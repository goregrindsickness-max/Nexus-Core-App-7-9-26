import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const titles = [
  'Shows & Tour Planner',
  'Multi-Band Tour Planner',
  'Upcoming Calendar',
  'Tour Weather Forecast',
  'Driving Directions',
  'Flight Tracker',
  'Core Packing Checklist',
  'Amenities Finder',
  'Black Book Directory',
  'Routing Beacons & Offers',
  'Setlist Manager',
  'Guest List Manager',
  'Tactical Road Tools'
];

let blocks = {};
let currentContent = content;

// Helper to find the matching closing tag considering we might not have nested ones, but let's be safe.
for (const title of titles) {
  const titleRegex = new RegExp('<V2ExpandableCard[^>]*?title="' + title.replace(/&/g, '\\&') + '"[^>]*?>');
  const match = titleRegex.exec(currentContent);
  if (match) {
    const startIndex = match.index;
    let openCount = 1;
    let i = startIndex + match[0].length;
    while (i < currentContent.length && openCount > 0) {
      const nextOpen = currentContent.indexOf('<V2ExpandableCard', i);
      const nextClose = currentContent.indexOf('</V2ExpandableCard>', i);
      
      if (nextClose === -1) break; // Error
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        openCount++;
        i = nextOpen + '<V2ExpandableCard'.length;
      } else {
        openCount--;
        i = nextClose + '</V2ExpandableCard>'.length;
      }
    }
    
    const blockContent = currentContent.substring(startIndex, i);
    blocks[title] = blockContent;
  } else {
    console.log("Could not find block for", title);
  }
}

console.log("Found blocks:", Object.keys(blocks));
