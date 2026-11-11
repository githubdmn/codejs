import { createSocket } from 'node:dgram';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = 41234;

export function start(): void {
  const server = createSocket('udp4');

  server.on('message', (msg, rinfo) => {
    const reply = `echo: ${msg.toString()}`;
    server.send(reply, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error('send error:', err);
      }
    });
  });

  server.on('error', (err) => {
    console.error('server error:', err);
    server.close();
  });

  server.bind(PORT, HOST, () => {
    console.log(`udp echo server listening on udp://${HOST}:${PORT}`);
  });
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  start();
}
