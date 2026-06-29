import fs from 'fs';

const filePath = 'node_modules/next/package.json';
if (fs.existsSync(filePath)) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('Next.js peerDependencies:', pkg.peerDependencies);
  console.log('Next.js dependencies:', pkg.dependencies);
} else {
  console.log('next/package.json does not exist.');
}
