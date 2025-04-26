console.log('\tES6 classes');

/* the "this" keyword
 * points (read/write) to window (global - nodejs) object
 * in order to prevent that 'use strict' is used as first line of js script
 * then "this" points to undefined
 * Also, ES6 class syntax implements 'use strict' by default
 * executes body of the class in 'use strict' mode
 */

class Circle {
	constructor(radius) {
		this.radius;
	}

	draw() {
		console.log('circle draw');
	}

	static print() {
		console.log('Static method');
	}
}

const c = new Circle(3);
c.draw();
Circle.print();

var cprop = Object.getPrototypeOf(c);

console.log(c, ' ', typeof c);
console.log(Object.keys(c));
console.log('prorotype of c ', cprop);
console.log('\n');

/* _classCallCheck()
 * is used to check that new operator is used when instantiating an object
 */

console.log('----HOISTING-----');

//hello() // can be invoked before or after the function declaration
function hello() {
	console.log('Hello');
}
//hello()

// bye() // cannot be invoked priort to the function expression
const bye = function () {
	console.log('Bye');
}; // ; is necessary when using function expression
// bye() // can be invoked after the function expression

/*
 * class declaration and class expression (analogy)
 * are not HOISTED
 */
