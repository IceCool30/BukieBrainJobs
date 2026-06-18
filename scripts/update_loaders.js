const fs = require('fs');

const filesToUpdate = [
  'app/dashboard/chat/[jobId]/page.tsx',
  'app/p/[id]/page.tsx',
  'app/admin/qa-sandbox/page.tsx',
  'app/admin/page.tsx',
  'components/ChatWindow.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('import Image')) {
      content = content.replace("import React", "import Image from 'next/image';\nimport React");
      fs.writeFileSync(file, content);
    }
  }
});

const allTargetFiles = [
  'app/dashboard/passport/page.tsx',
  'app/dashboard/chat/[jobId]/page.tsx',
  'app/dashboard/post-job/page.tsx',
  'app/p/[id]/page.tsx',
  'app/onboarding/page.tsx',
  'app/admin/qa-sandbox/page.tsx',
  'app/admin/page.tsx',
  'components/ChatWindow.tsx'
];

allTargetFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/<Loader2\s+className="w-10 h-10[^>]*\/>/g, '<Image src="/logo.png" alt="Loading..." width={40} height={40} className="animate-pulse shadow-md rounded-xl" />');
    content = content.replace(/<Loader2\s+className="w-8 h-8[^>]*\/>/g, '<Image src="/logo.png" alt="Loading..." width={40} height={40} className="animate-pulse shadow-md rounded-xl mb-3" />');
    fs.writeFileSync(file, content);
  }
});
