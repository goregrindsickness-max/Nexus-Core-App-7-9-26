import fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const code = fs.readFileSync('src/App.tsx', 'utf-8');

const ast = parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
});

let targetPath = null;

traverse.default(ast, {
  LogicalExpression(path) {
    if (
      path.node.operator === '&&' &&
      t.isBinaryExpression(path.node.left) &&
      t.isIdentifier(path.node.left.left, { name: 'dashboardV2ActiveNav' }) &&
      t.isStringLiteral(path.node.left.right, { value: 'EVENTS' })
    ) {
      targetPath = path;
      path.stop();
    }
  }
});

if (!targetPath) {
  console.error("Could not find the target block.");
  process.exit(1);
}

const requiredBindings = new Set();
const globals = new Set(['console', 'window', 'document', 'localStorage', 'navigator', 'Math', 'Date', 'Array', 'String', 'Number', 'Boolean', 'Object', 'JSON', 'isNaN', 'parseFloat', 'parseInt', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']);

targetPath.traverse({
  Identifier(path) {
    if (path.isReferencedIdentifier()) {
      const name = path.node.name;
      if (globals.has(name)) return;
      
      if (path.scope.hasBinding(name)) {
        const binding = path.scope.getBinding(name);
        if (binding) {
          let isInside = false;
          let currentScope = binding.scope;
          while (currentScope) {
            if (currentScope.path === targetPath || currentScope.path.isDescendant(targetPath)) {
              isInside = true;
              break;
            }
            currentScope = currentScope.parent;
          }
          
          if (!isInside) {
            requiredBindings.add(name);
          }
        } else {
          requiredBindings.add(name);
        }
      } else {
         if (!globals.has(name)) {
             requiredBindings.add(name);
         }
      }
    }
  }
});

const propsList = Array.from(requiredBindings).sort();

const extractedJSX = generate.default(targetPath.node.right).code;

let newComponentCode = `import React from 'react';\n`;
newComponentCode += `import { Plus, Minus, Edit2, Trash2, MapPin, Clock, Calendar, ChevronDown, ChevronUp, Check, X, FileText, Plane, CheckSquare, Settings, Flame, Compass, Truck, Table, ChevronRight, ChevronLeft, Map, ExternalLink, Shield, AlertTriangle, Play, CloudSun, CloudSnow, CloudRain, CloudLightning, Wind, Sun, AlertCircle, Info, Navigation, Fuel, Gauge, DollarSign } from 'lucide-react';\n`;
newComponentCode += `import { AnimatedText, AnimatedCount } from './AnimatedElements';\n`;
newComponentCode += `import V2ExpandableCard from './V2ExpandableCard';\n`;
newComponentCode += `import ShowsView from './ShowsView';\n`;
newComponentCode += `import CoOpRouteStagingView from './CoOpRouteStagingView';\n`;
newComponentCode += `import TourNotesView from './TourNotesView';\n`;
newComponentCode += `import BlackBookView from './BlackBookView';\n`;
newComponentCode += `import GuestlistsView from './GuestlistsView';\n`;
newComponentCode += `import SetlistsView from './SetlistsView';\n`;
newComponentCode += `import FlightTrackerModal from './FlightTrackerModal';\n`;
newComponentCode += `import ChecklistsView from './ChecklistsView';\n`;
newComponentCode += `import OnRouteEssentialsView from './OnRouteEssentialsView';\n\n`;

newComponentCode += `export default function EventsWorkspace(props: any) {\n`;
newComponentCode += `  const {\n`;
propsList.forEach(p => {
  newComponentCode += `    ${p},\n`;
});
newComponentCode += `  } = props;\n\n`;
newComponentCode += `  return (\n    ${extractedJSX}\n  );\n}\n`;

fs.writeFileSync('src/components/EventsWorkspace.tsx', newComponentCode);

const start = targetPath.node.start;
const end = targetPath.node.end;

// Make sure to import EventsWorkspace in App.tsx!
let newAppCode = code.substring(0, start) + `{dashboardV2ActiveNav === 'EVENTS' && (\n<EventsWorkspace \n${propsList.map(p => `  ${p}={${p}}`).join('\n')}\n/>\n)}` + code.substring(end);

// Insert import if not exists
if (!newAppCode.includes("import EventsWorkspace")) {
    newAppCode = newAppCode.replace("import LoginView", "import EventsWorkspace from './components/EventsWorkspace';\nimport LoginView");
}

fs.writeFileSync('src/App.tsx', newAppCode);
console.log("Successfully extracted EventsWorkspace");
