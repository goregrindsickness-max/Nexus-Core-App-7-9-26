with open('src/components/navigation/BrandNavigationHeader.tsx', 'r') as f:
    text = f.read()

import re
# we need to replace the lucide-react import and add framer-motion

old_import = "import { Shield, Sparkles, ChevronDown, CheckCircle2, CloudOff, RefreshCcw, Bell } from 'lucide-react';"
new_import = "import { Shield, Sparkles, ChevronDown, CheckCircle2, CloudOff, RefreshCcw, Bell, Repeat, User, Plus, ArrowRight, Settings, X, Lock, Home, Radio } from 'lucide-react';\nimport { motion, AnimatePresence } from 'framer-motion';"

text = text.replace(old_import, new_import)

with open('src/components/navigation/BrandNavigationHeader.tsx', 'w') as f:
    f.write(text)

