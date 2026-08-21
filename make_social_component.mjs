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

let targetPaths = [];

traverse.default(ast, {
  LogicalExpression(path) {
    if (
      path.node.operator === '&&' &&
      t.isBinaryExpression(path.node.left) &&
      t.isIdentifier(path.node.left.left, { name: 'dashboardV2ActiveNav' }) &&
      t.isStringLiteral(path.node.left.right, { value: 'SOCIAL' })
    ) {
      targetPaths.push(path);
    }
  }
});

if (targetPaths.length < 2) {
  console.error("Could not find the SOCIAL blocks.");
  process.exit(1);
}

// We will combine them into one component. Actually they are separate in the DOM structure.
// They are both in the return statement. We can leave them in App.tsx or wrap them both in a SocialWorkspace if they are adjacent.
// Let's check if they are adjacent.
// Between them is: {/* Story Creator */} and then {/* Full Width Social Feed */}
// They are adjacent! We can just replace both with one <SocialWorkspace /> component that returns a Fragment.

console.log(targetPaths.map(p => ({ start: p.node.start, end: p.node.end })));
