const fs = require('fs');
const path = require('path');

const mockDbPath = path.join(__dirname, 'apps', 'shared', 'mockDb.ts');
let content = fs.readFileSync(mockDbPath, 'utf8');

const logoMap = {
  "Abans": "https://logo.clearbit.com/abansgroup.com",
  "Softlogic": "https://logo.clearbit.com/softlogic.lk",
  "Singer Sri Lanka": "https://logo.clearbit.com/singersl.com",
  "Keells": "https://logo.clearbit.com/keellssuper.com",
  "Cargills Food City": "https://logo.clearbit.com/cargillsceylon.com",
  "Arpico Super Centre": "https://logo.clearbit.com/arpico.com",
  "Laugfs Super": "https://logo.clearbit.com/laugfs.lk",
  "DIMO": "https://logo.clearbit.com/dimolanka.com",
  "Singhagiri": "https://logo.clearbit.com/singhagiri.lk",
  "Hayleys": "https://logo.clearbit.com/hayleys.com",
  "Aitken Spence Travels": "https://logo.clearbit.com/aitkenspence.com",
  "MAS Holdings": "https://logo.clearbit.com/masholdings.com",
  "Brandix": "https://logo.clearbit.com/brandix.com",
  "LOLC Holdings": "https://logo.clearbit.com/lolc.com",
  "Ceylon Cold Stores": "https://logo.clearbit.com/elephanthouse.lk",
  "Maliban Group": "https://logo.clearbit.com/malibanbiscuit.com",
  "Munchee (CBL Foods)": "https://logo.clearbit.com/cblgroup.com",
  "Dilmah Tea": "https://logo.clearbit.com/dilmahtea.com",
  "Damro": "https://logo.clearbit.com/damro.lk",
  "Damro Electronics": "https://logo.clearbit.com/damro.lk",
  "ODEL": "https://logo.clearbit.com/odel.lk",
  "Fashion Bug": "https://logo.clearbit.com/fashionbug.lk",
  "Cool Planet": "https://logo.clearbit.com/coolplanet.lk",
  "Hameedia": "https://logo.clearbit.com/hameedia.com",
  "Nolimit": "https://logo.clearbit.com/nolimit.lk",
  "Spa Ceylon": "https://logo.clearbit.com/spaceylon.com",
  "ACL Cables": "https://logo.clearbit.com/acl.lk",
  "Kelani Cables": "https://logo.clearbit.com/kelanicables.com"
};

// We will use regex to find each brand and replace its logo
Object.keys(logoMap).forEach(brandName => {
  const newLogo = logoMap[brandName];
  // Regex to match the exact brand object and replace its logo. 
  // It looks for name: "BrandName", ... logo: "..."
  // Since objects can be long, we match name: "BrandName", then anything until logo: "..."
  const regex = new RegExp(`(name:\\s*"${brandName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}"[\\s\\S]*?logo:\\s*")[^"]+(")`, 'g');
  
  if (content.match(regex)) {
    content = content.replace(regex, `$1${newLogo}$2`);
    console.log(`Updated logo for ${brandName}`);
  } else {
    console.log(`Brand ${brandName} not found or logo not replaced.`);
  }
});

fs.writeFileSync(mockDbPath, content, 'utf8');
console.log('Finished updating logos.');
