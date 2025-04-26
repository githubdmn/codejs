console.log('Object properties');

function Circle(radius) {
	this.radius = radius;
	this.draw = function () {
		console.log('draw');
	};
}

const circle = new Circle(10);

// console.log(Object.getOwnPropertyNames(circle));
console.log(Object.keys(circle));

circle.location = { x: 1 };
// alternative notation
// circle['location'] = { x:1 };
// used when field has a special character in its name
// user-agent
// const propertyName = 'user-agent';
// user['properyName'] = ....

console.log(Object.keys(circle));

delete circle.location; // delete circle['location'];
console.log(Object.keys(circle));
