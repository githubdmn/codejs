console.log('\tClosures\n');

/**
 * A CLOSURE is a function that remembers the variables of the scope
 * it was created in, even after that outer function has returned.
 *
 * Every function in JS is a closure: it keeps a link to its outer scope.
 */

function makeGreeter(greeting) {
	// 'greeting' lives in makeGreeter's scope
	return function (name) {
		// the inner function keeps 'greeting' alive
		return greeting + ', ' + name;
	};
}

var hello = makeGreeter('Hello');
var goodbye = makeGreeter('Goodbye');
console.log(hello('Alice')); // Hello, Alice
console.log(goodbye('Bob')); // Goodbye, Bob

/**
 * Each call to makeGreeter creates a NEW scope,
 * so 'hello' and 'goodbye' each keep their own 'greeting'.
 */

/**
 * PRIVATE STATE with closures
 * 'count' cannot be read or changed from outside, only through the functions.
 */
function makeCounter() {
	var count = 0;
	return {
		increment: function () {
			count++;
			return count;
		},
		decrement: function () {
			count--;
			return count;
		},
		value: function () {
			return count;
		},
	};
}

var counterA = makeCounter();
var counterB = makeCounter();
counterA.increment();
counterA.increment();
counterB.increment();
console.log('counterA:', counterA.value()); // 2
console.log('counterB:', counterB.value()); // 1
console.log('count is private:', counterA.count); // undefined

/**
 * THE LOOP PITFALL
 * 'var' has function scope, so all the functions share ONE 'i'.
 * By the time they run, the loop has finished and i is 3.
 */
var badFns = [];
for (var i = 0; i < 3; i++) {
	badFns.push(function () {
		return i;
	});
}
console.log('loop with var:', badFns[0](), badFns[1](), badFns[2]()); // 3 3 3

/**
 * FIX in ES5: an IIFE (Immediately Invoked Function Expression)
 * creates a new scope for each loop step and copies the current value of 'i'.
 */
var goodFns = [];
for (var j = 0; j < 3; j++) {
	(function (captured) {
		goodFns.push(function () {
			return captured;
		});
	})(j);
}
console.log('loop with IIFE:', goodFns[0](), goodFns[1](), goodFns[2]()); // 0 1 2

/**
 * IIFE on its own: runs once and keeps nothing public.
 * Useful to hide helper variables from the global scope.
 */
var moduleResult = (function () {
	var secret = 'hidden';
	return {
		reveal: function () {
			return 'revealed: ' + secret;
		},
	};
})();
console.log(moduleResult.reveal());
console.log('secret visible?', typeof secret); // 'undefined' - not a global
