import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# 1. Add new states at the top of LoginView component
state_insertion = """
  const [registrationPage, setRegistrationPage] = useState<1 | 2>(1);
  const [newUserId, setNewUserId] = useState<string>('');
  const [accountTypeToggle, setAccountTypeToggle] = useState<'Fan Only Supporter' | 'Industry Pro'>('Fan Only Supporter');
  
  // Gesture states
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarPosX, setAvatarPosX] = useState(0);
  const [avatarPosY, setAvatarPosY] = useState(0);
  const [bannerScale, setBannerScale] = useState(1);
  const [bannerPosX, setBannerPosX] = useState(0);
  const [bannerPosY, setBannerPosY] = useState(0);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
"""
content = re.sub(
    r"(const LoginView: React\.FC<LoginViewProps> = \(\{.*?\}\) => \{)",
    r"\1" + state_insertion,
    content,
    flags=re.DOTALL
)

# Write back for inspection
with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

print("Injected state!")
