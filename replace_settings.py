import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = r"\{/\* Conversation Settings Overlay \*/\}.*?\{/\* Inbox Privacy & Global Settings Overlay \*/\}"
replacement = """{/* Conversation Settings Overlay */}
      <AnimatePresence>
        {showConversationSettings && selectedChatId && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[400px] max-w-full bg-black z-[100] flex flex-col shadow-2xl"
          >
            {(() => {
              const activeChat = chats.find(c => c.id === selectedChatId);
              if (!activeChat) return null;
              
              return (
                <div className="flex flex-col h-full overflow-y-auto pb-8">
                  {/* Header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black/80 backdrop-blur-md">
                    <button onClick={() => setShowConversationSettings(false)} className="p-2 -ml-2 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-900 transition-colors">
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button onClick={() => triggerNotification?.("More options")} className="p-2 -mr-2 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-900 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex flex-col items-center pt-2 pb-6">
                    <img src={activeChat.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'} className="w-[104px] h-[104px] rounded-full object-cover mb-4" alt={activeChat.name} />
                    <h2 className="text-[28px] font-bold text-white mb-6 tracking-tight">{activeChat.name}</h2>
                    
                    {/* Horizontal Buttons */}
                    <div className="flex justify-center gap-6 w-full px-4 mb-2">
                      <div onClick={() => { setShowConversationSettings(false); setSelectedUserProfile(getProfileForUser({ name: activeChat.name, avatar: activeChat.avatar, role: activeChat.role })); }} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-[38px] h-[38px] rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] font-medium text-zinc-300">Profile</span>
                      </div>
                      <div onClick={() => triggerNotification?.("Payments opened")} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-[38px] h-[38px] rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] font-medium text-zinc-300">Payments</span>
                      </div>
                      <div onClick={() => triggerNotification?.("Nicknames opened")} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-[38px] h-[38px] rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors font-bold text-[18px]">
                          Aa
                        </div>
                        <span className="text-[12px] font-medium text-zinc-300">Nicknames</span>
                      </div>
                      <div onClick={() => triggerNotification?.("Search opened")} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-[38px] h-[38px] rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors">
                          <Search className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] font-medium text-zinc-300">Search</span>
                      </div>
                      <div onClick={() => triggerNotification?.("Customize opened")} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-[38px] h-[38px] rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors">
                          <Palette className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] font-medium text-zinc-300">Customize</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat info */}
                  <div className="px-4 py-2">
                    <h3 className="text-[14px] font-bold text-zinc-400 mb-3">Chat info</h3>
                    <div className="mb-4">
                      {/* Fake media grid matching screenshot */}
                      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mb-2">
                         <div className="aspect-[4/3] bg-zinc-800">
                           <img src="https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=500" className="w-full h-full object-cover" alt="" />
                         </div>
                         <div className="grid grid-rows-2 gap-1 h-full">
                            <img src="https://images.unsplash.com/photo-1571266028243-cb40fce75739?w=500" className="w-full h-full object-cover" alt="" />
                            <div className="grid grid-cols-2 gap-1 h-full">
                              <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500" className="w-full h-full object-cover" alt="" />
                              <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" className="w-full h-full object-cover" alt="" />
                            </div>
                         </div>
                      </div>
                    </div>
                    
                    <button onClick={() => triggerNotification?.("Media viewer opened")} className="w-full flex items-center gap-4 py-3 group">
                      <ImageIcon className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">View all media, files & links</span>
                    </button>
                    <button onClick={() => triggerNotification?.("Pinned messages viewer opened")} className="w-full flex items-center gap-4 py-3 group">
                      <PinIcon className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Pinned messages</span>
                    </button>
                  </div>
                  
                  {/* Actions */}
                  <div className="px-4 py-2 mt-2">
                    <h3 className="text-[14px] font-bold text-zinc-400 mb-3">Actions</h3>
                    
                    <button onClick={() => setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, muted: !c.settings?.muted } } : c))} className="w-full flex items-center gap-4 py-3 group">
                      <BellOff className={`w-6 h-6 transition-colors ${activeChat.settings?.muted ? 'text-rose-500' : 'text-zinc-300 group-hover:text-white'}`} />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Mute {activeChat.name}</span>
                    </button>
                    <button onClick={() => setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, notifications: !(c.settings?.notifications ?? true) } } : c))} className="w-full flex items-center gap-4 py-3 group">
                      <Volume2 className={`w-6 h-6 transition-colors ${!(activeChat.settings?.notifications ?? true) ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`} />
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Notifications & sounds</span>
                        <span className="text-[13px] text-zinc-400">{activeChat.settings?.notifications !== false ? 'On' : 'Off'}</span>
                      </div>
                    </button>
                    <button onClick={() => triggerNotification?.(`Group chat creation opened for ${activeChat.name}`)} className="w-full flex items-center gap-4 py-3 group">
                      <Users className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Create group chat with {activeChat.name.split(' ')[0]}</span>
                    </button>
                    <button onClick={() => setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, autoSavePhotos: !c.settings?.autoSavePhotos } } : c))} className="w-full flex items-center gap-4 py-3 group">
                      <Download className={`w-6 h-6 transition-colors ${activeChat.settings?.autoSavePhotos ? 'text-cyan-400' : 'text-zinc-300 group-hover:text-white'}`} />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Auto-save photos</span>
                    </button>
                    <button onClick={() => triggerNotification?.("Contact shared")} className="w-full flex items-center gap-4 py-3 group">
                      <Share2 className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Share contact</span>
                    </button>
                  </div>
                  
                  {/* Privacy & support */}
                  <div className="px-4 py-2 mt-2">
                    <h3 className="text-[14px] font-bold text-zinc-400 mb-3">Privacy & support</h3>
                    
                    <button onClick={() => setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, disappearing: c.settings?.disappearing === '24 hours' ? '7 days' : c.settings?.disappearing === '7 days' ? 'Off' : '24 hours' } } : c))} className="w-full flex items-center gap-4 py-3 group justify-between">
                      <div className="flex items-center gap-4">
                        <Clock className={`w-6 h-6 transition-colors ${activeChat.settings?.disappearing && activeChat.settings.disappearing !== 'Off' ? 'text-rose-400' : 'text-zinc-300 group-hover:text-white'}`} />
                        <div className="flex flex-col items-start">
                          <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Disappearing messages</span>
                          <span className="text-[13px] text-zinc-400">{activeChat.settings?.disappearing || 'Off'}</span>
                        </div>
                      </div>
                      <span className="bg-blue-600 text-white text-[12px] font-semibold px-2 py-0.5 rounded-full">New</span>
                    </button>
                    <button onClick={() => setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, readReceipts: !(c.settings?.readReceipts ?? true) } } : c))} className="w-full flex items-center gap-4 py-3 group">
                      <Eye className={`w-6 h-6 transition-colors ${!(activeChat.settings?.readReceipts ?? true) ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`} />
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Read receipts</span>
                        <span className="text-[13px] text-zinc-400">{activeChat.settings?.readReceipts !== false ? 'On' : 'Off'}</span>
                      </div>
                    </button>
                    <button onClick={() => setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, typingIndicator: !(c.settings?.typingIndicator ?? true) } } : c))} className="w-full flex items-center gap-4 py-3 group">
                      <MessageSquare className={`w-6 h-6 transition-colors ${!(activeChat.settings?.typingIndicator ?? true) ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`} />
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Typing indicator</span>
                        <span className="text-[13px] text-zinc-400">{activeChat.settings?.typingIndicator !== false ? 'On' : 'Off'}</span>
                      </div>
                    </button>
                    <button onClick={() => triggerNotification?.("Message permissions toggled")} className="w-full flex items-center gap-4 py-3 group">
                      <Shield className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Message permissions</span>
                    </button>
                    <button onClick={() => triggerNotification?.("End-to-end encryption info opened")} className="w-full flex items-center gap-4 py-3 group">
                      <Lock className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">End-to-end encryption</span>
                        <span className="text-[13px] text-zinc-400">This chat is end-to-end encrypted</span>
                      </div>
                    </button>
                    <button onClick={() => { setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, blocked: !c.settings?.blocked } } : c)); triggerNotification?.(activeChat.settings?.blocked ? `Unblocked ${activeChat.name}` : `Blocked ${activeChat.name}`); }} className="w-full flex items-center gap-4 py-3 group mt-2">
                      <MinusCircle className={`w-6 h-6 transition-colors ${activeChat.settings?.blocked ? 'text-zinc-300' : 'text-zinc-300 group-hover:text-white'}`} />
                      <span className={`text-[15px] font-medium transition-colors ${activeChat.settings?.blocked ? 'text-zinc-300' : 'text-zinc-200 group-hover:text-white'}`}>{activeChat.settings?.blocked ? 'Unblock' : 'Block'}</span>
                    </button>
                    <button onClick={() => { setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, settings: { ...c.settings, restricted: !c.settings?.restricted } } : c)); triggerNotification?.(activeChat.settings?.restricted ? `Unrestricted ${activeChat.name}` : `Restricted ${activeChat.name}`); }} className="w-full flex items-center gap-4 py-3 group">
                      <Slash className={`w-6 h-6 transition-colors ${activeChat.settings?.restricted ? 'text-zinc-300' : 'text-zinc-300 group-hover:text-white'}`} />
                      <span className={`text-[15px] font-medium transition-colors ${activeChat.settings?.restricted ? 'text-zinc-300' : 'text-zinc-200 group-hover:text-white'}`}>{activeChat.settings?.restricted ? 'Unrestrict' : 'Restrict'}</span>
                    </button>
                    <button onClick={() => { setShowReportModal(true); setReportReason(''); }} className="w-full flex items-center gap-4 py-3 group">
                      <AlertTriangle className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">Report</span>
                        <span className="text-[13px] text-zinc-400">Give feedback and report conversation</span>
                      </div>
                    </button>
                    <button onClick={() => { setChats(prev => prev.filter(c => c.id !== selectedChatId)); setShowConversationSettings(false); setSelectedChatId(null); triggerNotification?.(`Chat with ${activeChat.name} deleted`); }} className="w-full flex items-center gap-4 py-3 mt-4 group">
                      <Trash2 className="w-6 h-6 text-[#ff3b30] transition-colors" />
                      <span className="text-[15px] font-medium text-[#ff3b30] transition-colors">Delete chat</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inbox Privacy & Global Settings Overlay */}"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

# Let's fix missing imports if any. Palette, DollarSign, User, Volume2, Eye, MinusCircle, Slash, Shield
imports_to_add = ['Palette', 'DollarSign', 'User', 'Volume2', 'Eye', 'MinusCircle', 'Slash', 'Shield']

import_target = "import { "
import_block_start = content.find(import_target)
import_block_end = content.find("} from 'lucide-react'")

if import_block_start != -1 and import_block_end != -1:
    existing_imports = content[import_block_start + len(import_target):import_block_end]
    for imp in imports_to_add:
        if imp not in existing_imports:
            existing_imports += f", {imp}"
    
    content = content[:import_block_start + len(import_target)] + existing_imports + content[import_block_end:]

with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)

print("Replaced settings UI.")
