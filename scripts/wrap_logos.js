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
  let regex = /<Image\s+src="\/logo-primary\.png"\s+alt="BukieBrainJobs Logo"\s+width=\{([0-9]+)\}\s+height=\{([0-9]+)\}\s+className="([^"]+)"\s*\/>\s*(<span[^>]*>)\s*BukieBrainJobs\s*<\/span>/g;
  let matches = regex.test(content);
  if (matches && filePath !== 'app/jobs/page.tsx') {
    // We already fixed app/jobs/page.tsx
    console.log(`Needs fixing: ${filePath}`);
    
    // Replace logic
    let replacedContent = content.replace(regex, (match, w, h, cls, spanTag) => {
       return `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">
              <Image src="/logo-primary.png" alt="BukieBrainJobs Logo" width={${w}} height={${h}} className="${cls}" />
              ${spanTag}BukieBrainJobs</span>
            </div>`;
    });
    fs.writeFileSync(filePath, replacedContent);
  }
});
