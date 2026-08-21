import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const needle = `                    })()}
                  </div>
                {/* Profile Tabs Navigation */}`;

const replacement = `                    })()}
                  </div>
                )}
                {/* Profile Tabs Navigation */}`;

if (content.includes(needle)) {
  content = content.replace(needle, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Added missing )} successfully!");
} else {
  console.log("Needle not found");
}
