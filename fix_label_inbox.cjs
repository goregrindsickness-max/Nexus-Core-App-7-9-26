const fs = require('fs');

let content = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf8');

const correctEndRender = `                        {isCurrentlyActive && (
                          <div className="absolute right-10 top-4.5 w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                        )}
                      </button>
                      </div>
                    );
                  })}
                </div>`;

const originalEndRender = `                        {isCurrentlyActive && (
                          <div className="absolute right-4 top-4.5 w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>`;

content = content.replace(correctEndRender, originalEndRender);

const buttonRegex = /<button[\s\S]*?className=\{`w-full p-4 text-left flex items-start gap-4 transition-all relative rounded-2xl border \$\{[\s\S]*?\}`\}[\s\S]*?>/;

const match = content.match(buttonRegex);
if (match) {
  const originalButton = match[0];
  const newButton = `<div
                        key={channel.id}
                        className={\`w-full relative transition-all rounded-2xl border group \${
                          isCurrentlyActive 
                            ? 'bg-zinc-900/40 border-[#f97316]/40 text-white shadow-md shadow-orange-950/5' 
                            : 'bg-zinc-950/30 hover:bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                        }\`}
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setInboxChannels(prev => prev.filter(c => c.id !== channel.id));
                            if (activeInboxChatId === channel.id) setActiveInboxChatId(null);
                            showLocalToast('Conversation Deleted');
                          }}
                          className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInboxChatId(channel.id);
                            setInboxSubTab('chat');
                          }}
                          className="w-full p-4 text-left flex items-start gap-4"
                        >`;
                        
  content = content.replace(originalButton, newButton);
  content = content.replace(originalEndRender, correctEndRender);
  fs.writeFileSync('src/components/LabelDashboardViewV2.tsx', content);
  console.log("Success");
} else {
  console.log("Regex not matched");
}
