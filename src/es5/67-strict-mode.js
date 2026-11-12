'use strict';

console.log('\tStrict mode\n');

/**
 * 'use strict' is a directive: a plain string as the FIRST line of a file
 * (or of a function). It turns on a stricter set of rules.
 * It must be the very first statement, before any other code.
 *
 * In strict mode JS:
 *   - does NOT create global variables by accident
 *   - makes 'this' undefined in plain function calls (instead of the global object)
 *   - throws errors on silent mistakes (writing to frozen objects, etc.)
 *   - forbids some syntax (with, octal literals, duplicate parameter names)
 *
 * Classes in ES6 are always strict, even without the directive.
 * This file has 'use strict' at the top, so every example below runs strictly.
 */

// 1. Assigning to an undeclared variable
try {
	undeclaredVariable = 10; // sloppy mode would silently create a global
} catch (e) {
	console.log('1. ' + e.name + ': ' + e.message);
}

// 2. 'this' inside a plain function call
function whoAmI() {
	return this;
}
console.log('2. this in plain call is:', whoAmI()); // undefined

// 3. Writing to a read-only property (a frozen object)
var config = Object.freeze({ debug: false });
try {
	config.debug = true; // sloppy mode would ignore this silently
} catch (e) {
	console.log('3. ' + e.name + ': ' + e.message);
}
console.log('3. config.debug is still:', config.debug);

// 4. Deleting a non-deletable property
try {
	delete Object.prototype;
} catch (e) {
	console.log('4. ' + e.name + ': ' + e.message);
}

/**
 * Strict mode can also be turned on for ONE function only:
 * put the directive as the first line inside the function body.
 */
function strictOnly() {
	'use strict';
	return this === undefined;
}
console.log('strictOnly: this is undefined ->', strictOnly()); // true
