import fs from 'fs';
import path from 'path';

function findReactDirs(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'react' && fs.statSync(fullPath).isDirectory()) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(fullPath, 'package.json'), 'utf8'));
        list.push({ path: fullPath, version: pkg.version });
      } catch (e) {}
    } else if (file === 'node_modules' && fs.statSync(fullPath).isDirectory()) {
      findReactDirs(fullPath, list);
    } else if (fs.statSync(fullPath).isDirectory() && !file.startsWith('.')) {
      // Recurse into subdirectories to find nested node_modules
      findReactDirs(fullPath, list);
    }
  }
  return list;
}

const reactDirs = findReactDirs('node_modules');
console.log('Found React installations:', reactDirs);
