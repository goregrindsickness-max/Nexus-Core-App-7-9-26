const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `            onGoToDashboard={() => {
              const saved = localStorage.getItem('nexus_core_user_profile');
              const profileSaved = saved !== null && saved !== 'null';
              if (profileSaved) {
                setIsLoggedOut(false);
              } else {
                // Auto-create a mock operator profile so the user enters immediately without hurdles!
                const mockProfile = {
                  id: "op_default",
                  name: "Nexus Operator",
                  email: "admin@example.com",
                  account_type: "artist",
                  pin: "0000"
                };
                localStorage.setItem('nexus_core_user_profile', JSON.stringify(mockProfile));
                setUserProfile(mockProfile);
                
                const mockBand = {
                  id: "b1",
                  name: "VIRULENT SPECTRE",
                  genre: "BLACKENED DEATH METAL",
                  logo_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400"
                };
                setBands([mockBand]);
                setActiveBandId("b1");
                setIsLoggedOut(false);
              }
              setShowSplash(false);
            }}`;

const replacement = `            onGoToDashboard={() => {
              const saved = localStorage.getItem('nexus_core_user_profile');
              const profileSaved = saved !== null && saved !== 'null';
              if (profileSaved) {
                setIsLoggedOut(false);
              } else {
                setIsLoggedOut(true);
              }
              setShowSplash(false);
            }}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', content, 'utf-8');
  console.log('Splash patched');
} else {
  console.log('Target not found');
}
