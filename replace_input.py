import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """                        {/* Reply Input Box */}
                        <div className="px-2 py-2 border-t border-zinc-900 bg-black shrink-0 flex items-center gap-2">
                          <button onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)} className="text-blue-500 hover:text-blue-400 p-1 shrink-0">
                            <Plus className="w-6 h-6" />
                          </button>
                          
                          {!typedMessage.trim() && (
                            <>
                              <button onClick={() => {}} className="text-blue-500 hover:text-blue-400 p-1 shrink-0">
                                <Camera className="w-6 h-6" />
                              </button>
                              <button onClick={() => handleSendMessage({ image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' })} className="text-blue-500 hover:text-blue-400 p-1 shrink-0">
                                <ImageIcon className="w-6 h-6" />
                              </button>
                              <button className="text-blue-500 hover:text-blue-400 p-1 shrink-0">
                                <Mic className="w-6 h-6" />
                              </button>
                            </>
                          )}
                          
                          <div className="flex-1 relative flex items-center bg-zinc-800/80 rounded-full transition-colors overflow-hidden">
                            <input
                              type="text"
                              placeholder="Message"
                              value={typedMessage}
                              onChange={(e) => setTypedMessage(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                              className="w-full bg-transparent px-4 py-2 text-[15px] text-white placeholder:text-zinc-400 focus:outline-none"
                            />
                            <button className="pr-3 pl-1 text-blue-500 hover:text-blue-400 shrink-0">
                              <Smile className="w-6 h-6" />
                            </button>
                          </div>
                          
                          {typedMessage.trim() ? (
                            <button
                              type="button"
                              onClick={() => handleSendMessage()}
                              className="text-blue-500 hover:text-blue-400 p-1 shrink-0 transition-transform hover:scale-110 active:scale-95"
                            >
                              <ArrowRight className="w-6 h-6" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendMessage({ text: '👍' })}
                              className="text-blue-500 hover:text-blue-400 p-1 shrink-0 transition-transform hover:scale-110 active:scale-95"
                            >
                              <ThumbsUp className="w-6 h-6" />
                            </button>
                          )}
                        </div>"""

replacement = """                        {/* Reply Input Box */}
                        <div className="px-2 py-2 border-t border-zinc-900 bg-black shrink-0 flex items-center gap-2">
                          {isRecordingVoice ? (
                            <div className="flex-1 flex items-center justify-between bg-zinc-900 rounded-full px-4 py-2 border border-rose-500/30">
                              <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-rose-400 font-mono text-sm">
                                  0:{recordingTime.toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                                    setIsRecordingVoice(false);
                                    setRecordingTime(0);
                                  }}
                                  className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                                    setIsRecordingVoice(false);
                                    if (recordingTime > 0) {
                                      handleSendMessage({ voice: true, voiceDuration: `0:${recordingTime.toString().padStart(2, '0')}` });
                                    }
                                    setRecordingTime(0);
                                  }}
                                  className="p-1.5 text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/10 rounded-full"
                                >
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)} className="text-blue-500 hover:text-blue-400 p-1 shrink-0">
                                <Plus className="w-6 h-6" />
                              </button>
                              
                              {!typedMessage.trim() && (
                                <>
                                  <button onClick={() => {}} className="text-blue-500 hover:text-blue-400 p-1 shrink-0 hidden sm:block">
                                    <Camera className="w-6 h-6" />
                                  </button>
                                  <label className="text-blue-500 hover:text-blue-400 p-1 shrink-0 cursor-pointer">
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const url = URL.createObjectURL(e.target.files[0]);
                                          handleSendMessage({ image: url });
                                        }
                                      }}
                                    />
                                    <ImageIcon className="w-6 h-6" />
                                  </label>
                                  <button 
                                    onClick={() => {
                                      setIsRecordingVoice(true);
                                      setRecordingTime(0);
                                      recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
                                    }}
                                    className="text-blue-500 hover:text-blue-400 p-1 shrink-0"
                                  >
                                    <Mic className="w-6 h-6" />
                                  </button>
                                </>
                              )}
                              
                              <div className="flex-1 relative flex items-center bg-zinc-800/80 rounded-full transition-colors overflow-hidden">
                                <input
                                  type="text"
                                  placeholder="Message"
                                  value={typedMessage}
                                  onChange={(e) => setTypedMessage(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                  className="w-full bg-transparent px-4 py-2 text-[15px] text-white placeholder:text-zinc-400 focus:outline-none"
                                />
                                <label className="pr-3 pl-1 text-blue-500 hover:text-blue-400 shrink-0 cursor-pointer">
                                  {/* Using a focus hack for mobile keyboards to show emoji, or just standard icon */}
                                  <Smile className="w-6 h-6" />
                                </label>
                              </div>
                              
                              {typedMessage.trim() ? (
                                <button
                                  type="button"
                                  onClick={() => handleSendMessage()}
                                  className="text-blue-500 hover:text-blue-400 p-1 shrink-0 transition-transform hover:scale-110 active:scale-95"
                                >
                                  <ArrowRight className="w-6 h-6" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSendMessage({ text: '👍' })}
                                  className="text-blue-500 hover:text-blue-400 p-1 shrink-0 transition-transform hover:scale-110 active:scale-95"
                                >
                                  <ThumbsUp className="w-6 h-6" />
                                </button>
                              )}
                            </>
                          )}
                        </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed input box.")
else:
    print("Target not found.")

