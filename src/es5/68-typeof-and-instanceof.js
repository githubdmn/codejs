console.log('\tTypeof and instanceof\n');

/**
 * typeof returns a STRING naming the type of a value.
 * It is useful for primitives. For objects it is less precise.
 */
console.log(typeof 'text'); // 'string'
console.log(typeof 42); // 'number'
console.log(typeof true); // 'boolean'
console.log(typeof undefined); // 'undefined'
console.log(typeof function () {}); // 'function'

/**
 * Known gotchas
 */
console.log(typeof null); // 'object' - a famous bug kept for compatibility
console.log(typeof []); // 'object' - arrays are objects
console.log(typeof {}); // 'object'
console.log(typeof NaN); // 'number' - NaN means "not a number", but it is a number type

/**
 * To tell arrays apart use Array.isArray (ES5).
 */
console.log('isArray([]):', Array.isArray([])); // true
console.log('isArray({}):', Array.isArray({})); // false

/**
 * To check for null, compare with === directly.
 */
var value = null;
console.log('value is null?', value === null); // true

/**
 * instanceof checks whether an object's prototype chain contains
 * Constructor.prototype. It only works with objects, not primitives.
 */
function Circle(radius) {
	this.radius = radius;
}
var c = new Circle(3);
console.log('c instanceof Circle:', c instanceof Circle); // true
console.log('c instanceof Object:', c instanceof Object); // true - every object inherits from Object
console.log('[] instanceof Array:', [] instanceof Array); // true
console.log('"text" instanceof String:', 'text' instanceof String); // false - primitive, not an object

/**
 * The same check with the prototype object directly:
 */
console.log('Circle.prototype.isPrototypeOf(c):', Circle.prototype.isPrototypeOf(c)); // true
