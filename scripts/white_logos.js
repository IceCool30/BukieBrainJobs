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
  let changed = false;

  // Replace <Image src="/logo-primary.png" ... className="xyz" />
  // with <Image src="/logo-primary.png" ... className="xyz bg-white p-[2px]" />
  // ONLY if it doesn't already have bg-white
  
  let newContent = content.replace(/<Image\s+src="\/logo-primary\.png"([^>]+)className="([^"]+)"([^>]*)>/g, (match, before, cls, after) => {
    if (!cls.includes('bg-white ')) {
      return `<Image src="/logo-primary.png"${before}className="${cls} bg-white p-[2px]"${after}>`;
    }
    return match;
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
});
