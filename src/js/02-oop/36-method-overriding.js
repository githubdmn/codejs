console.log('\tMethod Overriding');

function extend(Parent, Child) {
	Child.prototype = Object.create(Parent.prototype);
	Child.prototype.constructor = Child;
}

function Shape(color) {
	this.color = color;
}

Shape.prototype.duplicate = function () {
	console.log('\nduplicate');
};

function Circle(radius, color) {
	Shape.call(this, color); // invoking the super contructor
	this.radius = radius;
}

extend(Shape, Circle);

Circle.prototype.draw = function () {
	console.log('DRAW');
};

Circle.prototype.duplicate = function () {
	// if logic from the parent object is needed
	Shape.prototype.duplicate.call(this);
	console.log('Method overriding\n');
};

Circle.prototype.printRadius = function () {
	console.log('Radius = ', this.radius);
};

var c = new Circle(3, 'red');

c.duplicate();

console.log(Object.keys(c));
var protoC = Object.getPrototypeOf(c);
var protoS = Object.getPrototypeOf(protoC);
console.log('protoC ->', protoC, '\nprotoS -> ', protoS);
