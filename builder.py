import re

with open('temp_layout.tsx', 'r') as f:
    content = f.read()

# Make color replacements
content = content.replace('orange-500', 'fuchsia-500')
content = content.replace('#f97316', '#d946ef')
content = content.replace('orange-400', 'fuchsia-400')
content = content.replace('orange-950', 'fuchsia-950')
content = content.replace('orange-pulse-glow', 'fuchsia-pulse-glow')
content = content.replace('orange-chase-border', 'fuchsia-chase-border')

# Replace names and variables
content = content.replace('userProfile.label_company_name', '(userProfile.creative_metadata?.business_name)')
content = content.replace('userProfile.label_avatar', 'userProfile.avatar_url')
content = content.replace('userProfile.label_banner', 'userProfile.banner_url')
content = content.replace('userProfile.label_url_slug', 'userProfile.console_handle')
content = content.replace("NEXUS LABEL HQ", "NEXUS CREATIVE HQ")
content = content.replace("LABELS HQ:", "CREATIVE HQ:")

# Remove dynamic label specific elements like labelRosterData
content = re.sub(r'\{labelRosterData\.length\} / \{(.*?)\}', 'UNLIMITED', content)
content = content.replace('labelRosterData.length', '0')
content = re.sub(r'\{userProfile\.label_roster_count \|\| 0\} BANDS', 'CREATIVE PORTFOLIO', content)
content = content.replace("userProfile.label_plan_tier === 'APEX' ? 'APEX COMMAND' : userProfile.label_plan_tier === 'SYNDICATE' ? 'SYNDICATE FLEET' : 'DISTRO SEED'", "'PRO CREATIVE'")
content = content.replace("userProfile.label_trial_period_days || 30", "30")

# Adjust tabs array
# Replace the .map part for tabs
content = re.sub(
    r"\[\s*\{\s*id:\s*'ROSTER'.*?\]\.map",
    """[
            { id: 'JOBS', label: 'Jobs', icon: Briefcase },
            { id: 'BOOKINGS', label: 'Bookings', icon: Calendar },
            { id: 'PORTFOLIO', label: 'Portfolio', icon: Palette },
            { id: 'TEAMS', label: 'Teams', icon: Users },
            { id: 'SOCIAL', label: 'Social', icon: Globe },
            { id: 'SETTINGS', label: 'Settings', icon: Settings },
          ].map""",
    content,
    flags=re.DOTALL
)

# Roster condition to JOBS
content = content.replace("activeTab === 'ROSTER'", "activeTab === 'JOBS'")

# Roster Sub tab section (SALES/FINANCE) - remove it or just let it not render. We'll leave it since it checks for SALES/FINANCE and those tabs aren't there except we don't have subtabs for JOBS.
# Actually I'll remove the subtab navigation entirely from the top
content = re.sub(r'\{\(activeTab === \'SALES\' \|\| activeTab === \'FINANCE\'\)\s*&&\s*\((.*?)\s*\}\)\s*\}', '', content, flags=re.DOTALL)

# Let's wrap this into a proper react component
header = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Power, Globe, Users, User, DollarSign, Database, Activity, RefreshCw, Settings, X, Home, Lock, Sparkles, Layers, LogOut, Bell, Building, MapPin, MessageSquare, ArrowLeft, Send, CheckSquare, Check, Plus, AlertTriangle, TrendingUp, Shield, BarChart3, Radio, Heart, MessageCircle, Play, Pause, Square, SkipBack, SkipForward, Disc, Volume2, Truck, Tag, Edit, Trash2, Upload, ShoppingBag, ShoppingCart, CreditCard, Calendar, ArrowRightLeft, Package, Box, Banknote, ChevronDown, Calculator, Palette, Info, Search, Pin, Flame, Rocket, ThumbsUp, Menu, Briefcase } from 'lucide-react';
import MarqueeText from './MarqueeText';

interface CreativeDashboardViewV2Props {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  notifications?: any[];
  onOpenNotifications?: () => void;
  onBack: () => void;
}

export default function CreativeDashboardViewV2({
   userProfile,
   setUserProfile,
   onLogout,
   notifications,
   onOpenNotifications,
   onBack
}: CreativeDashboardViewV2Props) {
  const [activeTab, setActiveTab] = useState<'JOBS'|'BOOKINGS'|'PORTFOLIO'|'TEAMS'|'SOCIAL'|'SETTINGS'>('JOBS');
  const [subTab, setSubTab] = useState<string>('');
  const [v2RoleMenuOpen, setV2RoleMenuOpen] = useState(false);
  const [isSpecsDrawerOpen, setIsSpecsDrawerOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxSubTab, setInboxSubTab] = useState('');

  const allowedWorkspaces = userProfile.allowed_workspaces || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  };
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  };

"""

footer = """
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
"""

with open('src/components/CreativeDashboardViewV2.tsx', 'w') as f:
    f.write(header + content + footer)

