const fs = require('fs');
let content = fs.readFileSync('src/components/PromoterPortalView.tsx', 'utf8');

content = content.replace(
  "const INBOX_CHANNELS = [",
  "const [INBOX_CHANNELS, setInboxChannels] = useState(["
);

content = content.replace(
  /    \}\n  \];/,
  "    }\n  ]);"
);

const targetStr = `                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => {
                          setActiveInboxChatId(channel.id);
                          setInboxSubTab('chat');
                        }}
                        className={\`w-full p-4.5 text-left flex items-start gap-4 transition-all relative rounded-2xl border \${
                          isCurrentlyActive 
                            ? 'bg-zinc-900/40 border-yellow-500/40 text-white' 
                            : 'bg-zinc-950/30 hover:bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                        }\`}
                      >`;
                      
const newStr = `                      <div
                        key={channel.id}
                        className={\`w-full relative transition-all rounded-2xl border group \${
                          isCurrentlyActive 
                            ? 'bg-zinc-900/40 border-yellow-500/40 text-white' 
                            : 'bg-zinc-950/30 hover:bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                        }\`}
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setInboxChannels(prev => prev.filter(c => c.id !== channel.id));
                            if (activeInboxChatId === channel.id) setActiveInboxChatId(null);
                            triggerNotification?.('Conversation deleted');
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
                          className="w-full p-4.5 text-left flex items-start gap-4"
                        >`;

const targetEndStr = `                        {isCurrentlyActive && (
                          <div className="absolute right-4 top-4.5 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        )}
                      </button>`;
                      
const newEndStr = `                        {isCurrentlyActive && (
                          <div className="absolute right-10 top-4.5 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        )}
                      </button>
                      </div>`;

content = content.replaceAll(targetStr, newStr);
content = content.replaceAll(targetEndStr, newEndStr);

fs.writeFileSync('src/components/PromoterPortalView.tsx', content);
console.log("Safely patched!");
