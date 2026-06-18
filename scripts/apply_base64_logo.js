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

const importStatement = `import { LogoBase64 } from '@/lib/logo';`;

walkDir('./', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  if (content.includes('"/logo-primary.png"')) {
    // Add import statement if not present
    if (!content.includes(importStatement)) {
      // Find the last import statement or the beginning of the file
      const importRegex = /^import .+?;?$/gm;
      let lastMatch;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }

      if (lastMatch) {
         const insertPos = lastMatch.index + lastMatch[0].length;
         newContent = newContent.slice(0, insertPos) + '\n' + importStatement + newContent.slice(insertPos);
      } else {
         newContent = importStatement + '\n' + newContent;
      }
    }

    // Replace the src
    newContent = newContent.replace(/src="\/logo-primary\.png"/g, 'src={LogoBase64}');
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
});
