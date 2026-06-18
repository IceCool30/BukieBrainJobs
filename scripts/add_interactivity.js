const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Add active:scale-[0.98] to typical large primary buttons
    content = content.replace(/className="(w-full [^"]*bg-\[#0A192F\][^"]*)"/g, (match, classes) => {
        if (!classes.includes('active:scale')) {
            return `className="${classes.trim()} active:scale-[0.98] transition-all"`;
        }
        return match;
    });

    // Add active:scale-95 to smaller buttons
    content = content.replace(/className="((?:[^"]*bg-\[#0A192F\][^"]*px-\d+[^"]*)|(?:text-sm font-bold[^"]*)|(?:text-\[#0A192F\] font-bold text-\[15px\][^"]*))"/g, (match, classes) => {
        if (!classes.includes('active:scale') && !classes.includes('w-full')) {
            return `className="${classes.trim()} active:scale-95 transition-all"`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated interactivity in ${filePath}`);
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
