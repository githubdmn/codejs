console.log('\tPrototype VS inheritance members\n');

function Circle(radius) {
	this.radius = radius;
	this.draw = function () {
		console.log('Draw');
	};
}

const c1 = new Circle(2);
const c2 = new Circle(3);

console.log(
	`this is not memory efficient \n${Object.keys(c1)} -> ${Object.keys(c2)}\n`,
);

/** Prototype paradigm */
console.log('\n\tProrotype prardigm');

function Square(side) {
	this.side = side;
}

Square.prototype.draw = function () {
	console.log('draw square');
};

const s1 = new Square(3);
const s2 = new Square(4);

console.log(`\ns1 ${Object.keys(s1)} -> s2  ${Object.keys(s2)}\n`);
console.log(`Square prototype -> ${Object.keys(Square.prototype)}\n`);
s1.draw();
s2.draw();

/** Method overrideing */
console.log('\n\tMethod overriding');

Square.prototype.toString = function () {
	return 'This is override for square ' + this.side;
};

console.log(s1.toString());
console.log(s2.toString());

/**
 * function Square(edge) {
 *  this.edge = edge;
 *  this.move = function() { console.log('move'); }
 * }
 * Square.prototype.draw = function() { this.move(); console.log('draw'); }
 * ....
 */
