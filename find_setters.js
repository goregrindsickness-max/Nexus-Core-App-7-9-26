import fs from 'fs';

const code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');
const lines = code.split('\n');

let insideFunctionDepth = 0;
let insideHook = false;
let hookDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track curly braces to see if we are in some nested block
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  
  // Check if we are inside a useEffect/useMemo/useCallback
  if (line.includes('useEffect(') || line.includes('useMemo(') || line.includes('useCallback(')) {
    insideHook = true;
    hookDepth = 0;
  }
  
  if (insideHook) {
    hookDepth += openBraces - closeBraces;
    if (hookDepth <= 0) {
      insideHook = false;
    }
  }
  
  // Naive check for state setters like setXYZ(...) or setUserProfile(...)
  // We only care if we are NOT inside a useEffect, useMemo, or event handler/callback function.
  // Standard event handler pattern: `const handleXYZ =` or `() => {` or `function xyz`
  const isFunctionDeclaration = line.includes('function ') || line.includes('=>') || line.includes('handler') || line.includes('Handler');
  
  const stateSetterMatch = line.match(/\b(set[A-Z][a-zA-Z0-9_]*)\(/);
  if (stateSetterMatch) {
    const setterName = stateSetterMatch[1];
    // Exclude standard useState declaration, e.g., const [x, setX] = useState
    if (!line.includes('useState') && !insideHook && !isFunctionDeclaration) {
      console.log(`Line ${i + 1}: Possible bad setter call: ${line.trim()}`);
    }
  }
}
