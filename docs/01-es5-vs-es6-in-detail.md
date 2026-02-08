# Comprehensive Comparison: ES5 vs ES6 (Continued)

# Comprehensive Comparison: ES5 vs ES6

## Historical Context

**ES5 (ECMAScript 5)** - Released December 2009

- First major update since ES3 (1999)
- Added strict mode, JSON support, array methods
- Became the stable baseline for JavaScript

**ES6 (ECMAScript 2015)** - Released June 2015

- Massive overhaul after 6 years of development
- Added 50+ new features
- Modernized JavaScript for large-scale applications
- Set the foundation for annual releases (ES2016, ES2017, etc.)

---

## 1. Variable Declarations and Scope

### ES5: Function Scope with `var`

```javascript
// ES5 - var has function scope only
function example() {
	var x = 1;

	if (true) {
		var x = 2; // Same variable! Overwrites outer x
		console.log(x); // 2
	}

	console.log(x); // 2 (modified by if block)
}

// Hoisting issues
console.log(y); // undefined (not an error!)
var y = 5;

// Loop variable leaks
for (var i = 0; i < 3; i++) {
	setTimeout(function() {
		console.log(i); // Prints: 3, 3, 3
	}, 100);
}
console.log(i); // 3 (leaked outside loop)
```

**Problems with `var`:**

- No block scope (only function scope)
- Hoisting causes confusion
- Easy to accidentally create globals
- Loop variable leakage

### ES6: Block Scope with `let` and `const`

```javascript
// ES6 - let/const have block scope
function example() {
	let x = 1;

	if (true) {
		let x = 2; // Different variable, block-scoped
		console.log(x); // 2
	}

	console.log(x); // 1 (unchanged)
}

// Temporal Dead Zone - proper error handling
console.log(y); // ReferenceError (not undefined!)
let y = 5;

// Loop variables are properly scoped
for (let i = 0; i < 3; i++) {
	setTimeout(() => {
		console.log(i); // Prints: 0, 1, 2 (correctly!)
	}, 100);
}
console.log(i); // ReferenceError (not leaked)

// const prevents reassignment
const PI = 3.14159;
PI = 3; // TypeError: Assignment to constant variable

// But object properties can still be modified
const obj = { name: "John" };
obj.name = "Jane"; // Allowed!
obj = {}; // TypeError: Assignment to constant
```

**Benefits:**

- Block scope prevents variable leakage
- Temporal Dead Zone catches errors early
- `const` provides immutable bindings
- More predictable behavior

**Verdict:** ES6's `let`/`const` are **significantly better** - they prevent bugs and make code more predictable.

---

## 2. Functions

### ES5: Function Declarations and Expressions

```javascript
// ES5 - Regular functions
function add(a, b) {
	return a + b;
}

// Function expression
var multiply = function(a, b) {
	return a * b;
};

// 'this' binding issues
var obj = {
	name: "Calculator",
	numbers: [1, 2, 3],

	double: function() {
		// 'this' is lost in nested function
		this.numbers.forEach(function(n) {
			console.log(this.name); // undefined! 'this' is wrong
		});

		// Workarounds needed:
		// 1. Store reference
		var self = this;
		this.numbers.forEach(function(n) {
			console.log(self.name); // Works
		});

		// 2. Use bind
		this.numbers.forEach(function(n) {
			console.log(this.name);
		}.bind(this));
	}
};

// No default parameters
function greet(name) {
	name = name || "World"; // Problematic: greet("") fails
	name = typeof name !== 'undefined' ? name : "World"; // Verbose
	return "Hello, " + name;
}

// No rest parameters
function sum() {
	var args = Array.prototype.slice.call(arguments);
	return args.reduce(function(a, b) {
		return a + b;
	}, 0);
}
```

### ES6: Enhanced Functions

```javascript
// ES6 - Arrow functions with lexical 'this'
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

// Implicit return for single expression
const square = x => x * x;

// Multiple statements need braces
const complexCalc = (x, y) => {
	const temp = x * 2;
	return temp + y;
};

// Lexical 'this' - no binding issues!
const obj = {
	name: "Calculator",
	numbers: [1, 2, 3],

	double() {
		// Arrow function inherits 'this' from enclosing scope
		this.numbers.forEach(n => {
			console.log(this.name); // Works perfectly!
		});
	}
};

// Default parameters - clean and intuitive
function greet(name = "World") {
	return `Hello, ${name}`;
}

greet(); // "Hello, World"
greet("John"); // "Hello, John"
greet(""); // "Hello, " (respects empty string)

// Rest parameters - elegant syntax
function sum(...numbers) {
	return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Function call with spread
Math.max(...arr1); // 3
```

**Key Differences:**

- Arrow functions fix `this` binding issues
- Default parameters are cleaner and safer
- Rest/spread operators are more intuitive than `arguments`

**Verdict:** ES6 arrow functions are **revolutionary** - they solve the `this` binding problem that plagued ES5.

---

## 3. Strings

### ES5: Concatenation and Escaping

```javascript
// ES5 - String concatenation is verbose
var name = "John";
var age = 30;
var message = "Hello, my name is " + name + " and I'm " + age + " years old.";

// Multiline strings require escaping
var html = '<div class="container">\n' +
	'  <h1>' + title + '</h1>\n' +
	'  <p>' + content + '</p>\n' +
	'</div>';

// String methods limited
var str = "Hello World";
str.indexOf("World") !== -1; // Checking substring
str.charAt(0); // Getting character
```

### ES6: Template Literals

```javascript
// ES6 - Template literals with interpolation
const name = "John";
const age = 30;
const message = `Hello, my name is ${name} and I'm ${age} years old.`;

// Multiline strings - natural syntax
const html = `
<div class="container">
  <h1>${title}</h1>
  <p>${content}</p>
</div>
`;

// Expressions in templates
const price = 19.99;
const message = `Total: $${(price * 1.2).toFixed(2)}`;

// Tagged templates - advanced feature
function highlight(strings, ...values) {
	return strings.reduce((result, str, i) => {
		return result + str + (values[i] ? `<mark>${values[i]}</mark>` : '');
	}, '');
}

const result = highlight`Name: ${name}, Age: ${age}`;

// New string methods
const str = "Hello World";
str.includes("World"); // true (cleaner than indexOf)
str.startsWith("Hello"); // true
str.endsWith("World"); // true
str.repeat(3); // "Hello WorldHello WorldHello World"
```

**Verdict:** ES6 template literals are **much more readable** and eliminate common string concatenation errors.

---

## 4. Objects

### ES5: Verbose Object Syntax

```javascript
// ES5 - Repetitive property assignment
var name = "John";
var age = 30;
var person = {
	name: name,
	age: age,
	greet: function() {
		return "Hello, I'm " + this.name;
	}
};

// Dynamic property names require multiple steps
var propName = "score";
var obj = {};
obj[propName] = 100;

// Object copying is manual
var original = { a: 1, b: 2 };
var copy = {};
for (var key in original) {
	if (original.hasOwnProperty(key)) {
		copy[key] = original[key];
	}
}

// Merging objects
function merge(target, source) {
	for (var key in source) {
		if (source.hasOwnProperty(key)) {
			target[key] = source[key];
		}
	}
	return target;
}
```

### ES6: Enhanced Object Literals

```javascript
// ES6 - Property shorthand
const name = "John";
const age = 30;
const person = {
	name,  // Shorthand for name: name
	age,   // Shorthand for age: age
	greet() {  // Method shorthand
		return `Hello, I'm ${this.name}`;
	}
};

// Computed property names - inline
const propName = "score";
const obj = {
	[propName]: 100,
	[`${propName}_max`]: 1000
};

// Object.assign() for copying and merging
const original = { a: 1, b: 2 };
const copy = Object.assign({}, original);

// Merging multiple objects
const merged = Object.assign({}, obj1, obj2, obj3);

// Object destructuring
const { name: userName, age: userAge } = person;

// With defaults
const { name = "Unknown", score = 0 } = data;

// Nested destructuring
const { address: { city, country } } = user;
```

**Verdict:** ES6 object enhancements make code **much more concise** and eliminate boilerplate.

---

## 5. Arrays

### ES5: Limited Array Operations

```javascript
// ES5 - Array methods introduced in ES5
var numbers = [1, 2, 3, 4, 5];

// Good functional methods
var doubled = numbers.map(function(n) {
	return n * 2;
});
var evens = numbers.filter(function(n) {
	return n % 2 === 0;
});
var sum = numbers.reduce(function(acc, n) {
	return acc + n;
}, 0);

// But destructuring is manual
var first = numbers[0];
var second = numbers[1];
var rest = numbers.slice(2);

// Spreading arrays is verbose
var arr1 = [1, 2];
var arr2 = [3, 4];
var combined = arr1.concat(arr2);

// Array-like to array conversion
var divs = document.querySelectorAll('div');
var divsArray = Array.prototype.slice.call(divs);
```

### ES6: Enhanced Array Operations

```javascript
// ES6 - All ES5 methods plus more
const numbers = [1, 2, 3, 4, 5];

// Array destructuring
const [first, second, ...rest] = numbers;
// first = 1, second = 2, rest = [3, 4, 5]

// Spread operator - elegant
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2];

// Array.from() - convert iterables
const divs = document.querySelectorAll('div');
const divsArray = Array.from(divs);

// With mapping
const lengths = Array.from('hello', char => char.charCodeAt(0));

// Array.of() - create arrays
Array.of(1, 2, 3); // [1, 2, 3]

// New methods
numbers.find(n => n > 3); // 4 (first match)
numbers.findIndex(n => n > 3); // 3 (index of first match)
numbers.includes(3); // true (cleaner than indexOf)

// for...of iteration
for (const num of numbers) {
	console.log(num); // Clean iteration over values
}
```

**Verdict:** ES6 adds **convenient syntax** (destructuring, spread) and **useful methods** (find, includes).

---

## 6. Object-Oriented Programming

### ES5: Prototype-Based Inheritance

```javascript
// ES5 - Verbose prototype setup
function Animal(name) {
	this.name = name;
}

Animal.prototype.speak = function() {
	return this.name + " makes a sound";
};

Animal.prototype.eat = function() {
	return this.name + " is eating";
};

// Inheritance requires manual prototype chain setup
function Dog(name, breed) {
	Animal.call(this, name); // Call parent constructor
	this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Add dog-specific methods
Dog.prototype.bark = function() {
	return this.name + " barks";
};

// Override parent method
Dog.prototype.speak = function() {
	return this.name + " barks loudly";
};

// Static methods
Dog.createPuppy = function(name) {
	return new Dog(name, "Mixed");
};

// Usage
var dog = new Dog("Rex", "Labrador");
console.log(dog.speak()); // "Rex barks loudly"
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
```

**ES5 Issues:**

- Verbose and error-prone
- Easy to forget steps (constructor reset, etc.)
- No clear way to call parent methods
- Confusing for developers from other languages

### ES6: Class Syntax

```javascript
// ES6 - Clean class syntax
class Animal {
	constructor(name) {
		this.name = name;
	}

	speak() {
		return `${this.name} makes a sound`;
	}

	eat() {
		return `${this.name} is eating`;
	}
}

// Inheritance is straightforward
class Dog extends Animal {
	constructor(name, breed) {
		super(name); // Call parent constructor
		this.breed = breed;
	}

	bark() {
		return `${this.name} barks`;
	}

	// Override parent method
	speak() {
		return `${this.name} barks loudly`;
	}

	// Call parent method
	makeNoise() {
		return super.speak() + " and " + this.bark();
	}

	// Static method
	static createPuppy(name) {
		return new Dog(name, "Mixed");
	}

	// Getters and setters
	get info() {
		return `${this.name} is a ${this.breed}`;
	}

	set ownerName(owner) {
		this._owner = owner;
	}
}

// Usage - identical behavior
const dog = new Dog("Rex", "Labrador");
console.log(dog.speak()); // "Rex barks loudly"
console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(Dog.createPuppy("Puppy")); // Static method
```

**Important:** ES6 classes are **syntactic sugar** over prototypes - they compile to ES5 prototype code. However, they
provide:

- Cleaner syntax
- Less error-prone
- Built-in `super` keyword
- Clear static method syntax
- Getter/setter support

**Verdict:** ES6 classes are **dramatically more readable** and less error-prone, even though they're ultimately the
same mechanism.

---

## 7. Modules

### ES5: No Native Module System

```javascript
// ES5 - Module Pattern (IIFE)
var MyModule = (function() {
	// Private variables
	var privateVar = "secret";
	var privateFunction = function() {
		return privateVar;
	};

	// Public API
	return {
		publicMethod: function() {
			return privateFunction();
		},
		publicVar: "public"
	};
})();

// Usage
console.log(MyModule.publicMethod());
console.log(MyModule.privateVar); // undefined

// CommonJS (Node.js only)
// mymodule.js
var privateVar = "secret";

function publicMethod() {
	return privateVar;
}

module.exports = {
	publicMethod: publicMethod
};

// main.js
var myModule = require('./mymodule');
myModule.publicMethod();

// AMD (RequireJS - browsers)
define(['dependency1', 'dependency2'], function(dep1, dep2) {
	return {
		publicMethod: function() {
		}
	};
});
```

**ES5 Problems:**

- No native browser module system
- Multiple competing standards (CommonJS, AMD, UMD)
- Synchronous loading (CommonJS) or callback hell (AMD)
- No static analysis
- Difficult dependency management

### ES6: Native Module System

```javascript
// ES6 - Native import/export
// mymodule.js
const privateVar = "secret";

export function publicMethod() {
	return privateVar;
}

export const publicVar = "public";

export default class MyClass {
	constructor() {
		this.name = "MyClass";
	}
}

// Named exports
export { publicMethod, publicVar };

// main.js
import MyClass from './mymodule.js'; // Default import
import { publicMethod, publicVar } from './mymodule.js'; // Named imports
import * as myModule from './mymodule.js'; // Namespace import
import { publicMethod as pm } from './mymodule.js'; // Aliased import

// Dynamic imports (ES2020, but part of module evolution)
const module = await import('./mymodule.js');
```

**ES6 Benefits:**

- Native browser and Node.js support
- Static analysis (tree shaking, dead code elimination)
- Asynchronous loading built-in
- Live bindings (imported values update)
- Clear, declarative syntax
- Single standard

```javascript
// Live bindings example
// counter.js
export let count = 0;

export function increment() {
	count++;
}

// main.js
import { count, increment } from './counter.js';

console.log(count); // 0
increment();
console.log(count); // 1 (live binding!)
```

**Verdict:** ES6 modules are a **game changer** - they unified JavaScript's module ecosystem and enabled modern tooling.

---

## 8. Asynchronous Programming

### ES5: Callbacks and Pyramid of Doom

```javascript
// ES5 - Callback hell
function getUserData(userId, callback) {
	setTimeout(function() {
		callback(null, { id: userId, name: "John" });
	}, 1000);
}

function getUserPosts(userId, callback) {
	setTimeout(function() {
		callback(null, [{ id: 1, title: "Post 1" }]);
	}, 1000);
}

function getPostComments(postId, callback) {
	setTimeout(function() {
		callback(null, [{ id: 1, text: "Comment 1" }]);
	}, 1000);
}

// Nested callbacks - "Pyramid of Doom"
getUserData(1, function(err, user) {
	if (err) {
		console.error(err);
		return;
	}

	getUserPosts(user.id, function(err, posts) {
		if (err) {
			console.error(err);
			return;
		}

		getPostComments(posts[0].id, function(err, comments) {
			if (err) {
				console.error(err);
				return;
			}

			console.log(comments);
		});
	});
});

// Error handling is repetitive and error-prone
```

### ES6: Promises

```javascript
// ES6 - Promises flatten the pyramid
function getUserData(userId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve({ id: userId, name: "John" });
		}, 1000);
	});
}

function getUserPosts(userId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve([{ id: 1, title: "Post 1" }]);
		}, 1000);
	});
}

function getPostComments(postId) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve([{ id: 1, text: "Comment 1" }]);
		}, 1000);
	});
}

// Promise chain - much flatter
getUserData(1)
	.then(user => getUserPosts(user.id))
	.then(posts => getPostComments(posts[0].id))
	.then(comments => console.log(comments))
	.catch(err => console.error(err)); // Single error handler!

// Promise.all - parallel execution
Promise.all([
	getUserData(1),
	getUserData(2),
	getUserData(3)
])
	.then(users => console.log(users))
	.catch(err => console.error(err));

// Promise.race - first to complete
Promise.race([
	fetch('/api/fast'),
	fetch('/api/slow')
])
	.then(response => console.log('Winner:', response));
```

**ES6 Promise Benefits:**

- Flatter code structure
- Better error handling (single catch)
- Composability (Promise.all, Promise.race)
- Standardized async pattern

**Note:** ES2017 added async/await which makes promises even better:

```javascript
// ES2017 - async/await (evolution of ES6 promises)
async function loadData() {
	try {
		const user = await getUserData(1);
		const posts = await getUserPosts(user.id);
		const comments = await getPostComments(posts[0].id);
		console.log(comments);
	} catch (err) {
		console.error(err);
	}
}
```

**Verdict:** ES6 Promises **fundamentally improved** async code - they're a new capability, not just sugar.

---

## 9. Iteration

### ES5: Limited Iteration Options

```javascript
// ES5 - for loop
var arr = [1, 2, 3];
for (var i = 0; i < arr.length; i++) {
	console.log(arr[i]);
}

// forEach (ES5 addition)
arr.forEach(function(item) {
	console.log(item);
	// Can't break or return early!
});

// for...in (iterates over keys, has issues)
for (var key in arr) {
	console.log(arr[key]); // Works but also iterates prototype properties
}

// Custom iterators require manual implementation
var iterator = {
	index: 0,
	data: [1, 2, 3],
	next: function() {
		if (this.index < this.data.length) {
			return { value: this.data[this.index++], done: false };
		}
		return { done: true };
	}
};
```

### ES6: Iterators, Generators, and for...of

```javascript
// ES6 - for...of loop (iterates over values)
const arr = [1, 2, 3];
for (const item of arr) {
	console.log(item);
	break; // Can break!
}

// Works with any iterable
for (const char of "hello") {
	console.log(char);
}

// Iterators protocol
const iterable = {
	[Symbol.iterator]() {
		let index = 0;
		const data = [1, 2, 3];

		return {
			next() {
				if (index < data.length) {
					return { value: data[index++], done: false };
				}
				return { done: true };
			}
		};
	}
};

for (const item of iterable) {
	console.log(item); // 1, 2, 3
}

// Generators - functions that can pause and resume
function* fibonacci() {
	let [a, b] = [0, 1];
	while (true) {
		yield a; // Pause here, return value
		[a, b] = [b, a + b];
	}
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2

// Generator with for...of
function* range(start, end) {
	for (let i = start; i <= end; i++) {
		yield i;
	}
}

for (const num of range(1, 5)) {
	console.log(num); // 1, 2, 3, 4, 5
}

// Infinite sequences made easy
function* naturalNumbers() {
	let n = 1;
	while (true) {
		yield n++;
	}
}
```

**Verdict:** ES6 iterators and generators are **powerful new capabilities** for lazy evaluation and custom iteration.

---

## 10. New Data Structures

### ES5: Only Objects and Arrays

```javascript
// ES5 - Objects as maps (problematic)
var map = {};
map['key1'] = 'value1';
map['key2'] = 'value2';

// Problems:
// 1. Keys are always strings
map[1] = 'one';
console.log(map['1']); // 'one' (number converted to string)

// 2. Prototype pollution
map['toString'] = 'hacked';
console.log(map.toString); // 'hacked' (overwrites method)

// 3. Can't use objects as keys
var objKey = { id: 1 };
map[objKey] = 'value'; // Key becomes "[object Object]"

// Arrays for unique values (inefficient)
var uniqueValues = [];

function addUnique(value) {
	if (uniqueValues.indexOf(value) === -1) {
		uniqueValues.push(value);
	}
}
```

### ES6: Map, Set, WeakMap, WeakSet

```javascript
// ES6 - Map: proper key-value store
const map = new Map();

// Any type as key
map.set('string', 'value1');
map.set(1, 'value2');
map.set(true, 'value3');

// Objects as keys!
const objKey = { id: 1 };
map.set(objKey, 'value4');
console.log(map.get(objKey)); // 'value4'

// Map methods
map.has('string'); // true
map.size; // 4
map.delete('string');
map.clear();

// Iteration
for (const [key, value] of map) {
	console.log(key, value);
}

map.forEach((value, key) => {
	console.log(key, value);
});

// Set: unique values collection
const set = new Set();
set.add(1);
set.add(2);
set.add(2); // Ignored (duplicate)
set.add(3);

console.log(set.size); // 3
set.has(2); // true
set.delete(2);

// Array deduplication
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// WeakMap: garbage-collection-friendly
const weakMap = new WeakMap();
let obj = { data: 'value' };
weakMap.set(obj, 'metadata');

// When obj is no longer referenced, it can be garbage collected
obj = null; // WeakMap entry is automatically removed

// Use case: private data
const privateData = new WeakMap();

class Person {
	constructor(name, ssn) {
		this.name = name;
		privateData.set(this, { ssn }); // Private SSN
	}

	getSSN() {
		return privateData.get(this).ssn;
	}
}

// WeakSet: weak references to objects
const weakSet = new WeakSet();
let obj1 = { id: 1 };
weakSet.add(obj1);
weakSet.has(obj1); // true
obj1 = null; // Object can be garbage collected
```

**Benefits:**

- Proper key-value storage without prototype issues
- Any type as key (Map)
- Efficient uniqueness (Set)
- Memory-safe references (WeakMap, WeakSet)

**Verdict:** ES6 data structures fill **critical gaps** in JavaScript's type system.

---

## 11. Symbols and Reflection

### ES5: No Private Properties or Metaprogramming

```javascript
// ES5 - "Privacy" through closures only
function createPerson(name) {
	var ssn = '123-45-6789'; // Private via closure

	return {
		name: name,
		getSSN: function() {
			return ssn;
		}
	};
}

// No way to create truly unique property keys
var obj = {};
obj['id'] = 1;
obj['id'] = 2; // Overwrites

// Limited metaprogramming
Object.defineProperty(obj, 'hidden', {
	enumerable: false,
	value: 'secret'
});
```

### ES6: Symbols and Proxies

```javascript
// ES6 - Symbols for unique keys
const ID = Symbol('id');
const obj = {
	name: 'John',
	[ID]: 12345 // Unique property key
};

console.log(obj[ID]); // 12345
console.log(obj.ID); // undefined

// Symbols don't show in normal iteration
Object.keys(obj); // ['name'] only
for (let key in obj) {
} // Only 'name'

// But accessible with Symbol-specific methods
Object.getOwnPropertySymbols(obj); // [Symbol(id)]

// Well-known symbols for metaprogramming
const collection = {
	items: [1, 2, 3],
	[Symbol.iterator]() {
		let index = 0;
		return {
			next: () => {
				if (index < this.items.length) {
					return { value: this.items[index++], done: false };
				}
				return { done: true };
			}
		};
	}
};

// Now collection is iterable
for (const item of collection) {
	console.log(item); // 1, 2, 3
}

// Proxies: intercept object operations
const handler = {
	get(target, prop) {
		console.log(`Getting ${prop}`);
		return prop in target ? target[prop] : 'default';
	},
	set(target, prop, value) {
		console.log(`Setting ${prop} to ${value}`);
		target[prop] = value;
		return true;
	}
};

const proxy = new Proxy({}, handler);
proxy.name = 'John'; // Logs: "Setting name to John"
console.log(proxy.name); // Logs: "Getting name", returns "John"
console.log(proxy.age); // Logs: "Getting age", returns "default"

// Use cases:
// 1. Validation
const validated = new Proxy({}, {
	set(target, prop, value) {
		if (prop === 'age' && typeof value !== 'number') {
			throw new TypeError('Age must be a number');
		}
		target[prop] = value;
		return true;
	}
});

// 2. Logging/debugging
// 3. Computed properties
// 4. Data binding (Vue.js uses this)

// Reflect API: standardized object operations
Reflect.get(obj, 'name'); // obj.name
Reflect.set(obj, 'name', 'Jane'); // obj.name = 'Jane'
Reflect.has(obj, 'name'); // 'name' in obj (true/false)
Reflect.deleteProperty(obj, 'name'); // delete obj.name
Reflect.ownKeys(obj); // Object.keys(obj)
Reflect.getPrototypeOf(obj); // Object.getPrototypeOf(obj)
Reflect.setPrototypeOf(obj, Person.prototype); // Object.setPrototypeOf(obj, Person.prototype)
Reflect.isExtensible(obj); // Object.isExtensible(obj)
Reflect.preventExtensions(obj); // Object.preventExtensions(obj)
Reflect.defineProperty(obj, 'name', { value: 'John' }); // Object.defineProperty(obj, 'name', { value: 'John' })
Reflect.getOwnPropertyDescriptor(obj, 'name'); // Object.getOwnPropertyDescriptor(obj, 'name')
Reflect.getOwnKeys(obj); // Object.getOwnPropertyNames(obj)
```
---

##
12.
Destructuring

###
ES5: Manual
Property / Element
Access

	```javascript
// ES5 - Extracting object properties
var person = {
	name: 'John',
	age: 30,
	address: {
		city: 'New York',
		country: 'USA'
	}
};

var name = person.name;
var age = person.age;
var city = person.address.city;

// Function parameters
function greet(person) {
	var name = person.name;
	var age = person.age;
	return 'Hello ' + name + ', you are ' + age;
}

// Array elements
var numbers = [1, 2, 3, 4, 5];
var first = numbers[0];
var second = numbers[1];
var rest = numbers.slice(2);

// Swapping variables requires temp variable
var a = 1, b = 2;
var temp = a;
a = b;
b = temp;

// Extracting from function returns
function getCoordinates() {
	return { x: 10, y: 20 };
}

var coords = getCoordinates();
var x = coords.x;
var y = coords.y;
```

### ES6: Destructuring Assignment

```javascript
// ES6 - Object destructuring
const person = {
	name: 'John',
	age: 30,
	address: {
		city: 'New York',
		country: 'USA'
	}
};

// Basic destructuring
const { name, age } = person;

// Nested destructuring
const { address: { city, country } } = person;

// Renaming variables
const { name: fullName, age: years } = person;

// Default values
const { name, occupation = 'Unknown' } = person;

// Rest properties
const { name, ...otherInfo } = person; // otherInfo = {age: 30, address: {...}}

// Function parameters - incredibly useful!
function greet({ name, age }) {
	return `Hello ${name}, you are ${age}`;
}

greet(person); // Clean and readable

// With defaults in parameters
function createUser({ name = 'Anonymous', role = 'user' } = {}) {
	return { name, role };
}

// Array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second] = numbers; // first=1, second=2

// Skip elements
const [first, , third] = numbers; // first=1, third=3

// Rest elements
const [first, ...rest] = numbers; // first=1, rest=[2,3,4,5]

// Swapping variables - elegant!
let a = 1, b = 2;
[a, b] = [b, a]; // Swapped!

// Function returns
function getCoordinates() {
	return { x: 10, y: 20 };
}

const { x, y } = getCoordinates();

// Array from function
function getRange() {
	return [1, 10];
}

const [min, max] = getRange();

// Practical examples
// 1. React hooks
const [count, setCount] = useState(0);

// 2. Importing modules
import { Component, useState, useEffect } from 'react';

// 3. Loop iteration
const users = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
for (const { name, age } of users) {
	console.log(`${name} is ${age} years old`);
}

// 4. Promise handling
fetch('/api/user')
	.then(response => response.json())
	.then(({ name, email }) => {
		console.log(`User: ${name}, Email: ${email}`);
	});
```

**Verdict:** Destructuring is **massively reduces boilerplate** and makes code more declarative and readable.

---

## 13. Enhanced Literals and Computed Properties

### ES5: Static Property Names

```javascript
// ES5 - Property names must be static
var prefix = 'user_';
var id = 123;

var obj = {
	name: 'John'
};

// Dynamic properties require separate assignment
obj[prefix + id] = 'value'; // obj.user_123 = 'value'

// Octal and binary literals unclear
var octal = parseInt('755', 8); // 493
var binary = parseInt('1010', 2); // 10

// No shorthand for methods
var calculator = {
	add: function(a, b) {
		return a + b;
	},
	multiply: function(a, b) {
		return a * b;
	}
};
```

### ES6: Computed Property Names and Enhanced Literals

```javascript
// ES6 - Computed property names
const prefix = 'user_';
const id = 123;

const obj = {
	name: 'John',
	[prefix + id]: 'value', // Computed at creation time
	[`${prefix}email`]: 'john@example.com'
};

// Dynamic method names
const methodName = 'greet';
const person = {
	name: 'John',
	[methodName]() {
		return `Hello, ${this.name}`;
	}
};
person.greet(); // "Hello, John"

// Binary and octal literals - clear syntax
const octal = 0o755; // 493
const binary = 0b1010; // 10
const hex = 0xFF; // 255

// Method shorthand
const calculator = {
	add(a, b) {
		return a + b;
	},
	multiply(a, b) {
		return a * b;
	}
};

// Combining features
const key = 'dynamicKey';
const value = 42;
const obj2 = {
	[key]: value,
	[`${key}_computed`]: value * 2,
	[Symbol.iterator]() {
		// Custom iterator
	}
};

// Practical use case: creating objects from arrays
const fields = ['name', 'email', 'age'];
const values = ['John', 'john@example.com', 30];

const user = fields.reduce((obj, field, index) => {
	obj[field] = values[index];
	return obj;
}, {});

// ES6 with computed properties
const user2 = fields.reduce((obj, field, index) => ({
	...obj,
	[field]: values[index]
}), {});
```

**Verdict:** Computed properties enable **dynamic object creation patterns** that were clunky in ES5.

---

## 14. Parameter Handling

### ES5: Limited Parameter Features

```javascript
// ES5 - Default parameters
function createUser(name, role) {
	name = name || 'Anonymous'; // Problem: empty string is falsy!
	role = typeof role !== 'undefined' ? role : 'user'; // Verbose
	return { name: name, role: role };
}

createUser('John'); // Works
createUser('', 'admin'); // Bug! name becomes 'Anonymous'

// Variable arguments
function sum() {
	var args = Array.prototype.slice.call(arguments);
	return args.reduce(function(total, n) {
		return total + n;
	}, 0);
}

sum(1, 2, 3, 4); // 10

// No way to distinguish required vs optional parameters clearly
function processData(data, options) {
	options = options || {};
	var timeout = options.timeout || 5000;
	var retries = options.retries || 3;
	// ... verbose option extraction
}
```

### ES6: Enhanced Parameter Handling

```javascript
// ES6 - Default parameters (proper)
function createUser(name = 'Anonymous', role = 'user') {
	return { name, role };
}

createUser('John'); // {name: 'John', role: 'user'}
createUser('', 'admin'); // {name: '', role: 'admin'} - respects empty string!

// Default values can reference previous parameters
function greet(name = 'User', message = `Hello, ${name}!`) {
	return message;
}

// Default values can be expressions
function getValue() {
	return 42;
}

function process(value = getValue()) {
	console.log(value);
}

// Rest parameters - clean and intuitive
function sum(...numbers) {
	return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // 10

// Rest must be last parameter
function logAll(prefix, ...messages) {
	messages.forEach(msg => console.log(prefix + msg));
}

// Destructuring parameters with defaults
function processData({
											 timeout = 5000,
											 retries = 3,
											 onSuccess = () => {
											 },
											 onError = () => {
											 }
										 } = {}) {
	console.log(`Timeout: ${timeout}, Retries: ${retries}`);
}

processData(); // Uses all defaults
processData({ timeout: 10000 }); // Override only timeout

// Practical example: configuration objects
function createServer({
												port = 3000,
												host = 'localhost',
												ssl = false,
												middleware = [],
												routes = {}
											} = {}) {
	return { port, host, ssl, middleware, routes };
}

// Named parameters pattern
function drawCircle({ x, y, radius, color = 'black', fill = true }) {
	// Clear which parameter is which
}

drawCircle({ x: 10, y: 20, radius: 5 }); // Order doesn't matter!
```

**Verdict:** ES6 parameter handling is **significantly more expressive** and reduces parameter-handling boilerplate.

---

## 15. Number and Math Enhancements

### ES5: Limited Number Utilities

```javascript
// ES5 - Type checking issues
isNaN(NaN); // true
isNaN('hello'); // true (coerces to NaN)
isNaN(undefined); // true

// No safe integer checking
var big = 9007199254740992; // Exceeds safe integer range
big + 1 === big; // true (precision lost!)

// Limited Math functions
Math.floor(4.7); // 4
Math.ceil(4.3); // 5
Math.round(4.5); // 5

// No hypot, trunc, sign, etc.
```

### ES6: Enhanced Number and Math

```javascript
// ES6 - Proper NaN checking
Number.isNaN(NaN); // true
Number.isNaN('hello'); // false (doesn't coerce!)

// Safe integer checking
Number.isSafeInteger(9007199254740991); // true
Number.isSafeInteger(9007199254740992); // false
Number.MAX_SAFE_INTEGER; // 9007199254740991
Number.MIN_SAFE_INTEGER; // -9007199254740991

// Type checking
Number.isFinite(100); // true
Number.isFinite(Infinity); // false
Number.isFinite('100'); // false (doesn't coerce!)

Number.isInteger(10); // true
Number.isInteger(10.5); // false

// Number parsing (same as global, but on Number)
Number.parseInt('123', 10); // 123
Number.parseFloat('123.45'); // 123.45

// New Math methods
Math.trunc(4.9); // 4 (removes decimal part)
Math.trunc(-4.9); // -4

Math.sign(5); // 1 (positive)
Math.sign(-5); // -1 (negative)
Math.sign(0); // 0

Math.cbrt(27); // 3 (cube root)
Math.hypot(3, 4); // 5 (√(3² + 4²))

// Trigonometric
Math.sinh(1); // Hyperbolic sine
Math.cosh(1); // Hyperbolic cosine
Math.tanh(1); // Hyperbolic tangent

// Logarithmic
Math.log10(100); // 2
Math.log2(8); // 3
Math.log1p(x); // More accurate for small x

// 32-bit integer operations
Math.imul(2, 4); // 8 (32-bit multiplication)
Math.clz32(1); // 31 (count leading zeros)

// Constants
Number.EPSILON; // Smallest difference between two numbers
```

**Verdict:** ES6 number utilities fix **type coercion issues** and add missing mathematical functions.

---

## 16. Regular Expressions

### ES5: Basic Regex Features

```javascript
// ES5 - Standard regex
var regex = /hello/i; // Case insensitive
var match = 'Hello World'.match(regex);

// Multiline
var multiline = /^start/m;

// Global
var global = /o/g;
'Hello World'.match(global); // ['o', 'o']

// Sticky flag doesn't exist
// Unicode support is limited
```

### ES6: Enhanced Regular Expressions

```javascript
// ES6 - Unicode flag
const regex = /\u{1F4A9}/u; // 💩 (poop emoji)
console.log(regex.test('💩')); // true

// Without 'u' flag, surrogate pairs cause issues
'💩'.length; // 2 (in ES5, surrogate pair)
/^.$/.test('💩'); // false (ES5)
/^.$/u.test('💩'); // true (ES6 with u flag)

// Sticky flag (y) - matches at exact position
const sticky = /foo/y;
sticky.lastIndex = 3;
'..foo'.match(sticky); // null (doesn't match at index 3)

const text = 'foofoofoo';
const pattern = /foo/y;
console.log(pattern.exec(text)); // ['foo'] at index 0
pattern.lastIndex; // 3
console.log(pattern.exec(text)); // ['foo'] at index 3
pattern.lastIndex; // 6
console.log(pattern.exec(text)); // ['foo'] at index 6

// Flags property
const re = /hello/gi;
console.log(re.flags); // 'gi'
console.log(re.source); // 'hello'

// Better Unicode handling
const text = '𝒳𝒴𝒵'; // Mathematical script letters
console.log([...text].length); // 3 (correct with spread)
console.log(text.length); // 6 (wrong without spread)

// Unicode property escapes (ES2018, but evolved from ES6)
// \p{...} for Unicode properties
const letters = /\p{Letter}/u;
const currency = /\p{Currency_Symbol}/u;
```

**Verdict:** ES6 regex improvements handle **Unicode properly** and add useful flags.

---

## 17. Type Coercion and Equality

### ES5: Implicit Coercion Issues

```javascript
// ES5 - Problematic type coercion
0 == '0'; // true (coercion)
0 == []; // true (wat?)
'' == '0'; // false (inconsistent)

false == '0'; // true
false == undefined; // false
false == null; // false
null == undefined; // true (special case)

// Comparisons
'2' > '12'; // true (string comparison)
2 > '12'; // false (coerces to number)

// Addition vs concatenation ambiguity
1 + 2; // 3
'1' + 2; // '12'
1 + '2'; // '12'
1 + 2 + '3'; // '33'
'1' + 2 + 3; // '123'

// Array to string
[1, 2, 3] + [4, 5, 6]; // '1,2,34,5,6' (wat?)
```

### ES6: Same Behavior, But Better Tools

```javascript
// ES6 - Still has coercion, but Object.is() helps
0 == '0'; // still true
0 === '0'; // false (strict equality, existed in ES5)

// Object.is() - more predictable equality
Object.is(0, -0); // false (0 === -0 is true)
Object.is(NaN, NaN); // true (NaN === NaN is false)

Object.is(+0, -0); // false
+0 === -0; // true

// Use case: detecting actual NaN
const value = NaN;
value === value; // false (quirky)
Object.is(value, NaN); // true (better)
Number.isNaN(value); // true (best)

// ES6 doesn't fix coercion but provides better alternatives
// Use === instead of ==
// Use Number() for explicit conversion
// Use String() for explicit conversion
```

**Verdict:** ES6 adds `Object.is()` for **corner cases** but doesn't fix fundamental coercion issues.

---

## 18. Error Handling

### ES5: Basic Try-Catch

```javascript
// ES5 - Simple error handling
function divide(a, b) {
	try {
		if (b === 0) {
			throw new Error('Division by zero');
		}
		return a / b;
	} catch (e) {
		console.error(e.message);
		return null;
	}
}

// Custom error types require prototype setup
function ValidationError(message) {
	this.name = 'ValidationError';
	this.message = message;
	this.stack = (new Error()).stack;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

// No finally in some older implementations (actually added in ES3)
try {
	// code
} catch (e) {
	// handle
} finally {
	// cleanup
}
```

### ES6: Enhanced Error Handling with Classes

```javascript
// ES6 - Custom errors with classes
class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ValidationError';
	}
}

class NetworkError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.name = 'NetworkError';
		this.statusCode = statusCode;
	}
}

// Usage
function validateUser(user) {
	if (!user.name) {
		throw new ValidationError('Name is required');
	}
	if (!user.email) {
		throw new ValidationError('Email is required');
	}
}

// Catching specific error types
try {
	validateUser({});
} catch (error) {
	if (error instanceof ValidationError) {
		console.log('Validation failed:', error.message);
	} else if (error instanceof NetworkError) {
		console.log('Network failed:', error.statusCode);
	} else {
		console.log('Unknown error:', error);
	}
}

// Promise error handling (ES6 feature)
fetch('/api/user')
	.then(response => {
		if (!response.ok) {
			throw new NetworkError('Request failed', response.status);
		}
		return response.json();
	})
	.catch(error => {
		if (error instanceof NetworkError) {
			console.log(`Network error ${error.statusCode}`);
		} else {
			console.log('Other error:', error);
		}
	});

// Async/await error handling (ES2017, but natural evolution)
async function loadUser() {
	try {
		const response = await fetch('/api/user');
		if (!response.ok) {
			throw new NetworkError('Request failed', response.status);
		}
		return await response.json();
	} catch (error) {
		if (error instanceof NetworkError) {
			console.log('Network issue');
		}
		throw error; // Re-throw if can't handle
	}
}
```

**Verdict:** ES6 makes custom errors **much cleaner** with class syntax.

---

## 19. Performance Characteristics

### ES5 Performance Profile

```javascript
// ES5 - Generally predictable performance
var arr = [1, 2, 3, 4, 5];

// forEach is slower than for loop (function call overhead)
arr.forEach(function(item) {
	console.log(item);
});

// Traditional for loop is fastest
for (var i = 0; i < arr.length; i++) {
	console.log(arr[i]);
}

// Function creation overhead
for (var i = 0; i < 1000; i++) {
	var fn = function() {
		return i;
	}; // Creates 1000 functions
}
```

### ES6 Performance Considerations

```javascript
// ES6 - Similar performance, but some differences

// for...of is slightly slower than traditional for
const arr = [1, 2, 3, 4, 5];
for (const item of arr) {
	console.log(item); // Iterator protocol overhead
}

// Arrow functions may be slightly faster (less 'this' binding)
const fn = () => 42;

// Destructuring has minimal overhead (optimized by engines)
const { name, age } = person; // Nearly zero cost in modern engines

// Spread operator can be expensive for large arrays
const arr1 = new Array(1000000).fill(1);
const arr2 = [...arr1]; // Copies entire array

// Template literals vs concatenation: similar performance
const name = 'John';
const msg1 = `Hello ${name}`; // Template literal
const msg2 = 'Hello ' + name; // Concatenation
// Modern engines optimize both equally

// Classes have same performance as constructor functions
// (they're syntactic sugar)

// Generators add overhead (state machine)
function* fibonacci() {
	let [a, b] = [0, 1];
	while (true) {
		yield a;
		[a, b] = [b, a + b];
	}
}

// Slower than regular iteration, but enables lazy evaluation

// Promises add overhead
// But enable better async patterns
```

**Verdict:** ES6 performance is **comparable to ES5** - modern engines optimize both well. The benefits in code clarity
outweigh minor performance differences.

---

## 20. Browser Support and Transpilation

### ES5 Browser Support

```javascript
// ES5 - Universal support since ~2012
// All modern browsers support ES5 fully
// IE9+ supports most ES5 features
// IE8 requires polyfills for some methods

// No transpilation needed
var code = function() {
	return "runs everywhere";
};
```

### ES6 Browser Support and Transpilation

```javascript
// ES6 - Native support varies by browser

// Modern browsers (2017+): Full ES6 support
// - Chrome 51+
// - Firefox 52+
// - Safari 10+
// - Edge 15+

// Older browsers need transpilation with Babel

// Input (ES6):
const greet = (name = 'World') => `Hello, ${name}!`;

// Babel output (ES5):
"use strict";
var greet = function greet() {
	var name = arguments.length > 0 && arguments[0] !== undefined
		? arguments[0]
		: 'World';
	return "Hello, " + name + "!";
};

// Webpack + Babel workflow:
// 1. Write ES6 code
// 2. Babel transpiles to ES5
// 3. Webpack bundles
// 4. Deploy ES5 bundle

// .babelrc configuration
{
	"presets"
:
	[
		["@babel/preset-env", {
			"targets": {
				"browsers": ["> 1%", "last 2 versions"]
			}
		}]
	]
}

// Modern approach: differential serving
// - ES6 bundle for modern browsers
// - ES5 bundle for legacy browsers
<script type="module" src="modern.js"></script>
<script nomodule src="legacy.js"></script>
```

**Verdict:** ES6 requires **transpilation for older browsers**, but modern browsers support it natively.

---

## Summary Comparison Table

| Feature                  | ES5                              | ES6                             | Winner  |
|--------------------------|----------------------------------|---------------------------------|---------|
| **Variables**            | `var` (function scope)           | `let`/`const` (block scope)     | **ES6** |
| **Functions**            | Regular functions, `this` issues | Arrow functions, lexical `this` | **ES6** |
| **Strings**              | Concatenation with `+`           | Template literals               | **ES6** |
| **Objects**              | Verbose syntax                   | Shorthand, computed properties  | **ES6** |
| **Classes**              | Prototype chain setup            | Class syntax                    | **ES6** |
| **Modules**              | No native support                | `import`/`export`               | **ES6** |
| **Async**                | Callbacks (pyramid of doom)      | Promises                        | **ES6** |
| **Iteration**            | `for`, `forEach`                 | `for...of`, generators          | **ES6** |
| **Data Structures**      | Objects, Arrays                  | Map, Set, WeakMap, WeakSet      | **ES6** |
| **Destructuring**        | Manual extraction                | Pattern matching                | **ES6** |
| **Parameters**           | Verbose defaults, `arguments`    | Defaults, rest, spread          | **ES6** |
| **Browser Support**      | Universal                        | Modern browsers (or transpile)  | **ES5** |
| **Performance**          | Predictable                      | Comparable                      | **Tie** |
| **Learning Curve**       | Moderate                         | Steeper initially               | **ES5** |
| **Code Maintainability** | Verbose, error-prone             | Concise, safer                  | **ES6** |

---

## Migration Strategy: ES5 to ES6

### Gradual Adoption Approach

```javascript
// Phase 1: Start with safe, high-value changes
// ✅ Replace var with let/const
// ✅ Use arrow functions for callbacks
// ✅ Use template literals
// ✅ Use destructuring for obvious cases

// Before
var name = user.name;
var age = user.age;
arr.map(function(x) {
	return x * 2;
});

// After
const { name, age } = user;
arr.map(x => x * 2);

// Phase 2: Adopt classes and modules
// ✅ Convert constructor functions to classes
// ✅ Use import/export for modules

// Before
function User(name) {
	this.name = name;
}

User.prototype.greet = function() {
	return 'Hello, ' + this.name;
};

// After
class User {
	constructor(name) {
		this.name = name;
	}

	greet() {
		return `Hello, ${this.name}`;
	}
}

// Phase 3: Use advanced features
// ✅ Generators for complex iteration
// ✅ Promises for async operations
// ✅ Symbols for metaprogramming
```

---

## Conclusion

**ES6 is a massive improvement over ES5:**

- **70% syntactic sugar** that makes code cleaner, safer, and more maintainable
- **30% new capabilities** that enable patterns impossible in ES5
- The sugar alone is worth it - cleaner code has fewer bugs
- Modern JavaScript development is essentially ES6+ (with transpilation for legacy support)

**When to use ES5:**

- Legacy codebases that can't be updated
- Environments without transpilation tooling
- Learning JavaScript fundamentals (arguable)

**When to use ES6:**

- All new projects (default choice)
- Modern web applications
- Node.js applications (native support since v6)
- Any codebase that can use transpilation

The JavaScript ecosystem has fully embraced ES6 and beyond. While understanding ES5 is valuable for maintaining legacy
code and understanding JavaScript's evolution, **ES6 should be the baseline for all modern JavaScript development**.