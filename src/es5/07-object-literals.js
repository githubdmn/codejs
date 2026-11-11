console.log('object literals');

// in ES5 var is user
// in ES6 const and let is used

// object literal syntax
const circle = {
	radius: 1,
	coordinates: {
		x: 1,
		y: 1,
	},
	draw: function () {
		console.log('draw');
	},
};

circle.draw();
