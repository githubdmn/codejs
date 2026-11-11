import { createSocket } from 'node:dgram';

const PORT = 41234;
const HOST = '127.0.0.1';

const server = createSocket('udp4');

server.on('message', (msg, rinfo) => {
	server.send(msg, rinfo.port, rinfo.address);
});

server.bind(PORT, HOST, () => {
	const client = createSocket('udp4');

	client.on('message', (msg) => {
		console.log(`echoed: ${msg.toString()}`);
		client.close();
		server.close();
	});

	client.send('ping', PORT, HOST, (err) => {
		if (err) {
			console.error(err);
		}
	});
});
