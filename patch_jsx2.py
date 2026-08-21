import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# Add the gesture handlers and handlePage2Submit right before handleSignup
handlers_code = """
  const handleTouchStart = (e: React.TouchEvent, type: 'avatar' | 'banner') => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setLastTouch({ x: 0, y: 0, dist });
    } else if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      if (type === 'avatar') setIsDraggingAvatar(true);
      if (type === 'banner') setIsDraggingBanner(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, type: 'avatar' | 'banner') => {
    if (!lastTouch) return;
    if (e.touches.length === 2 && lastTouch.dist) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scaleChange = dist / lastTouch.dist;
      if (type === 'avatar') setAvatarScale(s => Math.max(1, Math.min(3, s * scaleChange)));
      if (type === 'banner') setBannerScale(s => Math.max(1, Math.min(3, s * scaleChange)));
      setLastTouch({ ...lastTouch, dist });
    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      if (type === 'avatar') {
        setAvatarPosX(p => p + dx);
        setAvatarPosY(p => p + dy);
      }
      if (type === 'banner') {
        setBannerPosX(p => p + dx);
        setBannerPosY(p => p + dy);
      }
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = (type: 'avatar' | 'banner') => {
    setLastTouch(null);
    if (type === 'avatar') setIsDraggingAvatar(false);
    if (type === 'banner') setIsDraggingBanner(false);
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'avatar' | 'banner') => {
    setLastTouch({ x: e.clientX, y: e.clientY });
    if (type === 'avatar') setIsDraggingAvatar(true);
    if (type === 'banner') setIsDraggingBanner(true);
  };

  const handleMouseMove = (e: React.MouseEvent, type: 'avatar' | 'banner') => {
    if (!lastTouch) return;
    if (type === 'avatar' && !isDraggingAvatar) return;
    if (type === 'banner' && !isDraggingBanner) return;
    
    const dx = e.clientX - lastTouch.x;
    const dy = e.clientY - lastTouch.y;
    
    if (type === 'avatar') {
      setAvatarPosX(p => p + dx);
      setAvatarPosY(p => p + dy);
    }
    if (type === 'banner') {
      setBannerPosX(p => p + dx);
      setBannerPosY(p => p + dy);
    }
    setLastTouch({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (type: 'avatar' | 'banner') => {
    setLastTouch(null);
    if (type === 'avatar') setIsDraggingAvatar(false);
    if (type === 'banner') setIsDraggingBanner(false);
  };

  const handlePage2Submit = async () => {
    setIsLoading(true);
    setStatusMessage('Syncing visual identity...');
    const supabase = getSupabase();
    if (!supabase || !newUserId) {
      setError('System Error: Missing database connection or user context.');
      setIsLoading(false);
      return;
    }
    
    try {
      let finalAvatarUrl = null;
      let finalBannerUrl = null;
      
      if (profileAvatar?.startsWith('data:')) {
        finalAvatarUrl = await uploadBase64ToStorage(profileAvatar, 'avatars', newUserId, originalFileNames['avatar'] || 'profile-avatar');
      } else {
        finalAvatarUrl = profileAvatar;
      }
      
      if (profileBanner?.startsWith('data:')) {
        finalBannerUrl = await uploadBase64ToStorage(profileBanner, 'banners', newUserId, originalFileNames['banner'] || 'profile-banner');
      } else {
        finalBannerUrl = profileBanner;
      }
      
      const { error: updateError } = await supabase.from('profiles').update({
        avatar_url: finalAvatarUrl || '/Nexus Icon brackets.png',
        banner_url: finalBannerUrl
      }).eq('id', newUserId);
      
      if (updateError) throw updateError;
      
      // Successfully updated, trigger login
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', newUserId).single();
      onLogin(updatedProfile, undefined, undefined);
      
    } catch (ex: any) {
      console.error('Page 2 Upload Error:', ex);
      setError(ex.message || 'Failed to upload visuals.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
"""

content = content.replace("  const handleSignup = async (e: React.FormEvent) => {", handlers_code)

# Now inject the end of form replacement
end_replacement = """                  </>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase">Visual Identity</h2>
                      <p className="text-[10px] text-zinc-500 font-mono mt-2">PINCH TO ZOOM & DRAG TO PAN</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono tracking-wider text-emerald-500 uppercase">PROFILE AVATAR</label>
                        <div 
                          className="relative w-full h-[220px] bg-zinc-950 rounded-xl border border-emerald-900/40 hover:border-emerald-500/80 transition-colors flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] select-none"
                          onTouchStart={(e) => handleTouchStart(e, 'avatar')}
                          onTouchMove={(e) => handleTouchMove(e, 'avatar')}
                          onTouchEnd={() => handleTouchEnd('avatar')}
                          onMouseDown={(e) => handleMouseDown(e, 'avatar')}
                          onMouseMove={(e) => handleMouseMove(e, 'avatar')}
                          onMouseUp={() => handleMouseUp('avatar')}
                          onMouseLeave={() => handleMouseUp('avatar')}
                        >
                          {profileAvatar && profileAvatar !== '/Nexus Icon brackets.png' ? (
                            <img 
                              src={profileAvatar} 
                              className="w-full h-full object-cover pointer-events-none" 
                              style={{ transform: `translate3d(${avatarPosX}px, ${avatarPosY}px, 0) scale(${avatarScale})`, transition: isDraggingAvatar ? 'none' : 'transform 0.1s ease-out' }}
                              alt="Avatar" 
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                              <span className="text-3xl drop-shadow-md">📸</span>
                              <span className="text-[10px] text-zinc-600 font-mono font-bold tracking-wider">UPLOAD AVATAR</span>
                            </div>
                          )}
                          <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => handleFileChange(e.target.files?.[0], 'avatar')}
                             className="absolute top-0 right-0 w-8 h-8 opacity-0 cursor-pointer z-10" 
                             title="Upload New"
                           />
                           <div className="absolute top-2 right-2 z-0 pointer-events-none bg-black/50 p-1.5 rounded text-[8px] font-mono text-white">REPLACE</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono tracking-wider text-purple-500 uppercase">BANNER COVER</label>
                        <div 
                          className="relative w-full h-[180px] bg-zinc-950 rounded-xl border border-purple-900/40 hover:border-purple-500/80 transition-colors flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] select-none"
                          onTouchStart={(e) => handleTouchStart(e, 'banner')}
                          onTouchMove={(e) => handleTouchMove(e, 'banner')}
                          onTouchEnd={() => handleTouchEnd('banner')}
                          onMouseDown={(e) => handleMouseDown(e, 'banner')}
                          onMouseMove={(e) => handleMouseMove(e, 'banner')}
                          onMouseUp={() => handleMouseUp('banner')}
                          onMouseLeave={() => handleMouseUp('banner')}
                        >
                          {profileBanner ? (
                            <img 
                              src={profileBanner} 
                              className="w-full h-full object-cover pointer-events-none" 
                              style={{ transform: `translate3d(${bannerPosX}px, ${bannerPosY}px, 0) scale(${bannerScale})`, transition: isDraggingBanner ? 'none' : 'transform 0.1s ease-out' }}
                              alt="Banner" 
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
                              <span className="text-3xl drop-shadow-md">🌌</span>
                              <span className="text-[10px] text-zinc-600 font-mono font-bold tracking-wider">UPLOAD BANNER</span>
                            </div>
                          )}
                          <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => handleFileChange(e.target.files?.[0], 'banner')}
                             className="absolute top-0 right-0 w-8 h-8 opacity-0 cursor-pointer z-10" 
                             title="Upload New"
                           />
                           <div className="absolute top-2 right-2 z-0 pointer-events-none bg-black/50 p-1.5 rounded text-[8px] font-mono text-white">REPLACE</div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handlePage2Submit}
                      disabled={isLoading}
                      className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-4 rounded-xl text-xs tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                    >
                      {isLoading ? 'SYNCING VISUALS...' : 'COMPLETE & ENTER WORKSPACE'}
                    </button>
                  </div>
                )}
            </form>"""

content = content.replace("              </div>\n            </form>", "              </div>\n" + end_replacement)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

print("Injected Page 2 handlers and JSX!")
