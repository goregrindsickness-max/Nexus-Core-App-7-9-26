const fs = require('fs');
const text = fs.readFileSync('dev_server_file.txt', 'utf8');
const lines = text.split('\n');
const lastLine = lines[lines.length - 1];
if (lastLine.startsWith('//# sourceMappingURL=data:application/json;base64,')) {
  const base64 = lastLine.replace('//# sourceMappingURL=data:application/json;base64,', '');
  const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  fs.writeFileSync('src/components/LabelDashboardViewV2.tsx.recovered', json.sourcesContent[0]);
  console.log("Recovered successfully!");
} else {
  console.log("No sourcemap found at the last line");
}
