# Async Patterns in Node.js - Deep Dive

---

## 1. Understanding Asynchronous Programming

### 1.1 Why Asynchronous?

```javascript
/*
SYNCHRONOUS vs ASYNCHRONOUS
───────────────────────────

SYNCHRONOUS (Blocking):
┌─────────────┐
│  Request 1  │ ████████████ (blocked)
└─────────────┘
┌─────────────┐
│  Request 2  │           ████████████ (waiting, then blocked)
└─────────────┘
┌─────────────┐
│  Request 3  │                      ████████████ (waiting, then blocked)
└─────────────┘

ASYNCHRONOUS (Non-blocking):
┌─────────────┐
│  Request 1  │ ██──────────────────────── (start, wait for I/O, complete)
└─────────────┘
┌─────────────┐
│  Request 2  │   ██────────────────────── (start while 1 waits)
└─────────────┘
┌─────────────┐
│  Request 3  │     ██──────────────────── (start while 1&2 wait)
└─────────────┘

In Node.js:
- I/O operations (file, network, database) are async
- CPU-bound operations block (unless using workers)
- Event loop coordinates async operations
*/

const fs = require('fs');

// ❌ BLOCKING (Synchronous)
console.log('Start reading file');
const data = fs.readFileSync('large-file.txt', 'utf8');
console.log('File read complete');
console.log('Doing other work'); // Must wait for file read

// ✅ NON-BLOCKING (Asynchronous)
console.log('Start reading file');
fs.readFile('large-file.txt', 'utf8', (err, data) => {
	console.log('File read complete');
});
console.log('Doing other work'); // Executes immediately!

// Output:
// Start reading file
// Doing other work       ← Executes before file read completes
// File read complete
```

### 1.2 The Problem with Synchronous Code

```javascript
const http = require('http');
const fs = require('fs');

// ❌ BAD: Synchronous server (blocks on every request)
const badServer = http.createServer((req, res) => {
	// This blocks the entire server for ALL requests
	const data = fs.readFileSync('large-file.txt', 'utf8');

	// Expensive computation (blocks)
	let result = 0;
	for (let i = 0; i < 1000000000; i++) {
		result += i;
	}

	res.end(`Data: ${data.length} bytes, Result: ${result}`);
});

badServer.listen(3000);

// If this server gets 100 requests, they're processed one at a time
// Request 2 waits for Request 1 to finish
// Request 3 waits for Requests 1 and 2 to finish
// etc.

// ✅ GOOD: Asynchronous server (handles concurrent requests)
const goodServer = http.createServer((req, res) => {
	// Non-blocking file read
	fs.readFile('large-file.txt', 'utf8', (err, data) => {
		if (err) {
			res.statusCode = 500;
			res.end('Error reading file');
			return;
		}

		// For CPU-intensive work, use worker threads or child processes
		// (covered later)
		res.end(`Data: ${data.length} bytes`);
	});
	// Server continues handling other requests immediately
});

goodServer.listen(3001);
```

---

## 2. Callbacks Pattern

### 2.1 Callback Basics

```javascript
/*
CALLBACK PATTERN
────────────────

A callback is a function passed as an argument to be executed later.

Node.js convention (error-first callbacks):
- First parameter is error (null if no error)
- Subsequent parameters are results
*/

// Simple callback example
function fetchUser(id, callback) {
	// Simulate async operation
	setTimeout(() => {
		const user = { id, name: 'John', email: 'john@example.com' };
		callback(null, user); // null error, user data
	}, 1000);
}

// Usage
fetchUser(123, (error, user) => {
	if (error) {
		console.error('Error:', error);
		return;
	}
	console.log('User:', user);
});

// Error-first callback pattern
const fs = require('fs');

fs.readFile('file.txt', 'utf8', (error, data) => {
	if (error) {
		// Handle error
		console.error('Failed to read file:', error);
		return;
	}

	// Success - process data
	console.log('File contents:', data);
});

// Creating your own async functions with callbacks
function delay(ms, callback) {
	setTimeout(() => {
		callback(null, `Delayed ${ms}ms`);
	}, ms);
}

delay(1000, (err, message) => {
	console.log(message); // "Delayed 1000ms" after 1 second
});

// Multiple callbacks
function fetchUserAndPosts(userId, callback) {
	// Simulate database queries
	setTimeout(() => {
		const user = { id: userId, name: 'Alice' };

		setTimeout(() => {
			const posts = [
				{ id: 1, title: 'First Post' },
				{ id: 2, title: 'Second Post' }
			];

			callback(null, user, posts);
		}, 500);
	}, 500);
}

fetchUserAndPosts(1, (err, user, posts) => {
	if (err) {
		console.error('Error:', err);
		return;
	}
	console.log('User:', user);
	console.log('Posts:', posts);
});
```

### 2.2 Callback Hell (Pyramid of Doom)

```javascript
/*
CALLBACK HELL
─────────────

Deeply nested callbacks make code hard to read and maintain
*/

// ❌ BAD: Callback hell example
const fs = require('fs');

fs.readFile('user.json', 'utf8', (err, userData) => {
	if (err) {
		console.error('Error reading user:', err);
		return;
	}

	const user = JSON.parse(userData);

	fs.readFile(`posts-${user.id}.json`, 'utf8', (err, postsData) => {
		if (err) {
			console.error('Error reading posts:', err);
			return;
		}

		const posts = JSON.parse(postsData);

		fs.readFile(`comments-${posts[0].id}.json`, 'utf8', (err, commentsData) => {
			if (err) {
				console.error('Error reading comments:', err);
				return;
			}

			const comments = JSON.parse(commentsData);

			fs.readFile(`author-${comments[0].userId}.json`, 'utf8', (err, authorData) => {
				if (err) {
					console.error('Error reading author:', err);
					return;
				}

				const author = JSON.parse(authorData);

				console.log('Final result:', {
					user,
					posts,
					comments,
					author
				});
			});
		});
	});
});

// Problems:
// 1. Hard to read (pyramid shape)
// 2. Repetitive error handling
// 3. Hard to maintain
// 4. Difficult to add error recovery logic
// 5. Can't use try-catch
```

### 2.3 Solving Callback Hell

```javascript
// ✅ SOLUTION 1: Named functions (flattening)
// ──────────────────────────────────────────

function readUser(callback) {
	fs.readFile('user.json', 'utf8', (err, data) => {
		if (err) return callback(err);
		callback(null, JSON.parse(data));
	});
}

function readPosts(user, callback) {
	fs.readFile(`posts-${user.id}.json`, 'utf8', (err, data) => {
		if (err) return callback(err);
		callback(null, user, JSON.parse(data));
	});
}

function readComments(user, posts, callback) {
	fs.readFile(`comments-${posts[0].id}.json`, 'utf8', (err, data) => {
		if (err) return callback(err);
		callback(null, user, posts, JSON.parse(data));
	});
}

function readAuthor(user, posts, comments, callback) {
	fs.readFile(`author-${comments[0].userId}.json`, 'utf8', (err, data) => {
		if (err) return callback(err);
		callback(null, {
			user,
			posts,
			comments,
			author: JSON.parse(data)
		});
	});
}

// Usage - much flatter!
readUser((err, user) => {
	if (err) return handleError(err);

	readPosts(user, (err, user, posts) => {
		if (err) return handleError(err);

		readComments(user, posts, (err, user, posts, comments) => {
			if (err) return handleError(err);

			readAuthor(user, posts, comments, (err, result) => {
				if (err) return handleError(err);
				console.log('Final result:', result);
			});
		});
	});
});

function handleError(err) {
	console.error('Error:', err);
}

// ✅ SOLUTION 2: Control flow libraries (async.js)
// ─────────────────────────────────────────────────

const async = require('async');

async.waterfall([
	// Step 1: Read user
	(callback) => {
		fs.readFile('user.json', 'utf8', callback);
	},

	// Step 2: Parse user and read posts
	(userData, callback) => {
		const user = JSON.parse(userData);
		fs.readFile(`posts-${user.id}.json`, 'utf8', (err, postsData) => {
			if (err) return callback(err);
			callback(null, user, postsData);
		});
	},

	// Step 3: Parse posts and read comments
	(user, postsData, callback) => {
		const posts = JSON.parse(postsData);
		fs.readFile(`comments-${posts[0].id}.json`, 'utf8', (err, commentsData) => {
			if (err) return callback(err);
			callback(null, user, posts, commentsData);
		});
	},

	// Step 4: Parse comments and read author
	(user, posts, commentsData, callback) => {
		const comments = JSON.parse(commentsData);
		fs.readFile(`author-${comments[0].userId}.json`, 'utf8', (err, authorData) => {
			if (err) return callback(err);
			callback(null, {
				user,
				posts,
				comments,
				author: JSON.parse(authorData)
			});
		});
	}
], (err, result) => {
	if (err) {
		console.error('Error:', err);
		return;
	}
	console.log('Final result:', result);
});

// ✅ SOLUTION 3: Parallel execution with async.js
// ────────────────────────────────────────────────

async.parallel({
	user: (callback) => {
		fs.readFile('user.json', 'utf8', callback);
	},
	posts: (callback) => {
		fs.readFile('posts.json', 'utf8', callback);
	},
	comments: (callback) => {
		fs.readFile('comments.json', 'utf8', callback);
	}
}, (err, results) => {
	if (err) {
		console.error('Error:', err);
		return;
	}

	console.log('All data loaded:', results);
	// results = { user: '...', posts: '...', comments: '...' }
});

// ✅ SOLUTION 4: async.series (sequential execution)
// ──────────────────────────────────────────────────

async.series([
	(callback) => {
		console.log('Task 1');
		setTimeout(() => callback(null, 'Result 1'), 1000);
	},
	(callback) => {
		console.log('Task 2');
		setTimeout(() => callback(null, 'Result 2'), 500);
	},
	(callback) => {
		console.log('Task 3');
		setTimeout(() => callback(null, 'Result 3'), 300);
	}
], (err, results) => {
	console.log('All tasks complete:', results);
	// ['Result 1', 'Result 2', 'Result 3']
});
```

### 2.4 Callback Best Practices

```javascript
// Best Practice 1: Always check for errors first
// ──────────────────────────────────────────────

function readConfig(callback) {
	fs.readFile('config.json', 'utf8', (err, data) => {
		// ✅ Check error first
		if (err) {
			return callback(err);
		}

		// ✅ Use try-catch for parsing
		try {
			const config = JSON.parse(data);
			callback(null, config);
		} catch (parseError) {
			callback(parseError);
		}
	});
}

// Best Practice 2: Avoid calling callback multiple times
// ──────────────────────────────────────────────────────

// ❌ BAD: Callback called twice
function badFunction(callback) {
	if (someCondition) {
		callback(null, 'result');
		// Oops! Continues executing
	}
	callback(new Error('error')); // Called again!
}

// ✅ GOOD: Use return
function goodFunction(callback) {
	if (someCondition) {
		return callback(null, 'result'); // return prevents further execution
	}
	callback(new Error('error'));
}

// Best Practice 3: Handle both sync and async errors
// ──────────────────────────────────────────────────

function safeFunction(data, callback) {
	// Synchronous error handling
	try {
		// Validation that might throw
		if (!data) {
			throw new Error('Data is required');
		}

		// Async operation
		fs.readFile(data.path, 'utf8', (err, content) => {
			if (err) return callback(err);

			try {
				// Parsing might throw
				const parsed = JSON.parse(content);
				callback(null, parsed);
			} catch (parseError) {
				callback(parseError);
			}
		});
	} catch (syncError) {
		// Handle synchronous errors
		// Important: Use setImmediate to make it async
		setImmediate(() => callback(syncError));
	}
}

// Best Practice 4: Make callbacks truly async
// ───────────────────────────────────────────

// ❌ BAD: Sometimes sync, sometimes async (Zalgo!)
function maybeAsync(callback) {
	if (cachedData) {
		callback(null, cachedData); // Synchronous!
	} else {
		fetchData((err, data) => {
			callback(err, data); // Asynchronous!
		});
	}
}

// This causes unpredictable behavior:
let finished = false;
maybeAsync((err, data) => {
	console.log('Callback executed');
	finished = true;
});
console.log('After maybeAsync');
// Output order is unpredictable!

// ✅ GOOD: Always async
function alwaysAsync(callback) {
	if (cachedData) {
		// Make it async
		process.nextTick(() => {
			callback(null, cachedData);
		});
	} else {
		fetchData((err, data) => {
			callback(err, data);
		});
	}
}

// Best Practice 5: Limit callback nesting
// ───────────────────────────────────────

// ❌ BAD: Deep nesting
getData((err, data) => {
	if (err) return handleError(err);

	processData(data, (err, processed) => {
		if (err) return handleError(err);

		saveData(processed, (err, result) => {
			if (err) return handleError(err);
			console.log('Done');
		});
	});
});

// ✅ GOOD: Extract functions
function handleData(err, data) {
	if (err) return handleError(err);
	processData(data, handleProcessed);
}

function handleProcessed(err, processed) {
	if (err) return handleError(err);
	saveData(processed, handleSaved);
}

function handleSaved(err, result) {
	if (err) return handleError(err);
	console.log('Done');
}

getData(handleData);
```

---

## 3. Promises

### 3.1 Promise Basics

```javascript
/*
PROMISES
────────

A Promise is an object representing the eventual completion or failure
of an asynchronous operation.

States:
1. Pending - initial state
2. Fulfilled - operation completed successfully
3. Rejected - operation failed

Once settled (fulfilled or rejected), a promise cannot change state.

┌─────────┐
│ Pending │
└────┬────┘
     │
     ├──► Fulfilled (resolve)
     │
     └──► Rejected (reject)
*/

// Creating a Promise
const myPromise = new Promise((resolve, reject) => {
	// Async operation
	setTimeout(() => {
		const success = true;

		if (success) {
			resolve('Operation successful'); // Fulfill
		} else {
			reject(new Error('Operation failed')); // Reject
		}
	}, 1000);
});

// Consuming a Promise
myPromise
	.then((result) => {
		console.log('Success:', result);
	})
	.catch((error) => {
		console.error('Error:', error);
	})
	.finally(() => {
		console.log('Promise settled (cleanup)');
	});

// Promise vs Callback comparison
// ───────────────────────────────

// Callback version
function fetchUserCallback(id, callback) {
	setTimeout(() => {
		if (id) {
			callback(null, { id, name: 'John' });
		} else {
			callback(new Error('Invalid ID'));
		}
	}, 1000);
}

// Promise version
function fetchUserPromise(id) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (id) {
				resolve({ id, name: 'John' });
			} else {
				reject(new Error('Invalid ID'));
			}
		}, 1000);
	});
}

// Usage comparison
// ────────────────

// Callback
fetchUserCallback(123, (err, user) => {
	if (err) {
		console.error(err);
		return;
	}
	console.log(user);
});

// Promise
fetchUserPromise(123)
	.then(user => console.log(user))
	.catch(err => console.error(err));
```

### 3.2 Promise Chaining

```javascript
// Sequential promise execution
// ────────────────────────────

function fetchUser(id) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ id, name: 'Alice' });
		}, 500);
	});
}

function fetchPosts(userId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve([
				{ id: 1, userId, title: 'Post 1' },
				{ id: 2, userId, title: 'Post 2' }
			]);
		}, 500);
	});
}

function fetchComments(postId) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve([
				{ id: 1, postId, text: 'Great post!' },
				{ id: 2, postId, text: 'Thanks for sharing!' }
			]);
		}, 500);
	});
}

// ✅ Promise chaining (much cleaner than callbacks!)
fetchUser(1)
	.then(user => {
		console.log('User:', user);
		return fetchPosts(user.id);
	})
	.then(posts => {
		console.log('Posts:', posts);
		return fetchComments(posts[0].id);
	})
	.then(comments => {
		console.log('Comments:', comments);
	})
	.catch(error => {
		console.error('Error in chain:', error);
	})
	.finally(() => {
		console.log('Chain complete');
	});

// Returning values in promise chain
// ─────────────────────────────────

Promise.resolve(5)
	.then(num => {
		console.log(num); // 5
		return num * 2;   // Return value
	})
	.then(num => {
		console.log(num); // 10
		return num + 3;
	})
	.then(num => {
		console.log(num); // 13
	});

// Returning promises in chain
// ───────────────────────────

Promise.resolve(1)
	.then(num => {
		console.log(num); // 1
		// Return a promise
		return new Promise(resolve => {
			setTimeout(() => resolve(num * 2), 1000);
		});
	})
	.then(num => {
		console.log(num); // 2 (after 1 second)
		return Promise.resolve(num + 3);
	})
	.then(num => {
		console.log(num); // 5
	});

// Collecting results from chain
// ─────────────────────────────

let user, posts;

fetchUser(1)
	.then(userData => {
		user = userData;
		return fetchPosts(user.id);
	})
	.then(postsData => {
		posts = postsData;
		return fetchComments(posts[0].id);
	})
	.then(comments => {
		console.log('Full data:', { user, posts, comments });
	});

// Better: Using Promise.all to avoid intermediate variables
Promise.all([
	fetchUser(1),
	fetchPosts(1),
	fetchComments(1)
])
	.then(([user, posts, comments]) => {
		console.log('Full data:', { user, posts, comments });
	});
```

### 3.3 Promise Static Methods

```javascript
// Promise.all() - Wait for all promises
// ─────────────────────────────────────

const promise1 = Promise.resolve(3);
const promise2 = new Promise(resolve => setTimeout(() => resolve(42), 1000));
const promise3 = Promise.resolve('foo');

Promise.all([promise1, promise2, promise3])
	.then(results => {
		console.log(results); // [3, 42, 'foo'] after 1 second
	});

// If ANY promise rejects, Promise.all rejects
Promise.all([
	Promise.resolve(1),
	Promise.reject(new Error('Failed')),
	Promise.resolve(3)
])
	.then(results => {
		console.log('Success:', results); // Never called
	})
	.catch(error => {
		console.error('Error:', error); // Error: Failed
	});

// Practical example: Parallel data fetching
Promise.all([
	fetch('/api/user'),
	fetch('/api/posts'),
	fetch('/api/comments')
])
	.then(responses => Promise.all(responses.map(r => r.json())))
	.then(([user, posts, comments]) => {
		console.log('All data loaded:', { user, posts, comments });
	})
	.catch(error => {
		console.error('Failed to load data:', error);
	});

// Promise.allSettled() - Wait for all, regardless of outcome
// ──────────────────────────────────────────────────────────

Promise.allSettled([
	Promise.resolve(1),
	Promise.reject(new Error('Failed')),
	Promise.resolve(3)
])
	.then(results => {
		console.log(results);
		/*
        [
            { status: 'fulfilled', value: 1 },
            { status: 'rejected', reason: Error: Failed },
            { status: 'fulfilled', value: 3 }
        ]
        */

		// Process results
		results.forEach(result => {
			if (result.status === 'fulfilled') {
				console.log('Success:', result.value);
			} else {
				console.error('Error:', result.reason);
			}
		});
	});

// Promise.race() - First to settle wins
// ─────────────────────────────────────

Promise.race([
	new Promise(resolve => setTimeout(() => resolve('fast'), 100)),
	new Promise(resolve => setTimeout(() => resolve('slow'), 500))
])
	.then(result => {
		console.log(result); // 'fast' after 100ms
	});

// Timeout implementation using race
function withTimeout(promise, ms) {
	const timeout = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Timeout')), ms);
	});

	return Promise.race([promise, timeout]);
}

// Usage
const slowOperation = new Promise(resolve => {
	setTimeout(() => resolve('Done'), 5000);
});

withTimeout(slowOperation, 2000)
	.then(result => console.log(result))
	.catch(error => console.error(error)); // Error: Timeout after 2s

// Promise.any() - First fulfilled promise
// ───────────────────────────────────────

Promise.any([
	Promise.reject(new Error('Error 1')),
	new Promise(resolve => setTimeout(() => resolve('Success'), 100)),
	new Promise(resolve => setTimeout(() => resolve('Another success'), 200))
])
	.then(result => {
		console.log(result); // 'Success' (first fulfilled)
	})
	.catch(error => {
		console.error('All failed:', error);
	});

// If all reject, Promise.any rejects with AggregateError
Promise.any([
	Promise.reject(new Error('Error 1')),
	Promise.reject(new Error('Error 2')),
	Promise.reject(new Error('Error 3'))
])
	.catch(error => {
		console.log(error instanceof AggregateError); // true
		console.log(error.errors); // [Error: Error 1, Error: Error 2, Error: Error 3]
	});

// Promise.resolve() and Promise.reject()
// ──────────────────────────────────────

// Create immediately resolved promise
const resolved = Promise.resolve(42);
resolved.then(value => console.log(value)); // 42

// Create immediately rejected promise
const rejected = Promise.reject(new Error('Failed'));
rejected.catch(error => console.error(error)); // Error: Failed

// Useful for converting values to promises
function maybeAsync(value) {
	if (value instanceof Promise) {
		return value;
	}
	return Promise.resolve(value);
}
```

### 3.4 Promise Error Handling

```javascript
// Error propagation in promise chains
// ───────────────────────────────────

Promise.resolve(1)
	.then(num => {
		console.log(num); // 1
		return num * 2;
	})
	.then(num => {
		console.log(num); // 2
		throw new Error('Something went wrong');
	})
	.then(num => {
		console.log('This will not execute');
	})
	.catch(error => {
		console.error('Caught error:', error.message);
		// Can recover from error
		return 'recovered value';
	})
	.then(value => {
		console.log('Recovered:', value); // 'recovered value'
	});

// Multiple catch handlers
// ───────────────────────

fetchUser(1)
	.then(user => {
		return fetchPosts(user.id);
	})
	.catch(error => {
		// Handle user fetch error
		console.error('Failed to fetch user:', error);
		// Throw to propagate or return to recover
		throw error;
	})
	.then(posts => {
		return fetchComments(posts[0].id);
	})
	.catch(error => {
		// Handle posts or comments error
		console.error('Failed to fetch posts/comments:', error);
	});

// Catch with error type checking
// ──────────────────────────────

class NetworkError extends Error {
	constructor(message) {
		super(message);
		this.name = 'NetworkError';
	}
}

class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ValidationError';
	}
}

fetchData()
	.catch(error => {
		if (error instanceof NetworkError) {
			console.error('Network issue:', error);
			// Retry logic
			return retryFetch();
		} else if (error instanceof ValidationError) {
			console.error('Validation failed:', error);
			// Handle validation error differently
			return defaultData;
		} else {
			// Unknown error, rethrow
			throw error;
		}
	});

// Unhandled promise rejections
// ────────────────────────────

// ❌ BAD: Unhandled rejection
Promise.reject(new Error('Unhandled'));
// Will cause warning or crash depending on Node.js version

// Global handlers
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise);
	console.error('Reason:', reason);
	// Log to error tracking service
	// DON'T rely on this - always handle rejections properly!
});

process.on('rejectionHandled', (promise) => {
	console.log('Rejection handled late:', promise);
});

// ✅ GOOD: Always handle rejections
Promise.reject(new Error('Handled'))
	.catch(error => {
		console.error('Properly handled:', error);
	});

// Finally block (cleanup)
// ──────────────────────

let connection;

connectToDatabase()
	.then(conn => {
		connection = conn;
		return connection.query('SELECT * FROM users');
	})
	.then(results => {
		console.log('Query results:', results);
	})
	.catch(error => {
		console.error('Database error:', error);
	})
	.finally(() => {
		// Always executed, whether success or failure
		if (connection) {
			connection.close();
			console.log('Connection closed');
		}
	});
```

### 3.5 Converting Callbacks to Promises

```javascript
const fs = require('fs');
const { promisify } = require('util');

// Manual promisification
// ─────────────────────

function readFilePromise(path, encoding) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, encoding, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

// Usage
readFilePromise('file.txt', 'utf8')
	.then(data => console.log(data))
	.catch(error => console.error(error));

// Using util.promisify (easier)
// ─────────────────────────────

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Now they return promises!
readFile('file.txt', 'utf8')
	.then(data => console.log(data))
	.catch(error => console.error(error));

// Promisify custom functions
// ──────────────────────────

function oldStyleFunction(arg1, arg2, callback) {
	setTimeout(() => {
		if (arg1 && arg2) {
			callback(null, arg1 + arg2);
		} else {
			callback(new Error('Invalid arguments'));
		}
	}, 1000);
}

const newStyleFunction = promisify(oldStyleFunction);

newStyleFunction(5, 3)
	.then(result => console.log(result)) // 8
	.catch(error => console.error(error));

// Promisify entire modules
// ────────────────────────

const fsPromises = require('fs').promises;

// All fs methods now return promises
fsPromises.readFile('file.txt', 'utf8')
	.then(data => console.log(data));

// Or manually create wrapper
const fsAsync = {
	readFile: promisify(fs.readFile),
	writeFile: promisify(fs.writeFile),
	readdir: promisify(fs.readdir),
	stat: promisify(fs.stat)
};

// Generic promisify function
// ──────────────────────────

function promisifyCustom(fn) {
	return function(...args) {
		return new Promise((resolve, reject) => {
			fn(...args, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	};
}
```

---

## 4. Async/Await

### 4.1 Async/Await Basics

```javascript
/*
ASYNC/AWAIT
───────────

Syntactic sugar over Promises that makes async code look synchronous.

Key rules:
1. 'await' can only be used inside 'async' functions
2. 'async' function always returns a Promise
3. 'await' pauses execution until Promise settles
4. Errors can be caught with try-catch
*/

// Basic async function
async function fetchUser(id) {
	// Return value is wrapped in Promise.resolve()
	return { id, name: 'John' };
}

console.log(fetchUser(1)); // Promise { { id: 1, name: 'John' } }

fetchUser(1).then(user => console.log(user)); // { id: 1, name: 'John' }

// Using await
async function getUser() {
	const user = await fetchUser(1); // Waits for promise
	console.log(user); // { id: 1, name: 'John' }
	return user;
}

getUser();

// Comparison: Promises vs Async/Await
// ───────────────────────────────────

// PROMISES
function getUserDataPromises(id) {
	return fetchUser(id)
		.then(user => {
			return fetchPosts(user.id);
		})
		.then(posts => {
			return fetchComments(posts[0].id);
		})
		.then(comments => {
			return { user, posts, comments };
		})
		.catch(error => {
			console.error('Error:', error);
			throw error;
		});
}

// ASYNC/AWAIT (much more readable!)
async function getUserDataAsync(id) {
	try {
		const user = await fetchUser(id);
		const posts = await fetchPosts(user.id);
		const comments = await fetchComments(posts[0].id);

		return { user, posts, comments };
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
}
```

### 4.2 Error Handling with Async/Await

```javascript
// Try-catch for error handling
// ────────────────────────────

async function handleErrors() {
	try {
		const data = await fetchData();
		const processed = await processData(data);
		const saved = await saveData(processed);

		return saved;
	} catch (error) {
		console.error('Error occurred:', error);
		throw error; // Re-throw or handle
	}
}

// Multiple try-catch blocks
// ─────────────────────────

async function complexOperation() {
	let user, posts;

	try {
		user = await fetchUser(1);
	} catch (error) {
		console.error('Failed to fetch user:', error);
		user = getDefaultUser();
	}

	try {
		posts = await fetchPosts(user.id);
	} catch (error) {
		console.error('Failed to fetch posts:', error);
		posts = [];
	}

	return { user, posts };
}

// Finally block for cleanup
// ─────────────────────────

async function queryDatabase() {
	const connection = await connectToDatabase();

	try {
		const results = await connection.query('SELECT * FROM users');
		return results;
	} catch (error) {
		console.error('Query failed:', error);
		throw error;
	} finally {
		// Always runs, even if error thrown
		await connection.close();
		console.log('Connection closed');
	}
}

// Handling specific error types
// ─────────────────────────────

class NetworkError extends Error {
}

class DatabaseError extends Error {
}

async function smartErrorHandling() {
	try {
		const data = await riskyOperation();
		return data;
	} catch (error) {
		if (error instanceof NetworkError) {
			console.log('Network issue, retrying...');
			return await retryOperation();
		} else if (error instanceof DatabaseError) {
			console.log('Database issue, using cache...');
			return await getCachedData();
		} else {
			console.error('Unknown error:', error);
			throw error;
		}
	}
}

// Wrapper for safe async calls
// ────────────────────────────

async function safeAsync(promise) {
	try {
		const data = await promise;
		return [null, data]; // [error, data]
	} catch (error) {
		return [error, null];
	}
}

// Usage
async function example() {
	const [error, user] = await safeAsync(fetchUser(1));

	if (error) {
		console.error('Error:', error);
		return;
	}

	console.log('User:', user);
}

// Another pattern (Go-style)
function to(promise) {
	return promise
		.then(data => [null, data])
		.catch(error => [error, null]);
}

async function example2() {
	const [error, user] = await to(fetchUser(1));

	if (error) {
		console.error('Error:', error);
		return;
	}

	console.log('User:', user);
}
```

### 4.3 Parallel Execution with Async/Await

```javascript
// ❌ BAD: Sequential execution (slow)
async function sequentialSlow() {
	const user = await fetchUser(1);      // Wait 1s
	const posts = await fetchPosts(1);    // Wait 1s
	const comments = await fetchComments(1); // Wait 1s
	// Total: 3 seconds

	return { user, posts, comments };
}

// ✅ GOOD: Parallel execution with Promise.all
async function parallelFast() {
	const [user, posts, comments] = await Promise.all([
		fetchUser(1),
		fetchPosts(1),
		fetchComments(1)
	]);
	// Total: 1 second (all run in parallel)

	return { user, posts, comments };
}

// Start promises before awaiting
async function parallelManual() {
	// Start all promises immediately
	const userPromise = fetchUser(1);
	const postsPromise = fetchPosts(1);
	const commentsPromise = fetchComments(1);

	// Then await them
	const user = await userPromise;
	const posts = await postsPromise;
	const comments = await commentsPromise;

	return { user, posts, comments };
}

// Dependent vs independent operations
// ───────────────────────────────────

async function mixedExecution() {
	// Independent - can run in parallel
	const [settings, preferences] = await Promise.all([
		fetchSettings(),
		fetchPreferences()
	]);

	// Dependent - must run sequentially
	const user = await fetchUser(1);
	const posts = await fetchPosts(user.id); // Depends on user
	const comments = await fetchComments(posts[0].id); // Depends on posts

	return { user, posts, comments, settings, preferences };
}

// Processing arrays in parallel
// ─────────────────────────────

const userIds = [1, 2, 3, 4, 5];

// ❌ BAD: Sequential (slow)
async function processSequential() {
	const users = [];

	for (const id of userIds) {
		const user = await fetchUser(id); // Each waits for previous
		users.push(user);
	}

	return users;
}

// ✅ GOOD: Parallel with Promise.all
async function processParallel() {
	const userPromises = userIds.map(id => fetchUser(id));
	const users = await Promise.all(userPromises);
	return users;
}

// Or more concisely:
async function processParallelConcise() {
	return await Promise.all(userIds.map(fetchUser));
}

// Controlled concurrency (limit parallel requests)
// ────────────────────────────────────────────────

async function processWithConcurrencyLimit(items, limit, asyncFn) {
	const results = [];
	const executing = [];

	for (const item of items) {
		const promise = asyncFn(item).then(result => {
			executing.splice(executing.indexOf(promise), 1);
			return result;
		});

		results.push(promise);
		executing.push(promise);

		if (executing.length >= limit) {
			await Promise.race(executing);
		}
	}

	return await Promise.all(results);
}

// Usage: Process 100 users with max 5 concurrent requests
const userIds = Array.from({ length: 100 }, (_, i) => i + 1);
const users = await processWithConcurrencyLimit(userIds, 5, fetchUser);

// Using p-limit library (recommended)
const pLimit = require('p-limit');

const limit = pLimit(5); // Max 5 concurrent

const users = await Promise.all(
	userIds.map(id => limit(() => fetchUser(id)))
);
```

### 4.4 Advanced Async Patterns

```javascript
// Async iteration (for await...of)
// ────────────────────────────────

async function* asyncGenerator() {
	for (let i = 0; i < 5; i++) {
		await new Promise(resolve => setTimeout(resolve, 100));
		yield i;
	}
}

async function consumeAsyncGenerator() {
	for await (const value of asyncGenerator()) {
		console.log(value); // 0, 1, 2, 3, 4 (with 100ms delay each)
	}
}

// Processing streams asynchronously
const fs = require('fs');
const readline = require('readline');

async function processLargeFile(filePath) {
	const fileStream = fs.createReadStream(filePath);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl) {
		// Process each line asynchronously
		await processLine(line);
	}

	console.log('File processed');
}

// Retry logic with async/await
// ────────────────────────────

async function retry(fn, maxAttempts = 3, delay = 1000) {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			if (attempt === maxAttempts) {
				throw error;
			}

			console.log(`Attempt ${attempt} failed, retrying...`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
}

// Usage
const data = await retry(() => fetchFromUnreliableAPI(), 5, 2000);

// Exponential backoff retry
async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000) {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			if (attempt === maxAttempts) {
				throw error;
			}

			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.log(`Attempt ${attempt} failed, waiting ${delay}ms...`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
}

// Timeout wrapper
// ───────────────

async function withTimeout(promise, ms) {
	const timeout = new Promise((_, reject) => {
		setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
	});

	return Promise.race([promise, timeout]);
}

// Usage
try {
	const result = await withTimeout(slowOperation(), 5000);
	console.log(result);
} catch (error) {
	if (error.message.includes('Timeout')) {
		console.error('Operation timed out');
	} else {
		throw error;
	}
}

// Debounce async function
// ───────────────────────

function debounce(fn, delay) {
	let timeoutId;

	return function(...args) {
		clearTimeout(timeoutId);

		return new Promise((resolve, reject) => {
			timeoutId = setTimeout(async () => {
				try {
					const result = await fn(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, delay);
		});
	};
}

// Usage
const debouncedSearch = debounce(async (query) => {
	const results = await searchAPI(query);
	return results;
}, 300);

// Memoization for async functions
// ────────────────────────────────

function memoizeAsync(fn) {
	const cache = new Map();

	return async function(...args) {
		const key = JSON.stringify(args);

		if (cache.has(key)) {
			console.log('Cache hit');
			return cache.get(key);
		}

		console.log('Cache miss');
		const result = await fn(...args);
		cache.set(key, result);
		return result;
	};
}

const memoizedFetch = memoizeAsync(fetchUser);

await memoizedFetch(1); // Cache miss - fetches from API
await memoizedFetch(1); // Cache hit - returns cached value

// Queue for sequential async operations
// ─────────────────────────────────────

class AsyncQueue {
	constructor() {
		this.queue = [];
		this.processing = false;
	}

	async add(asyncFn) {
		return new Promise((resolve, reject) => {
			this.queue.push({ asyncFn, resolve, reject });
			this.process();
		});
	}

	async process() {
		if (this.processing || this.queue.length === 0) {
			return;
		}

		this.processing = true;
		const { asyncFn, resolve, reject } = this.queue.shift();

		try {
			const result = await asyncFn();
			resolve(result);
		} catch (error) {
			reject(error);
		} finally {
			this.processing = false;
			this.process(); // Process next
		}
	}
}

// Usage
const queue = new AsyncQueue();

queue.add(() => fetchUser(1)).then(console.log);
queue.add(() => fetchUser(2)).then(console.log);
queue.add(() => fetchUser(3)).then(console.log);
// Executes sequentially even though added simultaneously
```

### 4.5 Common Async/Await Pitfalls

```javascript
// ❌ PITFALL 1: Forgetting await
// ──────────────────────────────

async function forgotAwait() {
	const user = fetchUser(1); // Missing await!
	console.log(user); // Promise object, not user data
}

// ✅ FIX
async function rememberedAwait() {
	const user = await fetchUser(1);
	console.log(user); // Actual user data
}

// ❌ PITFALL 2: Sequential when parallel would work
// ─────────────────────────────────────────────────

async function unnecessarySequential() {
	const users = await fetchUsers();        // 1s
	const posts = await fetchPosts();        // 1s
	const comments = await fetchComments();  // 1s
	// Total: 3s (could be 1s!)
}

// ✅ FIX
async function properParallel() {
	const [users, posts, comments] = await Promise.all([
		fetchUsers(),
		fetchPosts(),
		fetchComments()
	]);
	// Total: 1s
}

// ❌ PITFALL 3: Not handling errors
// ─────────────────────────────────

async function noErrorHandling() {
	const user = await fetchUser(1); // If this throws, unhandled rejection!
	return user;
}

// ✅ FIX
async function properErrorHandling() {
	try {
		const user = await fetchUser(1);
		return user;
	} catch (error) {
		console.error('Error:', error);
		throw error; // or handle differently
	}
}

// ❌ PITFALL 4: Async in forEach
// ──────────────────────────────

async function asyncForEach() {
	const ids = [1, 2, 3];

	ids.forEach(async (id) => {
		const user = await fetchUser(id);
		console.log(user);
	});

	console.log('Done'); // Prints before users!
}

// ✅ FIX: Use for...of or Promise.all
async function properIteration() {
	const ids = [1, 2, 3];

	// Sequential
	for (const id of ids) {
		const user = await fetchUser(id);
		console.log(user);
	}

	// Or parallel
	await Promise.all(ids.map(async (id) => {
		const user = await fetchUser(id);
		console.log(user);
	}));

	console.log('Done'); // Prints after all users
}

// ❌ PITFALL 5: Mixing promises and async/await
// ─────────────────────────────────────────────

async function mixedStyle() {
	return fetchUser(1)
		.then(user => {
			return fetchPosts(user.id);
		})
		.then(async (posts) => {
			const comments = await fetchComments(posts[0].id);
			return comments;
		});
}

// ✅ FIX: Choose one style
async function consistentStyle() {
	const user = await fetchUser(1);
	const posts = await fetchPosts(user.id);
	const comments = await fetchComments(posts[0].id);
	return comments;
}

// ❌ PITFALL 6: Returning without await
// ─────────────────────────────────────

async function returnWithoutAwait() {
	try {
		return fetchUser(1); // Promise returned, try-catch won't catch errors!
	} catch (error) {
		console.error('Never caught:', error);
	}
}

// ✅ FIX
async function returnWithAwait() {
	try {
		return await fetchUser(1); // Now errors are caught
	} catch (error) {
		console.error('Properly caught:', error);
	}
}

// ❌ PITFALL 7: Floating promises
// ───────────────────────────────

async function floatingPromise() {
	fetchUser(1); // Promise created but not awaited or handled!

	const posts = await fetchPosts(1);
	return posts;
}

// ✅ FIX: Either await or handle
async function handleAllPromises() {
	const userPromise = fetchUser(1);
	const posts = await fetchPosts(1);

	// If you don't need the result immediately, await it later
	const user = await userPromise;

	return { user, posts };
}
```

This covers async patterns comprehensively! Would you like me to continue with:

1. **HTTP and Networking** (servers, requests, WebSockets, real-time)
2. **Express.js Framework** (routing, middleware, REST APIs)
3. **Database Integration** (MongoDB, PostgreSQL, ORMs)
4. **Testing** (unit tests, integration tests, mocking)
5. **Performance & Scaling** (clustering, load balancing, caching)
