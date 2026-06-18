const fs = require('fs');
const path = require('path');

const replacementHero = `                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-center p-2.5 w-fit">
                   <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={72} height={72} className="rounded-2xl shadow-sm border border-gray-200 bg-white p-[4px]" />
                </div>`;

const replacementCapsule = `<div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">
              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-xl shadow-sm border border-gray-200 bg-white p-[2px]" />
              <span className="font-extrabold text-xl tracking-tight text-[#0A192F] hidden sm:block pr-2">BukieBrainJobs</span>
            </div>`;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // For login page:
    if (filePath.includes('login/page.tsx')) {
        content = content.replace(/<div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">\s*<Image src=\{LogoBase64\}[\s\S]*?<\/span>\s*<\/div>/, 
          `<div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">\n              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-xl shadow-sm border border-gray-200 bg-white p-[2px]" />\n              <span className="font-extrabold text-xl tracking-tight text-[#0A192F] pr-2">BukieBrainJobs</span>\n            </div>`
        );
    }
    
    // For dashboard and other headers that had LogoBase64 and text separated
    // e.g. dashboard/page.tsx
    if (filePath.includes('dashboard/page.tsx') || filePath.includes('admin/page.tsx')) {
         content = content.replace(/<Image src=\{LogoBase64\} alt="BukieBrainJobs Logo" width=\{40\} height=\{40\} className="rounded-xl shadow-md border-b-2 border-\[#004D2C\] bg-white p-\[2px\]" \/>/g, replacementCapsule);
    }

    fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') walkDir(dirPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            processFile(dirPath);
        }
    });
}

walkDir('./app');
