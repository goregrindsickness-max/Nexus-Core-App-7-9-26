const fs = require('fs');
let content = fs.readFileSync('src/supabase.ts', 'utf8');

const failoverTarget = `export function handleDatabaseFailover(tableName: string, fallbackData: any[]): any[] {
  if (typeof window === 'undefined') return fallbackData;
  try {
    const cached = localStorage.getItem(\`nexus_fallback_\${tableName}\`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        console.warn(\`[EGRESS LOCK ACTIVE] Serving local cache for table: \${tableName}\`);
        return parsed;
      }
    }
  } catch (err) {
    console.error(\`Failed to read/parse localStorage nexus_fallback_\${tableName}\`, err);
  }
  return fallbackData;
}`;

const failoverReplacement = `export function handleDatabaseFailover(tableName: string, fallbackData: any[]): any[] {
  return fallbackData;
}`;

const saveTarget = `export function saveToFailoverCache(tableName: string, freshData: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (Array.isArray(freshData)) {
      localStorage.setItem(\`nexus_fallback_\${tableName}\`, JSON.stringify(freshData));
    }
  } catch (err) {
    console.error(\`Failed to save payload to nexus_fallback_\${tableName}\`, err);
  }
}`;

const saveReplacement = `export function saveToFailoverCache(tableName: string, freshData: any[]): void {
  // Disabled as per user request to remove fallback logic entirely
}`;

content = content.replace(failoverTarget, failoverReplacement);
content = content.replace(saveTarget, saveReplacement);

fs.writeFileSync('src/supabase.ts', content);
console.log("Patched supabase.ts fallback logic");
