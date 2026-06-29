import fs from 'fs';
import path from 'path';

function searchInDir(dir, pattern, matches = []) {
  if (!fs.existsSync(dir)) return matches;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchInDir(fullPath, pattern, matches);
    } else if (file.endsWith('.js') || file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(pattern)) {
          matches.push(fullPath);
        }
      } catch (e) {}
    }
  }
  return matches;
}

const matches = searchInDir('.next/server', '61682'); // 61682 is the module key inside chunk 682
console.log('Matches for 61682:', matches);
