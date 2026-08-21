const fs = require('fs');
const path = require('path');

const supabaseBaseUrl = "https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets";

const publicFiles = fs.readdirSync('public')
  .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (/\.tsx?$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const file of publicFiles) {
        // Match occurrences of exactly `/filename.ext` enclosed in quotes
        // Also match `url("/filename.ext")` or `url('/filename.ext')` or `url(/filename.ext)`
        
        // Escape special chars in filename for regex
        const escapedFile = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace in quotes: e.g. "/High energy concert 2.png" -> "https://..."
        const regex1 = new RegExp(`(['"\`])\\/${escapedFile}\\1`, 'g');
        const encodedUrl = `${supabaseBaseUrl}/${encodeURIComponent(file).replace(/'/g, "%27")}`;
        
        if (regex1.test(content)) {
          content = content.replace(regex1, `$1${encodedUrl}$1`);
          changed = true;
        }
        
        // Replace in url(...) just in case it doesn't have quotes
        const regex2 = new RegExp(`url\\(\\/${escapedFile}\\)`, 'g');
        if (regex2.test(content)) {
          content = content.replace(regex2, `url("${encodedUrl}")`);
          changed = true;
        }
        
        // Replace in array definitions without leading slash (wait, the prompt says "pointing to local /public folder assets")
        // we'll stick to leading slash.
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir('src');
