# HTTP and Networking in Node.js - Deep Dive

---

## 1. HTTP Fundamentals

### 1.1 Understanding HTTP Protocol

```javascript
/*
HTTP (HyperText Transfer Protocol)
──────────────────────────────────

HTTP Request Structure:
┌────────────────────────────────────┐
│ GET /api/users HTTP/1.1            │ ← Request Line
│ Host: example.com                  │
│ User-Agent: Mozilla/5.0            │ ← Headers
│ Accept: application/json           │
│ Authorization: Bearer token123     │
│                                    │ ← Empty line
│ {"name": "John"}                   │ ← Body (optional)
└────────────────────────────────────┘

HTTP Response Structure:
┌────────────────────────────────────┐
│ HTTP/1.1 200 OK                    │ ← Status Line
│ Content-Type: application/json     │
│ Content-Length: 25                 │ ← Headers
│ Set-Cookie: session=abc123         │
│                                    │ ← Empty line
│ {"id": 1, "name": "John"}          │ ← Body
└────────────────────────────────────┘

HTTP Methods (Verbs):
- GET      - Retrieve resource
- POST     - Create resource
- PUT      - Update/replace resource
- PATCH    - Partial update
- DELETE   - Delete resource
- HEAD     - Get headers only
- OPTIONS  - Get allowed methods

Status Codes:
- 1xx - Informational
- 2xx - Success (200 OK, 201 Created, 204 No Content)
- 3xx - Redirection (301 Moved, 302 Found, 304 Not Modified)
- 4xx - Client Error (400 Bad Request, 401 Unauthorized, 404 Not Found)
- 5xx - Server Error (500 Internal Server Error, 503 Service Unavailable)
*/

const http = require('http');

// Inspecting HTTP request
const server = http.createServer((req, res) => {
	console.log('Method:', req.method);        // GET, POST, etc.
	console.log('URL:', req.url);              // /api/users?id=1
	console.log('Headers:', req.headers);      // Object with all headers
	console.log('HTTP Version:', req.httpVersion); // 1.1

	// Parse URL
	const url = new URL(req.url, `http://${req.headers.host}`);
	console.log('Pathname:', url.pathname);    // /api/users
	console.log('Query:', url.searchParams);   // URLSearchParams object

	res.end('Hello World');
});

server.listen(3000);
```

### 1.2 Creating HTTP Servers

```javascript
const http = require('http');

// Basic Server
// ────────────

const basicServer = http.createServer((req, res) => {
	// req: http.IncomingMessage (Readable Stream)
	// res: http.ServerResponse (Writable Stream)

	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World\n');
});

basicServer.listen(3000, () => {
	console.log('Server running at http://localhost:3000/');
});

// Server with routing
// ───────────────────

const routedServer = http.createServer((req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	// Simple routing
	if (url.pathname === '/' && req.method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end('<h1>Home Page</h1>');

	} else if (url.pathname === '/api/users' && req.method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify([
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		]));

	} else if (url.pathname === '/api/users' && req.method === 'POST') {
		let body = '';

		// Read request body
		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', () => {
			try {
				const user = JSON.parse(body);
				user.id = Date.now();

				res.writeHead(201, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify(user));
			} catch (error) {
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Invalid JSON' }));
			}
		});

	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('404 Not Found');
	}
});

routedServer.listen(3001);

// Handling different content types
// ─────────────────────────────────

const contentTypeServer = http.createServer((req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	switch (url.pathname) {
		case '/json':
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ message: 'JSON response' }));
			break;

		case '/html':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end('<html><body><h1>HTML Response</h1></body></html>');
			break;

		case '/text':
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('Plain text response');
			break;

		case '/xml':
			res.writeHead(200, { 'Content-Type': 'application/xml' });
			res.end('<?xml version="1.0"?><root><message>XML response</message></root>');
			break;

		default:
			res.writeHead(404);
			res.end('Not Found');
	}
});

contentTypeServer.listen(3002);

// Server with error handling
// ──────────────────────────

const robustServer = http.createServer((req, res) => {
	try {
		// Handle request
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('Success');
	} catch (error) {
		console.error('Error handling request:', error);

		if (!res.headersSent) {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'Internal Server Error' }));
		}
	}
});

// Handle server errors
robustServer.on('error', (error) => {
	if (error.code === 'EADDRINUSE') {
		console.error('Port already in use');
	} else {
		console.error('Server error:', error);
	}
});

robustServer.on('clientError', (error, socket) => {
	console.error('Client error:', error);
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

robustServer.listen(3003);

// Graceful shutdown
// ─────────────────

const shutdownServer = http.createServer((req, res) => {
	res.end('Hello');
});

shutdownServer.listen(3004);

// Track active connections
const connections = new Set();

shutdownServer.on('connection', (connection) => {
	connections.add(connection);

	connection.on('close', () => {
		connections.delete(connection);
	});
});

// Graceful shutdown handler
function gracefulShutdown() {
	console.log('Shutting down gracefully...');

	shutdownServer.close(() => {
		console.log('Server closed');
		process.exit(0);
	});

	// Close existing connections
	for (const connection of connections) {
		connection.end();
	}

	// Force close after timeout
	setTimeout(() => {
		console.error('Forcing shutdown');
		process.exit(1);
	}, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 1.3 Parsing Request Data

```javascript
const http = require('http');
const querystring = require('querystring');

// Parsing URL query parameters
// ────────────────────────────

http.createServer((req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	// Get query parameters
	const userId = url.searchParams.get('id');
	const filter = url.searchParams.get('filter');
	const page = url.searchParams.get('page') || 1;

	// Get all values for a key
	const tags = url.searchParams.getAll('tag'); // ?tag=js&tag=node

	console.log({ userId, filter, page, tags });

	res.end('OK');
}).listen(3000);

// Example: GET /api/users?id=123&filter=active&page=2&tag=js&tag=node

// Parsing JSON request body
// ─────────────────────────

function parseJSON(req) {
	return new Promise((resolve, reject) => {
		let body = '';

		req.on('data', chunk => {
			body += chunk.toString();

			// Prevent large payloads
			if (body.length > 1e6) { // 1MB limit
				req.connection.destroy();
				reject(new Error('Request body too large'));
			}
		});

		req.on('end', () => {
			try {
				const data = JSON.parse(body);
				resolve(data);
			} catch (error) {
				reject(new Error('Invalid JSON'));
			}
		});

		req.on('error', reject);
	});
}

http.createServer(async (req, res) => {
	if (req.method === 'POST') {
		try {
			const data = await parseJSON(req);
			console.log('Received data:', data);

			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ received: data }));
		} catch (error) {
			res.writeHead(400, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: error.message }));
		}
	}
}).listen(3001);

// Parsing form data (application/x-www-form-urlencoded)
// ─────────────────────────────────────────────────────

function parseFormData(req) {
	return new Promise((resolve, reject) => {
		let body = '';

		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', () => {
			const data = querystring.parse(body);
			resolve(data);
		});

		req.on('error', reject);
	});
}

http.createServer(async (req, res) => {
	if (req.method === 'POST' &&
		req.headers['content-type'] === 'application/x-www-form-urlencoded') {

		const formData = await parseFormData(req);
		console.log('Form data:', formData);
		// { username: 'john', password: 'secret' }

		res.end('Form received');
	}
}).listen(3002);

// Parsing multipart/form-data (file uploads)
// ──────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// For production, use libraries like 'formidable' or 'multer'
// This is a simplified example

http.createServer((req, res) => {
	if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {

		const uploadDir = './uploads';
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}

		const filename = `upload-${Date.now()}.dat`;
		const filepath = path.join(uploadDir, filename);
		const writeStream = fs.createWriteStream(filepath);

		req.pipe(writeStream);

		writeStream.on('finish', () => {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				message: 'File uploaded',
				filename
			}));
		});

		writeStream.on('error', (error) => {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'Upload failed' }));
		});
	} else {
		res.writeHead(400);
		res.end('Bad Request');
	}
}).listen(3003);

// Handling cookies
// ────────────────

function parseCookies(cookieHeader) {
	const cookies = {};

	if (cookieHeader) {
		cookieHeader.split(';').forEach(cookie => {
			const [name, value] = cookie.trim().split('=');
			cookies[name] = decodeURIComponent(value);
		});
	}

	return cookies;
}

function setCookie(res, name, value, options = {}) {
	let cookie = `${name}=${encodeURIComponent(value)}`;

	if (options.maxAge) {
		cookie += `; Max-Age=${options.maxAge}`;
	}

	if (options.httpOnly) {
		cookie += '; HttpOnly';
	}

	if (options.secure) {
		cookie += '; Secure';
	}

	if (options.sameSite) {
		cookie += `; SameSite=${options.sameSite}`;
	}

	if (options.path) {
		cookie += `; Path=${options.path}`;
	}

	res.setHeader('Set-Cookie', cookie);
}

http.createServer((req, res) => {
	// Parse cookies from request
	const cookies = parseCookies(req.headers.cookie);
	console.log('Cookies:', cookies);

	// Set cookie in response
	setCookie(res, 'sessionId', 'abc123', {
		maxAge: 3600,    // 1 hour
		httpOnly: true,
		secure: true,
		sameSite: 'Strict',
		path: '/'
	});

	res.end('Cookie set');
}).listen(3004);
```

### 1.4 HTTP Headers

```javascript
const http = require('http');

// Common request headers
// ──────────────────────

http.createServer((req, res) => {
	// Content negotiation
	const acceptHeader = req.headers['accept'];
	const acceptsJSON = acceptHeader?.includes('application/json');
	const acceptsHTML = acceptHeader?.includes('text/html');

	// Authentication
	const authHeader = req.headers['authorization'];
	// "Bearer token123" or "Basic base64encodedcreds"

	// Client information
	const userAgent = req.headers['user-agent'];
	const referer = req.headers['referer'];
	const host = req.headers['host'];

	// Request body info
	const contentType = req.headers['content-type'];
	const contentLength = req.headers['content-length'];

	// Caching
	const ifNoneMatch = req.headers['if-none-match']; // ETag
	const ifModifiedSince = req.headers['if-modified-since'];

	// CORS
	const origin = req.headers['origin'];

	console.log({
		acceptsJSON,
		authHeader,
		userAgent,
		contentType,
		origin
	});

	res.end('Headers received');
}).listen(3000);

// Setting response headers
// ────────────────────────

http.createServer((req, res) => {
	// Single header
	res.setHeader('Content-Type', 'application/json');

	// Multiple headers
	res.setHeader('X-Custom-Header', 'custom-value');
	res.setHeader('X-Request-ID', Date.now().toString());

	// Or use writeHead
	res.writeHead(200, {
		'Content-Type': 'application/json',
		'X-Custom-Header': 'custom-value',
		'X-Request-ID': Date.now().toString()
	});

	res.end(JSON.stringify({ message: 'Success' }));
}).listen(3001);

// CORS headers
// ────────────

http.createServer((req, res) => {
	// Allow all origins (not recommended for production)
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Or specific origin
	const allowedOrigins = ['https://example.com', 'https://app.example.com'];
	const origin = req.headers.origin;

	if (allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}

	// Allowed methods
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

	// Allowed headers
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	// Allow credentials
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	// Preflight cache duration (seconds)
	res.setHeader('Access-Control-Max-Age', '86400');

	// Handle preflight request
	if (req.method === 'OPTIONS') {
		res.writeHead(204); // No Content
		res.end();
		return;
	}

	res.end('CORS enabled');
}).listen(3002);

// Caching headers
// ───────────────

http.createServer((req, res) => {
	// Cache-Control (modern)
	res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
	// Options: public, private, no-cache, no-store, max-age, must-revalidate

	// ETag (entity tag for validation)
	const etag = '"123456789"';
	res.setHeader('ETag', etag);

	// Check if client has cached version
	if (req.headers['if-none-match'] === etag) {
		res.writeHead(304); // Not Modified
		res.end();
		return;
	}

	// Last-Modified
	const lastModified = new Date('2024-01-01').toUTCString();
	res.setHeader('Last-Modified', lastModified);

	// Check if modified since
	const ifModifiedSince = req.headers['if-modified-since'];
	if (ifModifiedSince === lastModified) {
		res.writeHead(304);
		res.end();
		return;
	}

	// Expires (older method)
	const expires = new Date(Date.now() + 3600000).toUTCString();
	res.setHeader('Expires', expires);

	res.end('Cached content');
}).listen(3003);

// Security headers
// ────────────────

http.createServer((req, res) => {
	// Prevent XSS attacks
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-XSS-Protection', '1; mode=block');

	// Content Security Policy
	res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");

	// HTTPS only
	res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	// Referrer policy
	res.setHeader('Referrer-Policy', 'no-referrer');

	// Permissions policy
	res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');

	res.end('Secure headers set');
}).listen(3004);

// Compression headers
// ───────────────────

const zlib = require('zlib');

http.createServer((req, res) => {
	const acceptEncoding = req.headers['accept-encoding'] || '';
	const data = 'Hello World'.repeat(1000); // Large response

	if (acceptEncoding.includes('gzip')) {
		res.setHeader('Content-Encoding', 'gzip');
		res.setHeader('Content-Type', 'text/plain');

		zlib.gzip(data, (err, compressed) => {
			if (err) {
				res.writeHead(500);
				res.end('Compression error');
				return;
			}

			res.end(compressed);
		});

	} else if (acceptEncoding.includes('deflate')) {
		res.setHeader('Content-Encoding', 'deflate');
		res.setHeader('Content-Type', 'text/plain');

		zlib.deflate(data, (err, compressed) => {
			if (err) {
				res.writeHead(500);
				res.end('Compression error');
				return;
			}

			res.end(compressed);
		});

	} else {
		// No compression
		res.setHeader('Content-Type', 'text/plain');
		res.end(data);
	}
}).listen(3005);
```

---

## 2. Making HTTP Requests

### 2.1 Using http.request()

```javascript
const http = require('http');
const https = require('https');

// Basic GET request
// ─────────────────

const options = {
	hostname: 'jsonplaceholder.typicode.com',
	port: 443,
	path: '/users/1',
	method: 'GET',
	headers: {
		'User-Agent': 'Node.js HTTP Client',
		'Accept': 'application/json'
	}
};

const req = https.request(options, (res) => {
	console.log('Status Code:', res.statusCode);
	console.log('Headers:', res.headers);

	let data = '';

	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		console.log('Response:', JSON.parse(data));
	});
});

req.on('error', (error) => {
	console.error('Request failed:', error);
});

req.end();

// POST request with JSON
// ──────────────────────

function postJSON(hostname, path, data) {
	return new Promise((resolve, reject) => {
		const postData = JSON.stringify(data);

		const options = {
			hostname,
			port: 443,
			path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(postData)
			}
		};

		const req = https.request(options, (res) => {
			let responseData = '';

			res.on('data', chunk => {
				responseData += chunk;
			});

			res.on('end', () => {
				try {
					resolve({
						statusCode: res.statusCode,
						headers: res.headers,
						body: JSON.parse(responseData)
					});
				} catch (error) {
					reject(error);
				}
			});
		});

		req.on('error', reject);

		req.write(postData);
		req.end();
	});
}

// Usage
postJSON('jsonplaceholder.typicode.com', '/posts', {
	title: 'New Post',
	body: 'Post content',
	userId: 1
})
	.then(response => {
		console.log('Created:', response.body);
	})
	.catch(error => {
		console.error('Error:', error);
	});

// Request with timeout
// ────────────────────

function requestWithTimeout(options, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let data = '';

			res.on('data', chunk => {
				data += chunk;
			});

			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					body: data
				});
			});
		});

		req.on('error', reject);

		// Set timeout
		req.setTimeout(timeout, () => {
			req.destroy();
			reject(new Error('Request timeout'));
		});

		req.end();
	});
}

// Following redirects
// ───────────────────

function requestWithRedirects(url, maxRedirects = 5) {
	return new Promise((resolve, reject) => {
		let redirectCount = 0;

		function makeRequest(currentUrl) {
			const urlObj = new URL(currentUrl);
			const protocol = urlObj.protocol === 'https:' ? https : http;

			const req = protocol.request(currentUrl, (res) => {
				// Handle redirects
				if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
					if (redirectCount >= maxRedirects) {
						reject(new Error('Too many redirects'));
						return;
					}

					redirectCount++;
					const redirectUrl = new URL(res.headers.location, currentUrl);
					makeRequest(redirectUrl.href);
					return;
				}

				let data = '';

				res.on('data', chunk => {
					data += chunk;
				});

				res.on('end', () => {
					resolve({
						statusCode: res.statusCode,
						body: data
					});
				});
			});

			req.on('error', reject);
			req.end();
		}

		makeRequest(url);
	});
}

// Downloading files
// ─────────────────

const fs = require('fs');

function downloadFile(url, destination) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(destination);

		https.get(url, (response) => {
			// Check if successful
			if (response.statusCode !== 200) {
				reject(new Error(`Failed to download: ${response.statusCode}`));
				return;
			}

			// Track progress
			const totalSize = parseInt(response.headers['content-length'], 10);
			let downloadedSize = 0;

			response.on('data', (chunk) => {
				downloadedSize += chunk.length;
				const progress = (downloadedSize / totalSize * 100).toFixed(2);
				console.log(`Download progress: ${progress}%`);
			});

			// Pipe to file
			response.pipe(file);

			file.on('finish', () => {
				file.close();
				resolve(destination);
			});

			file.on('error', (error) => {
				fs.unlink(destination, () => {
				}); // Delete incomplete file
				reject(error);
			});
		});
	});
}

// Usage
downloadFile(
	'https://example.com/large-file.zip',
	'./downloads/file.zip'
)
	.then(path => console.log('Downloaded to:', path))
	.catch(error => console.error('Download failed:', error));
```

### 2.2 Using Fetch API (Node.js 18+)

```javascript
// Node.js 18+ has built-in fetch API (like browsers)

// Basic GET request
// ─────────────────

async function fetchUser(id) {
	const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.statusCode}`);
	}

	const user = await response.json();
	return user;
}

fetchUser(1)
	.then(user => console.log(user))
	.catch(error => console.error(error));

// POST request
// ────────────

async function createPost(data) {
	const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	return await response.json();
}

createPost({
	title: 'New Post',
	body: 'Content here',
	userId: 1
})
	.then(post => console.log('Created:', post));

// Request with authentication
// ───────────────────────────

async function authenticatedRequest(url, token) {
	const response = await fetch(url, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});

	return await response.json();
}

// Request with timeout
// ────────────────────

async function fetchWithTimeout(url, timeout = 5000) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			signal: controller.signal
		});

		clearTimeout(timeoutId);
		return await response.json();
	} catch (error) {
		if (error.name === 'AbortError') {
			throw new Error('Request timeout');
		}
		throw error;
	}
}

// Parallel requests
// ─────────────────

async function fetchMultipleUsers(ids) {
	const promises = ids.map(id =>
		fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
			.then(res => res.json())
	);

	return await Promise.all(promises);
}

fetchMultipleUsers([1, 2, 3, 4, 5])
	.then(users => console.log('All users:', users));

// Handling different response types
// ──────────────────────────────────

async function fetchData(url) {
	const response = await fetch(url);
	const contentType = response.headers.get('content-type');

	if (contentType?.includes('application/json')) {
		return await response.json();
	} else if (contentType?.includes('text/')) {
		return await response.text();
	} else {
		return await response.blob();
	}
}

// Streaming response
// ──────────────────

async function streamResponse(url) {
	const response = await fetch(url);
	const reader = response.body.getReader();

	while (true) {
		const { done, value } = await reader.read();

		if (done) break;

		console.log('Received chunk:', value.length, 'bytes');
		// Process chunk
	}
}
```

### 2.3 Using Third-Party Libraries

```javascript
// Axios - Popular HTTP client
// ──────────────────────────

const axios = require('axios');

// GET request
axios.get('https://jsonplaceholder.typicode.com/users/1')
	.then(response => {
		console.log(response.data);
		console.log(response.status);
		console.log(response.headers);
	})
	.catch(error => {
		console.error('Error:', error.message);
	});

// POST request
axios.post('https://jsonplaceholder.typicode.com/posts', {
	title: 'New Post',
	body: 'Content',
	userId: 1
})
	.then(response => {
		console.log('Created:', response.data);
	});

// With config
axios({
	method: 'get',
	url: 'https://api.example.com/data',
	headers: {
		'Authorization': 'Bearer token123'
	},
	params: {
		id: 123,
		filter: 'active'
	},
	timeout: 5000
})
	.then(response => console.log(response.data));

// Interceptors
axios.interceptors.request.use(
	config => {
		// Add auth token to all requests
		config.headers.Authorization = `Bearer ${getToken()}`;
		console.log('Request:', config.method.toUpperCase(), config.url);
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	response => {
		console.log('Response:', response.status);
		return response;
	},
	error => {
		if (error.response?.status === 401) {
			// Handle unauthorized
			console.log('Unauthorized - refreshing token');
		}
		return Promise.reject(error);
	}
);

// Create instance with defaults
const api = axios.create({
	baseURL: 'https://api.example.com',
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json'
	}
});

api.get('/users/1').then(response => console.log(response.data));

// got - Another popular HTTP library
// ──────────────────────────────────

const got = require('got');

// GET request
const response = await got('https://jsonplaceholder.typicode.com/users/1').json();
console.log(response);

// POST request
const created = await got.post('https://jsonplaceholder.typicode.com/posts', {
	json: {
		title: 'New Post',
		body: 'Content',
		userId: 1
	}
}).json();

// With retry
await got('https://api.example.com/data', {
	retry: {
		limit: 3,
		methods: ['GET', 'POST'],
		statusCodes: [408, 413, 429, 500, 502, 503, 504]
	}
});

// Stream
const stream = got.stream('https://example.com/large-file.zip');
stream.pipe(fs.createWriteStream('file.zip'));

// node-fetch - Fetch API for older Node.js
// ─────────────────────────────────────────

const fetch = require('node-fetch');

const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

---

## 3. HTTPS and SSL/TLS

### 3.1 Creating HTTPS Servers

```javascript
const https = require('https');
const fs = require('fs');

// Create HTTPS server with self-signed certificate
// ────────────────────────────────────────────────

// Generate self-signed certificate (for development):
// openssl req -nodes -new -x509 -keyout server.key -out server.cert

const options = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.cert')
};

const server = https.createServer(options, (req, res) => {
	res.writeHead(200);
	res.end('Secure connection\n');
});

server.listen(443, () => {
	console.log('HTTPS server running on port 443');
});

// With Let's Encrypt certificate (production)
// ───────────────────────────────────────────

const productionOptions = {
	key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem')
};

const productionServer = https.createServer(productionOptions, (req, res) => {
	res.end('Production HTTPS server');
});

productionServer.listen(443);

// Redirect HTTP to HTTPS
// ──────────────────────

const http = require('http');

http.createServer((req, res) => {
	res.writeHead(301, {
		'Location': `https://${req.headers.host}${req.url}`
	});
	res.end();
}).listen(80);

// Client certificate authentication
// ─────────────────────────────────

const mutualTLSOptions = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.cert'),
	ca: fs.readFileSync('ca.cert'), // Certificate Authority
	requestCert: true,
	rejectUnauthorized: true
};

const mutualTLSServer = https.createServer(mutualTLSOptions, (req, res) => {
	const cert = req.socket.getPeerCertificate();

	if (req.client.authorized) {
		res.writeHead(200);
		res.end(`Hello ${cert.subject.CN}\n`);
	} else {
		res.writeHead(401);
		res.end('Invalid certificate\n');
	}
});

mutualTLSServer.listen(8443);
```

### 3.2 Making HTTPS Requests

```javascript
const https = require('https');

// Basic HTTPS request
// ───────────────────

https.get('https://api.example.com/data', (res) => {
	let data = '';

	res.on('data', chunk => {
		data += chunk;
	});

	res.on('end', () => {
		console.log(JSON.parse(data));
	});
});

// Ignore SSL certificate errors (development only!)
// ─────────────────────────────────────────────────

const options = {
	hostname: 'self-signed.badssl.com',
	port: 443,
	path: '/',
	method: 'GET',
	rejectUnauthorized: false // ⚠️ DANGEROUS! Only for development
};

https.request(options, (res) => {
	console.log('Connected despite invalid certificate');
}).end();

// Custom CA certificate
// ─────────────────────

const customCA = {
	hostname: 'example.com',
	port: 443,
	path: '/',
	method: 'GET',
	ca: fs.readFileSync('custom-ca.pem')
};

https.request(customCA, (res) => {
	console.log('Connected with custom CA');
}).end();

// Client certificate authentication
// ─────────────────────────────────

const clientCertOptions = {
	hostname: 'secure-api.example.com',
	port: 443,
	path: '/api/data',
	method: 'GET',
	key: fs.readFileSync('client-key.pem'),
	cert: fs.readFileSync('client-cert.pem'),
	ca: fs.readFileSync('ca-cert.pem')
};

https.request(clientCertOptions, (res) => {
	console.log('Authenticated with client certificate');
}).end();
```

---

## 4. WebSockets

### 4.1 WebSocket Fundamentals

```javascript
/*
WebSockets
──────────

WebSocket is a protocol for full-duplex communication over TCP.
Unlike HTTP (request-response), WebSockets maintain a persistent connection.

HTTP (Request-Response):
Client  ──Request──►  Server
Client  ◄─Response──  Server
Client  ──Request──►  Server
Client  ◄─Response──  Server

WebSocket (Bidirectional):
Client  ◄──────────►  Server
        (persistent connection)

Use cases:
- Real-time chat
- Live notifications
- Collaborative editing
- Gaming
- Live data feeds (stock prices, sports scores)
*/

// Using 'ws' library (most popular)
const WebSocket = require('ws');

// Create WebSocket server
// ───────────────────────

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
	console.log('Client connected from:', req.socket.remoteAddress);

	// Send message to client
	ws.send('Welcome to WebSocket server!');

	// Receive messages from client
	ws.on('message', (message) => {
		console.log('Received:', message.toString());

		// Echo back
		ws.send(`Echo: ${message}`);
	});

	// Handle errors
	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});

	// Handle disconnection
	ws.on('close', (code, reason) => {
		console.log('Client disconnected:', code, reason.toString());
	});
});

console.log('WebSocket server running on ws://localhost:8080');

// WebSocket client
// ────────────────

const client = new WebSocket('ws://localhost:8080');

client.on('open', () => {
	console.log('Connected to server');
	client.send('Hello Server!');
});

client.on('message', (data) => {
	console.log('Received:', data.toString());
});

client.on('close', () => {
	console.log('Disconnected from server');
});

client.on('error', (error) => {
	console.error('Error:', error);
});
```

### 4.2 Building Real-Time Applications

```javascript
// Chat Server Example
// ───────────────────

const WebSocket = require('ws');

class ChatServer {
	constructor(port) {
		this.wss = new WebSocket.Server({ port });
		this.clients = new Map(); // clientId -> { ws, username, room }

		this.wss.on('connection', (ws, req) => {
			this.handleConnection(ws, req);
		});

		console.log(`Chat server running on ws://localhost:${port}`);
	}

	handleConnection(ws, req) {
		const clientId = this.generateId();

		// Store client
		this.clients.set(clientId, {
			ws,
			username: null,
			room: 'lobby'
		});

		console.log(`Client ${clientId} connected`);

		// Handle messages
		ws.on('message', (data) => {
			try {
				const message = JSON.parse(data);
				this.handleMessage(clientId, message);
			} catch (error) {
				console.error('Invalid message:', error);
			}
		});

		// Handle disconnect
		ws.on('close', () => {
			console.log(`Client ${clientId} disconnected`);
			this.clients.delete(clientId);
			this.broadcastUserList();
		});

		ws.on('error', (error) => {
			console.error(`Client ${clientId} error:`, error);
		});
	}

	handleMessage(clientId, message) {
		const client = this.clients.get(clientId);

		switch (message.type) {
			case 'join':
				client.username = message.username;
				this.broadcast({
					type: 'user-joined',
					username: message.username,
					timestamp: Date.now()
				}, client.room);
				this.broadcastUserList();
				break;

			case 'message':
				this.broadcast({
					type: 'message',
					username: client.username,
					text: message.text,
					timestamp: Date.now()
				}, client.room);
				break;

			case 'join-room':
				const oldRoom = client.room;
				client.room = message.room;

				this.broadcast({
					type: 'user-left',
					username: client.username
				}, oldRoom);

				this.broadcast({
					type: 'user-joined',
					username: client.username
				}, client.room);

				this.broadcastUserList();
				break;

			case 'typing':
				this.broadcast({
					type: 'typing',
					username: client.username,
					isTyping: message.isTyping
				}, client.room, clientId);
				break;
		}
	}

	broadcast(message, room, excludeId = null) {
		const messageStr = JSON.stringify(message);

		for (const [id, client] of this.clients) {
			if (id !== excludeId && client.room === room && client.ws.readyState === WebSocket.OPEN) {
				client.ws.send(messageStr);
			}
		}
	}

	broadcastUserList() {
		const usersByRoom = {};

		for (const client of this.clients.values()) {
			if (!usersByRoom[client.room]) {
				usersByRoom[client.room] = [];
			}
			if (client.username) {
				usersByRoom[client.room].push(client.username);
			}
		}

		for (const [id, client] of this.clients) {
			if (client.ws.readyState === WebSocket.OPEN) {
				client.ws.send(JSON.stringify({
					type: 'user-list',
					users: usersByRoom[client.room] || []
				}));
			}
		}
	}

	generateId() {
		return Math.random().toString(36).substring(2, 15);
	}
}

// Start chat server
const chatServer = new ChatServer(8080);

// Live Data Feed Example
// ──────────────────────

class LiveDataServer {
	constructor(port) {
		this.wss = new WebSocket.Server({ port });
		this.subscribers = new Map(); // topic -> Set of ws connections

		this.wss.on('connection', (ws) => {
			ws.on('message', (data) => {
				const message = JSON.parse(data);

				if (message.type === 'subscribe') {
					this.subscribe(ws, message.topic);
				} else if (message.type === 'unsubscribe') {
					this.unsubscribe(ws, message.topic);
				}
			});

			ws.on('close', () => {
				this.unsubscribeAll(ws);
			});
		});

		// Simulate live data updates
		this.startDataFeed();

		console.log(`Live data server running on ws://localhost:${port}`);
	}

	subscribe(ws, topic) {
		if (!this.subscribers.has(topic)) {
			this.subscribers.set(topic, new Set());
		}

		this.subscribers.get(topic).add(ws);
		console.log(`Client subscribed to ${topic}`);
	}

	unsubscribe(ws, topic) {
		if (this.subscribers.has(topic)) {
			this.subscribers.get(topic).delete(ws);
		}
	}

	unsubscribeAll(ws) {
		for (const subscribers of this.subscribers.values()) {
			subscribers.delete(ws);
		}
	}

	publish(topic, data) {
		if (!this.subscribers.has(topic)) return;

		const message = JSON.stringify({
			topic,
			data,
			timestamp: Date.now()
		});

		for (const ws of this.subscribers.get(topic)) {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(message);
			}
		}
	}

	startDataFeed() {
		// Simulate stock prices
		setInterval(() => {
			const stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];

			stocks.forEach(symbol => {
				const price = (Math.random() * 1000).toFixed(2);
				const change = (Math.random() * 10 - 5).toFixed(2);

				this.publish(`stock:${symbol}`, {
					symbol,
					price: parseFloat(price),
					change: parseFloat(change)
				});
			});
		}, 1000);

		// Simulate cryptocurrency prices
		setInterval(() => {
			const cryptos = ['BTC', 'ETH', 'SOL'];

			cryptos.forEach(symbol => {
				const price = (Math.random() * 50000).toFixed(2);

				this.publish(`crypto:${symbol}`, {
					symbol,
					price: parseFloat(price)
				});
			});
		}, 2000);
	}
}

// Start live data server
const liveDataServer = new LiveDataServer(8081);
```

### 4.3 WebSocket with HTTP Server

```javascript
// Combining HTTP and WebSocket servers
// ────────────────────────────────────

const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

// Create HTTP server
const server = http.createServer((req, res) => {
	if (req.url === '/') {
		// Serve HTML client
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(fs.readFileSync('./client.html'));
	} else {
		res.writeHead(404);
		res.end('Not Found');
	}
});

// Create WebSocket server on same HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
	console.log('WebSocket client connected');

	ws.on('message', (message) => {
		console.log('Received:', message.toString());
		ws.send(`Echo: ${message}`);
	});
});

server.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
	console.log('WebSocket available on ws://localhost:3000');
});

// With path-based routing
// ───────────────────────

const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
	const pathname = new URL(request.url, 'ws://localhost').pathname;

	if (pathname === '/chat') {
		wss1.handleUpgrade(request, socket, head, (ws) => {
			wss1.emit('connection', ws, request);
		});
	} else if (pathname === '/data') {
		wss2.handleUpgrade(request, socket, head, (ws) => {
			wss2.emit('connection', ws, request);
		});
	} else {
		socket.destroy();
	}
});

wss1.on('connection', (ws) => {
	console.log('Chat WebSocket connected');
});

wss2.on('connection', (ws) => {
	console.log('Data WebSocket connected');
});
```

### 4.4 Advanced WebSocket Patterns

```javascript
// Heartbeat/Ping-Pong (keep connection alive)
// ───────────────────────────────────────────

const wss = new WebSocket.Server({ port: 8080 });

function heartbeat() {
	this.isAlive = true;
}

wss.on('connection', (ws) => {
	ws.isAlive = true;
	ws.on('pong', heartbeat);

	ws.on('message', (message) => {
		console.log('Received:', message.toString());
	});
});

// Check for dead connections every 30 seconds
const interval = setInterval(() => {
	wss.clients.forEach((ws) => {
		if (ws.isAlive === false) {
			console.log('Terminating dead connection');
			return ws.terminate();
		}

		ws.isAlive = false;
		ws.ping(); // Send ping
	});
}, 30000);

wss.on('close', () => {
	clearInterval(interval);
});

// Authentication and Authorization
// ─────────────────────────────────

const jwt = require('jsonwebtoken');

const authenticatedWss = new WebSocket.Server({
	noServer: true
});

server.on('upgrade', (request, socket, head) => {
	// Extract token from query string or header
	const url = new URL(request.url, 'ws://localhost');
	const token = url.searchParams.get('token');

	try {
		// Verify JWT token
		const decoded = jwt.verify(token, 'secret-key');

		authenticatedWss.handleUpgrade(request, socket, head, (ws) => {
			ws.userId = decoded.userId;
			ws.username = decoded.username;
			authenticatedWss.emit('connection', ws, request);
		});
	} catch (error) {
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
		socket.destroy();
	}
});

authenticatedWss.on('connection', (ws) => {
	console.log(`User ${ws.username} authenticated`);

	ws.send(JSON.stringify({
		type: 'authenticated',
		username: ws.username
	}));
});

// Rate Limiting
// ─────────────

class RateLimiter {
	constructor(maxRequests, windowMs) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
		this.requests = new Map();
	}

	check(clientId) {
		const now = Date.now();
		const clientRequests = this.requests.get(clientId) || [];

		// Remove old requests
		const recentRequests = clientRequests.filter(
			time => now - time < this.windowMs
		);

		if (recentRequests.length >= this.maxRequests) {
			return false; // Rate limit exceeded
		}

		recentRequests.push(now);
		this.requests.set(clientId, recentRequests);
		return true;
	}
}

const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

const rateLimitedWss = new WebSocket.Server({ port: 8082 });

rateLimitedWss.on('connection', (ws, req) => {
	const clientId = req.socket.remoteAddress;

	ws.on('message', (message) => {
		if (!rateLimiter.check(clientId)) {
			ws.send(JSON.stringify({
				type: 'error',
				message: 'Rate limit exceeded'
			}));
			return;
		}

		// Process message
		console.log('Message:', message.toString());
	});
});

// Binary data transfer
// ────────────────────

const binaryWss = new WebSocket.Server({ port: 8083 });

binaryWss.on('connection', (ws) => {
	// Send binary data
	const buffer = Buffer.from([1, 2, 3, 4, 5]);
	ws.send(buffer);

	ws.on('message', (message, isBinary) => {
		if (isBinary) {
			console.log('Received binary:', message);
			// Process binary data
		} else {
			console.log('Received text:', message.toString());
		}
	});
});

// Broadcast optimization
// ──────────────────────

class BroadcastServer {
	constructor(port) {
		this.wss = new WebSocket.Server({ port });
		this.rooms = new Map(); // roomId -> Set of ws

		this.wss.on('connection', (ws) => {
			ws.on('message', (data) => {
				const message = JSON.parse(data);

				if (message.type === 'join-room') {
					this.joinRoom(ws, message.roomId);
				} else if (message.type === 'broadcast') {
					this.broadcast(ws.roomId, message.data);
				}
			});
		});
	}

	joinRoom(ws, roomId) {
		if (!this.rooms.has(roomId)) {
			this.rooms.set(roomId, new Set());
		}

		this.rooms.get(roomId).add(ws);
		ws.roomId = roomId;
	}

	broadcast(roomId, data) {
		if (!this.rooms.has(roomId)) return;

		const message = JSON.stringify(data);
		const room = this.rooms.get(roomId);

		// Pre-encode message once
		const preparedMessage = WebSocket.Sender.frame(
			Buffer.from(message),
			{ opcode: 1, readOnly: true, fin: true }
		);

		// Send to all clients in room
		for (const client of room) {
			if (client.readyState === WebSocket.OPEN) {
				client._sender.send(preparedMessage);
			}
		}
	}
}
```

This covers HTTP and Networking comprehensively! Would you like me to continue with:

1. **Express.js Framework** (routing, middleware, REST APIs, validation)
2. **Database Integration** (MongoDB, PostgreSQL, Redis, ORMs)
3. **Authentication & Security** (JWT, OAuth, bcrypt, security best practices)
4. **Testing** (Jest, Mocha, Supertest, integration tests)
5. **Performance & Production** (clustering, caching, monitoring, deployment)

