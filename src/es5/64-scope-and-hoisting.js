console.log('\tScope and hoisting\n');

/**
 * In ES5 there is only two kinds of scope:
 *   - global scope (outside every function)
 *   - function scope (every function creates a new scope)
 *
 * There is NO block scope in ES5: 'var' inside an if, for or while block
 * is visible everywhere in the enclosing FUNCTION.
 * (ES6 'let' and 'const' fix this, see the ES6 notes.)
 */

var globalName = 'global';

function showScope() {
	var localName = 'local';
	console.log('inside function:', globalName, localName);
}

showScope();
// console.log(localName); // ReferenceError: localName is not defined outside the function

/**
 * Block scope does not exist in ES5.
 * The 'var' declared in the if block is still visible after the block.
 */
if (true) {
	var insideIf = 'visible after the block';
}
console.log(insideIf);

/**
 * HOISTING
 * The declaration of a 'var' (and of a function declaration) is moved
 * to the top of its scope before the code runs.
 * The assignment stays where it is written.
 * So a 'var' can be read before its line and it is 'undefined'.
 */
console.log('hoisted var before assignment:', hoistedValue); // undefined, not an error
var hoistedValue = 42;
console.log('after assignment:', hoistedValue);

/**
 * Function declarations are hoisted with their body,
 * so they can be called before they appear in the file.
 */
console.log(sayHi('Alice')); // works
function sayHi(name) {
	return 'Hi ' + name;
}

/**
 * Function expressions are NOT hoisted as functions. Only the 'var' name is.
 * Calling it before the assignment fails with a TypeError.
 */
// sayBye('Bob'); // TypeError: sayBye is not a function
var sayBye = function (name) {
	return 'Bye ' + name;
};
console.log(sayBye('Bob'));

/**
 * Re-declaring a 'var' is allowed and does not reset its value.
 */
var counter = 1;
var counter;
console.log('counter still:', counter); // 1

/**
 * Scope chain: when a name is used, JS looks in the current function first,
 * then in the outer function, and finally in the global scope.
 */
var level = 'global';
function outer() {
	var level = 'outer';
	function inner() {
		console.log('inner sees:', level); // 'outer' - the nearest one wins
	}
	inner();
}
outer();
