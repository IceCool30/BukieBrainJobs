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
  let newContent = content;

  // Let's just remove ALL `import { LogoBase64 } ...` and re-add it cleanly to the top of the file
  if (content.includes("import { LogoBase64 } from '@/lib/logo';")) {
     newContent = newContent.replace(/import \{ LogoBase64 \} from '@\/lib\/logo';/g, '');
     newContent = `import { LogoBase64 } from '@/lib/logo';\n` + newContent;
  }
  
  // also fix double imports if I injected it inside another import by mistake
  // For instance "import { \n\n" from replacing it... actually just running a generic fix for that trailing or breaking syntax:
  newContent = newContent.replace(/import\s*\{\s*\n\s*\n/g, 'import {\n');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
});
