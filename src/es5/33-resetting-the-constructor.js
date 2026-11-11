console.log('\tResetting the constructor');

function Shape() {}

Shape.prototype.duplicate = function () {
	console.log('duplicate');
};

function Circle(radius) {
	this.radius = radius;
}

// Circle is inheriting the "baseObject" by default
// Circle.prototype = Object.create(Object.prototype);
var tmp1 = new Circle.prototype.constructor();
var proto1 = Object.getPrototypeOf(tmp1);
console.log('prototype of Circle.prototype.constructor() ', proto1);

// To inherit the Shape object - now circle instace can access duplicate()
Circle.prototype = Object.create(Shape.prototype);
// Resetting the constructor!!! IMPORTANT
// output without the following line { duplicate: [Function (anonymous)] }
Circle.prototype.constructor = Circle;
// now constructor is refering to Circle()
var tmp2 = new Circle.prototype.constructor();
var proto2 = Object.getPrototypeOf(tmp2);
console.log('prototype of Circle.prototype.constructor()\n', proto2, '\n');

Circle.prototype.draw = function () {
	console.log('DRAW');
};

Circle.prototype.printRadius = function () {
	console.log('Radius = ', this.radius);
};

var c = new Circle(3);
c.draw();
c.printRadius();
//c.duplicate();

// Circle object
console.log(Object.keys(c));
var protoC = Object.getPrototypeOf(c);
var protoS = Object.getPrototypeOf(protoC);
console.log('protoC ->', protoC, '\nprotoS -> ', protoS);
