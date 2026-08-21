const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = "        const isOurs = post.\n                        post.author.name === userProfile?.name ||\n                        post.author.name === userProfile?.console_handle ||\n                        post.author.name === profileHandle;";
                        
const replacement = "        const isOurs = post?.author?.name === userProfile?.name ||\n                       post?.author?.name === userProfile?.console_handle ||\n                       post?.author?.name === profileHandle;";

content = content.replace(target, replacement);

content = content.replace(
  "You reacted ${prettyReaction} to ${post.author.name}'s post!",
  "You reacted ${prettyReaction} to ${post?.author?.name || 'someone'}'s post!"
);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Patched author error");
