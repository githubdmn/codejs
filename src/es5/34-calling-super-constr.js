console.log('\tInvoking the super constructor');

function extend(Parent, Child) {
	Child.prototype = Object.create(Parent.prototype);
	Child.prototype.constructor = Child;
}

function Shape(color) {
	this.color = color;
}

Shape.prototype.duplicate = function () {
	console.log('duplicate');
};

function Circle(radius, color) {
	Shape.call(this, color); // invoking the super contructor
	this.radius = radius;
}

extend(Shape, Circle);

Circle.prototype.draw = function () {
	console.log('DRAW');
};

Circle.prototype.printRadius = function () {
	console.log('Radius = ', this.radius);
};

var c = new Circle(3, 'red');
// Circle object
console.log(Object.keys(c));
var protoC = Object.getPrototypeOf(c);
var protoS = Object.getPrototypeOf(protoC);
console.log('protoC ->', protoC, '\nprotoS -> ', protoS);
