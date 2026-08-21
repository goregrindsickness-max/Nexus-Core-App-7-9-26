const fs = require('fs');

let content = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf8');

// Replace const INBOX_CHANNELS = [ ... ]; with state
const oldInboxChannels = `  const INBOX_CHANNELS = [
    {
      id: 'tomb-mold-rep',
      name: 'Tomb Mold Representative (Max)',
      category: 'Tour Logistics / Distro Inquiry',
      avatarText: 'TM',
      badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
    },
    {
      id: 'blood-incantation-manager',
      name: 'Blood Incantation Manager (Paul)',
      category: 'Album Campaign Planning',
      avatarText: 'BI',
      badgeColor: 'border-rose-500 text-rose-400 bg-rose-950/20'
    },
    {
      id: 'nexus-pr-coordinator',
      name: 'Nexus PR Agency (Sarah)',
      category: 'Global Press & Reviews Coordination',
      avatarText: 'PR',
      badgeColor: 'border-amber-500 text-amber-400 bg-amber-950/20'
    }
  ];`;

const newInboxChannels = `  const [INBOX_CHANNELS, setInboxChannels] = useState([
    {
      id: 'tomb-mold-rep',
      name: 'Tomb Mold Representative (Max)',
      category: 'Tour Logistics / Distro Inquiry',
      avatarText: 'TM',
      badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
    },
    {
      id: 'blood-incantation-manager',
      name: 'Blood Incantation Manager (Paul)',
      category: 'Album Campaign Planning',
      avatarText: 'BI',
      badgeColor: 'border-rose-500 text-rose-400 bg-rose-950/20'
    },
    {
      id: 'nexus-pr-coordinator',
      name: 'Nexus PR Agency (Sarah)',
      category: 'Global Press & Reviews Coordination',
      avatarText: 'PR',
      badgeColor: 'border-amber-500 text-amber-400 bg-amber-950/20'
    }
  ]);`;

content = content.replace(oldInboxChannels, newInboxChannels);

// Now patch the rendering of INBOX_CHANNELS to add delete button
const targetRender = `                                        return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => {
                          setActiveInboxChatId(channel.id);
                          setInboxSubTab('chat');
                        }}
                        className={\`w-full p-4 text-left flex items-start gap-4 transition-all relative rounded-2xl border \${
                          isCurrentlyActive 
                            ? 'bg-zinc-900/40 border-[#f97316]/40 text-white shadow-md shadow-orange-950/5' 
                            : 'bg-zinc-950/30 hover:bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                        }\`}
                      >
                        <div className={\`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-black shrink-0 \${channel.badgeColor}\`}>`;

const newRender = `                                        return (
                      <div
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
                        >
                        <div className={\`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-black shrink-0 \${channel.badgeColor}\`}>`;

const targetEndRender = `                        {isCurrentlyActive && (
                          <div className="absolute right-4 top-4.5 w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>`;

const newEndRender = `                        {isCurrentlyActive && (
                          <div className="absolute right-10 top-4.5 w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                        )}
                      </button>
                      </div>
                    );
                  })}
                </div>`;

content = content.replace(targetRender, newRender);
content = content.replace(targetEndRender, newEndRender);

fs.writeFileSync('src/components/LabelDashboardViewV2.tsx', content);
