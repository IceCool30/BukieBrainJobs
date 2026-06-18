const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) callback(dirPath);
    }
  });
}

walkDir('./', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.startsWith("import { LogoBase64 } from '@/lib/logo';\n'use client';")) {
    let newContent = content.replace("import { LogoBase64 } from '@/lib/logo';\n'use client';", "'use client';\nimport { LogoBase64 } from '@/lib/logo';");
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
});
