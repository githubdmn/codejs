console.log('\tThe this keyword, call, apply and bind\n');

/**
 * 'this' is NOT fixed by where a function is written.
 * It is decided by HOW the function is called:
 *
 *   1. method call      obj.fn()        -> this = obj
 *   2. plain call       fn()            -> this = global object (sloppy mode)
 *                                          or undefined (strict mode)
 *   3. new              new Fn()        -> this = the new object
 *   4. call/apply/bind  fn.call(obj)    -> this = obj (you choose it)
 *
 * Note: arrow functions (ES6) do not have their own 'this'.
 */

var person = {
	name: 'Alice',
	sayName: function () {
		console.log('method call, this.name =', this.name);
	},
};
person.sayName(); // this = person

var sayNameAlone = person.sayName;
/**
 * This project is an ES module (package.json "type": "module"), so the file is strict:
 * a plain call gives this = undefined and reading this.name throws.
 * In a sloppy script this would be the global object and this.name would be undefined.
 */
try {
	sayNameAlone();
} catch (error) {
	console.log('lost this:', error.name + ': ' + error.message);
}

/**
 * A common fix: keep a reference to the object in a variable named 'self'.
 */
var timer = {
	seconds: 5,
	countDown: function () {
		var self = this; // remember the object
		return function () {
			return 'seconds left: ' + self.seconds; // self, not this
		};
	},
};
console.log(timer.countDown()());

/**
 * call(thisArg, arg1, arg2, ...)
 * Calls the function now, with 'this' set to thisArg and the arguments listed.
 */
function introduce(greeting, punctuation) {
	return greeting + ', I am ' + this.name + punctuation;
}
var bob = { name: 'Bob' };
console.log(introduce.call(bob, 'Hi', '!')); // Hi, I am Bob!

/**
 * apply(thisArg, [arg1, arg2, ...])
 * Same as call, but the arguments are given as ONE array.
 * Handy when you already have an array of values.
 */
console.log(introduce.apply(bob, ['Hello', '.'])); // Hello, I am Bob.

// Real example: Math.max takes numbers, not an array. apply lets us pass an array.
var numbers = [3, 9, 1, 7];
console.log('max with apply:', Math.max.apply(null, numbers)); // 9

/**
 * Borrowing a method: call a method from one object on another object.
 * 'arguments' is an array-like object with no slice(), so we borrow Array's slice.
 */
function firstTwo() {
	return Array.prototype.slice.call(arguments, 0, 2);
}
console.log('borrowed slice:', firstTwo('a', 'b', 'c')); // ['a', 'b']

/**
 * bind(thisArg, arg1, ...)
 * Does NOT call the function. It returns a NEW function with 'this' fixed.
 * Use it when a function will be called later, e.g. in a callback.
 */
var alice = { name: 'Alice' };
var introduceAlice = introduce.bind(alice, 'Hey');
console.log(introduceAlice('?')); // Hey, I am Alice?

// bind with the lost-this problem from above
var fixedSayName = person.sayName.bind(person);
fixedSayName(); // this.name = 'Alice' again

/**
 * Partial application: bind can also fix some ARGUMENTS.
 */
function multiply(a, b) {
	return a * b;
}
var double = multiply.bind(null, 2);
console.log('double 5:', double(5)); // 10

/**
 * A bound function ignores a later call.call / bind: 'this' is set once.
 */
var fromAlice = introduce.bind(alice, 'Hi', '!');
console.log(fromAlice.call(bob, 'Yo', '?')); // still Alice, because bind wins
