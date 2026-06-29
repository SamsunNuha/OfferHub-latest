const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolveCname('logo.clearbit.com', (err, addresses) => {
  console.log('resolveCname err:', err);
  console.log('resolveCname addresses:', addresses);
});
