console.log('constructors\n');

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

/**
 * In case key word 'new' is not used for instantiating an object
 * key word 'this' will refer to global object (a 'window' object in browser,
 * or a 'global' in nodejs environment)
 * Also, the constructor expicitly looks like:
 *
  function Circle(radius) {
    this.radius = radius;
    this.draw = function () {
      console.log('draw');
    };
    return this; // this implies when using the 'new' operatior
  }
 *
 */

circle.draw();
