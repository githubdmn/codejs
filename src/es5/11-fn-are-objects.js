console.log('Functions are Objects');

function Circle(radius) {
	this.radius = radius;
	this.draw = function () {
		console.log('draw');
	};
}

const anotherCircle = new Function(
	'radius',
	`
  this.radius = radius;
  this.draw = function() {
    console.log('draw');
  }
`,
);

const myCircle = new anotherCircle(1);

// Another way of isntatiating an object

// "call" function
// {} refers to this from the object
// 1 is a parameter corresponding to constructor
anotherCircle.call({}, 1);

// same as "call" only parameters are passed to constructor
// as an array
anotherCircle.apply({}, [1]);
