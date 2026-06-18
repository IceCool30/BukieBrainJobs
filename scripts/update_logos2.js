const fs = require('fs');
const path = require('path');

const responsiveCapsule = `<div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit cursor-pointer">
              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={28} height={28} className="rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]" />
              <span className="font-black text-[16px] tracking-tight text-[#0A192F] hidden sm:block pr-2 whitespace-nowrap">BukieBrainJobs</span>
            </div>`;

const loadingCapsule = `<div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse">
            <Image src={LogoBase64} alt="Loading..." width={28} height={28} className="rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]" />
            <span className="font-black text-[16px] tracking-tight text-[#0A192F] hidden sm:block pr-2 whitespace-nowrap">BukieBrainJobs</span>
          </div>`;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix jobs page nav capsule
    content = content.replace(/<div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 shrink-0">\s*<Image src=\{LogoBase64\} alt="BukieBrainJobs Logo" width=\{32\} height=\{32\} className="rounded-xl shadow-sm border border-gray-200 bg-white p-\[2px\]" \/>\s*<span className="font-extrabold text-xl tracking-tight text-\[#0A192F\] hidden sm:block pr-2">BukieBrainJobs<\/span>\s*<\/div>/g, responsiveCapsule);

    // Fix loading single logos
    content = content.replace(/<Image src=\{LogoBase64\} alt="Loading\.\.\." width=\{40\} height=\{40\} className="animate-pulse shadow-md rounded-xl mb-3 bg-white p-\[2px\]" \/>/g, loadingCapsule);

    // Fix onboarding loading
    content = content.replace(/<Image src=\{LogoBase64\} alt="Loading\.\.\." width=\{40\} height=\{40\} className="animate-pulse shadow-md rounded-xl bg-white p-\[2px\]" \/>/g, 
        `<div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit animate-pulse">
            <Image src={LogoBase64} alt="Loading..." width={28} height={28} className="rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]" />
            <span className="font-black text-[16px] tracking-tight text-[#0A192F] hidden sm:block pr-2 whitespace-nowrap">BukieBrainJobs</span>
          </div>`
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
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
