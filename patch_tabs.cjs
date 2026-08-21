const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
fs.writeFileSync('src/App.tsx', appTsx.replace(
  "const [activeTab, setActiveTab] = useState<'home' | 'home-v2' | 'inventory' | 'reports' | 'shows' | 'settings' | 'new-sale' | 'notes' | 'setlists' | 'guestlist' | 'add-item' | 'promo-hub' | 'plans' | 'terms' | 'black-book' | 'flights' | 'merchandise-printers' | 'help-desk' | 'pay-portal' | 'creatives-hub' | 'checklist' | 'landing' | 'on-route-essentials' | 'distro-deck' | 'distro-deck-v2' | 'social'>('home-v2');",
  "const [activeTab, setActiveTab] = useState<'home' | 'home-v2' | 'inventory' | 'reports' | 'shows' | 'settings' | 'new-sale' | 'notes' | 'setlists' | 'guestlist' | 'add-item' | 'promo-hub' | 'plans' | 'terms' | 'black-book' | 'flights' | 'merchandise-printers' | 'help-desk' | 'pay-portal' | 'creatives-hub' | 'checklist' | 'landing' | 'on-route-essentials' | 'distro-deck' | 'distro-deck-v2' | 'social'>('social');"
));

const creative = fs.readFileSync('src/components/CreativeDashboardViewV2.tsx', 'utf-8');
fs.writeFileSync('src/components/CreativeDashboardViewV2.tsx', creative.replace(
  "const [activeTab, setActiveTab] = useState<'JOBS'|'BOOKINGS'|'PORTFOLIO'|'TEAMS'|'SOCIAL'|'SETTINGS'>('JOBS');",
  "const [activeTab, setActiveTab] = useState<'JOBS'|'BOOKINGS'|'PORTFOLIO'|'TEAMS'|'SOCIAL'|'SETTINGS'>('SOCIAL');"
));

const promoter = fs.readFileSync('src/components/PromoterDashboardViewV2.tsx', 'utf-8');
fs.writeFileSync('src/components/PromoterDashboardViewV2.tsx', promoter.replace(
  "const [activeTab, setActiveTab] = useState<'ROUTING'|'WORKSPACE'|'OFFERS'|'SALES'|'SOCIAL'|'SETTINGS'>('ROUTING');",
  "const [activeTab, setActiveTab] = useState<'ROUTING'|'WORKSPACE'|'OFFERS'|'SALES'|'SOCIAL'|'SETTINGS'>('SOCIAL');"
));

const label = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf-8');
fs.writeFileSync('src/components/LabelDashboardViewV2.tsx', label.replace(
  "const [activeTab, setActiveTab] = useState<'ROSTER'|'CATALOG'|'SALES'|'FINANCE'|'SOCIAL'|'SETTINGS'>('ROSTER');",
  "const [activeTab, setActiveTab] = useState<'ROSTER'|'CATALOG'|'SALES'|'FINANCE'|'SOCIAL'|'SETTINGS'>('SOCIAL');"
));

console.log('Tabs patched');
