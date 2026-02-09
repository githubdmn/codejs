# Mastering Node.js In Depth - Complete Roadmap

I'll create a comprehensive, structured learning path to master Node.js from fundamentals to advanced concepts.

---

## Part 1: Core Foundations

### 1.1 Understanding Node.js Runtime

**What is Node.js?**
```javascript
// Node.js is NOT a language - it's a runtime environment
// Built on Chrome's V8 JavaScript engine
// Enables JavaScript to run outside the browser

// Key characteristics:
// 1. Single-threaded event loop
// 2. Non-blocking I/O
// 3. Asynchronous by default
// 4. Built-in modules for server-side operations
```

**The V8 Engine:**
```javascript
// V8 compiles JavaScript to native machine code
// Just-In-Time (JIT) compilation
// Memory management with garbage collection
// Optimizes hot code paths

// Understanding V8 helps you write performant code:
// - Avoid dynamic object shape changes
// - Use consistent types
// - Minimize property additions after creation

// Example: V8-optimized code
class Point {
    constructor(x, y) {
        this.x = x;  // Define all properties in constructor
        this.y = y;
    }
}

// Not optimized (shape changes)
const point = {};
point.x = 10;  // Shape change
point.y = 20;  // Another shape change
```

**Event Loop Architecture:**
```javascript
// The Node.js event loop has 6 phases:

/*
   ┌───────────────────────────┐
┌─>│           timers          │ - setTimeout/setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ - I/O callbacks deferred to next iteration
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ - Internal use only
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │ - setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ - socket.on('close', ...)
   └───────────────────────────┘
*/

// Understanding execution order:
console.log('1: Synchronous');

setTimeout(() => console.log('2: Timer'), 0);

setImmediate(() => console.log('3: Immediate'));

process.nextTick(() => console.log('4: nextTick'));

Promise.resolve().then(() => console.log('5: Promise'));

console.log('6: Synchronous');

// Output order:
// 1: Synchronous
// 6: Synchronous
// 4: nextTick (microtask queue - highest priority)
// 5: Promise (microtask queue)
// 2: Timer
// 3: Immediate
```

**Process Object:**
```javascript
// The global 'process' object provides info about Node.js process

// Environment variables
console.log(process.env.NODE_ENV); // 'development' or 'production'
console.log(process.env.PATH);

// Process info
console.log(process.pid);        // Process ID
console.log(process.platform);   // 'linux', 'darwin', 'win32'
console.log(process.arch);       // 'x64', 'arm'
console.log(process.version);    // Node.js version
console.log(process.cwd());      // Current working directory
console.log(process.uptime());   // Process uptime in seconds

// Memory usage
console.log(process.memoryUsage());
// {
//   rss: 30000000,        // Resident Set Size
//   heapTotal: 7000000,   // Total heap size
//   heapUsed: 4000000,    // Used heap size
//   external: 1000000     // C++ objects bound to JS
// }

// Command line arguments
// node app.js arg1 arg2
console.log(process.argv);
// ['/usr/local/bin/node', '/path/to/app.js', 'arg1', 'arg2']

// Exit codes
process.exit(0);  // Success
process.exit(1);  // Failure

// Handle uncaught exceptions (last resort - should not rely on this)
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

### 1.2 Module System

**CommonJS Modules (Node.js default):**
```javascript
// math.js - Exporting
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

const PI = 3.14159;

// Method 1: Attach to exports
exports.add = add;
exports.PI = PI;

// Method 2: Replace entire exports object
module.exports = {
    add,
    subtract,
    PI
};

// Method 3: Export single function/class
module.exports = class Calculator {
    add(a, b) { return a + b; }
    subtract(a, b) { return a - b; }
};

// app.js - Importing
const math = require('./math');
console.log(math.add(2, 3));

// Destructuring import
const { add, subtract } = require('./math');

// Import single export
const Calculator = require('./math');
const calc = new Calculator();
```

**How `require()` Works:**
```javascript
// Simplified implementation of require()
function require(modulePath) {
    // 1. Resolve: Find the absolute path
    const absolutePath = Module._resolveFilename(modulePath);
    
    // 2. Check cache: Return cached module if exists
    if (Module._cache[absolutePath]) {
        return Module._cache[absolutePath].exports;
    }
    
    // 3. Create new module
    const module = new Module(absolutePath);
    Module._cache[absolutePath] = module;
    
    // 4. Load: Read file and wrap in function
    const moduleWrapper = 
        '(function(exports, require, module, __filename, __dirname) {' +
        fs.readFileSync(absolutePath, 'utf8') +
        '})';
    
    // 5. Compile and execute
    const compiledWrapper = vm.runInThisContext(moduleWrapper);
    compiledWrapper.call(
        module.exports,
        module.exports,
        require,
        module,
        absolutePath,
        path.dirname(absolutePath)
    );
    
    // 6. Return exports
    return module.exports;
}

// Module caching example
// counter.js
let count = 0;
module.exports = {
    increment() { count++; },
    getCount() { return count; }
};

// app.js
const counter1 = require('./counter');
const counter2 = require('./counter');

counter1.increment();
console.log(counter2.getCount()); // 1 (same instance!)

// To get different instances, export a factory function:
// counter.js
module.exports = function createCounter() {
    let count = 0;
    return {
        increment() { count++; },
        getCount() { return count; }
    };
};

// app.js
const createCounter = require('./counter');
const counter1 = createCounter();
const counter2 = createCounter();
counter1.increment();
console.log(counter2.getCount()); // 0 (different instances)
```

**ES Modules (ESM) in Node.js:**
```javascript
// package.json - Enable ES modules
{
    "type": "module"
}

// math.mjs - Named exports
export function add(a, b) {
    return a + b;
}

export const PI = 3.14159;

// Default export
export default class Calculator {
    add(a, b) { return a + b; }
}

// app.mjs - Importing
import Calculator from './math.mjs';
import { add, PI } from './math.mjs';
import * as math from './math.mjs';

// Dynamic imports (returns a promise)
const math = await import('./math.mjs');

// Top-level await (ES modules only)
const response = await fetch('https://api.example.com');
const data = await response.json();

// Import CommonJS from ESM
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const oldModule = require('./old-commonjs-module');

// ESM special variables
console.log(import.meta.url);  // file:///path/to/file.mjs
```

**Module Resolution Algorithm:**
```javascript
// require('./module') resolution order:

// 1. Core modules (built-in)
require('fs');        // Always resolves to built-in fs module
require('path');      // Always resolves to built-in path module

// 2. File modules (relative/absolute paths)
require('./module');   // Tries in order:
//   - ./module.js
//   - ./module.json
//   - ./module.node (compiled addon)

require('./module/'); // Tries:
//   - ./module/package.json (main field)
//   - ./module/index.js
//   - ./module/index.json
//   - ./module/index.node

// 3. node_modules lookup (non-relative)
require('express');   // Searches up directory tree:
//   - ./node_modules/express
//   - ../node_modules/express
//   - ../../node_modules/express
//   - ... up to root

// Understanding package.json main field
{
    "name": "my-package",
    "main": "./lib/index.js",  // Entry point
    "exports": {               // Modern exports map
        ".": "./lib/index.js",
        "./utils": "./lib/utils.js"
    }
}
```

### 1.3 Built-in Core Modules

**File System (fs):**
```javascript
const fs = require('fs');
const fsPromises = require('fs').promises;  // Promise-based API

// Synchronous (blocking - avoid in production!)
const data = fs.readFileSync('file.txt', 'utf8');
console.log(data);

// Asynchronous callback-based
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});

// Promise-based (modern approach)
async function readFileAsync() {
    try {
        const data = await fsPromises.readFile('file.txt', 'utf8');
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// Writing files
await fsPromises.writeFile('output.txt', 'Hello World');

// Append to file
await fsPromises.appendFile('log.txt', 'New log entry\n');

// File stats
const stats = await fsPromises.stat('file.txt');
console.log(stats.size);        // File size in bytes
console.log(stats.isFile());    // true
console.log(stats.isDirectory()); // false
console.log(stats.mtime);       // Last modified time

// Directory operations
await fsPromises.mkdir('new-directory', { recursive: true });
const files = await fsPromises.readdir('directory');
await fsPromises.rmdir('directory', { recursive: true });

// Watch for file changes
fs.watch('file.txt', (eventType, filename) => {
    console.log(`${filename} was ${eventType}`);
});

// Streams for large files (memory efficient)
const readStream = fs.createReadStream('large-file.txt', {
    encoding: 'utf8',
    highWaterMark: 64 * 1024  // 64KB chunks
});

readStream.on('data', (chunk) => {
    console.log('Received chunk:', chunk.length);
});

readStream.on('end', () => {
    console.log('File read complete');
});

// Copy file using streams
const writeStream = fs.createWriteStream('copy.txt');
readStream.pipe(writeStream);
```

**Path Module:**
```javascript
const path = require('path');

// Join path segments
const filePath = path.join('/users', 'john', 'documents', 'file.txt');
// '/users/john/documents/file.txt' (Unix)
// '\users\john\documents\file.txt' (Windows)

// Resolve to absolute path
const absolutePath = path.resolve('folder', 'file.txt');
// '/current/working/directory/folder/file.txt'

// Parse path
const parsed = path.parse('/users/john/file.txt');
// {
//   root: '/',
//   dir: '/users/john',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Useful path operations
path.basename('/users/john/file.txt');     // 'file.txt'
path.dirname('/users/john/file.txt');      // '/users/john'
path.extname('/users/john/file.txt');      // '.txt'

// Normalize path (resolve .. and .)
path.normalize('/users/john/../jane/./file.txt');
// '/users/jane/file.txt'

// Check if path is absolute
path.isAbsolute('/users/john');  // true
path.isAbsolute('users/john');   // false

// Relative path between two absolute paths
path.relative('/users/john', '/users/jane');  // '../jane'

// Platform-specific separator
console.log(path.sep);  // '/' on Unix, '\' on Windows
```

**HTTP Module:**
```javascript
const http = require('http');

// Create basic server
const server = http.createServer((req, res) => {
    // req: IncomingMessage (readable stream)
    // res: ServerResponse (writable stream)
    
    console.log(`${req.method} ${req.url}`);
    console.log(req.headers);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    
    // Send response
    res.end('Hello World\n');
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

// Handle different routes
const server2 = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Home Page</h1>');
    } else if (req.url === '/api/users' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([{ id: 1, name: 'John' }]));
    } else if (req.url === '/api/users' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const user = JSON.parse(body);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: 2, ...user }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Making HTTP requests
const options = {
    hostname: 'api.example.com',
    port: 443,
    path: '/users',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', chunk => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(JSON.parse(data));
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
```

**Events Module:**
```javascript
const EventEmitter = require('events');

// Create custom event emitter
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// Register listener
myEmitter.on('event', (arg1, arg2) => {
    console.log('Event occurred:', arg1, arg2);
});

// Emit event
myEmitter.emit('event', 'value1', 'value2');

// One-time listener
myEmitter.once('once-event', () => {
    console.log('This runs only once');
});

// Remove listener
const listener = () => console.log('Listener');
myEmitter.on('remove-test', listener);
myEmitter.removeListener('remove-test', listener);

// Error handling
myEmitter.on('error', (error) => {
    console.error('Error occurred:', error);
});

myEmitter.emit('error', new Error('Something went wrong'));

// Practical example: Custom Logger
class Logger extends EventEmitter {
    log(message) {
        this.emit('log', { message, timestamp: new Date() });
    }
    
    error(message) {
        this.emit('error', { message, timestamp: new Date() });
    }
}

const logger = new Logger();

logger.on('log', (data) => {
    console.log(`[${data.timestamp.toISOString()}] LOG: ${data.message}`);
});

logger.on('error', (data) => {
    console.error(`[${data.timestamp.toISOString()}] ERROR: ${data.message}`);
});

logger.log('Application started');
logger.error('Database connection failed');
```

Let me continue with more advanced Node.js concepts. Would you like me to proceed with:

1. **Streams and Buffers** (deep dive)
2. **Async Patterns** (callbacks, promises, async/await)
3. **Express.js Framework** (routing, middleware, REST APIs)
4. **Database Integration** (MongoDB, PostgreSQL, Redis)
5. **Authentication & Security**
6. **Testing** (Jest, Mocha, Supertest)
7. **Performance & Scaling**
8. **Deployment & Production**

