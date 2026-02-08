Here's a comprehensive list of ES6 features categorized by whether they're syntactic sugar or new capabilities:

## 🍯 SYNTACTIC SUGAR (Compiles to ES5 equivalents)

### Variable Declarations

- **`let` and `const`** - Block-scoped variables (vs function-scoped `var`)

```javascript
// ES6
let x = 1;
const y = 2;

// ES5 equivalent (with block scope simulation)
var x = 1;
var y = 2; // + scope management
```

### Function Enhancements

- **Arrow Functions** - Shorter syntax with lexical `this`

```javascript
// ES6
const add = (a, b) => a + b;

// ES5
var add = function(a, b) {
	return a + b;
}.bind(this);
```

- **Default Parameters**

```javascript
// ES6
function greet(name = "World") {
}

// ES5
function greet(name) {
	name = name || "World";
}
```

- **Rest Parameters** - `...args`

```javascript
// ES6
function sum(...numbers) {
}

// ES5
function sum() {
	var numbers = Array.prototype.slice.call(arguments);
}
```

- **Spread Operator** - `...array`

```javascript
// ES6
const arr = [1, 2, ...otherArray];

// ES5
var arr = [1, 2].concat(otherArray);
```

### Object Enhancements

- **Object Method Shorthand**

```javascript
// ES6
const obj = {
	method() {
	}
};

// ES5
var obj = {
	method: function() {
	}
};
```

- **Property Shorthand**

```javascript
// ES6
const obj = { name, age };

// ES5
var obj = { name: name, age: age };
```

- **Computed Property Names**

```javascript
// ES6
const obj = { [key]: value };

// ES5
var obj = {};
obj[key] = value;
```

### String Features

- **Template Literals** - Backtick strings with interpolation

```javascript
// ES6
const msg = `Hello ${name}!`;

// ES5
var msg = "Hello " + name + "!";
```

### Destructuring

- **Array Destructuring**

```javascript
// ES6
const [a, b] = array;

// ES5
var a = array[0], b = array[1];
```

- **Object Destructuring**

```javascript
// ES6
const { name, age } = person;

// ES5
var name = person.name, age = person.age;
```

### Classes

- **Class Syntax** - Sugar over prototypes

```javascript
// ES6
class Person extends Animal {
	constructor(name) {
		super(name);
	}

	greet() {
	}
}

// ES5
function Person(name) {
	Animal.call(this, name);
}

Person.prototype = Object.create(Animal.prototype);
Person.prototype.greet = function() {
};
```

### Modules (Partial Sugar)

- **Import/Export Syntax** - Declarative module syntax

```javascript
// ES6
import { func } from './module';

export default class {
};

// ES5 (CommonJS)
var func = require('./module').func;
module.exports = MyClass;
```

---

## ⚡ NEW CAPABILITIES (Genuinely new features)

### New Data Types

- **Symbols** - New primitive type for unique identifiers

```javascript
const sym = Symbol('description');
const obj = { [sym]: 'hidden' }; // Truly private-ish properties
```

### New Data Structures

- **Map** - Key-value pairs with any key type

```javascript
const map = new Map();
map.set(objectKey, value); // Objects as keys!
map.set(1, 'number key');
```

- **Set** - Collection of unique values

```javascript
const set = new Set([1, 2, 2, 3]); // [1, 2, 3]
```

- **WeakMap** - Weak references to prevent memory leaks

```javascript
const wm = new WeakMap();
wm.set(obj, metadata); // Won't prevent obj garbage collection
```

- **WeakSet** - Weak references for objects only

```javascript
const ws = new WeakSet();
ws.add(obj); // Won't prevent obj garbage collection
```

### Iteration Protocol

- **Iterators** - Standardized iteration interface

```javascript
const iterator = array[Symbol.iterator]();
console.log(iterator.next()); // {value: 1, done: false}
```

- **Generators** - Functions that can pause and resume

```javascript
function* fibonacci() {
	let [a, b] = [0, 1];
	while (true) {
		yield a; // Pause here, return value
		[a, b] = [b, a + b];
	}
}
```

- **for...of loops** - Iterate over iterables

```javascript
for (const item of iterable) {
} // Works with any iterable
```

### Async Programming

- **Promises** - Native async handling (not just syntactic sugar)

```javascript
const promise = new Promise((resolve, reject) => {
	// Async operation
});
promise.then(result => {
}).catch(error => {
});
```

### Reflection

- **Proxy** - Intercept and customize object operations

```javascript
const proxy = new Proxy(target, {
	get(obj, prop) {
		console.log(`Accessing ${prop}`);
		return obj[prop];
	}
});
```

- **Reflect** - Programmatic object manipulation

```javascript
Reflect.get(obj, 'prop');
Reflect.set(obj, 'prop', value);
Reflect.has(obj, 'prop');
```

### New Built-in Methods

- **Array.from()** - Create arrays from array-likes/iterables

```javascript
Array.from('hello'); // ['h', 'e', 'l', 'l', 'o']
Array.from(new Set([1, 2])); // [1, 2]
```

- **Array.of()** - Create array from arguments

```javascript
Array.of(1, 2, 3); // [1, 2, 3] (vs new Array(3) which creates empty slots)
```

- **Object.assign()** - Shallow copy properties

```javascript
Object.assign(target, source1, source2);
```

- **Object.is()** - Better equality comparison

```javascript
Object.is(NaN, NaN); // true (vs NaN === NaN which is false)
Object.is(-0, +0); // false (vs -0 === +0 which is true)
```

### String Methods

- **String.prototype.includes()** - Check substring existence
- **String.prototype.startsWith()** - Check string start
- **String.prototype.endsWith()** - Check string end
- **String.prototype.repeat()** - Repeat string n times

### Number Enhancements

- **Number.isNaN()** - Proper NaN checking
- **Number.isInteger()** - Check if integer
- **Number.isSafeInteger()** - Check safe integer range
- **Number.EPSILON** - Smallest floating point increment

### Math Extensions

- **Math.trunc()** - Remove fractional part
- **Math.sign()** - Get sign of number
- **Math.hypot()** - Calculate hypotenuse
- Plus many more trigonometric and logarithmic functions

---

## 🔄 HYBRID FEATURES (Sugar + New Capabilities)

### Enhanced Object Literals

```javascript
// Combines syntactic sugar with new capabilities
const obj = {
	// Property shorthand (sugar)
	name,

	// Method shorthand (sugar)
	greet() {
	},

	// Computed properties (sugar)
	[methodName]() {
	},

	// But enables new patterns not possible in ES5
	[Symbol.iterator]() { /* custom iterator */
	}
};
```

### Modules

```javascript
// Import/export syntax is sugar, but the module system itself
// provides new capabilities like:
// - Static analysis
// - Tree shaking
// - Circular dependency handling
// - Live bindings
export let count = 0;

export function increment() {
	count++;
} // Live binding!
```

---

## Summary

**Syntactic Sugar (70% of ES6)**: Makes existing patterns cleaner and safer

- Classes, arrow functions, destructuring, template literals, let/const, etc.

**New Capabilities (30% of ES6)**: Adds genuinely new functionality

- Symbols, Map/Set, Promises, Generators, Proxies, new built-in methods

**Key Insight**: Even the "sugar" features often enable new patterns and prevent common bugs, making them more valuable
than pure cosmetic changes. The combination of both types of features makes ES6 a significant evolution in JavaScript
development.