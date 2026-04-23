const http = require('http');
const options = { hostname: 'localhost', port: 3000, path: '/', method: 'GET', timeout: 10000 };
const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk.toString(); });
  res.on('end', () => {
    console.log('Body length:', data.length);
    console.log(data.slice(0, 400));
  });
});
req.on('error', (err) => console.error('Error:', err.message));
req.on('timeout', () => { req.destroy(); console.error('Timeout'); });
req.end();
