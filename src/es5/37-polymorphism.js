console.log('\tPolymorphism');

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

function Circle() {}

function Square() {}

extend(Shape, Circle);
extend(Shape, Square);

Circle.prototype.duplicate = function () {
	console.log('Method overriding circle\n');
};

Square.prototype.duplicate = function () {
	console.log('Method overriding square\n');
};

var c = new Circle();
var s = new Square();

var shapes = [c, s];

for (var shape of shapes) {
	shape.duplicate();
}
