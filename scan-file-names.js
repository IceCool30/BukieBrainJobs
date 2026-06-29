import fs from 'fs';
import path from 'path';

function walkDir(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && !file.startsWith('.')) {
        walkDir(fullPath, list);
      }
    } else {
      const lower = file.toLowerCase();
      if (lower.includes('document') || lower.includes('html') || lower.includes('pages') || lower.includes('error')) {
        list.push(fullPath);
      }
    }
  }
  return list;
}

const files = walkDir('.');
console.log('Found files with keywords in names:', files);
