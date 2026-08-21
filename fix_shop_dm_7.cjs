const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/<MessageSquare className="w-4 h-4" \/> Message Seller\s*<\/button>\s*\) : \(\s*<\/button>\s*<\/div>\s*onClick=\{\(\) => \{/g,
`<MessageSquare className="w-4 h-4" /> Message Seller
                      </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
