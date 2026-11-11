console.log('\tES6 classes');

const _radius = new WeakMap();
const _move = new WeakMap();
const _resize = new WeakMap();

class Circle {
	constructor(radius) {
		_radius.set(this, radius);
		_move.set(this, function () {
			/* The body of the class is executed in 'use strict' mode
			 * the value of 'this' is 'usndefined'
			 * output is move undefined
			 */
			console.log('move', this);
		});
		// to fix that the arrow function syntax is used () => {}
		_resize.set(this, () => {
			console.log('resize', this);
		});
	}

	get radius() {
		return _radius.get(this);
	}
	set radius(value) {
		value < 2 ? console.log('Error') : _radius.set(this, value);
	}

	draw() {
		_move.get(this)();
		_resize.get(this)();
		console.log('circle draw');
	}
}

const c = new Circle(3);
c.draw();
c.radius = 4;
console.log(`radius ${c.radius}`);
c.radius = 0;
