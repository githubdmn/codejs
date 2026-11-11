console.log('\tIterating members');
/**
 * A prototype property will be part of any object created
 * from the so-called prototype, and this includes prototype
 * chain. A instance property will be part of the whole
 * instance, and in your case, it will part of any instance
 * because you're adding it within the constructor function
 */

function Circle(radius) {
	// own members or instance members
	this.radius = radius;
	this.move = function () {
		console.log('move');
	};
}

const c1 = new Circle(2);

// Prorotype members
Circle.prototype.draw = function () {
	console.log('draw');
};

const keys1 = Object.keys(c1); // returns only instance members
console.log(c1);

// prints both instance/own and prototype members
for (let key in c1) console.log(key);

console.log(c1.hasOwnProperty('radius'));
console.log(c1.hasOwnProperty('move'));
console.log(c1.hasOwnProperty('draw'));
