import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

new_submit = """
  const cropImage = (base64Str: string, scale: number, posX: number, posY: number, width: number, height: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Str);
        
        const imgRatio = img.width / img.height;
        const containerRatio = width / height;
        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imgRatio > containerRatio) {
          drawWidth = height * imgRatio;
          offsetX = (width - drawWidth) / 2;
        } else {
          drawHeight = width / imgRatio;
          offsetY = (height - drawHeight) / 2;
        }
        
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        ctx.translate(posX, posY);
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = base64Str;
    });
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
        const croppedAvatar = await cropImage(profileAvatar, avatarScale, avatarPosX, avatarPosY, 400, 220);
        const compressedAvatar = await compressImageAtModuleLevel(croppedAvatar, 800, 800, 0.8);
        finalAvatarUrl = await uploadBase64ToStorage(compressedAvatar, 'avatars', newUserId, originalFileNames['avatar'] || 'profile-avatar');
      } else {
        finalAvatarUrl = profileAvatar;
      }
      
      if (profileBanner?.startsWith('data:')) {
        const croppedBanner = await cropImage(profileBanner, bannerScale, bannerPosX, bannerPosY, 400, 180);
        const compressedBanner = await compressImageAtModuleLevel(croppedBanner, 1200, 800, 0.8);
        finalBannerUrl = await uploadBase64ToStorage(compressedBanner, 'banners', newUserId, originalFileNames['banner'] || 'profile-banner');
      } else {
        finalBannerUrl = profileBanner;
      }
      
      const { error: updateError } = await supabase.from('profiles').update({
        avatar_url: finalAvatarUrl || '/Nexus Icon brackets.png',
        banner_url: finalBannerUrl
      }).eq('id', newUserId);
      
      if (updateError) throw updateError;
      
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', newUserId).single();
      onLogin(updatedProfile, undefined, undefined);
      
    } catch (ex: any) {
      console.error('Page 2 Upload Error:', ex);
      setError(ex.message || 'Failed to upload visuals.');
    } finally {
      setIsLoading(false);
    }
  };
"""

target = """  const handlePage2Submit = async () => {
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
  };"""

if target in content:
    content = content.replace(target, new_submit)
    with open('src/components/LoginView.tsx', 'w') as f:
        f.write(content)
    print("Injected crop logic!")
else:
    print("Target not found.")

