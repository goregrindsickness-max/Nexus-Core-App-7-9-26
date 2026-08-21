import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsWorkspace.tsx', 'utf-8');
content = content.replace(
  "              supabaseKey={supabaseKey || ''}",
  "              supabaseKey={supabaseKey || ''}\n              bands={props.bands || []}\n              setBands={props.setBands || (() => {})}\n              activeBand={props.activeBand}\n              setActiveBandId={props.setActiveBandId || (() => {})}\n              setIsBandModalOpen={props.setIsBandModalOpen || (() => {})}"
);
fs.writeFileSync('src/components/SettingsWorkspace.tsx', content);
