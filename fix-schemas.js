const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/john.bisong/Bukie Workspace/bukiebrainjobs/packages/validation/src';

const files = fs.readdirSync(dir);

for (const file of files) {
  if (!file.endsWith('.ts')) continue;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // replace z.nativeEnum(X) with z.string()
  content = content.replace(/z\.nativeEnum\([a-zA-Z]+\)/g, 'z.string()');
  
  // replace JobType.TASK with 'TASK'
  content = content.replace(/JobType\.TASK/g, "'TASK'");
  
  // check for userRole
  content = content.replace(/UserRole\.[A-Z_]+/g, (match) => {
    return "'" + match.split('.')[1] + "'";
  });

  fs.writeFileSync(p, content);
}
console.log('Fixed schemas');
