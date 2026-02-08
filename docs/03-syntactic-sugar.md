# Comprehensive Comparison: ES5 vs ES6 (Continued)

---

## 12. Destructuring

### ES5: Manual Property/Element Access

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
    return {x: 10, y: 20};
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
const {name, age} = person;

// Nested destructuring
const {address: {city, country}} = person;

// Renaming variables
const {name: fullName, age: years} = person;

// Default values
const {name, occupation = 'Unknown'} = person;

// Rest properties
const {name, ...otherInfo} = person; // otherInfo = {age: 30, address: {...}}

// Function parameters - incredibly useful!
function greet({name, age}) {
    return `Hello ${name}, you are ${age}`;
}
greet(person); // Clean and readable

// With defaults in parameters
function createUser({name = 'Anonymous', role = 'user'} = {}) {
    return {name, role};
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
    return {x: 10, y: 20};
}
const {x, y} = getCoordinates();

// Array from function
function getRange() {
    return [1, 10];
}
const [min, max] = getRange();

// Practical examples
// 1. React hooks
const [count, setCount] = useState(0);

// 2. Importing modules
import {Component, useState, useEffect} from 'react';

// 3. Loop iteration
const users = [{name: 'John', age: 30}, {name: 'Jane', age: 25}];
for (const {name, age} of users) {
    console.log(`${name} is ${age} years old`);
}

// 4. Promise handling
fetch('/api/user')
    .then(response => response.json())
    .then(({name, email}) => {
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
    return {name: name, role: role};
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
    return {name, role};
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
    onSuccess = () => {},
    onError = () => {}
} = {}) {
    console.log(`Timeout: ${timeout}, Retries: ${retries}`);
}

processData(); // Uses all defaults
processData({timeout: 10000}); // Override only timeout

// Practical example: configuration objects
function createServer({
    port = 3000,
    host = 'localhost',
    ssl = false,
    middleware = [],
    routes = {}
} = {}) {
    return {port, host, ssl, middleware, routes};
}

// Named parameters pattern
function drawCircle({x, y, radius, color = 'black', fill = true}) {
    // Clear which parameter is which
}

drawCircle({x: 10, y: 20, radius: 5}); // Order doesn't matter!
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
    var fn = function() { return i; }; // Creates 1000 functions
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
const {name, age} = person; // Nearly zero cost in modern engines

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

**Verdict:** ES6 performance is **comparable to ES5** - modern engines optimize both well. The benefits in code clarity outweigh minor performance differences.

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
  "presets": [
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

| Feature | ES5 | ES6 | Winner |
|---------|-----|-----|--------|
| **Variables** | `var` (function scope) | `let`/`const` (block scope) | **ES6** |
| **Functions** | Regular functions, `this` issues | Arrow functions, lexical `this` | **ES6** |
| **Strings** | Concatenation with `+` | Template literals | **ES6** |
| **Objects** | Verbose syntax | Shorthand, computed properties | **ES6** |
| **Classes** | Prototype chain setup | Class syntax | **ES6** |
| **Modules** | No native support | `import`/`export` | **ES6** |
| **Async** | Callbacks (pyramid of doom) | Promises | **ES6** |
| **Iteration** | `for`, `forEach` | `for...of`, generators | **ES6** |
| **Data Structures** | Objects, Arrays | Map, Set, WeakMap, WeakSet | **ES6** |
| **Destructuring** | Manual extraction | Pattern matching | **ES6** |
| **Parameters** | Verbose defaults, `arguments` | Defaults, rest, spread | **ES6** |
| **Browser Support** | Universal | Modern browsers (or transpile) | **ES5** |
| **Performance** | Predictable | Comparable | **Tie** |
| **Learning Curve** | Moderate | Steeper initially | **ES5** |
| **Code Maintainability** | Verbose, error-prone | Concise, safer | **ES6** |

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
arr.map(function(x) { return x * 2; });

// After
const {name, age} = user;
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

The JavaScript ecosystem has fully embraced ES6 and beyond. While understanding ES5 is valuable for maintaining legacy code and understanding JavaScript's evolution, **ES6 should be the baseline for all modern JavaScript development**.
