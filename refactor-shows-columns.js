import fs from 'fs';
let content = fs.readFileSync('src/components/ShowsView.tsx', 'utf-8');
content = content.replaceAll(
  "'local_food_notes', 'emergency_medical_info', 'local_pharmacy_info', 'support_lineup'",
  "'local_food_notes', 'emergency_medical_info', 'local_pharmacy_info', 'audio_production_requirements', 'stage_backline_requirements', 'support_lineup'"
);
fs.writeFileSync('src/components/ShowsView.tsx', content);
console.log('Replaced successfully');
