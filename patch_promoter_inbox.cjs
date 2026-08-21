const fs = require('fs');

let content = fs.readFileSync('src/components/PromoterPortalView.tsx', 'utf8');

const oldInboxChannels = `  const INBOX_CHANNELS = [
    {
      id: 'tour-coordinator',
      name: 'Touring Band Representative',
      category: 'In-Route Booking Coordinator',
      avatarText: 'TB',
      badgeColor: 'border-emerald-500 text-emerald-450 bg-emerald-950/20'
    },
    {
      id: 'sound-contractor',
      name: 'House Sound & Lighting Engineer',
      category: 'Production Contractor',
      avatarText: 'SE',
      badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
    },
    {
      id: 'ticketing-partner',
      name: 'Local Ticketing Partner (DICE)',
      category: 'Sales API Integration Team',
      avatarText: 'TK',
      badgeColor: 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
    }
  ];`;

const newInboxChannels = `  const [INBOX_CHANNELS, setInboxChannels] = useState([
    {
      id: 'tour-coordinator',
      name: 'Touring Band Representative',
      category: 'In-Route Booking Coordinator',
      avatarText: 'TB',
      badgeColor: 'border-emerald-500 text-emerald-450 bg-emerald-950/20'
    },
    {
      id: 'sound-contractor',
      name: 'House Sound & Lighting Engineer',
      category: 'Production Contractor',
      avatarText: 'SE',
      badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
    },
    {
      id: 'ticketing-partner',
      name: 'Local Ticketing Partner (DICE)',
      category: 'Sales API Integration Team',
      avatarText: 'TK',
      badgeColor: 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
    }
  ]);`;

content = content.replace(oldInboxChannels, newInboxChannels);

const targetRender = `                                        return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => {
                          setActiveInboxChatId(channel.id);
                          setInboxSubTab('chat');
                        }}
                        className={\`w-full p-4 text-left flex items-start gap-4 transition-all relative rounded-xl border \${
                          isCurrentlyActive 
                            ? 'bg-[#15171e] border-purple-500/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                            : 'bg-[#1a1d24]/50 hover:bg-[#1a1d24] border-purple-500/10 hover:border-purple-500/20 text-zinc-300'
                        }\`}
                      >
                        <div className={\`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-black shrink-0 \${channel.badgeColor}\`}>`;

const newRender = `                                        return (
                      <div
                        key={channel.id}
                        className={\`w-full relative transition-all rounded-xl border group \${
                          isCurrentlyActive 
                            ? 'bg-[#15171e] border-purple-500/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
                            : 'bg-[#1a1d24]/50 hover:bg-[#1a1d24] border-purple-500/10 hover:border-purple-500/20 text-zinc-300'
                        }\`}
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setInboxChannels(prev => prev.filter(c => c.id !== channel.id));
                            if (activeInboxChatId === channel.id) setActiveInboxChatId(null);
                            triggerNotification?.('Conversation deleted');
                          }}
                          className="absolute right-3 top-3 p-1.5 rounded-lg bg-[#1a1d24] text-zinc-500 hover:text-red-500 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all z-10"
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
                        >
                        <div className={\`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-black shrink-0 \${channel.badgeColor}\`}>`;

const targetEndRender = `                        {isCurrentlyActive && (
                          <div className="absolute right-4 top-4.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]" />
                        )}
                      </button>
                    );
                  })}
                </div>`;

const newEndRender = `                        {isCurrentlyActive && (
                          <div className="absolute right-10 top-4.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]" />
                        )}
                      </button>
                      </div>
                    );
                  })}
                </div>`;

content = content.replace(targetRender, newRender);
content = content.replace(targetEndRender, newEndRender);

fs.writeFileSync('src/components/PromoterPortalView.tsx', content);
