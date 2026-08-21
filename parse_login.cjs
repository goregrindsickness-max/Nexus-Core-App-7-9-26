const fs = require('fs');
let code = fs.readFileSync('src/components/LoginView.tsx', 'utf-8');

// 1. Inject state
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'unlock' | 'signup'>(initialTab);",
  "const [activeTab, setActiveTab] = useState<'unlock' | 'signup'>(initialTab);\n  const [registrationPage, setRegistrationPage] = useState<1 | 2>(1);\n  const [newUserId, setNewUserId] = useState<string>('');\n  const [accountTypeToggle, setAccountTypeToggle] = useState<'fan' | 'pro'>('fan');"
);

// 2. Add Pinch-to-zoom logic state
code = code.replace(
  "const [email, setEmail] = useState",
  "// Image gesture states\n  const [avatarScale, setAvatarScale] = useState(1);\n  const [avatarPosX, setAvatarPosX] = useState(0);\n  const [avatarPosY, setAvatarPosY] = useState(0);\n  const [bannerScale, setBannerScale] = useState(1);\n  const [bannerPosX, setBannerPosX] = useState(0);\n  const [bannerPosY, setBannerPosY] = useState(0);\n  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);\n  const [isDraggingBanner, setIsDraggingBanner] = useState(false);\n  const [lastTouch, setLastTouch] = useState<{x: number, y: number, dist?: number} | null>(null);\n\n  const [email, setEmail] = useState"
);

fs.writeFileSync('src/components/LoginView.tsx', code);
console.log("Injected state!");
