const fs = require('fs');
const lines = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8').split('\n');

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Label action buttons: Message and Submit EPK')) {
    start = i;
  }
  if (start !== -1 && i > start && lines[i].includes('<MessageSquare className="w-3.5 h-3.5" /> Message Label')) {
    end = i;
    break;
  }
}

if (start !== -1 && end !== -1) {
  for (let i = start; i < end; i++) {
    if (lines[i].includes('const targetUser = selectedUserProfile;')) {
      const indentation = lines[i].match(/^\s*/)[0];
      let j = i;
      while (j < end && !lines[j].includes('className="flex items-center justify-center')) {
        j++;
      }
      const replacement = [
        indentation + 'const targetUser = selectedUserProfile;',
        indentation + 'setSelectedUserProfile(null);',
        indentation + 'window.dispatchEvent(new CustomEvent(\'nexus_open_chat_thread\', { detail: { profile_id: targetUser?.email || targetUser?.name, username: targetUser?.name, avatar_url: targetUser?.avatar } }));',
        indentation + 'triggerNotification?.(`⚡ Opened encrypted channel with ${targetUser?.name || \'Unknown Label\'}`);',
        indentation + '}}'
      ];
      lines.splice(i, j - i, ...replacement);
      break;
    }
  }
  fs.writeFileSync('src/components/UniversalSocialFeed.tsx', lines.join('\n'));
}
