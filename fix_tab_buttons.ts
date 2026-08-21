import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const needle = `                        <div className="mt-2">
                          <SonicFootprint 
                            profile={selectedUserProfile} 
                            onActionClick={(actionLabel) => {
                              triggerNotification?.(\`⚡ Navigating to \${actionLabel}...\`);
                            }} 
                          />
                        </div>
                      );
                    })()}
                  </div>

                             let tabButtons = [];`;

const replacement = `                        <div className="mt-2">
                          <SonicFootprint 
                            profile={selectedUserProfile} 
                            onActionClick={(actionLabel) => {
                              triggerNotification?.(\`⚡ Navigating to \${actionLabel}...\`);
                            }} 
                          />
                        </div>
                      );
                    })()}
                  </div>

                {/* Profile Tabs Navigation */}
                {(() => {
                  const r = selectedUserProfile.role.toLowerCase();
                  const isArtist = r.includes('artist') || r.includes('band');
                  const isLabel = r.includes('label');
                  const isPromoter = r.includes('promoter');
                  const isCreative = r.includes('creative');

                  let tabButtons = [];`;

if (content.includes(needle)) {
  content = content.replace(needle, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Needle not found exactly, searching substring...");
  const chunk = '</div>\n                      );\n                    })()}\n                  </div>\n\n                             let tabButtons = [];';
  if (content.includes(chunk)) {
    content = content.replace(chunk, `</div>\n                      );\n                    })()}\n                  </div>\n\n                {/* Profile Tabs Navigation */}\n                {(() => {\n                  const r = selectedUserProfile.role.toLowerCase();\n                  const isArtist = r.includes('artist') || r.includes('band');\n                  const isLabel = r.includes('label');\n                  const isPromoter = r.includes('promoter');\n                  const isCreative = r.includes('creative');\n\n                  let tabButtons = [];`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Replaced via chunk!");
  } else {
    console.log("Chunk not found either");
  }
}
