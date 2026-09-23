# How Node.js Handles Requests, Database Communication, and Connections

This is fundamental to understanding Node.js architecture.

---

## 1. How Node.js Handles HTTP Requests

### 1.1 Request Lifecycle Overview

```javascript
/*
REQUEST FLOW IN NODE.JS
───────────────────────

┌─────────────────────────────────────────────────────────────┐
│ 1. NETWORK LAYER (OS)                                       │
│    Client TCP connection arrives at server's listening port  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EVENT LOOP (libuv)                                        │
│    Poll phase detects incoming connection                    │
│    Adds connection to event loop queue                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. HTTP PARSING (Node.js native)                            │
│    Parse HTTP request line, headers, body                   │
│    Construct IncomingMessage object                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. REQUEST HANDLER EXECUTION                                │
│    Call your request callback/middleware                    │
│    req = IncomingMessage (readable stream)                  │
│    res = ServerResponse (writable stream)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. APPLICATION LOGIC                                         │
│    - Parse request data                                      │
│    - Query database (async I/O)                             │
│    - Process data                                            │
│    - Start async operations                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. ASYNC OPERATIONS QUEUED                                  │
│    - Database queries go to thread pool or OS async APIs    │
│    - File I/O goes to thread pool                           │
│    - Timers registered with event loop                      │
│    - Request handler returns control to event loop          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. EVENT LOOP CONTINUES                                     │
│    - Handle other requests                                  │
│    - Process timers                                          │
│    - Check for completed I/O operations                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. I/O COMPLETION (from database)                           │
│    - Data returns from thread pool / OS                     │
│    - Callback/Promise registered in step 5 executes        │
│    - Queue in microtask queue if Promise-based             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. SEND RESPONSE                                            │
│    - res.write() or res.end() called                        │
│    - Response written to TCP socket                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. CONNECTION CLOSE                                        │
│     - Client receives response                              │
│     - Socket closed or kept alive (HTTP/1.1)               │
└─────────────────────────────────────────────────────────────┘
*/

// CRITICAL: All of this happens WITHOUT blocking other requests!
// While request 1 waits for database (steps 5-8),
// the event loop can handle requests 2, 3, 4, etc.
```

### 1.2 Request Handling in Detail

```javascript
const http = require('http');
const net = require('net');

// Create server
const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // At this point:
    // 1. TCP connection established
    // 2. HTTP headers parsed
    // 3. IncomingMessage object created (req)
    // 4. ServerResponse object created (res)
    
    // The key insight: This function is called by the event loop
    // ONCE for each request. Control returns after this function ends.
    
    res.writeHead(200);
    res.end('Hello World');
});

server.listen(3000);

// Track connections
const connections = new Map();

server.on('connection', (socket) => {
    const id = Math.random().toString(36).substring(7);
    console.log(`Connection established: ${id}`);
    
    connections.set(id, {
        socket,
        createdAt: Date.now(),
        requestCount: 0
    });
    
    socket.on('data', (data) => {
        // Raw TCP data received
        console.log(`Data received on ${id}: ${data.length} bytes`);
    });
    
    socket.on('close', () => {
        console.log(`Connection closed: ${id}`);
        const conn = connections.get(id);
        console.log(`  - Requests handled: ${conn.requestCount}`);
        connections.delete(id);
    });
});

// Understanding HTTP/1.1 Keep-Alive
// ─────────────────────────────────

/*
HTTP/1.1 Keep-Alive (persistent connections):

Request 1: GET / HTTP/1.1
         ┌────────────────────┐
Socket 1 │ Request handler 1  │ (100ms)
         └────────────────────┘
                   ↓
Request 2: GET /api HTTP/1.1
         ┌────────────────────┐
Socket 1 │ Request handler 2  │ (150ms)
         └────────────────────┘
                   ↓
Request 3: GET /data HTTP/1.1
         ┌────────────────────┐
Socket 1 │ Request handler 3  │ (80ms)
         └────────────────────┘
         
Multiple requests on SAME TCP connection!

vs HTTP/1.0 (new connection per request):

Request 1: GET /
Socket 1 ──Connection─── Close
        
Request 2: GET /api
Socket 2 ──Connection─── Close
        
Request 3: GET /data
Socket 3 ──Connection─── Close

Multiple TCP connections!
*/

// Handling multiple concurrent requests
// ─────────────────────────────────────

const server2 = http.createServer((req, res) => {
    // Simulate async operation (database query)
    setTimeout(() => {
        res.writeHead(200);
        res.end(`Response for ${req.url}`);
    }, 1000);
    
    // This function RETURNS IMMEDIATELY
    // The response will be sent later
    console.log(`Request started: ${req.url}`);
});

server2.listen(3001);

/*
Timeline with 3 concurrent requests arriving at t=0:

t=0ms:   Request 1 arrives → handler called (returns immediately)
         Request 2 arrives → handler called (returns immediately)
         Request 3 arrives → handler called (returns immediately)
         
t=1000ms: All 3 timeouts complete
         Response 1 sent
         Response 2 sent
         Response 3 sent

Total time: 1 second (parallel!)
NOT 3 seconds (sequential)

This is the power of Node.js - non-blocking I/O
*/
```

### 1.3 Stream-Based Request/Response

```javascript
const http = require('http');
const fs = require('fs');

// Key insight: req and res are STREAMS

const server = http.createServer((req, res) => {
    // req is a Readable Stream
    // res is a Writable Stream
    
    if (req.method === 'POST') {
        console.log('Receiving request body as stream...');
        
        // Data arrives in chunks
        // We can process as it arrives (memory efficient)
        
        let totalBytes = 0;
        
        req.on('data', (chunk) => {
            totalBytes += chunk.length;
            console.log(`Chunk received: ${chunk.length} bytes`);
            
            // Process chunk immediately without buffering entire body
            // This is crucial for large uploads
        });
        
        req.on('end', () => {
            console.log(`Request complete: ${totalBytes} bytes total`);
            res.end('Received');
        });
    } else if (req.url === '/download') {
        // Streaming large file response
        const stream = fs.createReadStream('large-file.bin');
        
        // Pipe automatically handles backpressure
        // Won't load entire file into memory
        stream.pipe(res);
    }
});

server.listen(3002);

/*
Request streaming example:
┌──────────────────────────┐
│ Client sends 1GB file    │
└────────────┬─────────────┘
             │
    ┌────────▼─────────┐
    │ chunk 1 (64KB)  │→ Process immediately
    │                 │→ Don't buffer
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │ chunk 2 (64KB)  │→ Process immediately
    │                 │→ Memory constant!
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │ chunk 3 (64KB)  │
    └────────┬─────────┘
             ...
             
Memory usage: ~64KB (chunk size)
NOT 1GB (total file size)
*/
```

---

## 2. How Node.js Communicates with Databases

### 2.1 Database Driver Architecture

```javascript
/*
DATABASE COMMUNICATION FLOW
──────────────────────────

┌────────────────────────────┐
│  Your Application Code     │
│  (JavaScript)              │
└────────────────┬───────────┘
                 │
                 ▼
┌────────────────────────────┐
│  Database Driver (Node.js) │
│  (JavaScript bindings)     │
│                            │
│  - Parses queries          │
│  - Manages connections     │
│  - Handles results         │
└────────────────┬───────────┘
                 │
                 ▼
┌────────────────────────────┐
│  Native Module / Network   │
│  (C++ bindings or TCP)     │
│                            │
│  - Sends query to database │
│  - Receives response       │
│  - Handles protocol        │
└────────────────┬───────────┘
                 │
                 ▼
┌────────────────────────────┐
│  Database Server           │
│  (PostgreSQL, MongoDB, etc)│
│                            │
│  - Parses query            │
│  - Executes                │
│  - Returns result set      │
└────────────────────────────┘

Non-blocking flow:
1. Application sends query to driver
2. Driver sends query to database (via network or socket)
3. Application returns control to event loop
4. Event loop handles other requests
5. Database processes query
6. Result comes back
7. Callback/Promise executes
8. Application processes result
*/

// Example: PostgreSQL with pg library
const { Client } = require('pg');

// Connection configuration
const connectionConfig = {
    user: 'dbuser',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'myapp'
};

// ASYNC FLOW (Non-blocking)
async function queryDatabase() {
    const client = new Client(connectionConfig);
    
    try {
        // Connect to database
        // This is ASYNC - doesn't block event loop
        await client.connect();
        
        console.log('Connected to database');
        // Event loop can handle other requests while connecting
        
        // Execute query
        // This is ASYNC - query sent, event loop continues
        const result = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [123]
        );
        
        console.log('Query result:', result.rows);
        // Event loop can handle other requests while query executes
        
        return result.rows[0];
        
    } finally {
        // Close connection
        await client.end();
    }
}

// CALLBACK FLOW (Traditional, non-blocking)
function queryDatabaseCallback() {
    const client = new Client(connectionConfig);
    
    // Connect
    client.connect((err) => {
        if (err) {
            console.error('Connection failed:', err);
            return;
        }
        
        // Execute query
        client.query(
            'SELECT * FROM users WHERE id = $1',
            [123],
            (err, result) => {
                if (err) {
                    console.error('Query failed:', err);
                } else {
                    console.log('Query result:', result.rows);
                }
                
                // Close connection
                client.end();
            }
        );
        
        // Control returns here immediately
        // Query happens in background
    });
    
    // This executes BEFORE query completes
    console.log('Query sent to database');
}

// Key timing illustration
// ────────────────────────

console.log('1. Before database call');

queryDatabase().then(user => {
    console.log('3. Database result received:', user);
}).catch(err => {
    console.error('Database error:', err);
});

console.log('2. After database call (before result!)');

/*
Output:
1. Before database call
2. After database call (before result!)
Connected to database
Query result: [...]
3. Database result received: {...}

Notice: Step 2 prints BEFORE step 3!
The database call doesn't block.
*/
```

### 2.2 Query Execution Details

```javascript
// MongoDB with mongoose
const mongoose = require('mongoose');

// Timeline of database communication
// ──────────────────────────────────

async function mongoDBExample() {
    // Step 1: Connect (network I/O)
    await mongoose.connect('mongodb://localhost:27017/myapp');
    // Blocked: Establishing TCP connection + MongoDB handshake
    // Event loop: Can handle other requests
    
    // Step 2: Create model
    const User = mongoose.model('User', userSchema);
    
    // Step 3: Query database (network I/O)
    console.log('Before find: ' + Date.now());
    
    const user = await User.findById(123);
    // Network I/O operation:
    // a) Query serialized to BSON
    // b) Sent over TCP socket (non-blocking send)
    // c) Database receives and processes
    // d) Response sent back
    // e) Response parsed from BSON
    // f) Promise resolves with JavaScript object
    
    console.log('After find: ' + Date.now());
    
    return user;
}

// Under the hood: What really happens
// ───────────────────────────────────

/*
When you call: await User.findById(123)

1. Mongoose serializes the query:
   { findOne: "users", filter: { _id: 123 } }

2. Converts to BSON (binary format MongoDB understands):
   [0x12, 0x00, 0x00, 0x00, 0x01, ...]

3. Sends over TCP socket (NON-BLOCKING):
   socket.write(bsonData)
   Returns immediately

4. Event loop resumes:
   - Can handle other requests
   - Can process timers
   - Can handle other I/O

5. MongoDB processes query on its own thread/process

6. Response sent back on TCP socket

7. libuv's network event handler triggered
   (poll phase detected data on socket)

8. Node.js receives response

9. BSON parsed to JavaScript object

10. Promise resolves
    If using async/await: await returns with object

11. Next line of your code executes
    (Could be microseconds or seconds later!)
*/

// Parallel queries
// ────────────────

async function parallelQueries() {
    // Sequential (SLOW - waits for each)
    console.time('sequential');
    const user = await User.findById(1);
    const posts = await Post.find({ userId: user._id });
    const comments = await Comment.find({ userId: user._id });
    console.timeEnd('sequential');
    // If each query takes 100ms: total = 300ms
    
    // Parallel (FAST - simultaneous)
    console.time('parallel');
    const [user2, posts2, comments2] = await Promise.all([
        User.findById(1),
        Post.find({ userId: 1 }),
        Comment.find({ userId: 1 })
    ]);
    console.timeEnd('parallel');
    // All queries sent simultaneously: total ≈ 100ms
}

// Query result as stream
// ─────────────────────

async function streamResults() {
    // Getting 1 million records
    
    // BAD: Load all into memory
    const allUsers = await User.find();
    // Memory usage: huge!
    
    // GOOD: Stream results
    const cursor = User.find().cursor();
    
    cursor.on('data', (user) => {
        // Process one user at a time
        console.log('Processing:', user.name);
        // Memory usage: constant!
    });
    
    cursor.on('end', () => {
        console.log('All users processed');
    });
}
```

### 2.3 Transaction and Multi-Query Operations

```javascript
// PostgreSQL with transaction support
const { Client } = require('pg');

async function transactionExample() {
    const client = new Client(connectionConfig);
    
    try {
        await client.connect();
        
        // Start transaction
        await client.query('BEGIN');
        
        // Query 1: Debit account
        await client.query(
            'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
            [100, 'account1']
        );
        
        // Query 2: Credit account
        await client.query(
            'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
            [100, 'account2']
        );
        
        // Commit all or nothing
        await client.query('COMMIT');
        
        console.log('Transfer successful');
        
    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error('Transfer failed:', error);
    } finally {
        await client.end();
    }
}

/*
Transaction flow:
1. BEGIN - Start transaction block
2. Query 1 - Buffered in transaction
3. Query 2 - Buffered in transaction  
4. COMMIT - All queries executed atomically
   
If error between BEGIN and COMMIT:
   - ROLLBACK - Cancel all changes

This ensures data integrity!
*/
```

---

## 3. Connection Management: Opening and Closing

### 3.1 Connection Lifecycle

```javascript
/*
CONNECTION LIFECYCLE
───────────────────

┌─────────────────────────────────┐
│ 1. CONNECTION POOL CREATED      │
│    - Config: max 10 connections │
│    - Initial: 0 connections     │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 2. ON-DEMAND CONNECTION CREATION│
│    - First query arrives        │
│    - Create connection #1       │
│    - Establish TCP socket       │
│    - Perform handshake          │
│    - Ready for queries          │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 3. QUERY EXECUTION              │
│    - Send query #1 on conn #1   │
│    - Event loop continues       │
│    - Query 2 arrives            │
│    - Use same connection        │
│      (if available) or create #2│
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 4. CONNECTION POOLING           │
│    - Active connections: 2-5    │
│    - Idle connections: kept     │
│    - Max connections: don't     │
│      exceed limit               │
│    - Queue: pending queries     │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 5. IDLE TIMEOUT                 │
│    - Idle for 30 mins?          │
│    - Close connection           │
│    - Free up resources          │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 6. CONNECTION REUSE             │
│    - New query needs connection │
│    - Check pool for idle conn   │
│    - Found idle connection      │
│    - Reuse (fast, no handshake!)│
│    - If no idle, wait in queue  │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ 7. APPLICATION SHUTDOWN         │
│    - Drain active connections   │
│    - Reject new queries         │
│    - Close all connections      │
│    - Free all resources         │
└─────────────────────────────────┘
*/

// PostgreSQL Connection Pool Example
// ───────────────────────────────────

const { Pool } = require('pg');

// Create pool (not individual clients)
const pool = new Pool({
    user: 'dbuser',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    
    // Pool configuration
    max: 20,                      // Max connections
    idleTimeoutMillis: 30000,     // Close idle after 30s
    connectionTimeoutMillis: 2000, // Fail if can't connect in 2s
});

// Acquiring connection from pool
async function queryUsingPool() {
    const client = await pool.connect();
    // ↑ Either gets existing idle connection OR creates new one
    
    try {
        const result = await client.query('SELECT * FROM users LIMIT 1');
        console.log(result.rows);
        
    } finally {
        // CRITICAL: Release connection back to pool
        client.release();
        // ↑ Connection now available for other queries
    }
}

// Timeline with pool
// ──────────────────

/*
Query 1: pool.connect()     → t=0ms   Create conn #1 (handshake: 50ms)
Query 1: execute            → t=50ms  Send query
Query 1: get result         → t=150ms Receive result
Query 1: client.release()   → t=151ms Return to pool (idle)

Query 2: pool.connect()     → t=10ms  Waiting... conn #1 still in use
Query 2: pool.connect()     → t=151ms Get conn #1 from pool (instant!)
Query 2: execute            → t=151ms Send query
Query 2: get result         → t=251ms Receive result

Without pooling:
Query 2: Would need NEW connection → 50ms handshake overhead!

With pooling: NO handshake, instant reuse!
*/

// Direct connection (NO pooling) - WRONG for multiple queries
// ────────────────────────────────────────────────────────────

const { Client } = require('pg');

// ❌ BAD: Creates new connection for each query
async function badQueryPattern() {
    for (let i = 0; i < 100; i++) {
        const client = new Client(connectionConfig);
        await client.connect(); // ⚠️ NEW connection, handshake 50ms
        const result = await client.query('SELECT 1');
        await client.end(); // ⚠️ CLOSES connection
        // Total per query: ~100ms (50ms handshake + 50ms query)
    }
    // 100 queries × 100ms = 10 seconds!
}

// ✅ GOOD: Reuse connections via pool
async function goodQueryPattern() {
    for (let i = 0; i < 100; i++) {
        const result = await pool.query('SELECT 1');
        // Uses pooled connection (instant reuse, ~50ms per query)
    }
    // 100 queries × 50ms = 5 seconds! (2x faster)
}

// Graceful shutdown with pool
// ────────────────────────────

async function shutdownDatabase() {
    console.log('Shutting down database connections...');
    
    // 1. Stop accepting new queries
    // 2. Wait for active queries to complete
    // 3. Close all connections
    
    await pool.end();
    console.log('All connections closed');
}

process.on('SIGTERM', shutdownDatabase);
process.on('SIGINT', shutdownDatabase);
```

### 3.2 Connection Pool Monitoring

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: 'dbuser',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    max: 20
});

// Monitor pool health
// ──────────────────

setInterval(() => {
    console.log('Pool status:');
    console.log('  Total connections: ' + pool.totalCount);
    // Total connections created (idle + active)
    
    console.log('  Idle connections: ' + pool.idleCount);
    // Available connections ready for queries
    
    console.log('  Active queries: ' + (pool.totalCount - pool.idleCount));
    // Connections currently executing queries
    
    console.log('  Queue length: ' + (pool._queue?.length || 0));
    // Queries waiting for available connection
}, 5000);

// Monitor connection errors
// ────────────────────────

pool.on('error', (error, client) => {
    console.error('Unexpected connection error:', error);
    // Connection became invalid unexpectedly
});

pool.on('connect', () => {
    console.log('New connection created');
});

pool.on('remove', () => {
    console.log('Connection removed from pool');
});

// Connection validation (health check)
// ────────────────────────────────────

async function validateConnection() {
    const client = await pool.connect();
    
    try {
        // Quick health check query
        await client.query('SELECT 1');
        console.log('Connection is healthy');
    } catch (error) {
        console.error('Connection is dead:', error);
        client.release(true); // Force remove from pool
        return;
    }
    
    client.release();
}

// Run validation periodically
setInterval(validateConnection, 30000);
```

### 3.3 Connection vs ConnectionPool in Different Databases

```javascript
// PostgreSQL - Connection Pool (recommended for web apps)
// ──────────────────────────────────────────────────────

const { Pool } = require('pg');

const pgPool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// MongoDB - Connection Pool (built-in)
// ───────────────────────────────────

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp', {
    maxPoolSize: 10,        // Max connections
    minPoolSize: 5,         // Min to keep alive
    maxIdleTimeMS: 30000,   // Close after 30s idle
});

// Redis - Connection Pool
// ──────────────────────

const redis = require('redis');

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    
    // Connection pooling
    connectionPool: {
        min: 2,
        max: 10
    }
});

// MySQL - Connection Pool
// ──────────────────────

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'password',
    database: 'myapp',
    
    waitForConnections: true,
    connectionLimit: 10,        // Max connections
    queueLimit: 0               // Unlimited queue
});

// Usage
const connection = await pool.getConnection();
try {
    const [rows] = await connection.query('SELECT * FROM users');
} finally {
    connection.release();
}
```

### 3.4 Real-World Example: Complete Request-Database Flow

```javascript
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000
});

// Single request handling complete flow
// ─────────────────────────────────────

app.get('/api/users/:id', async (req, res) => {
    console.log(`[${Date.now()}] Request: GET /api/users/${req.params.id}`);
    
    // Step 1: Get connection from pool
    // (May be instant reuse or 50ms new connection)
    const client = await pool.connect();
    console.log(`[${Date.now()}] Got connection from pool`);
    
    try {
        // Step 2: Execute query
        // (This is async - event loop free to handle other requests)
        const result = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [req.params.id]
        );
        console.log(`[${Date.now()}] Query completed`);
        
        // Step 3: Send response
        res.json(result.rows[0]);
        console.log(`[${Date.now()}] Response sent`);
        
    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        // Step 4: Release connection back to pool
        client.release();
        console.log(`[${Date.now()}] Connection returned to pool`);
    }
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

/*
Timeline with 3 concurrent requests:

t=0ms:    Request 1 arrives (GET /api/users/1)
t=0ms:    Request 2 arrives (GET /api/users/2)
t=0ms:    Request 3 arrives (GET /api/users/3)

t=0ms:    Request 1 handler: Get connection (reuse, instant)
          Request 1 handler: Send query
          Control returns to event loop

t=1ms:    Request 2 handler: Get connection (reuse, instant)
          Request 2 handler: Send query
          Control returns to event loop

t=2ms:    Request 3 handler: Get connection (reuse, instant)
          Request 3 handler: Send query
          Control returns to event loop

t=50ms:   Query 1 result arrives
          Request 1 callback: Process result
          Request 1: Send response
          Connection returned to pool

t=55ms:   Query 2 result arrives
          Request 2 callback: Process result
          Request 2: Send response
          Connection returned to pool

t=60ms:   Query 3 result arrives
          Request 3 callback: Process result
          Request 3: Send response
          Connection returned to pool

Total time: ~60ms
All 3 requests handled CONCURRENTLY!
3 connections reused from pool (no overhead)

Without pooling:
- Each request needs new connection (~50ms handshake)
- Total: 150ms+ (3x slower!)
*/
```

---

## Summary

### Request Handling

- **Non-blocking**: Request handler returns immediately, async operations queued
- **Event loop**: Coordinates all I/O operations and callbacks
- **Concurrent**: Hundreds/thousands of requests on single thread
- **Streams**: req/res are streams for memory-efficient processing

### Database Communication

- **Async I/O**: Query sent to database, event loop continues
- **Driver**: JavaScript library that manages protocol and results
- **Network**: TCP socket communication (fast, binary protocol)
- **Callback/Promise**: Results delivered when database responds

### Connection Management

- **Pool**: Maintains reusable connections (critical for performance)
- **Lifecycle**: Create, idle, reuse, timeout, close
- **Release**: Must return to pool after query
- **Shutdown**: Gracefully close all connections on app exit

The key insight: **Everything is async and non-blocking**. While Request 1 waits for the database, Requests 2-100 are being processed. This is what makes Node.js powerful for I/O-heavy applications!
