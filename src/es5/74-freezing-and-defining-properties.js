console.log('\tFreezing, sealing and defining many properties\n');

/**
 * These methods control HOW an object may change. They build on property
 * descriptors (see file 24).
 *
 *   Object.preventExtensions(obj) - no NEW properties can be added
 *   Object.seal(obj)              - no add, no delete; existing values can change
 *   Object.freeze(obj)            - no add, no delete, no change of values
 *
 * All three are SHALLOW: nested objects are not affected.
 *
 * This project is an ES module, so the file is strict: a blocked write THROWS a TypeError.
 * In a sloppy script the same write would be silently ignored.
 * The helper below catches the error so each example can keep running.
 */

function attempt(label, action) {
	try {
		action();
		console.log(label, '-> allowed');
	} catch (error) {
		console.log(label, '-> blocked:', error.name);
	}
}

var point = { x: 1, y: 2 };
Object.preventExtensions(point);
attempt('add point.z', function () {
	point.z = 3;
});
attempt('change point.x', function () {
	point.x = 10;
});
attempt('delete point.y', function () {
	delete point.y;
});
console.log('preventExtensions:', point, 'isExtensible:', Object.isExtensible(point));

var sealed = { name: 'Alice' };
Object.seal(sealed);
attempt('change sealed.name', function () {
	sealed.name = 'Bob';
});
attempt('add sealed.age', function () {
	sealed.age = 30;
});
attempt('delete sealed.name', function () {
	delete sealed.name;
});
console.log('seal:', sealed, 'isSealed:', Object.isSealed(sealed));

var frozen = { title: 'Config', nested: { level: 1 } };
Object.freeze(frozen);
attempt('change frozen.title', function () {
	frozen.title = 'Changed';
});
attempt('add frozen.extra', function () {
	frozen.extra = true;
});
console.log('freeze:', frozen, 'isFrozen:', Object.isFrozen(frozen));

/**
 * SHALLOW means the nested object is still changeable.
 */
frozen.nested.level = 2;
console.log('nested changed even though frozen:', frozen.nested.level); // 2

/**
 * Deep freeze: freeze the nested objects too, recursively.
 */
function deepFreeze(obj) {
	Object.getOwnPropertyNames(obj).forEach(function (name) {
		var value = obj[name];
		if (value !== null && typeof value === 'object') {
			deepFreeze(value);
		}
	});
	return Object.freeze(obj);
}

var settings = deepFreeze({ theme: { color: 'dark' } });
attempt('change nested color', function () {
	settings.theme.color = 'light';
});
console.log('deep frozen:', settings.theme.color); // 'dark'

/**
 * Object.defineProperties defines many properties at once, each with a descriptor.
 */
var car = {};
Object.defineProperties(car, {
	brand: {
		value: 'Toyota',
		enumerable: true,
		writable: false,
	},
	secret: {
		value: 'hidden',
		enumerable: false, // not shown by for...in or Object.keys
	},
});
attempt('change car.brand', function () {
	car.brand = 'Ford';
});
console.log('car:', car, 'keys:', Object.keys(car)); // only 'brand' in keys
console.log('secret still readable:', car.secret); // 'hidden'

/**
 * Object.defineProperty (one property) works the same way; see file 24.
 */
