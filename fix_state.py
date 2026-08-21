import re
with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# Remove the block that parse_login.cjs added
content = content.replace("const [registrationPage, setRegistrationPage] = useState<1 | 2>(1);\n  const [newUserId, setNewUserId] = useState<string>('');\n  const [accountTypeToggle, setAccountTypeToggle] = useState<'fan' | 'pro'>('fan');", "")

# Remove the gesture states added by parse_login.cjs
content = content.replace("""// Image gesture states
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarPosX, setAvatarPosX] = useState(0);
  const [avatarPosY, setAvatarPosY] = useState(0);
  const [bannerScale, setBannerScale] = useState(1);
  const [bannerPosX, setBannerPosX] = useState(0);
  const [bannerPosY, setBannerPosY] = useState(0);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [lastTouch, setLastTouch] = useState<{x: number, y: number, dist?: number} | null>(null);

""", "")

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
