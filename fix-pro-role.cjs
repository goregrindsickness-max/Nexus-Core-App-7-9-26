const fs = require('fs');
const file = 'src/components/social/TimelineFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const isIndustryPro = (post.authorRole || '').toUpperCase().includes('INDUSTRY') || (post.authorRole || '').toUpperCase() === 'PRO' || (post.authorRole || '').toUpperCase() === 'INDUSTRY_PRO';",
  "const isIndustryPro = (post.authorRole || '').toUpperCase().includes('INDUSTRY') || (post.authorRole || '').toUpperCase() === 'PRO' || (post.authorRole || '').toUpperCase() === 'INDUSTRY_PRO' || (post.authorRole || '').toUpperCase() === 'PROMOTER' || (post.authorRole || '').toUpperCase() === 'TALENT BUYER';"
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated TimelineFeed.tsx for pro role");
