import { createServer } from 'node:http';

const PORT = 3000;
const HOST = 'localhost';

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('hello');
});

server.listen(PORT, HOST, () => {
  console.log(`hello listening on http://${HOST}:${PORT}`);
});
