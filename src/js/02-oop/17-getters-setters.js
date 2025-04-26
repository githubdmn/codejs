console.log('Getters and setters');

function Circle(radius) {
	this.radius = radius;
	let start = { x: 0, y: 0 };
	let compute = function (factor) {
		console.log('Factor: ', factor);
	};
	this.draw = function () {
		compute(0.1);
		console.log('draw');
	};
	this.getStart = function () {
		return start;
	};
}

const c = new Circle(2);
c.draw();
console.log(c.getStart(), '\n');

function CircleB(radius) {
	this.radius = radius;
	let start = { x: 0, y: 0 };
	this.draw = function () {
		console.log('draw');
	};
	Object.defineProperty(this, 'start', {
		get: function () {
			return start;
		},
	});
}

const cb = new CircleB(2);
cb.draw();
console.log('Object.defineProperty -> get \n', cb.start, '\n');

function CircleC(radius) {
	this.radius = radius;
	let start = { x: 0, y: 0 };
	this.draw = function () {
		console.log('draw');
	};
	Object.defineProperty(this, 'start', {
		get: function () {
			return start;
		},
		set: function (value) {
			if (!value.x && !value.y) throw new Error('Invalid location');
			start: value;
		},
	});
}

const cc = new CircleC(2);
cc.draw();
console.log('Object.defineProperty -> get / set \n', cc.start, '\n');
// cc.start =  3; // reports an error
cc.start.x = 5;
cc.start.y = 3;
console.log(cc.start);
