console.log('Private properties and methods');

function Circle(radius) {
	let thisIsPrivateProp = 'My value';
	let anotherPrivateProp = 4;

	this.radius = radius;
	this.defaultLocation = { x: 0, y: 0 };

	this.compute = function (factor) {
		console.log('COMPUTE ', factor);
	};

	this.draw = function () {
		// draw() can access all members in Circle
		this.compute(1);
		console.log('draw');
	};
}

const circle = new Circle(10);
circle.draw();
