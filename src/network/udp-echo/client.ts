import { createSocket } from 'node:dgram';

const HOST = '127.0.0.1';
const PORT = 41234;

const client = createSocket('udp4');

const message = Buffer.from('hello udp');

client.on('message', (msg) => {
  console.log('reply:', msg.toString());
  client.close();
});

client.on('error', (err) => {
  console.error('client error:', err);
  client.close();
});

client.send(message, PORT, HOST, (err) => {
  if (err) {
    console.error('send error:', err);
    client.close();
  }
});
