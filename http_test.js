const https = require('https');
const fs = require('fs');

https.get('https://www.google.com/s2/favicons?sz=128&domain=keellssuper.com', (res) => {
  console.log('STATUS:', res.statusCode);
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('keells_test.png');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Saved keells_test.png successfully!');
    });
  }
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
