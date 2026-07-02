const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
}

const files = walkSync('./__tests__').filter(f => f.endsWith('.test.tsx') || f.endsWith('.test.ts'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let updated = content
    .replace(/it\('([^']+)', \(\) => {/g, "it('$1', async () => {")
    .replace(/render\(/g, 'await render(');
  fs.writeFileSync(f, updated);
  console.log('Fixed', f);
});
