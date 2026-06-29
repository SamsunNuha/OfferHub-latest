const fs = require('fs');
const path = require('path');

const mockDbPath = path.join(__dirname, 'apps', 'shared', 'mockDb.ts');
const content = fs.readFileSync(mockDbPath, 'utf8');

const startMarker = 'export const initialBrands: Brand[] = [';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find initialBrands in mockDb.ts");
  process.exit(1);
}

let bracketCount = 1;
let endIndex = startIndex + startMarker.length;
while (bracketCount > 0 && endIndex < content.length) {
  if (content[endIndex] === '[') bracketCount++;
  else if (content[endIndex] === ']') bracketCount--;
  endIndex++;
}

const brandsSub = content.slice(startIndex, endIndex);

// Parse all brands as objects
const brandRegex = /\{([\s\S]*?)\}/g;
let match;
const brands = [];

while ((match = brandRegex.exec(brandsSub)) !== null) {
  const objText = match[1];
  const nameMatch = /name:\s*"([^"]+)"/.exec(objText);
  const logoMatch = /logo:\s*"([^"]+)"/.exec(objText);
  const webMatch = /website:\s*"([^"]+)"/.exec(objText);
  
  if (nameMatch) {
    brands.push({
      name: nameMatch[1],
      logo: logoMatch ? logoMatch[1] : '',
      website: webMatch ? webMatch[1] : ''
    });
  }
}

console.log(JSON.stringify(brands, null, 2));
