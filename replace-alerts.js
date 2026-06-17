const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'app');

function findAndReplaceAlerts(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findAndReplaceAlerts(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      if (content.includes('alert(')) {
        let changed = false;
        
        // Simple heuristic: if it contains "success" or "claimed", use toast.success. Else toast.error/info.
        content = content.replace(/alert\((['"`].*?['"`])\)/g, (match, p1) => {
          changed = true;
          const textLower = p1.toLowerCase();
          if (textLower.includes('success') || textLower.includes('claimed') || textLower.includes('saved')) {
            return `toast.success(${p1})`;
          } else if (textLower.includes('fail') || textLower.includes('error') || textLower.includes('required')) {
            return `toast.error(${p1})`;
          } else {
            return `toast.error(${p1})`; // Default to error style for alerts usually
          }
        });
        
        // Handle alert(message) or alert(err.message)
        content = content.replace(/alert\(([^'"`][^)]*)\)/g, (match, p1) => {
            changed = true;
            return `toast.error(${p1})`;
        });

        if (changed) {
          if (!content.includes('import toast') && !content.includes('import { toast }')) {
            // Find the last import
            const importMatches = [...content.matchAll(/^import .*?;?$/gm)];
            if (importMatches.length > 0) {
              const lastImport = importMatches[importMatches.length - 1];
              const lastImportEnd = lastImport.index + lastImport[0].length;
              content = content.substring(0, lastImportEnd) + '\nimport toast from "react-hot-toast";' + content.substring(lastImportEnd);
            } else {
              // No imports, just put at top
              content = 'import toast from "react-hot-toast";\n' + content;
            }
          }
          fs.writeFileSync(fullPath, content, 'utf-8');
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

findAndReplaceAlerts(directory);
console.log("Done replacing alerts!");
