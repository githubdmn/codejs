# Streams and Buffers - Deep Dive

---

## 1. Understanding Buffers

### 1.1 What are Buffers?

```javascript
/*
BUFFER BASICS
─────────────

Buffers are:
- Fixed-size chunks of memory allocated outside V8 heap
- Used to handle binary data
- Similar to arrays of integers (0-255)
- Each element represents a byte (8 bits)

Memory representation:
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ 48  │ 65  │ 6C  │ 6C  │ 6F  │ 20  │ 21  │ 00  │  (Hexadecimal)
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
│  H  │  e  │  l  │  l  │  o  │ ' ' │ '!' │ \0  │  (ASCII)
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
  0     1     2     3     4     5     6     7      (Index)

Why Buffers?
- JavaScript strings are optimized for UTF-16
- Binary protocols (TCP, file I/O) use raw bytes
- Buffers provide efficient binary data manipulation
*/

// Creating Buffers
// ────────────────

// 1. From string (most common)
const buf1 = Buffer.from('Hello World');
console.log(buf1);
// <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>

// 2. From string with encoding
const buf2 = Buffer.from('Hello', 'utf8');    // Default
const buf3 = Buffer.from('48656c6c6f', 'hex'); // Hexadecimal
const buf4 = Buffer.from('SGVsbG8=', 'base64'); // Base64

// 3. From array of bytes
const buf5 = Buffer.from([72, 101, 108, 108, 111]); // "Hello"

// 4. Allocate empty buffer
const buf6 = Buffer.alloc(10);        // Filled with zeros
const buf7 = Buffer.allocUnsafe(10);  // Faster, not initialized (unsafe!)

console.log(buf6); // <Buffer 00 00 00 00 00 00 00 00 00 00>
console.log(buf7); // <Buffer ?? ?? ?? ?? ?? ?? ?? ?? ?? ??> (random data)

// allocUnsafe is faster but contains old memory data
// Always fill it before use:
buf7.fill(0);

// 5. Allocate with initial value
const buf8 = Buffer.alloc(5, 'a'); // <Buffer 61 61 61 61 61> ("aaaaa")
```

### 1.2 Buffer Operations

```javascript
// Reading from Buffers
// ────────────────────

const buffer = Buffer.from('Hello World');

// Convert to string
console.log(buffer.toString());           // 'Hello World'
console.log(buffer.toString('hex'));      // '48656c6c6f20576f726c64'
console.log(buffer.toString('base64'));   // 'SGVsbG8gV29ybGQ='

// Access individual bytes
console.log(buffer[0]);      // 72 (ASCII code for 'H')
console.log(buffer.length);  // 11

// Slice (creates view, not copy)
const slice = buffer.slice(0, 5);
console.log(slice.toString()); // 'Hello'

// Modifying slice affects original!
slice[0] = 74; // 'J'
console.log(buffer.toString()); // 'Jello World'

// To create independent copy:
const copy = Buffer.from(buffer);
copy[0] = 72; // 'H'
console.log(buffer.toString()); // 'Jello World' (unchanged)

// Writing to Buffers
// ──────────────────

const buf = Buffer.alloc(11);

// Write string
buf.write('Hello');
console.log(buf.toString()); // 'Hello'

// Write at offset
buf.write(' World', 5);
console.log(buf.toString()); // 'Hello World'

// Write with encoding
const hexBuf = Buffer.alloc(5);
hexBuf.write('48656c6c6f', 'hex');
console.log(hexBuf.toString()); // 'Hello'

// Direct byte manipulation
buf[0] = 74; // 'J'
console.log(buf.toString()); // 'Jello World'

// Fill buffer
const fillBuf = Buffer.alloc(10);
fillBuf.fill('ab');
console.log(fillBuf.toString()); // 'ababababab'

fillBuf.fill('x', 2, 5); // Fill from index 2 to 5
console.log(fillBuf.toString()); // 'abxxxbabab'
```

### 1.3 Binary Data Manipulation

```javascript
// Working with Numbers
// ────────────────────

const numBuf = Buffer.alloc(8);

// Write integers (different sizes and endianness)
numBuf.writeUInt8(255, 0);      // 1 byte at offset 0
numBuf.writeUInt16BE(1000, 1);  // 2 bytes, Big Endian
numBuf.writeUInt16LE(1000, 3);  // 2 bytes, Little Endian
numBuf.writeInt32BE(-12345, 5); // 4 bytes signed

console.log(numBuf);

// Read integers
console.log(numBuf.readUInt8(0));      // 255
console.log(numBuf.readUInt16BE(1));   // 1000
console.log(numBuf.readUInt16LE(3));   // 1000
console.log(numBuf.readInt32BE(5));    // -12345

// Floating point numbers
const floatBuf = Buffer.alloc(8);
floatBuf.writeFloatBE(3.14, 0);   // 4 bytes
floatBuf.writeDoubleBE(3.14159, 4); // 8 bytes

console.log(floatBuf.readFloatBE(0));  // 3.14
console.log(floatBuf.readDoubleBE(4)); // 3.14159

// Big Endian vs Little Endian
// ───────────────────────────

/*
Number: 1000 (0x03E8)

Big Endian (Network byte order):
┌─────┬─────┐
│ 03  │ E8  │  Most significant byte first
└─────┴─────┘

Little Endian (x86 processors):
┌─────┬─────┐
│ E8  │ 03  │  Least significant byte first
└─────┴─────┘
*/

const value = 1000;
const beBuf = Buffer.alloc(2);
const leBuf = Buffer.alloc(2);

beBuf.writeUInt16BE(value, 0);
leBuf.writeUInt16LE(value, 0);

console.log(beBuf); // <Buffer 03 e8>
console.log(leBuf); // <Buffer e8 03>

// Network protocols typically use Big Endian
// Most CPUs use Little Endian

// Binary Protocol Example: Custom Message Format
// ──────────────────────────────────────────────

/*
Message Format:
┌─────────┬──────────┬─────────┬──────────┐
│ Version │  Type    │ Length  │  Payload │
│ 1 byte  │ 1 byte   │ 2 bytes │ N bytes  │
└─────────┴──────────┴─────────┴──────────┘
*/

class MessageEncoder {
	static encode(type, payload) {
		const payloadBuf = Buffer.from(payload);
		const headerBuf = Buffer.alloc(4);

		headerBuf.writeUInt8(1, 0);              // Version
		headerBuf.writeUInt8(type, 1);           // Type
		headerBuf.writeUInt16BE(payloadBuf.length, 2); // Length

		return Buffer.concat([headerBuf, payloadBuf]);
	}

	static decode(buffer) {
		const version = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);
		const length = buffer.readUInt16BE(2);
		const payload = buffer.slice(4, 4 + length);

		return {
			version,
			type,
			length,
			payload: payload.toString()
		};
	}
}

// Usage
const message = MessageEncoder.encode(1, 'Hello World');
console.log(message);
// <Buffer 01 01 00 0b 48 65 6c 6c 6f 20 57 6f 72 6c 64>

const decoded = MessageEncoder.decode(message);
console.log(decoded);
// { version: 1, type: 1, length: 11, payload: 'Hello World' }
```

### 1.4 Buffer Pooling and Performance

```javascript
// Buffer Pooling
// ──────────────

/*
Node.js maintains an internal pool for small buffers (< 4KB)
to reduce memory allocation overhead

Buffer.allocUnsafe() and Buffer.from() use the pool
Buffer.alloc() does not (always allocates new memory)
*/

// These use the pool:
const pooled1 = Buffer.allocUnsafe(100);
const pooled2 = Buffer.from('Hello');

// This doesn't use the pool:
const notPooled = Buffer.alloc(100);

// Large buffers never use pool:
const large = Buffer.allocUnsafe(10000); // > 4KB, no pooling

// Performance comparison
console.time('alloc');
for (let i = 0; i < 100000; i++) {
	Buffer.alloc(100);
}
console.timeEnd('alloc');
// alloc: ~50ms

console.time('allocUnsafe');
for (let i = 0; i < 100000; i++) {
	Buffer.allocUnsafe(100);
}
console.timeEnd('allocUnsafe');
// allocUnsafe: ~10ms (5x faster!)

// Memory usage consideration
const buffers = [];

// Bad: Creates many small buffers
for (let i = 0; i < 1000; i++) {
	buffers.push(Buffer.alloc(10));
}

// Better: Allocate once, slice as needed
const largeBuf = Buffer.alloc(10000);
for (let i = 0; i < 1000; i++) {
	buffers.push(largeBuf.slice(i * 10, (i + 1) * 10));
}

// Concatenating Buffers
// ─────────────────────

// ❌ BAD: Inefficient (creates intermediate buffers)
let result = Buffer.alloc(0);
for (let i = 0; i < 1000; i++) {
	const chunk = Buffer.from(`Chunk ${i}\n`);
	result = Buffer.concat([result, chunk]);
}

// ✅ GOOD: Collect first, then concat once
const chunks = [];
let totalLength = 0;

for (let i = 0; i < 1000; i++) {
	const chunk = Buffer.from(`Chunk ${i}\n`);
	chunks.push(chunk);
	totalLength += chunk.length;
}

const efficient = Buffer.concat(chunks, totalLength);

// Even better: Pre-allocate if you know the size
const knownSize = Buffer.allocUnsafe(totalLength);
let offset = 0;

for (const chunk of chunks) {
	chunk.copy(knownSize, offset);
	offset += chunk.length;
}
```

### 1.5 Character Encodings

```javascript
// Supported Encodings
// ───────────────────

const text = 'Hello 世界';

// UTF-8 (default, variable length)
const utf8 = Buffer.from(text, 'utf8');
console.log(utf8);
// <Buffer 48 65 6c 6c 6f 20 e4 b8 96 e7 95 8c>
console.log(utf8.length); // 12 bytes

// UTF-16 Little Endian
const utf16le = Buffer.from(text, 'utf16le');
console.log(utf16le);
console.log(utf16le.length); // 14 bytes

// ASCII (only works for ASCII characters)
const ascii = Buffer.from('Hello', 'ascii');
console.log(ascii.toString()); // 'Hello'

// Latin1 (ISO-8859-1)
const latin1 = Buffer.from('Hello', 'latin1');

// Base64 encoding/decoding
const original = 'Hello World';
const base64 = Buffer.from(original).toString('base64');
console.log(base64); // 'SGVsbG8gV29ybGQ='

const decoded = Buffer.from(base64, 'base64').toString();
console.log(decoded); // 'Hello World'

// Hex encoding/decoding
const hex = Buffer.from('Hello').toString('hex');
console.log(hex); // '48656c6c6f'

const fromHex = Buffer.from(hex, 'hex').toString();
console.log(fromHex); // 'Hello'

// Binary data to base64 (common use case)
const fs = require('fs');

// Read binary file
const imageBuffer = fs.readFileSync('image.png');

// Convert to base64 for embedding in HTML/JSON
const imageBase64 = imageBuffer.toString('base64');
const dataUrl = `data:image/png;base64,${imageBase64}`;

// Encoding validation
console.log(Buffer.isEncoding('utf8'));   // true
console.log(Buffer.isEncoding('utf-8'));  // true
console.log(Buffer.isEncoding('invalid')); // false

// Get byte length for a string in specific encoding
console.log(Buffer.byteLength('Hello', 'utf8'));     // 5
console.log(Buffer.byteLength('Hello 世界', 'utf8')); // 12
```

---

## 2. Understanding Streams

### 2.1 Stream Fundamentals

```javascript
/*
WHAT ARE STREAMS?
─────────────────

Streams are collections of data that might not be available all at once
and don't have to fit in memory.

Benefits:
1. Memory efficiency - process data chunk by chunk
2. Time efficiency - start processing before all data arrives
3. Composability - pipe streams together

Types of Streams:
1. Readable - read data from (fs.createReadStream, http.IncomingMessage)
2. Writable - write data to (fs.createWriteStream, http.ServerResponse)
3. Duplex - both readable and writable (net.Socket, zlib, crypto)
4. Transform - duplex that transforms data (zlib.createGzip)

Stream Modes:
1. Flowing mode - data flows automatically
2. Paused mode - must explicitly call read()

               ┌──────────────┐
   Data Source │   READABLE   │
               │    STREAM    │
               └───────┬──────┘
                       │ pipe()
                       ▼
               ┌──────────────┐
               │  TRANSFORM   │  (optional)
               │    STREAM    │
               └───────┬──────┘
                       │ pipe()
                       ▼
               ┌──────────────┐
  Destination  │   WRITABLE   │
               │    STREAM    │
               └──────────────┘
*/

const { Readable, Writable, Transform, pipeline } = require('stream');

// Basic stream example - memory comparison
// ────────────────────────────────────────

// ❌ BAD: Load entire file into memory
const fs = require('fs');

// Reading 1GB file - uses 1GB of memory
const data = fs.readFileSync('huge-file.txt');
console.log(data.toString());

// ✅ GOOD: Stream the file - uses ~64KB chunks
const readStream = fs.createReadStream('huge-file.txt', {
	encoding: 'utf8',
	highWaterMark: 64 * 1024  // 64KB chunk size
});

readStream.on('data', (chunk) => {
	console.log(`Received ${chunk.length} bytes`);
	// Process chunk - only this chunk in memory
});

readStream.on('end', () => {
	console.log('Finished reading file');
});

readStream.on('error', (error) => {
	console.error('Error:', error);
});
```

### 2.2 Readable Streams

```javascript
const { Readable } = require('stream');
const fs = require('fs');

// Creating Readable Streams
// ─────────────────────────

// 1. From file
const fileStream = fs.createReadStream('file.txt', {
	encoding: 'utf8',
	highWaterMark: 16 * 1024,  // 16KB chunks (default: 64KB)
	start: 0,                   // Start position
	end: 100                    // End position (read first 100 bytes)
});

// 2. Custom readable stream
class NumberStream extends Readable {
	constructor(max) {
		super();
		this.current = 0;
		this.max = max;
	}

	_read() {
		if (this.current <= this.max) {
			// Push data to internal buffer
			this.push(String(this.current++) + '\n');
		} else {
			// Signal end of stream
			this.push(null);
		}
	}
}

const numbers = new NumberStream(10);
numbers.on('data', (chunk) => {
	console.log('Number:', chunk.toString().trim());
});

// 3. Create from array/iterable
const arrayStream = Readable.from(['Hello', 'World', '!']);
arrayStream.on('data', (chunk) => {
	console.log('Chunk:', chunk);
});

// 4. Create from async generator
async function* generate() {
	for (let i = 0; i < 5; i++) {
		await new Promise(resolve => setTimeout(resolve, 100));
		yield `Item ${i}`;
	}
}

const generatorStream = Readable.from(generate());

// Reading Modes
// ─────────────

// FLOWING MODE (automatic)
// ────────────────────────

const flowing = fs.createReadStream('file.txt');

// Attaching 'data' listener starts flowing
flowing.on('data', (chunk) => {
	console.log('Received chunk:', chunk.length);
});

// Control flow
flowing.pause();  // Pause data flow
flowing.resume(); // Resume data flow

// PAUSED MODE (manual)
// ────────────────────

const paused = fs.createReadStream('file.txt');

// Use readable event
paused.on('readable', () => {
	let chunk;
	// read() returns null when no more data
	while ((chunk = paused.read()) !== null) {
		console.log('Read chunk:', chunk.length);
	}
});

// Or read specific amount
paused.on('readable', () => {
	const chunk = paused.read(100); // Read 100 bytes
	if (chunk) {
		console.log('Read 100 bytes');
	}
});

// Stream Events
// ─────────────

const readable = fs.createReadStream('file.txt');

readable.on('open', (fd) => {
	console.log('File opened, descriptor:', fd);
});

readable.on('data', (chunk) => {
	console.log('Data received:', chunk.length);
});

readable.on('end', () => {
	console.log('No more data');
});

readable.on('close', () => {
	console.log('Stream closed');
});

readable.on('error', (error) => {
	console.error('Error:', error);
});

// Backpressure handling
// ─────────────────────

const source = fs.createReadStream('large-file.txt');
const destination = fs.createWriteStream('copy.txt');

source.on('data', (chunk) => {
	const canContinue = destination.write(chunk);

	if (!canContinue) {
		// Destination buffer is full
		console.log('Backpressure - pausing read');
		source.pause();
	}
});

destination.on('drain', () => {
	// Destination buffer drained
	console.log('Drain - resuming read');
	source.resume();
});

source.on('end', () => {
	destination.end();
});
```

### 2.3 Writable Streams

```javascript
const { Writable } = require('stream');
const fs = require('fs');

// Creating Writable Streams
// ─────────────────────────

// 1. File writable stream
const fileWriter = fs.createWriteStream('output.txt', {
	encoding: 'utf8',
	flags: 'a'  // 'a' = append, 'w' = write (default)
});

fileWriter.write('Hello ');
fileWriter.write('World\n');
fileWriter.end(); // Signal completion

// 2. Custom writable stream
class LogStream extends Writable {
	_write(chunk, encoding, callback) {
		console.log(`[LOG] ${chunk.toString()}`);
		callback(); // Signal write completion
	}

	_writev(chunks, callback) {
		// Called when multiple writes are buffered
		console.log(`[LOG] Writing ${chunks.length} chunks`);
		chunks.forEach(({ chunk }) => {
			console.log(`  - ${chunk.toString()}`);
		});
		callback();
	}

	_final(callback) {
		// Called before stream closes
		console.log('[LOG] Stream closing');
		callback();
	}
}

const logger = new LogStream();
logger.write('Message 1\n');
logger.write('Message 2\n');
logger.end('Final message\n');

// Writing to Streams
// ──────────────────

const writer = fs.createWriteStream('data.txt');

// write() returns boolean indicating if buffer is full
const canContinue = writer.write('Some data\n');

if (!canContinue) {
	console.log('Internal buffer full, backpressure!');
	writer.once('drain', () => {
		console.log('Buffer drained, can write more');
	});
}

// Proper backpressure handling
function writeMillionLines(writer, encoding, callback) {
	let i = 1000000;

	function write() {
		let ok = true;

		do {
			i--;
			if (i === 0) {
				// Last write
				writer.write('Last line\n', encoding, callback);
			} else {
				// Keep writing until buffer full
				ok = writer.write(`Line ${i}\n`, encoding);
			}
		} while (i > 0 && ok);

		if (i > 0) {
			// Buffer full, wait for drain
			writer.once('drain', write);
		}
	}

	write();
}

const output = fs.createWriteStream('million-lines.txt');
writeMillionLines(output, 'utf8', () => {
	console.log('Finished writing 1 million lines');
});

// Writable Stream Events
// ──────────────────────

const writable = fs.createWriteStream('output.txt');

writable.on('open', (fd) => {
	console.log('File opened');
});

writable.on('drain', () => {
	console.log('Buffer drained, ready for more');
});

writable.on('finish', () => {
	console.log('All writes completed');
});

writable.on('close', () => {
	console.log('Stream closed');
});

writable.on('error', (error) => {
	console.error('Error:', error);
});

// Cork and uncork (batching writes)
// ──────────────────────────────────

const batchWriter = fs.createWriteStream('batch.txt');

// Cork buffers all writes
batchWriter.cork();

batchWriter.write('Line 1\n');
batchWriter.write('Line 2\n');
batchWriter.write('Line 3\n');

// Uncork flushes buffered writes
process.nextTick(() => {
	batchWriter.uncork();
});

// Multiple cork/uncork
batchWriter.cork();
batchWriter.write('Batch 1\n');
batchWriter.uncork();

batchWriter.cork();
batchWriter.write('Batch 2\n');
batchWriter.uncork();
```

### 2.4 Duplex and Transform Streams

```javascript
const { Duplex, Transform, pipeline } = require('stream');
const fs = require('fs');

// Duplex Streams (both readable and writable)
// ───────────────────────────────────────────

class DuplexStream extends Duplex {
	constructor(options) {
		super(options);
		this.data = [];
	}

	_write(chunk, encoding, callback) {
		// Handle incoming data
		this.data.push(chunk);
		callback();
	}

	_read(size) {
		// Provide outgoing data
		if (this.data.length > 0) {
			this.push(this.data.shift());
		} else {
			this.push(null); // No more data
		}
	}
}

const duplex = new DuplexStream();

// Write to it
duplex.write('Hello ');
duplex.write('World');
duplex.end();

// Read from it
duplex.on('data', (chunk) => {
	console.log('Received:', chunk.toString());
});

// Transform Streams (modify data as it passes through)
// ────────────────────────────────────────────────────

// 1. Simple transform: Uppercase
class UpperCaseTransform extends Transform {
	_transform(chunk, encoding, callback) {
		// Transform the chunk
		const upperChunk = chunk.toString().toUpperCase();
		this.push(upperChunk);
		callback();
	}
}

const upperCase = new UpperCaseTransform();

// Pipe through transform
process.stdin
	.pipe(upperCase)
	.pipe(process.stdout);

// 2. CSV to JSON transform
class CsvToJsonTransform extends Transform {
	constructor(options) {
		super(options);
		this.headers = null;
		this.buffer = '';
	}

	_transform(chunk, encoding, callback) {
		this.buffer += chunk.toString();

		const lines = this.buffer.split('\n');
		this.buffer = lines.pop(); // Keep incomplete line

		lines.forEach((line, index) => {
			if (!this.headers) {
				this.headers = line.split(',');
			} else {
				const values = line.split(',');
				const obj = {};

				this.headers.forEach((header, i) => {
					obj[header] = values[i];
				});

				this.push(JSON.stringify(obj) + '\n');
			}
		});

		callback();
	}

	_flush(callback) {
		// Handle remaining buffer
		if (this.buffer && this.headers) {
			const values = this.buffer.split(',');
			const obj = {};

			this.headers.forEach((header, i) => {
				obj[header] = values[i];
			});

			this.push(JSON.stringify(obj) + '\n');
		}
		callback();
	}
}

// Usage
const csvToJson = new CsvToJsonTransform();

fs.createReadStream('data.csv')
	.pipe(csvToJson)
	.pipe(fs.createWriteStream('data.json'));

// 3. Compression transform
const zlib = require('zlib');

fs.createReadStream('file.txt')
	.pipe(zlib.createGzip())  // Built-in transform stream
	.pipe(fs.createWriteStream('file.txt.gz'));

// 4. Encryption transform
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const password = 'secret-key';
const key = crypto.scryptSync(password, 'salt', 32);
const iv = crypto.randomBytes(16);

const encryptStream = crypto.createCipheriv(algorithm, key, iv);

fs.createReadStream('secret.txt')
	.pipe(encryptStream)
	.pipe(fs.createWriteStream('secret.txt.enc'));

// Decryption
const decryptStream = crypto.createDecipheriv(algorithm, key, iv);

fs.createReadStream('secret.txt.enc')
	.pipe(decryptStream)
	.pipe(fs.createWriteStream('secret-decrypted.txt'));

// 5. Line-by-line transform
class LineTransform extends Transform {
	constructor(options) {
		super(options);
		this.buffer = '';
	}

	_transform(chunk, encoding, callback) {
		this.buffer += chunk.toString();

		const lines = this.buffer.split('\n');
		this.buffer = lines.pop();

		lines.forEach(line => {
			this.push(line + '\n');
		});

		callback();
	}

	_flush(callback) {
		if (this.buffer) {
			this.push(this.buffer);
		}
		callback();
	}
}

// Add line numbers
class AddLineNumbers extends Transform {
	constructor(options) {
		super(options);
		this.lineNumber = 0;
	}

	_transform(chunk, encoding, callback) {
		this.lineNumber++;
		const numbered = `${this.lineNumber}: ${chunk}`;
		this.push(numbered);
		callback();
	}
}

const lineTransform = new LineTransform();
const addNumbers = new AddLineNumbers();

fs.createReadStream('file.txt')
	.pipe(lineTransform)
	.pipe(addNumbers)
	.pipe(process.stdout);
```

### 2.5 Stream Piping and Composition

```javascript
const { pipeline, Transform } = require('stream');
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

// Basic Piping
// ────────────

// Simple pipe
fs.createReadStream('input.txt')
	.pipe(fs.createWriteStream('output.txt'));

// Chained pipes
fs.createReadStream('file.txt')
	.pipe(zlib.createGzip())
	.pipe(fs.createWriteStream('file.txt.gz'));

// Multiple transforms
fs.createReadStream('data.csv')
	.pipe(new CsvToJsonTransform())
	.pipe(new FilterTransform())
	.pipe(new FormatTransform())
	.pipe(fs.createWriteStream('output.json'));

// Error Handling with Pipes
// ─────────────────────────

// ❌ BAD: Errors not properly handled
fs.createReadStream('input.txt')
	.pipe(zlib.createGzip())
	.pipe(fs.createWriteStream('output.txt.gz'));
// If any stream errors, it might not be caught!

// ✅ GOOD: Use pipeline() for proper error handling
pipeline(
	fs.createReadStream('input.txt'),
	zlib.createGzip(),
	fs.createWriteStream('output.txt.gz'),
	(error) => {
		if (error) {
			console.error('Pipeline failed:', error);
		} else {
			console.log('Pipeline succeeded');
		}
	}
);

// Complex Pipeline Example
// ────────────────────────

// Log transform
class LogTransform extends Transform {
	constructor(label) {
		super();
		this.label = label;
		this.bytes = 0;
	}

	_transform(chunk, encoding, callback) {
		this.bytes += chunk.length;
		console.log(`[${this.label}] Processed ${this.bytes} bytes`);
		this.push(chunk);
		callback();
	}
}

// Filter lines containing specific text
class FilterLinesTransform extends Transform {
	constructor(searchTerm) {
		super();
		this.searchTerm = searchTerm;
		this.buffer = '';
	}

	_transform(chunk, encoding, callback) {
		this.buffer += chunk.toString();
		const lines = this.buffer.split('\n');
		this.buffer = lines.pop();

		lines.forEach(line => {
			if (line.includes(this.searchTerm)) {
				this.push(line + '\n');
			}
		});

		callback();
	}

	_flush(callback) {
		if (this.buffer && this.buffer.includes(this.searchTerm)) {
			this.push(this.buffer);
		}
		callback();
	}
}

// Build complex pipeline
pipeline(
	fs.createReadStream('large-log.txt'),
	new LogTransform('READ'),
	new FilterLinesTransform('ERROR'),
	new LogTransform('FILTER'),
	zlib.createGzip(),
	new LogTransform('COMPRESS'),
	fs.createWriteStream('errors.txt.gz'),
	(error) => {
		if (error) {
			console.error('Pipeline failed:', error);
			process.exit(1);
		}
		console.log('Error log compressed successfully');
	}
);

// Parallel Streams
// ────────────────

const { PassThrough } = require('stream');

// Split stream to multiple destinations
const source = fs.createReadStream('data.txt');
const dest1 = fs.createWriteStream('copy1.txt');
const dest2 = fs.createWriteStream('copy2.txt');
const dest3 = fs.createWriteStream('copy3.txt');

// Use PassThrough to tee the stream
const pass1 = new PassThrough();
const pass2 = new PassThrough();
const pass3 = new PassThrough();

source.pipe(pass1).pipe(dest1);
source.pipe(pass2).pipe(dest2);
source.pipe(pass3).pipe(dest3);

// Merge multiple streams
const { Readable } = require('stream');

function mergeStreams(...streams) {
	let pass = new PassThrough();
	let waiting = streams.length;

	for (let stream of streams) {
		stream.once('end', () => {
			if (--waiting === 0) {
				pass.end();
			}
		});
		stream.pipe(pass, { end: false });
	}

	return pass;
}

const file1 = fs.createReadStream('file1.txt');
const file2 = fs.createReadStream('file2.txt');
const file3 = fs.createReadStream('file3.txt');

const merged = mergeStreams(file1, file2, file3);
merged.pipe(fs.createWriteStream('merged.txt'));
```

### 2.6 Stream Performance and Best Practices

```javascript
// Performance Optimization
// ───────────────────────

// 1. Choose appropriate highWaterMark
// ───────────────────────────────────

// Small files: lower highWaterMark (16KB)
const smallFile = fs.createReadStream('small.txt', {
	highWaterMark: 16 * 1024
});

// Large files: higher highWaterMark (256KB or more)
const largeFile = fs.createReadStream('huge.txt', {
	highWaterMark: 256 * 1024
});

// 2. Object mode for non-buffer data
// ──────────────────────────────────

class ObjectStream extends Transform {
	constructor() {
		super({ objectMode: true });  // Accept objects instead of buffers
	}

	_transform(obj, encoding, callback) {
		// Process object
		obj.processed = true;
		obj.timestamp = Date.now();
		this.push(obj);
		callback();
	}
}

const objectStream = new ObjectStream();

Readable.from([
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
	{ id: 3, name: 'Charlie' }
])
	.pipe(objectStream)
	.on('data', (obj) => {
		console.log(obj);
		// { id: 1, name: 'Alice', processed: true, timestamp: ... }
	});

// 3. Async iterators with streams (Node.js 10+)
// ──────────────────────────────────────────────

async function processFile() {
	const stream = fs.createReadStream('data.txt', { encoding: 'utf8' });

	for await (const chunk of stream) {
		console.log('Processing chunk:', chunk.length);
		// Can use await here for async operations
		await someAsyncOperation(chunk);
	}

	console.log('File processed');
}

// 4. Stream composition with readable-stream
// ──────────────────────────────────────────

const { compose } = require('stream');

// Compose multiple transforms into one
const processStream = compose(
	new FilterTransform(),
	new MapTransform(),
	zlib.createGzip()
);

fs.createReadStream('input.txt')
	.pipe(processStream)
	.pipe(fs.createWriteStream('output.txt.gz'));

// Common Pitfalls and Solutions
// ─────────────────────────────

// ❌ PITFALL 1: Memory leaks from unclosed streams
const badStream = fs.createReadStream('file.txt');
badStream.on('data', () => {
	// If we don't consume all data and don't close...
	badStream.destroy(); // Must destroy to free resources
});

// ✅ SOLUTION: Always handle end/error and cleanup
const goodStream = fs.createReadStream('file.txt');

goodStream.on('data', (chunk) => {
	// Process
});

goodStream.on('end', () => {
	console.log('Stream ended');
});

goodStream.on('error', (error) => {
	console.error('Stream error:', error);
	goodStream.destroy();
});

// ❌ PITFALL 2: Not handling backpressure
const source = fs.createReadStream('huge.txt');
const dest = fs.createWriteStream('copy.txt');

source.on('data', (chunk) => {
	dest.write(chunk); // Ignoring return value = backpressure issues!
});

// ✅ SOLUTION: Use pipe() or handle backpressure manually
source.pipe(dest);  // Pipe handles backpressure automatically

// ❌ PITFALL 3: Error handling in pipe chains
fs.createReadStream('input.txt')
	.pipe(transform)
	.pipe(fs.createWriteStream('output.txt'));
// Errors in transform might crash the app!

// ✅ SOLUTION: Use pipeline()
pipeline(
	fs.createReadStream('input.txt'),
	transform,
	fs.createWriteStream('output.txt'),
	(error) => {
		if (error) {
			console.error('Pipeline error:', error);
		}
	}
);

// Real-world example: Processing large CSV file
// ─────────────────────────────────────────────

const { pipeline } = require('stream');
const { createReadStream, createWriteStream } = require('fs');
const { Transform } = require('stream');

class CsvParser extends Transform {
	constructor() {
		super({ objectMode: true });
		this.headers = null;
		this.lineBuffer = '';
	}

	_transform(chunk, encoding, callback) {
		this.lineBuffer += chunk.toString();
		const lines = this.lineBuffer.split('\n');
		this.lineBuffer = lines.pop();

		lines.forEach(line => {
			if (!this.headers) {
				this.headers = line.split(',');
			} else {
				const values = line.split(',');
				const record = {};
				this.headers.forEach((h, i) => {
					record[h] = values[i];
				});
				this.push(record);
			}
		});

		callback();
	}
}

class DataValidator extends Transform {
	constructor() {
		super({ objectMode: true });
	}

	_transform(record, encoding, callback) {
		// Validate and filter
		if (record.age && parseInt(record.age) > 18) {
			this.push(record);
		}
		callback();
	}
}

class JsonSerializer extends Transform {
	constructor() {
		super({ objectMode: true });
		this.first = true;
	}

	_transform(record, encoding, callback) {
		if (this.first) {
			this.push('[\n');
			this.first = false;
		} else {
			this.push(',\n');
		}
		this.push(JSON.stringify(record, null, 2));
		callback();
	}

	_flush(callback) {
		this.push('\n]');
		callback();
	}
}

// Process 1GB CSV file with constant memory usage
pipeline(
	createReadStream('users.csv'),
	new CsvParser(),
	new DataValidator(),
	new JsonSerializer(),
	createWriteStream('filtered-users.json'),
	(error) => {
		if (error) {
			console.error('Processing failed:', error);
		} else {
			console.log('Processing complete');
		}
	}
);
```

This covers Streams and Buffers in comprehensive detail. Would you like me to continue with:

1. **Async Patterns** (callbacks, promises, async/await, error handling)
2. **HTTP and Networking** (creating servers, making requests, WebSockets)
3. **File System Operations** (advanced fs usage, file watching)
4. **Performance and Optimization** (profiling, memory management, clustering)

