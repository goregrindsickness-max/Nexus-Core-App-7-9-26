import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the local state for PTT logs from App.tsx since it's now in the component
if (!content.includes('import { PTTRadioModal }')) {
  content = content.replace(
    "import { InventoryBoard } from './components/InventoryBoard';",
    "import { InventoryBoard } from './components/InventoryBoard';\nimport { PTTRadioModal } from './components/PTTRadioModal';"
  );
}

content = content.replace(/const \[pttLogs, setPttLogs\] = useState<any\[\]>\(\(\) => {[\s\S]*?\}\);/, "");

// Find the PTT block
const startIndex = content.indexOf("{/* PUSH-TO-TALK WALKIE-TALKIE MODAL */}");
if (startIndex !== -1) {
  const animateStr = "<AnimatePresence>";
  const firstAnimate = content.indexOf(animateStr, startIndex);
  if (firstAnimate !== -1) {
    const endIndex = content.indexOf("</AnimatePresence>", firstAnimate) + "</AnimatePresence>".length;
    
    if (endIndex > firstAnimate) {
       const toReplace = content.substring(startIndex, endIndex);
       const replacement = `
      {/* PUSH-TO-TALK WALKIE-TALKIE MODAL */}
      <PTTRadioModal
        isOpen={isPttOpen}
        onClose={() => setIsPttOpen(false)}
        userProfile={userProfile}
        triggerNotification={triggerNotification}
        playPttSound={playPttSound}
      />
       `.trim();
       content = content.replace(toReplace, replacement);
    }
  }
}

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx PTT Integration");
