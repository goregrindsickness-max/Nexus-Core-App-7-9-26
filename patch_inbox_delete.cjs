const fs = require('fs');

let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `<button
                        key={chat.id}
                        type="button"
                        onClick={() => {
                          setSelectedChatId(chat.id);
                          // Clear unread count on click
                          setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                        }}
                        className={\`w-full flex items-start gap-3 p-4 transition-all text-left group cursor-pointer border-b \${getChatThreadBorderClass(chat)} \${
                          isActive 
                            ? 'bg-rose-950/30' 
                            : 'bg-transparent hover:bg-rose-900/10'
                        }\`}
                      >
                        {/* Avatar Column */}
                        <div className="relative shrink-0">`;

const replacement = `<div
                        key={chat.id}
                        className={\`w-full relative flex items-start gap-3 p-4 transition-all text-left group border-b \${getChatThreadBorderClass(chat)} \${
                          isActive 
                            ? 'bg-rose-950/30' 
                            : 'bg-transparent hover:bg-rose-900/10'
                        }\`}
                      >
                        <button 
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-900/80 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete Conversation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChats(prev => prev.filter(c => c.id !== chat.id));
                            if (selectedChatId === chat.id) setSelectedChatId(null);
                            triggerNotification?.(\`Conversation deleted\`);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div 
                          className="flex-1 flex items-start gap-3 min-w-0 cursor-pointer pr-8"
                          onClick={() => {
                            setSelectedChatId(chat.id);
                            // Clear unread count on click
                            setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                          }}
                        >
                        {/* Avatar Column */}
                        <div className="relative shrink-0">`;

const targetEnd = `                        {chat.unread > 0 && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-rose-600 border border-black flex items-center justify-center text-[9px] font-black text-white shadow-[0_0_8px_#f43f5e] mt-1">
                            {chat.unread}
                          </div>
                        )}
                      </button>`;

const replacementEnd = `                        {chat.unread > 0 && (
                          <div className="shrink-0 w-5 h-5 rounded-full bg-rose-600 border border-black flex items-center justify-center text-[9px] font-black text-white shadow-[0_0_8px_#f43f5e] mt-1">
                            {chat.unread}
                          </div>
                        )}
                        </div>
                      </div>`;

content = content.replace(target, replacement);
content = content.replace(targetEnd, replacementEnd);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
