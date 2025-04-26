console.log('\tConstructor prototype\n');

// Object.prototype.constructor
// The constructor data property of an Object instance returns
// a reference to the constructor function that created the instance object.
// Note that the value of this property is a reference to the function itself,
// not a string containing the function's name.
//
// "Propper" way of accessing the protoytype of an object
const first = {};
// const first = new Object(); - alternative syntax
// parent for first is Object.prototype
const parentOfFirst = Object.getPrototypeOf(first);
console.log(
	'\tthese are the same\n',
	parentOfFirst,
	'\n',
	first.__proto__,
	'\n',
);

function Circle(radius) {
	this.radius = radius;
}

console.log('Circle.prototype ->', Circle.prototype);

const circle = new Circle(1);
