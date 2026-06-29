const dns = require('dns');

dns.lookup('www.google.com', (err, address, family) => {
  console.log('www.google.com lookup:', err, address);
});

dns.lookup('images.unsplash.com', (err, address, family) => {
  console.log('images.unsplash.com lookup:', err, address);
});
