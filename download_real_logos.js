const fs = require('fs');
const path = require('path');
const https = require('https');
const dns = require('dns');

// Force Node.js to use Google's DNS servers for direct lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mockDbPath = path.join(__dirname, 'apps', 'shared', 'mockDb.ts');
const assetsDir = path.join(__dirname, 'apps', 'assets', 'brand_logos');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Custom lookup function that bypasses broken OS DNS resolvers
function customLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      dns.resolve6(hostname, (err6, addresses6) => {
        if (err6 || !addresses6 || addresses6.length === 0) {
          // Fallback to native OS lookup if both fail
          dns.lookup(hostname, options, callback);
        } else {
          if (options.all) {
            callback(null, addresses6.map(addr => ({ address: addr, family: 6 })));
          } else {
            callback(null, addresses6[0], 6);
          }
        }
      });
      return;
    }
    if (options.all) {
      callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
    } else {
      callback(null, addresses[0], 4);
    }
  });
}


// Read mockDb.ts
const content = fs.readFileSync(mockDbPath, 'utf8');

// Extract initialBrands array content
const startMarker = 'export const initialBrands: Brand[] = [';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find initialBrands in mockDb.ts");
  process.exit(1);
}

// Find matching closing bracket ]; for the array
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

console.log(`Found ${brands.length} brands in mockDb.ts`);

const downloadedBrands = [];

function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function extractDomain(website) {
  if (!website) return null;
  let domain = website.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
  domain = domain.split('/')[0];
  return domain;
}

function getDownloadUrl(brand) {
  const { name, logo, website } = brand;
  
  // 1. If it's a Clearbit URL, prioritize that domain!
  if (logo && logo.includes('logo.clearbit.com')) {
    const clearbitDomain = logo.split('logo.clearbit.com/')[1];
    if (clearbitDomain) {
      return `https://www.google.com/s2/favicons?sz=128&domain=${clearbitDomain}`;
    }
  }
  
  // 2. Try to extract domain from website field
  const domain = extractDomain(website);
  if (domain && domain !== 'offerhub.lk' && domain !== 'www.offerhub.lk') {
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  }
  
  // 3. Fallback to logo URL
  return logo;
}

function downloadLogo(brand, index) {
  if (index >= brands.length) {
    generateMappingFile();
    return;
  }

  const { name } = brand;
  const fileName = `${sanitizeFileName(name)}.png`;
  const filePath = path.join(assetsDir, fileName);

  // If the brand is Abans, keep the user's custom uploaded logo!
  if (name.toLowerCase() === 'abans' && fs.existsSync(filePath)) {
    console.log(`[${index + 1}/${brands.length}] Skipping Abans (keeping custom high-res logo).`);
    downloadedBrands.push({ name, fileName });
    setTimeout(() => downloadLogo(brands[index + 1], index + 1), 10);
    return;
  }

  const targetUrl = getDownloadUrl(brand);
  console.log(`[${index + 1}/${brands.length}] Downloading logo for ${name} from ${targetUrl}...`);

  const request = https.get(targetUrl, {
    lookup: customLookup,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
  }, (response) => {
    // Follow redirect if needed
    if (response.statusCode === 301 || response.statusCode === 302) {
      const redirectUrl = response.headers.location;
      console.log(`Following redirect to: ${redirectUrl}`);
      const redirectRequest = https.get(redirectUrl, { lookup: customLookup }, (res) => {
        if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(filePath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Successfully saved ${name} logo.`);
            downloadedBrands.push({ name, fileName });
            setTimeout(() => downloadLogo(brands[index + 1], index + 1), 50);
          });
        } else {
          console.warn(`Failed to download ${name} logo on redirect. Status: ${res.statusCode}`);
          setTimeout(() => downloadLogo(brands[index + 1], index + 1), 50);
        }
      });
      redirectRequest.on('error', (err) => {
        console.error(`Error on redirect download for ${name}:`, err.message);
        setTimeout(() => downloadLogo(brands[index + 1], index + 1), 50);
      });
      return;
    }

    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Successfully saved ${name} logo.`);
        downloadedBrands.push({ name, fileName });
        setTimeout(() => downloadLogo(brands[index + 1], index + 1), 50);
      });
    } else {
      console.warn(`Failed to download ${name} logo. HTTP Status: ${response.statusCode}`);
      setTimeout(() => downloadLogo(brands[index + 1], index + 1), 50);
    }
  });

  request.on('error', (err) => {
    console.error(`Error downloading ${name} logo:`, err.message);
    setTimeout(() => downloadLogo(brands[index + 1], index + 1), 50);
  });
}

function generateMappingFile() {
  const mappingFilePath = path.join(__dirname, 'apps', 'shared', 'brandLogos.ts');
  let fileContent = `// This file is auto-generated by download_real_logos.js\n\n`;
  fileContent += `export const BRAND_LOGOS: Record<string, any> = {\n`;

  downloadedBrands.forEach(b => {
    fileContent += `  "${b.name}": require('../assets/brand_logos/${b.fileName}'),\n`;
  });

  fileContent += `};\n`;

  fs.writeFileSync(mappingFilePath, fileContent, 'utf8');
  console.log(`Generated logo mapping file at ${mappingFilePath}`);
  console.log(`Total downloaded logos: ${downloadedBrands.length}`);
}

// Start download
downloadLogo(brands[0], 0);
