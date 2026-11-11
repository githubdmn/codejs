// Legacy style: var, function expressions, and callbacks (ES5)

var greet = function (name, callback) {
	setTimeout(function () {
		callback(null, 'Hey ' + name);
	}, 100);
};

greet('world', function (err, message) {
	if (err) {
		console.error(err);
		return;
	}
	console.log(message);
});
