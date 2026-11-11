import { createServer } from 'node:http';

const PORT = Number(process.env['PORT'] ?? 3000);

const server = createServer((req, res) => {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(`Hey from ${req.method} ${req.url}\n`);
});

server.listen(PORT, 'localhost', () => {
	console.log(`Listening on http://localhost:${PORT}`);
});
