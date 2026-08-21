const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf-8');
content = content.replace(/localStorage\.setItem\('nexus_label_chat_messages', JSON\.stringify\(finalParsed\)\);\\n\\s*profileStore\.setItem\('nexus_label_chat_messages', finalParsed\)\.catch\(\(e\) => console\.error\(e\)\);/g, 
"localStorage.setItem('nexus_label_chat_messages', JSON.stringify(finalParsed));\\n        profileStore.setItem('nexus_label_chat_messages', finalParsed).catch((e) => console.error(e));");

content = content.replace("profileStore.setItem('nexus_label_chat_messages', parsed).catch((e) => console.error(e));", 
"profileStore.setItem('nexus_label_chat_messages', parsed || {}).catch((e) => console.error(e));");
fs.writeFileSync('src/components/LabelDashboardViewV2.tsx', content);
