const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    fs.statSync(full).isDirectory() ? walkDir(full, callback) : callback(full);
  });
}

walkDir(path.join(__dirname, 'api'), (filePath) => {
  if (!filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Revert #contracts/ and #db/ back to relative paths
  // Files in api/ root: ../contracts/ and ../db/
  // Files in api/queries/ or api/kimi/: ../../contracts/ and ../../db/

  // Determine depth from api/
  const rel = path.relative(path.join(__dirname, 'api'), path.dirname(filePath));
  const depth = rel === '' ? 1 : rel.split(path.sep).length + 1;
  const prefix = '../'.repeat(depth);

  content = content.replace(/(from\s+["'])#contracts\//g, `$1${prefix}contracts/`);
  content = content.replace(/(from\s+["'])#db\//g, `$1${prefix}db/`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted:', filePath);
  }
});

console.log('Done.');
