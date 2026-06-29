const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const https = require('https');

function customLookup(hostname, options, callback) {
  console.log('customLookup called for:', hostname, 'options:', options);
  
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

https.get('https://www.google.com/s2/favicons?sz=128&domain=cinnamonair.com', {
  lookup: customLookup
}, (res) => {
  console.log('STATUS:', res.statusCode);
}).on('error', (err) => {
  console.error('ERROR:', err);
});
