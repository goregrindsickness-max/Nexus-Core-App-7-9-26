const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    console.log("RECEIVED ERROR:", body);
    res.end('ok');
    process.exit(0);
  });
}).listen(3001, () => {
  console.log("Listening for errors on 3001...");
});
