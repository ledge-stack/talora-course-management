const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../apps/web/src/app/api');

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it already has the dynamic export
      if (!content.includes("export const dynamic = 'force-dynamic'")) {
        // Insert after the imports
        const lines = content.split('\n');
        let insertIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          }
        }
        
        lines.splice(insertIndex, 0, "\nexport const dynamic = 'force-dynamic';\n");
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(apiDir);
console.log('Done processing all route.ts files.');
