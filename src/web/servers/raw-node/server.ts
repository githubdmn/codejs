import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === 'GET') {
    const path = req.url ?? '/';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, path }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not found' }));
}

export function start(port = 3000): Server {
  const server = createServer(handler);
  server.listen(port, () => {
    console.log(`raw-node server listening on http://localhost:${port}`);
  });
  return server;
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  start();
}
