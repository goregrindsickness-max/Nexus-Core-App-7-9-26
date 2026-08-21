import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

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

let startOfFirstBlock = -1;
let endOfLastBlock = -1;

for (const title of titles) {
  const titleRegex = new RegExp('<V2ExpandableCard[^>]*?title="' + title.replace(/&/g, '\\&') + '"[^>]*?>');
  const match = titleRegex.exec(content);
  if (match) {
    const startIndex = match.index;
    let openCount = 1;
    let i = startIndex + match[0].length;
    while (i < content.length && openCount > 0) {
      const nextOpen = content.indexOf('<V2ExpandableCard', i);
      const nextClose = content.indexOf('</V2ExpandableCard>', i);
      
      if (nextClose === -1) break;
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        openCount++;
        i = nextOpen + '<V2ExpandableCard'.length;
      } else {
        openCount--;
        i = nextClose + '</V2ExpandableCard>'.length;
      }
    }
    
    if (startOfFirstBlock === -1 || startIndex < startOfFirstBlock) startOfFirstBlock = startIndex;
    if (i > endOfLastBlock) endOfLastBlock = i;
    
    blocks[title] = content.substring(startIndex, i);
  }
}

// Ensure there is no stray text caught between blocks if we just take substring
// Wait, taking the whole range from startOfFirstBlock to endOfLastBlock might overwrite comments or spacing between them, which is fine, we'll replace the whole thing.

const clusterHeader = (title) => `
                    {/* CLUSTER: ${title.toUpperCase()} */}
                    <div className="px-5 pt-8 pb-3 bg-black">
                      <h3 className="text-xs font-display font-bold text-zinc-500 uppercase tracking-widest">{title}</h3>
                    </div>
`;

let replacement = '';
replacement += clusterHeader('Master Planning & Scheduling');
replacement += blocks['Shows & Tour Planner'] + '\n';
replacement += blocks['Multi-Band Tour Planner'] + '\n';
replacement += blocks['Upcoming Calendar'] + '\n'; // We will leave it as Upcoming Calendar or rename inside the block

replacement += clusterHeader('Transit & Day-Of-Show');
replacement += blocks['Driving Directions'] + '\n';
replacement += blocks['Tour Weather Forecast'] + '\n';
replacement += blocks['Flight Tracker'] + '\n';
replacement += blocks['Core Packing Checklist'] + '\n';
replacement += blocks['Setlist Manager'] + '\n';
replacement += blocks['Guest List Manager'] + '\n';

replacement += clusterHeader('Utilities & Business Operations');
replacement += blocks['Amenities Finder'] + '\n';
replacement += blocks['Black Book Directory'] + '\n';
replacement += blocks['Routing Beacons & Offers'] + '\n';
replacement += blocks['Tactical Road Tools'] + '\n';

// Actually, some blocks have white space before them. Let's add standard indentation.
replacement = replacement.replace(/\n(?=<V2ExpandableCard)/g, '\n                    ');

const finalContent = content.substring(0, startOfFirstBlock) + replacement + content.substring(endOfLastBlock);

fs.writeFileSync('src/App.tsx', finalContent);
console.log("Successfully replaced the blocks");

