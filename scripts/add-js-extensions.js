#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add .js extensions to relative imports
      content = content.replace(
        /from\s+['"](\.\/[^'"]+)['"]/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            return match.replace(importPath, importPath + '.js');
          }
          return match;
        }
      );
      
      content = content.replace(
        /from\s+['"](\.\.\/[^'"]+)['"]/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            return match.replace(importPath, importPath + '.js');
          }
          return match;
        }
      );
      
      fs.writeFileSync(filePath, content);
    }
  }
}

// Add .js extensions to source files for build
addJsExtensions(path.join(__dirname, '../src'));
console.log('Added .js extensions to source files for build');
