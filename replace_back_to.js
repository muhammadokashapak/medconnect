const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'app'), function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We will find any occurrences of "Back to XYZ"
    // that are inside HTML tags, like >Back to Dashboard< or > Back to ... <
    // and replace them with ">Back to Homepage<".
    content = content.replace(/>\s*Back to [^<]+</g, ">Back to Homepage<");
    
    // For navigation, if there is a router.push(...) on the same line or previous line 
    // it's tricky, but usually the onClick is `onClick={() => router.push("...")}`
    // Since the user wants ALL "Back to Homepage" to go to homepage (which is /feed),
    // let's look for onClick={() => router.push(ANYTHING)} that are on buttons with "Back to Homepage"
    // A simpler regex: if we find ">Back to Homepage<", we can replace the nearby routing if we could parse it.
    
    // Just blindly replace any `/dashboard`, `/knowledge`, `/erp` inside router.push or href near "Back to Homepage"?
    // It's safer to just replace all `href="/.*"` and `router.push("/.*")` inside the file if they are right before "Back to Homepage"
    
    // Instead of complex regex, let's just do:
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Back to Homepage')) {
            // Check current and previous 2 lines for router.push or href
            for (let j = Math.max(0, i - 2); j <= i; j++) {
                lines[j] = lines[j].replace(/router\.push\(['"`]\/[^'"`]*['"`]\)/g, 'router.push("/feed")');
                lines[j] = lines[j].replace(/href=(['"`])\/[^'"`]*\1/g, 'href="/feed"');
            }
        }
    }
    content = lines.join('\n');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
