const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `    const dbProfile = allProfiles.find(p => 
      (p.name && p.name.toLowerCase() === user.name.toLowerCase()) || 
      (p.full_name && p.full_name.toLowerCase() === user.name.toLowerCase()) || 
      (p.console_handle && p.console_handle.toLowerCase() === user.name.toLowerCase()) || 
      (p.label_company_name && p.label_company_name.toLowerCase() === user.name.toLowerCase()) || 
      (p.promoter_name && p.promoter_name.toLowerCase() === user.name.toLowerCase()) || 
      (p.creative_name && p.creative_name.toLowerCase() === user.name.toLowerCase())
    );`;

const rep = `    const searchName = (user.name || '').toLowerCase().trim();
    const dbProfile = allProfiles.find(p => 
      (p.name && p.name.toLowerCase().trim() === searchName) || 
      (p.full_name && p.full_name.toLowerCase().trim() === searchName) || 
      (p.console_handle && p.console_handle.toLowerCase().trim() === searchName) || 
      (p.label_company_name && p.label_company_name.toLowerCase().trim() === searchName) || 
      (p.promoter_name && p.promoter_name.toLowerCase().trim() === searchName) || 
      (p.creative_name && p.creative_name.toLowerCase().trim() === searchName) ||
      (user.email && p.email && p.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );`;

code = code.replace(target, rep);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
