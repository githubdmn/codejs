# Node.js Runtime - Deep Dive

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Application                      │
│                     (JavaScript Code)                       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                      Node.js Bindings                       │
│         (C++ layer that connects JS to C++ APIs)            │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│   V8 Engine   │    │   libuv      │    │  C++ Addons  │
│  (JS Runtime) │    │ (Event Loop, │    │   (Native    │
│               │    │  Async I/O)  │    │   Modules)   │
└───────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────┴─────────┐
                    │  Operating System│
                    │   (Linux/Mac/Win)│
                    └──────────────────┘
```

### 1.2 Key Components Explained

**V8 JavaScript Engine:**

- Open-source JavaScript engine written in C++
- Developed by Google for Chrome
- Compiles JavaScript to native machine code
- Handles memory management (garbage collection)
- Provides the JavaScript runtime environment

**libuv:**

- Cross-platform C library for asynchronous I/O
- Provides the event loop
- Handles file system operations, networking, timers
- Thread pool for operations that can't be done asynchronously
- Works on Windows, macOS, Linux

**Node.js Bindings:**

- C++ layer that bridges JavaScript and C++
- Exposes libuv and other C++ APIs to JavaScript
- Implements Node.js core modules (fs, http, crypto, etc.)

---

## 2. The V8 Engine in Detail

### 2.1 How V8 Executes JavaScript

```javascript
// JavaScript code goes through several stages in V8:

// 1. PARSING
// ──────────
// Source code → Abstract Syntax Tree (AST)

const add = (a, b) => a + b;

// V8 parses this into an AST structure:
/*
FunctionExpression
  ├── Parameters: [a, b]
  └── Body: BinaryExpression
      ├── Left: Identifier(a)
      ├── Operator: +
      └── Right: Identifier(b)
*/

// 2. IGNITION (Interpreter)
// ──────────────────────────
// AST → Bytecode
// V8's interpreter generates bytecode from the AST
// Bytecode is executed immediately

// Example bytecode (simplified):
/*
LdaNamedProperty a1, [0]  // Load 'a' from argument 1
Star r0                    // Store in register 0
LdaNamedProperty a2, [0]  // Load 'b' from argument 2
Add r0, [1]               // Add register 0 to current accumulator
Return                     // Return result
*/

// 3. TURBOFAN (Optimizing Compiler)
// ──────────────────────────────────
// Hot code → Optimized machine code
// If function is called many times, TurboFan compiles it to native code

// Performance example:
function hotFunction(x) {
	return x * 2;
}

// First few calls: Interpreted by Ignition
for (let i = 0; i < 10; i++) {
	hotFunction(i);
}

// After many calls: TurboFan optimizes it
for (let i = 0; i < 100000; i++) {
	hotFunction(i);  // Now runs as native machine code
}

// 4. DEOPTIMIZATION
// ─────────────────
// If assumptions break, V8 deoptimizes back to bytecode

function maybeOptimize(x) {
	return x + 1;
}

// V8 assumes x is always a number
for (let i = 0; i < 100000; i++) {
	maybeOptimize(i);  // Optimized for numbers
}

// Breaking the assumption
maybeOptimize("string");  // DEOPTIMIZATION! Falls back to interpreter
```

### 2.2 V8 Memory Management

```javascript
// V8 divides memory into spaces:

/*
┌─────────────────────────────────────────────────────────┐
│                     V8 HEAP                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  NEW SPACE (Young Generation) - 1-8 MB                  │
│  ├── Semi-space 1 (From)                                │
│  └── Semi-space 2 (To)                                  │
│  • Short-lived objects                                  │
│  • Fast allocation (bump pointer)                       │
│  • Scavenge GC (Minor GC)                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  OLD SPACE (Old Generation)                             │
│  • Long-lived objects promoted from New Space           │
│  • Mark-Sweep-Compact GC (Major GC)                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LARGE OBJECT SPACE                                     │
│  • Objects larger than 1MB                              │
│  • Never moved                                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CODE SPACE                                             │
│  • Compiled code (JIT)                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
*/

// Garbage Collection in Action

// SCAVENGE (Minor GC) - Fast, frequent
// ────────────────────────────────────
function createShortLived() {
	const temp = { data: 'temporary' };  // Allocated in New Space
	return temp.data;
}

for (let i = 0; i < 1000; i++) {
	createShortLived();  // Objects quickly garbage collected
}

// MARK-SWEEP-COMPACT (Major GC) - Slower, less frequent
// ──────────────────────────────────────────────────────
const globalCache = [];  // Lives in Old Space

function createLongLived() {
	const obj = { id: Date.now(), data: new Array(1000) };
	globalCache.push(obj);  // Promoted to Old Space
}

// Memory leak example (avoid this!)
const leakyCache = {};

function memorLeak(id) {
	leakyCache[id] = new Array(10000000);  // Never removed = memory leak
}

// Proper cache with cleanup
class LRUCache {
	constructor(maxSize) {
		this.maxSize = maxSize;
		this.cache = new Map();
	}

	set(key, value) {
		if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);  // Remove oldest
		}
		this.cache.set(key, value);
	}
}

// Monitor memory usage
setInterval(() => {
	const usage = process.memoryUsage();
	console.log({
		rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,       // Total memory
		heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
		heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
		external: `${Math.round(usage.external / 1024 / 1024)} MB`
	});
}, 5000);

// Force garbage collection (requires --expose-gc flag)
// node --expose-gc app.js
if (global.gc) {
	global.gc();
	console.log('Garbage collection triggered');
}
```

### 2.3 V8 Optimization Techniques

```javascript
// HIDDEN CLASSES (Object Shapes)
// ────────────────────────────────

// ✅ GOOD: Consistent object shape
class Point {
	constructor(x, y) {
		this.x = x;  // Hidden class with properties: x
		this.y = y;  // Hidden class with properties: x, y
	}
}

const points = [];
for (let i = 0; i < 1000; i++) {
	points.push(new Point(i, i * 2));  // All same hidden class!
}
// V8 can optimize property access

// ❌ BAD: Dynamic object shapes
const dynamicPoints = [];
for (let i = 0; i < 1000; i++) {
	const point = {};
	point.x = i;
	if (i % 2 === 0) {
		point.y = i * 2;     // Different shape!
		point.z = i * 3;     // Another different shape!
	}
	dynamicPoints.push(point);
}
// V8 cannot optimize - different hidden classes

// INLINE CACHING
// ──────────────

function getX(obj) {
	return obj.x;  // V8 caches the property location
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);

getX(p1);  // Cache: Point hidden class, x at offset 0
getX(p2);  // Cache hit! Fast access

// MONOMORPHIC vs POLYMORPHIC vs MEGAMORPHIC
// ─────────────────────────────────────────

// MONOMORPHIC (BEST) - One type
function processPoint(point) {
	return point.x + point.y;
}

const points1 = [new Point(1, 2), new Point(3, 4)];
points1.forEach(p => processPoint(p));  // Always Point type

// POLYMORPHIC (OK) - Few types (2-4)
class Point3D {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

const mixed = [new Point(1, 2), new Point3D(3, 4, 5)];
mixed.forEach(p => processPoint(p));  // Two types, still optimizable

// MEGAMORPHIC (BAD) - Many types (5+)
const veryMixed = [
	new Point(1, 2),
	new Point3D(3, 4, 5),
	{ x: 1, y: 2 },
	{ x: 1, y: 2, z: 3 },
	{ x: 1, y: 2, extra: true }
];
veryMixed.forEach(p => processPoint(p));  // Too many types, can't optimize

// ARRAY OPTIMIZATIONS
// ───────────────────

// ✅ GOOD: Consistent element types
const numbers = [1, 2, 3, 4, 5];  // PACKED_SMI_ELEMENTS (fastest)
numbers.push(6);

const doubles = [1.1, 2.2, 3.3];  // PACKED_DOUBLE_ELEMENTS
doubles.push(4.4);

// ❌ BAD: Mixed types
const mixedArray = [1, 2, 3];     // Starts as PACKED_SMI_ELEMENTS
mixedArray.push('string');        // Transitions to PACKED_ELEMENTS (slower)
mixedArray.push({});              // Still PACKED_ELEMENTS

// ❌ BAD: Sparse arrays (holes)
const sparse = [1, 2, 3];
sparse[1000] = 4;                 // Creates holes, becomes HOLEY
// Now V8 must check for holes on every access

// FUNCTION INLINING
// ─────────────────

// Small functions get inlined
function square(x) {
	return x * x;
}

function sumOfSquares(arr) {
	let sum = 0;
	for (let i = 0; i < arr.length; i++) {
		sum += square(arr[i]);  // square() gets inlined here
	}
	return sum;
}

// After optimization, effectively becomes:
function sumOfSquaresOptimized(arr) {
	let sum = 0;
	for (let i = 0; i < arr.length; i++) {
		sum += arr[i] * arr[i];  // Inlined!
	}
	return sum;
}
```

### 2.4 Writing V8-Friendly Code

```javascript
// BEST PRACTICES FOR V8 OPTIMIZATION

// 1. Initialize all object properties in constructor
// ───────────────────────────────────────────────────
class User {
	constructor(name, email) {
		this.name = name;
		this.email = email;
		this.age = null;      // Initialize even if null
		this.address = null;  // Better than adding later
	}
}

// 2. Avoid changing object shape after creation
// ──────────────────────────────────────────────
// ❌ BAD
const user = { name: 'John' };
user.email = 'john@example.com';  // Shape change
delete user.name;                 // Shape change (very bad!)

// ✅ GOOD
const user2 = {
	name: 'John',
	email: 'john@example.com'
};

// 3. Use consistent types
// ───────────────────────
// ❌ BAD
function add(a, b) {
	return a + b;
}

add(1, 2);        // Works with numbers
add('1', '2');    // Works with strings - type confusion!

// ✅ GOOD
function addNumbers(a, b) {
	// Type check or use TypeScript
	if (typeof a !== 'number' || typeof b !== 'number') {
		throw new TypeError('Arguments must be numbers');
	}
	return a + b;
}

// 4. Avoid arguments object (use rest parameters)
// ────────────────────────────────────────────────
// ❌ BAD - arguments prevents optimization
function oldWay() {
	const args = Array.prototype.slice.call(arguments);
	return args.reduce((a, b) => a + b, 0);
}

// ✅ GOOD - rest parameters are optimizable
function newWay(...args) {
	return args.reduce((a, b) => a + b, 0);
}

// 5. Avoid try-catch in hot functions
// ────────────────────────────────────
// ❌ BAD - try-catch prevents optimization
function processWithTryCatch(data) {
	try {
		return data.map(x => x * 2);
	} catch (e) {
		return [];
	}
}

// ✅ GOOD - Move try-catch outside hot path
function process(data) {
	return data.map(x => x * 2);
}

function safeProcess(data) {
	try {
		return process(data);
	} catch (e) {
		return [];
	}
}

// 6. Keep functions small and focused
// ────────────────────────────────────
// ✅ GOOD - Small functions can be inlined
function calculateTotal(items) {
	return items.reduce((sum, item) => sum + item.price, 0);
}

function applyDiscount(total, discountPercent) {
	return total * (1 - discountPercent / 100);
}

function calculateFinalPrice(items, discountPercent) {
	const total = calculateTotal(items);
	return applyDiscount(total, discountPercent);
}

// 7. Use TypedArrays for numeric data
// ────────────────────────────────────
// ✅ BETTER for large numeric datasets
const uint8 = new Uint8Array([1, 2, 3, 4, 5]);
const float64 = new Float64Array([1.1, 2.2, 3.3]);

// vs regular array
const regular = [1, 2, 3, 4, 5];

// TypedArrays are:
// - Faster for numeric operations
// - Fixed size (no dynamic growth)
// - Better memory layout
// - No type confusion

// 8. Avoid mixing numbers and holes in arrays
// ────────────────────────────────────────────
// ❌ BAD
const arr = new Array(1000);  // Creates holes
arr[0] = 1;
arr[999] = 2;

// ✅ GOOD
const arr2 = new Array(1000).fill(0);  // No holes
arr2[0] = 1;
arr2[999] = 2;
```

---

## 3. libuv and the Event Loop

### 3.1 libuv Architecture

```javascript
/*
libuv provides:
1. Event loop
2. Asynchronous I/O
3. Thread pool
4. Timers
5. File system operations
6. Networking (TCP, UDP, pipes)
7. Child processes
8. Signals

┌───────────────────────────┐
│      Event Loop (Main)    │
│      Single Thread        │
└───────┬───────────────────┘
        │
        ├─────────► Timers (setTimeout, setInterval)
        ├─────────► I/O Callbacks
        ├─────────► Idle, Prepare
        ├─────────► Poll (network I/O)
        ├─────────► Check (setImmediate)
        └─────────► Close Callbacks
        
        ▼
┌──────────────────────────────┐
│       Thread Pool            │
│    (4 threads by default)    │
│  UV_THREADPOOL_SIZE=4        │
└──────────────────────────────┘
        │
        ├─────────► File System Operations
        ├─────────► DNS Lookup (getaddrinfo)
        ├─────────► CPU-intensive crypto
        └─────────► Custom tasks (native addons)
*/

// Setting thread pool size (before any async operations)
process.env.UV_THREADPOOL_SIZE = 8;

const fs = require('fs');
const crypto = require('crypto');

// File operations use thread pool
fs.readFile('file.txt', (err, data) => {
	// Runs in thread pool, callback in event loop
	console.log('File read complete');
});

// Crypto operations use thread pool
crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', (err, key) => {
	// CPU-intensive work in thread pool
	console.log('Hashing complete');
});

// Network I/O does NOT use thread pool (uses OS async APIs)
const http = require('http');
http.get('http://example.com', (res) => {
	// No thread pool involved - fully async at OS level
	console.log('HTTP request complete');
});
```

### 3.2 Event Loop Phases in Detail

```javascript
/*
Event Loop Phases (in order):

   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  I/O callbacks deferred
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  Internal use
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  socket.on('close', ...)
   └───────────────────────────┘
   
Microtasks (run between phases):
- process.nextTick() - highest priority
- Promise callbacks
*/

// PHASE 1: TIMERS
// ───────────────
console.log('1. Start');

setTimeout(() => {
	console.log('4. Timeout 0ms');
}, 0);

setTimeout(() => {
	console.log('5. Timeout 100ms');
}, 100);

// PHASE 5: CHECK
// ──────────────
setImmediate(() => {
	console.log('6. Immediate');
});

// MICROTASKS (run after current operation, before next phase)
// ────────────────────────────────────────────────────────────
process.nextTick(() => {
	console.log('2. Next Tick');
});

Promise.resolve().then(() => {
	console.log('3. Promise');
});

console.log('7. End');

/*
Output order:
1. Start
7. End
2. Next Tick        ← Microtask (highest priority)
3. Promise          ← Microtask
4. Timeout 0ms      ← Timer phase
6. Immediate        ← Check phase
5. Timeout 100ms    ← Timer phase (next loop)
*/

// Detailed phase walkthrough:

// TIMERS PHASE
// ────────────
const start = Date.now();

setTimeout(() => {
	console.log(`Timer executed after ${Date.now() - start}ms`);
}, 10);

// Timers execute callbacks whose time has elapsed
// Not guaranteed to run exactly at specified time

// POLL PHASE
// ──────────
const net = require('net');

const server = net.createServer((socket) => {
	socket.on('data', (data) => {
		// Runs in poll phase
		console.log('Data received:', data.toString());
	});
});

server.listen(8000, () => {
	console.log('Server listening');
});

// Poll phase:
// 1. Executes I/O callbacks
// 2. Waits for new I/O events
// 3. Exits when timers are ready or setImmediate is queued

// CHECK PHASE
// ───────────
setImmediate(() => {
	console.log('Immediate 1');

	setImmediate(() => {
		console.log('Immediate 2 (nested)');
	});
});

// setImmediate always runs after poll phase
// Good for deferring work without blocking I/O

// CLOSE CALLBACKS PHASE
// ─────────────────────
const server2 = net.createServer();
server2.on('close', () => {
	console.log('Server closed');  // Runs in close callbacks phase
});
```

### 3.3 Event Loop Behavior Examples

```javascript
// Example 1: setTimeout vs setImmediate
// ─────────────────────────────────────

setTimeout(() => {
	console.log('timeout');
}, 0);

setImmediate(() => {
	console.log('immediate');
});

// Output is non-deterministic when called at top level:
// Could be: timeout, immediate
// Or:       immediate, timeout
// Depends on process performance

// But inside I/O cycle, setImmediate is always first:
const fs = require('fs');

fs.readFile(__filename, () => {
	setTimeout(() => {
		console.log('timeout');
	}, 0);

	setImmediate(() => {
		console.log('immediate');
	});
});

// Always outputs:
// immediate
// timeout
// (Because we're already in poll phase)

// Example 2: Microtask Queue Priority
// ────────────────────────────────────

setTimeout(() => console.log('1. timeout'), 0);

setImmediate(() => console.log('2. immediate'));

process.nextTick(() => {
	console.log('3. nextTick 1');

	process.nextTick(() => {
		console.log('4. nextTick 2 (nested)');
	});
});

Promise.resolve().then(() => {
	console.log('5. promise 1');
}).then(() => {
	console.log('6. promise 2');
});

// Output:
// 3. nextTick 1
// 4. nextTick 2 (nested)
// 5. promise 1
// 6. promise 2
// 1. timeout or 2. immediate (depends)
// 2. immediate or 1. timeout (depends)

// Example 3: Blocking the Event Loop
// ───────────────────────────────────

console.log('Before blocking');

// ❌ BAD: Synchronous blocking operation
const crypto = require('crypto');
const hash = crypto.pbkdf2Sync('password', 'salt', 100000, 512, 'sha512');
console.log('Hash computed');  // Blocks for ~100ms

// Meanwhile, these are delayed:
setTimeout(() => console.log('Delayed timer'), 0);

console.log('After blocking');

// ✅ GOOD: Asynchronous operation
console.log('Before async operation');

crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', (err, key) => {
	console.log('Hash computed asynchronously');
});

setTimeout(() => console.log('Timer not delayed'), 0);

console.log('After async operation starts');

// Example 4: process.nextTick Recursion (Starvation)
// ───────────────────────────────────────────────────

// ❌ DANGEROUS: Can starve event loop
let counter = 0;

function recursiveNextTick() {
	if (counter < 10000) {
		counter++;
		process.nextTick(recursiveNextTick);
	}
}

process.nextTick(recursiveNextTick);

// Timer will never run until nextTick queue is empty
setTimeout(() => {
	console.log('This is starved for a while');
}, 0);

// ✅ BETTER: Use setImmediate to avoid starvation
let counter2 = 0;

function recursiveImmediate() {
	if (counter2 < 10000) {
		counter2++;
		setImmediate(recursiveImmediate);  // Allows other events
	}
}

setImmediate(recursiveImmediate);

setTimeout(() => {
	console.log('This runs between immediates');
}, 0);

// Example 5: Understanding Event Loop Lag
// ────────────────────────────────────────

function measureEventLoopLag() {
	const start = Date.now();

	setImmediate(() => {
		const lag = Date.now() - start;
		console.log(`Event loop lag: ${lag}ms`);
	});
}

// Measure lag every second
setInterval(measureEventLoopLag, 1000);

// Simulate blocking work
function simulateWork(duration) {
	const start = Date.now();
	while (Date.now() - start < duration) {
		// Blocking CPU work
	}
}

// Every 5 seconds, block for 200ms
setInterval(() => {
	simulateWork(200);
}, 5000);

// When blocking occurs, lag will spike to ~200ms
```

### 3.4 Thread Pool Behavior

```javascript
const crypto = require('crypto');
const fs = require('fs');

// By default, UV_THREADPOOL_SIZE = 4

// Experiment: 5 concurrent crypto operations
const start = Date.now();

for (let i = 0; i < 5; i++) {
	crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', (err, key) => {
		console.log(`${i + 1}: ${Date.now() - start}ms`);
	});
}

/*
With 4 threads:
1: 150ms
2: 152ms
3: 153ms
4: 154ms
5: 305ms  ← Had to wait for a thread to become available

With UV_THREADPOOL_SIZE=5:
1: 150ms
2: 151ms
3: 152ms
4: 153ms
5: 154ms  ← All ran concurrently
*/

// File operations also use thread pool
fs.readFile('file1.txt', () => console.log('File 1'));
fs.readFile('file2.txt', () => console.log('File 2'));
fs.readFile('file3.txt', () => console.log('File 3'));
fs.readFile('file4.txt', () => console.log('File 4'));
fs.readFile('file5.txt', () => console.log('File 5'));  // Waits for thread

// DNS lookups use thread pool
const dns = require('dns');
dns.lookup('google.com', (err, address) => {
	console.log('Google IP:', address);
});

// But dns.resolve uses native async (no thread pool)
dns.resolve4('google.com', (err, addresses) => {
	console.log('Google IPs:', addresses);
});
```

---

## 4. Node.js Process Model

### 4.1 Single-Threaded Nature

```javascript
/*
Node.js Architecture:

┌────────────────────────────────────┐
│    Main Thread (Event Loop)        │
│  - Executes JavaScript             │
│  - Handles async callbacks         │
│  - Non-blocking I/O coordination   │
└────────────────────────────────────┘
         │
         ├──────► Worker Threads (optional)
         │
         └──────► Thread Pool (libuv)
                  - File I/O
                  - DNS
                  - Crypto
*/

// Single-threaded execution
console.log('This runs in the main thread');

// Even though async, callback still runs in main thread
setTimeout(() => {
	console.log('This callback also runs in main thread');
}, 1000);

// Blocking the main thread affects everything
function blockFor(ms) {
	const start = Date.now();
	while (Date.now() - start < ms) {
		// Blocking!
	}
}

setTimeout(() => console.log('Timer 1'), 1000);
setTimeout(() => console.log('Timer 2'), 1000);

blockFor(2000);  // Blocks EVERYTHING for 2 seconds

// Both timers will fire after the block, not at 1 second

// HTTP server example
const http = require('http');

const server = http.createServer((req, res) => {
	if (req.url === '/fast') {
		res.end('Fast response');
	} else if (req.url === '/slow') {
		// ❌ BAD: Blocking operation
		const result = fibonacci(40);  // Takes ~1 second
		res.end(`Result: ${result}`);
	}
});

function fibonacci(n) {
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}

server.listen(3000);

// If one request hits /slow, ALL other requests wait
// This is why CPU-intensive work should be offloaded
```

### 4.2 Worker Threads

```javascript
// worker_threads module allows true parallelism

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
	// MAIN THREAD
	console.log('Main thread started');

	// Create worker
	const worker = new Worker(__filename, {
		workerData: { num: 40 }
	});

	// Receive messages from worker
	worker.on('message', (result) => {
		console.log('Result from worker:', result);
	});

	worker.on('error', (error) => {
		console.error('Worker error:', error);
	});

	worker.on('exit', (code) => {
		if (code !== 0) {
			console.error(`Worker stopped with exit code ${code}`);
		}
	});

	console.log('Main thread continues executing...');

} else {
	// WORKER THREAD
	console.log('Worker thread started');

	function fibonacci(n) {
		if (n <= 1) return n;
		return fibonacci(n - 1) + fibonacci(n - 2);
	}

	const result = fibonacci(workerData.num);

	// Send result back to main thread
	parentPort.postMessage(result);
}

// Practical example: Parallel processing
const { Worker } = require('worker_threads');

function runWorker(workerData) {
	return new Promise((resolve, reject) => {
		const worker = new Worker('./worker.js', { workerData });
		worker.on('message', resolve);
		worker.on('error', reject);
		worker.on('exit', (code) => {
			if (code !== 0) {
				reject(new Error(`Worker exited with code ${code}`));
			}
		});
	});
}

async function parallelProcessing() {
	const tasks = [10, 20, 30, 40];

	const results = await Promise.all(
		tasks.map(task => runWorker({ num: task }))
	);

	console.log('All results:', results);
}

// Worker pool pattern
class WorkerPool {
	constructor(workerPath, poolSize) {
		this.workerPath = workerPath;
		this.pool = [];
		this.queue = [];

		for (let i = 0; i < poolSize; i++) {
			this.pool.push(this.createWorker());
		}
	}

	createWorker() {
		const worker = new Worker(this.workerPath);
		worker.busy = false;
		return worker;
	}

	async exec(workerData) {
		const worker = this.getAvailableWorker();

		if (!worker) {
			return new Promise((resolve) => {
				this.queue.push({ workerData, resolve });
			});
		}

		return this.runTask(worker, workerData);
	}

	getAvailableWorker() {
		return this.pool.find(w => !w.busy);
	}

	async runTask(worker, workerData) {
		worker.busy = true;

		return new Promise((resolve, reject) => {
			worker.once('message', (result) => {
				worker.busy = false;
				resolve(result);
				this.processQueue();
			});

			worker.once('error', reject);
			worker.postMessage(workerData);
		});
	}

	processQueue() {
		if (this.queue.length === 0) return;

		const worker = this.getAvailableWorker();
		if (!worker) return;

		const { workerData, resolve } = this.queue.shift();
		this.runTask(worker, workerData).then(resolve);
	}
}

// Usage
const pool = new WorkerPool('./worker.js', 4);

async function processMany() {
	const tasks = Array.from({ length: 100 }, (_, i) => i);
	const results = await Promise.all(
		tasks.map(task => pool.exec({ num: task }))
	);
	console.log('Processed 100 tasks:', results.length);
}
```

### 4.3 Child Processes

```javascript
const { spawn, exec, execFile, fork } = require('child_process');

// 1. spawn() - Stream-based, best for large data
// ────────────────────────────────────────────────

const ls = spawn('ls', ['-lh', '/usr']);

// stdout is a stream
ls.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
	console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
	console.log(`child process exited with code ${code}`);
});

// 2. exec() - Buffer-based, best for small output
// ────────────────────────────────────────────────

exec('ls -lh /usr', (error, stdout, stderr) => {
	if (error) {
		console.error(`exec error: ${error}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
	console.error(`stderr: ${stderr}`);
});

// With options
exec('cat *.js | wc -l', {
	cwd: '/path/to/dir',
	env: { NODE_ENV: 'production' },
	maxBuffer: 1024 * 1024  // 1MB
}, (error, stdout) => {
	console.log(`Number of lines: ${stdout}`);
});

// 3. execFile() - Like exec but doesn't spawn shell
// ──────────────────────────────────────────────────

execFile('node', ['--version'], (error, stdout) => {
	console.log(`Node version: ${stdout}`);
});

// 4. fork() - Spawn Node.js processes with IPC
// ─────────────────────────────────────────────

// parent.js
const child = fork('child.js');

child.on('message', (msg) => {
	console.log('Message from child:', msg);
});

child.send({ hello: 'world' });

// child.js
process.on('message', (msg) => {
	console.log('Message from parent:', msg);
	process.send({ received: true });
});

// Practical example: CPU-intensive work in child process
// ───────────────────────────────────────────────────────

// server.js
const http = require('http');
const { fork } = require('child_process');

http.createServer((req, res) => {
	if (req.url === '/compute') {
		const child = fork('compute.js');

		child.send({ num: 40 });

		child.on('message', (result) => {
			res.end(`Result: ${result}`);
		});

	} else {
		res.end('Hello World');
	}
}).listen(3000);

// compute.js
process.on('message', (msg) => {
	const result = fibonacci(msg.num);
	process.send(result);
	process.exit();
});

function fibonacci(n) {
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}

// Now /compute doesn't block other requests!
```

This covers the Node.js runtime in depth. Continue with:

1. **Streams and Buffers** (detailed explanation)
2. **Async patterns** (callbacks, promises, async/await)
3. **Performance optimization**
4. **Memory management and debugging**

