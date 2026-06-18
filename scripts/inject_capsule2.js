const fs = require('fs');
const path = require('path');

const newCapsule = `<div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">
              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-xl shadow-sm border border-gray-200 bg-white p-[2px]" />
              <span className="font-extrabold text-xl tracking-tight text-[#0A192F] hidden sm:block pr-2">BukieBrainJobs</span>
            </div>`;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Headers that just had the standalone logo before
    content = content.replace(/<Image src=\{LogoBase64\} alt="BukieBrainJobs Logo" width=\{[0-9]+\} height=\{[0-9]+\} className="rounded-xl shadow-md border-b-2 border-\[#004D2C\] bg-white p-\[2px\]" \/>/g, newCapsule);

    // Some have shadow instead of shadow-md
    content = content.replace(/<Image src=\{LogoBase64\} alt="BukieBrainJobs Logo" width=\{[0-9]+\} height=\{[0-9]+\} className="rounded-xl shadow border-b-2 border-\[#004D2C\] bg-white p-\[2px\]" \/>/g, newCapsule);

    // Some have `border border-[#004D2C]/50` or similar
    content = content.replace(/<Image src=\{LogoBase64\} alt="BukieBrainJobs Logo" width=\{[0-9]+\} height=\{[0-9]+\} className="rounded-xl shadow-md border border-\[#004D2C\]\/50 bg-white p-\[2px\]" \/>/g, newCapsule);

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
