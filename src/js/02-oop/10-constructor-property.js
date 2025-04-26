console.log('constructor property\n');

//Factory function
function circleFactory(radius) {
	return {
		radius,
		draw: function () {
			console.log('draw');
		},
	};
}
const oneCircle = circleFactory(1);

//Cosntructor Function
function Circle(radius) {
	this.radius = radius;
	this.draw = function () {
		console.log('draw');
	};
}

const circle = new Circle(1);

console.log(oneCircle.constructor);
/**
 * oneCircle.constructor shows [Function: Object]
 * this is shown because the function 'circleFactory' is essentialy an object
 * created using object literal syntax
 */
console.log(circle.constructor);
/**
 * circle.constructor shows [Function:Circle]
 * this is shown because the object created using 'new' keyword
 * is a specific object
 *
 */
