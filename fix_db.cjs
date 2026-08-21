const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf-8');

content = content.replace(/localStorage\.setItem\('label_storefront_sync_record',\s*JSON\.stringify\(\)\);/g, "localStorage.setItem('label_storefront_sync_record', JSON.stringify(storefrontSyncRecord));");
content = content.replace(/labelCatalogStore\.setItem\('label_storefront_sync_record',\s*\)\.catch\(console\.error\);/g, "labelCatalogStore.setItem('label_storefront_sync_record', storefrontSyncRecord).catch((e) => console.error(e));");

content = content.replace(/localStorage\.setItem\('label_followed_bands',\s*JSON\.stringify\(\)\);/g, "localStorage.setItem('label_followed_bands', JSON.stringify(followedBandIds));");
content = content.replace(/profileStore\.setItem\('label_followed_bands',\s*\)\.catch\(console\.error\);/g, "profileStore.setItem('label_followed_bands', followedBandIds).catch((e) => console.error(e));");

content = content.replace(/localStorage\.setItem\('label_public_profile',\s*JSON\.stringify\(\)\);/g, "localStorage.setItem('label_public_profile', JSON.stringify(labelPublicProfile));");
content = content.replace(/profileStore\.setItem\('label_public_profile',\s*\)\.catch\(console\.error\);/g, "profileStore.setItem('label_public_profile', labelPublicProfile).catch((e) => console.error(e));");

content = content.replace(/localStorage\.setItem\('label_inbound_inbox',\s*JSON\.stringify\(\)\);/g, "localStorage.setItem('label_inbound_inbox', JSON.stringify(inboundInquiries));");
content = content.replace(/profileStore\.setItem\('label_inbound_inbox',\s*\)\.catch\(console\.error\);/g, "profileStore.setItem('label_inbound_inbox', inboundInquiries).catch((e) => console.error(e));");

content = content.replace(/localStorage\.setItem\('distro_db_announcements',\s*JSON\.stringify\(\)\);/g, "localStorage.setItem('distro_db_announcements', JSON.stringify(updated));");
content = content.replace(/labelCatalogStore\.setItem\('distro_db_announcements',\s*\)\.catch\(console\.error\);/g, "labelCatalogStore.setItem('distro_db_announcements', updated).catch((e) => console.error(e));");

// nexus_label_chat_messages is trickier because it had different variable names: parsed, updatedMessages, finalParsed
// Let's just fix it by looking at the line before it.
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("localStorage.setItem('nexus_label_chat_messages', JSON.stringify());")) {
    let prevLine = lines[i-1] || "";
    let prevPrevLine = lines[i-2] || "";
    let varName = 'parsed';
    if (prevLine.includes('updatedMessages') || prevPrevLine.includes('updatedMessages')) varName = 'updatedMessages';
    if (prevLine.includes('finalParsed') || prevPrevLine.includes('finalParsed')) varName = 'finalParsed';
    
    lines[i] = lines[i].replace("JSON.stringify()", `JSON.stringify(${varName})`);
    if (lines[i+1] && lines[i+1].includes("profileStore.setItem('nexus_label_chat_messages', ).catch(console.error);")) {
      lines[i+1] = lines[i+1].replace("profileStore.setItem('nexus_label_chat_messages', ).catch(console.error);", `profileStore.setItem('nexus_label_chat_messages', ${varName}).catch((e) => console.error(e));`);
    }
  }
}
content = lines.join('\n');

fs.writeFileSync('src/components/LabelDashboardViewV2.tsx', content);
