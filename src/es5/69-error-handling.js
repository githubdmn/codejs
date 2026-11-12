console.log('\tError handling\n');

/**
 * try   - the code that may fail
 * catch - runs only if the try block throws; receives the error object
 * finally - ALWAYS runs, after try or catch, even with return
 *
 * A thrown error stops the normal flow and jumps to the nearest catch.
 */

function divide(a, b) {
	if (b === 0) {
		throw new Error('Cannot divide by zero');
	}
	return a / b;
}

try {
	console.log('10 / 2 =', divide(10, 2));
	console.log('10 / 0 =', divide(10, 0)); // throws here, the next line is skipped
	console.log('this line never runs');
} catch (error) {
	console.log('caught:', error.message);
} finally {
	console.log('finally always runs');
}

/**
 * The error object has useful properties:
 *   name    - the type of error, e.g. 'TypeError'
 *   message - the description
 *   stack   - where it happened (not standard in ES5, but supported by Node and browsers)
 */
try {
	null.property; // TypeError: cannot read property of null
} catch (error) {
	console.log('name:', error.name);
	console.log('message:', error.message);
}

/**
 * Built-in error types in ES5:
 *   Error, TypeError, ReferenceError, SyntaxError, RangeError, EvalError, URIError
 */
try {
	undefinedFunction(); // ReferenceError: undefinedFunction is not defined
} catch (error) {
	console.log(error instanceof ReferenceError, error.name);
}

/**
 * Throwing can be any value, but throwing an Error object is the good practice.
 * Here is a custom error type built with ES5 prototypes (see the inheritance files).
 */
function ValidationError(message) {
	this.name = 'ValidationError';
	this.message = message;
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

try {
	throw new ValidationError('Age must be a number');
} catch (error) {
	console.log(error.name + ': ' + error.message);
	console.log('is an Error?', error instanceof Error); // true
}

/**
 * Finally can change the outcome: a return in finally overrides the return in try.
 * This is rarely a good idea, but it shows the order of execution.
 */
function order() {
	try {
		return 'from try';
	} finally {
		console.log('finally runs before the function returns');
	}
}
console.log(order());
