console.log('\tPrototypal inheritance');

function Shape() {}

Shape.prototype.duplicate = function () {
	console.log('duplicate');
};

function Circle(radius) {
	this.radius = radius;
}

// Circle is inheriting the "baseObject"
// Circle.prototype = Object.create(Object.prototype);

// To inherit the Shape object
Circle.prototype = Object.create(Shape.prototype);

Circle.prototype.draw = function () {
	console.log('DRAW');
};

Circle.prototype.printRadius = function () {
	console.log('Radius = ', this.radius);
};

var c = new Circle(3);
c.draw();
c.printRadius();
c.duplicate();
