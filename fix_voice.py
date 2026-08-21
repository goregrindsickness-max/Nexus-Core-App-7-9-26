import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """                                    {msg.voice && (
                                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-full mb-1">
                                        <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                        </button>
                                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden min-w-[100px]">
                                          <div className="w-1/3 h-full bg-white rounded-full"></div>
                                        </div>
                                        <span className="text-[9px] font-mono opacity-80">{msg.voiceDuration || '0:12'}</span>
                                      </div>
                                    )}"""

replacement = """                                    {msg.voice && (
                                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-full mb-1">
                                        <button 
                                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
                                          onClick={(e) => {
                                            if (msg.voiceAudioUrl) {
                                              const audio = new Audio(msg.voiceAudioUrl);
                                              audio.play();
                                            } else {
                                              triggerNotification?.('Voice message unavailable');
                                            }
                                          }}
                                        >
                                          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                                        </button>
                                        <div className="flex-1 flex gap-[2px] items-center justify-center px-2">
                                          {[1, 2, 4, 3, 5, 4, 6, 4, 3, 2, 1, 3, 5, 2, 1].map((val, i) => (
                                            <div key={i} className="w-[3px] bg-white/50 rounded-full" style={{ height: `${val * 3 + 4}px` }} />
                                          ))}
                                        </div>
                                        <span className="text-[10px] font-mono opacity-80 shrink-0">{msg.voiceDuration || '0:12'}</span>
                                      </div>
                                    )}"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed voice rendering.")
else:
    print("Could not find voice rendering block.")
