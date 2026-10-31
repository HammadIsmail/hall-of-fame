import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes("export const dynamic = 'force-dynamic';")) {
        content = content.replace(/export const dynamic = 'force-dynamic';\r?\n?/g, '');
        fs.writeFileSync(full, content, 'utf8');
        console.log('Cleaned:', full);
      }
    }
  }
}

walk('src');

