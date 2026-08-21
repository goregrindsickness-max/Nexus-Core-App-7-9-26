import fs from 'fs';

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

const loginStart = lines.findIndex(l => l.startsWith('const LoginView: React.FC'));
let loginEnd = loginStart;
let bracketCount = 0;

for (let i = loginStart; i < lines.length; i++) {
    const line = lines[i];
    bracketCount += (line.match(/\{/g) || []).length;
    bracketCount -= (line.match(/\}/g) || []).length;
    if (bracketCount === 0 && line.startsWith('};')) {
        loginEnd = i;
        break;
    }
}

console.log("Start:", loginStart, "End:", loginEnd);

fs.writeFileSync('src/components/LoginView.tsx', 
`import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Lock, UserPlus, RefreshCw, CheckCircle, Sparkles, Clock, Check, ChevronRight, 
  Eye, EyeOff, User, Upload, Building, AlertTriangle, Disc, Tag, LogIn, ChevronLeft, Calendar, Ticket
} from 'lucide-react';
import { executeWithSchemaResilience, getSupabase } from '../supabase';
import { Band, UserProfile, Show } from '../types';

interface LoginViewProps {
  onLogin: (customProfile?: UserProfile, customBand?: Band, selectBandId?: string) => void;
  userProfile: UserProfile;
  initialTab?: 'unlock' | 'signup';
  onTabChange?: (tab: 'unlock' | 'signup') => void;
  triggerNotification?: (msg: string) => void;
  isUpgradeMode?: boolean;
}

` + lines.slice(loginStart, loginEnd + 1).join('\n') + `\n\nexport default LoginView;\n`
);

const newAppContent = lines.slice(0, loginStart).join('\n') + '\n' + lines.slice(loginEnd + 1).join('\n');
fs.writeFileSync('src/App.tsx.new', newAppContent);
