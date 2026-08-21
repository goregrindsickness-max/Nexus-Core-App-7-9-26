const fs = require('fs');
let code = fs.readFileSync('src/components/messaging/FloatingChatEngine.tsx', 'utf8');

const target = `    const handleExternalThreadTrigger = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const targetPayload = customEvent.detail;
      if (!targetPayload || !targetPayload.profile_id) return;

      setIsDismissed(false); // 🟢 Restore on external message trigger
      const targetProfileId = targetPayload.profile_id;

      const supabase = getSupabase();
      if (!supabase) return;

      try {
        // Resolve profile's email
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, role')
          .eq('id', targetProfileId)
          .single();

        if (error || !profileData || !profileData.email) {
          console.warn('Could not resolve profile details for chat:', error);
          return;
        }

        const recipientEmail = profileData.email.toLowerCase().trim();`;

const rep = `    const handleExternalThreadTrigger = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const targetPayload = customEvent.detail;
      if (!targetPayload || !targetPayload.profile_id) return;

      setIsDismissed(false); // 🟢 Restore on external message trigger
      setIsMinimized(false); // 🟢 Un-minimize
      
      const targetProfileId = targetPayload.profile_id;
      const supabase = getSupabase();

      try {
        let profileData = null;
        if (supabase) {
           const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetProfileId);
           
           const query = supabase.from('profiles').select('id, email, full_name, avatar_url, role');
           if (isUuid) {
              const { data } = await query.eq('id', targetProfileId).single();
              profileData = data;
           } else {
              const { data } = await query.or(\`email.eq.\${targetProfileId},name.eq.\${targetProfileId}\`).single();
              profileData = data;
           }
        }

        const recipientEmail = (profileData?.email || targetProfileId).toLowerCase().trim();`;

code = code.replace(target, rep);

const t2 = `            name: profileData.full_name || targetPayload.username || profileData.email,
            avatar: profileData.avatar_url || targetPayload.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            role: profileData.role || 'User',`;
const r2 = `            name: profileData?.full_name || targetPayload.username || profileData?.email || targetProfileId,
            avatar: profileData?.avatar_url || targetPayload.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            role: profileData?.role || 'User',`;

code = code.replace(t2, r2);

fs.writeFileSync('src/components/messaging/FloatingChatEngine.tsx', code);
