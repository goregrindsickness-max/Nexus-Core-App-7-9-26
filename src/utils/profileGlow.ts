export interface ProfileGlowInfo {
  type: 'industry_pro' | 'fan' | 'band' | 'promoter' | 'creative' | 'label';
  name: string;
  color: string;
  rgb: string;
  glowClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const getProfileGlowInfo = (profile: any): ProfileGlowInfo => {
  const rLower = (profile?.role || profile?.portalRole || profile?.account_type || profile?.type || '').toLowerCase();
  const accType = (profile?.account_type || profile?.type || profile?.portalRole || '').toLowerCase();
  const rawType = (profile?.type || '').toLowerCase();
  const isPersonal = profile?.isPersonal === true || profile?.isIndustryProPersonal === true;
  const workspaces = [
    ...(profile?.registered_workspaces || []),
    ...(profile?.allowed_workspaces || [])
  ].map((w: string) => typeof w === 'string' ? w.toLowerCase() : '');

  // 1. Explicit Creative Profile
  if (!isPersonal && (rawType === 'creative' || accType === 'creative' || rLower === 'creative' || rLower.includes('creative specialist') || rLower.includes('designer') || rLower.includes('photographer') || rLower.includes('videographer') || rLower.includes('audio engineer'))) {
    return {
      type: 'creative',
      name: 'Creative Specialist',
      color: '#ec4899',
      rgb: '236,72,153',
      glowClass: 'pulse-glow-magenta',
      badgeBg: 'bg-pink-950/40',
      badgeText: 'text-pink-400',
      badgeBorder: 'border-pink-500/50'
    };
  }

  // 2. Explicit Record Label Profile
  if (!isPersonal && (rawType === 'label' || accType === 'label' || rLower === 'label' || rLower.includes('record label') || rLower.includes('label executive'))) {
    return {
      type: 'label',
      name: 'Record Label',
      color: '#f97316',
      rgb: '249,115,22',
      glowClass: 'pulse-glow-orange',
      badgeBg: 'bg-orange-950/40',
      badgeText: 'text-orange-400',
      badgeBorder: 'border-orange-500/50'
    };
  }

  // 3. Explicit Promoter / Venue Profile
  if (!isPersonal && (rawType === 'promoter' || accType === 'promoter' || rLower === 'promoter' || rLower.includes('venue') || rLower.includes('talent buyer') || rLower.includes('booking agent'))) {
    return {
      type: 'promoter',
      name: 'Promoter / Venue',
      color: '#eab308',
      rgb: '234,179,8',
      glowClass: 'pulse-glow-yellow',
      badgeBg: 'bg-amber-950/40',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-500/50'
    };
  }

  // 4. Explicit Band / Artist Profile
  if (!isPersonal && (profile?.isBandProfile || rawType === 'band' || accType === 'band' || (rLower.includes('band') && !rLower.includes('fan')) || (rLower.includes('artist') && !rLower.includes('fan')) || rLower.includes('musician') || rLower.includes('group'))) {
    return {
      type: 'band',
      name: 'Band / Artist',
      color: '#10b981',
      rgb: '16,185,129',
      glowClass: 'pulse-glow-green',
      badgeBg: 'bg-emerald-950/40',
      badgeText: 'text-emerald-400',
      badgeBorder: 'border-emerald-500/50'
    };
  }

  // 5. Explicit Fan check
  if (
    accType === 'fan' || 
    accType === 'fan_only' || 
    accType === 'listener' || 
    rLower === 'fan' || 
    rLower === 'fan_only' || 
    rLower === 'fan listener' || 
    (rLower.includes('fan') && !rLower.includes('industry')) ||
    ((workspaces.includes('fan') || workspaces.includes('fan_only')) && !workspaces.some(w => ['creative', 'band', 'promoter', 'label', 'industry_pro', 'industry pro'].includes(w)))
  ) {
    return {
      type: 'fan',
      name: 'Fan Only',
      color: '#3b82f6',
      rgb: '59,130,246',
      glowClass: 'pulse-glow-blue',
      badgeBg: 'bg-blue-950/40',
      badgeText: 'text-blue-400',
      badgeBorder: 'border-blue-500/50'
    };
  }

  // 6. Industry Pro
  if (
    isPersonal ||
    workspaces.includes('industry_pro') || 
    workspaces.includes('industry pro') ||
    profile?.account_type === 'industry_pro' || 
    profile?.account_type === 'industry pro' || 
    profile?.account_type === 'pro' || 
    profile?.account_type === 'admin' || 
    profile?.is_pro === true || 
    rLower.includes('industry_pro') || 
    rLower.includes('industry pro') || 
    rLower.includes('industry') || 
    rLower.includes('operator') || 
    rLower.includes('founder') || 
    rLower.includes('admin') || 
    rLower.includes('chief')
  ) {
    return {
      type: 'industry_pro',
      name: 'Industry Pro',
      color: '#a855f7',
      rgb: '168,85,247',
      glowClass: 'pulse-glow-purple',
      badgeBg: 'bg-purple-950/40',
      badgeText: 'text-purple-400',
      badgeBorder: 'border-purple-500/50'
    };
  }

  // 7. Fallback Fan Only = Blue
  return {
    type: 'fan',
    name: 'Fan Only',
    color: '#3b82f6',
    rgb: '59,130,246',
    glowClass: 'pulse-glow-blue',
    badgeBg: 'bg-blue-950/40',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/50'
  };
};
