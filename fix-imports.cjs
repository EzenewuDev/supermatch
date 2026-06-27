const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function getRelativePath(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile);
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel;
}

const dbSchemaPath = path.resolve(__dirname, 'db/schema.ts');

walkDir(path.join(__dirname, 'api'), (filePath) => {
  if (!filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace "@db/schema" with relative path + .js
  let schemaRel = getRelativePath(filePath, dbSchemaPath).replace('.ts', '.js');
  content = content.replace(/from\s+["']@db\/schema["']/g, `from "${schemaRel}"`);

  // 2. Add .js to relative imports
  // Matches: import { X } from "./something"
  // Does not match: import { X } from "./something.js" or from "zod"
  content = content.replace(/(from\s+["'])(\.[^"']+)(["'])/g, (match, p1, p2, p3) => {
    if (!p2.endsWith('.js') && !p2.endsWith('.ts')) {
      return p1 + p2 + '.js' + p3;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed imports in', filePath);
  }
});
