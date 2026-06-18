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
  let newContent = content
    .replace(/#1A1C1E/g, '#0A192F') // Old Dark UI to Navy Blue
    .replace(/#006D44/g, '#0A192F') // Old Emerald to Navy Blue
    .replace(/#005a37/g, '#112a4f')
    .replace(/#005233/g, '#112a4f')
    .replace(/#D4AF37/g, '#004D2C') // Old Gold to Deep Dark Green
    .replace(/#c29f2f/g, '#003a21')
    .replace(/bg-\[\#F4F5F7\]/g, 'bg-white'); // Light grays to white where applicable

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
  }
});
