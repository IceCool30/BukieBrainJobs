import fs from 'fs';

const filePath = '.next/server/chunks/682.js';
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('Total length of chunk 682:', content.length);
  
  // Extract snippet around first 2000 chars
  console.log('First 2000 characters of chunk 682:\n', content.slice(0, 2000));
} else {
  console.log('Chunk 471.js does not exist.');
}
