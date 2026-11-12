console.log('\tJSON\n');

/**
 * JSON (JavaScript Object Notation) is a text format for data.
 * It looks like an object literal, but it has stricter rules:
 *   - keys and string values use DOUBLE quotes
 *   - no functions, no undefined, no comments, no trailing commas
 *
 * JSON.stringify  - turns a JavaScript value into a JSON string
 * JSON.parse      - turns a JSON string into a JavaScript value
 */

var user = {
	name: 'Alice',
	age: 30,
	tags: ['admin', 'editor'],
	active: true,
	nothing: null,
};

var text = JSON.stringify(user);
console.log('stringified:', text);
console.log('type:', typeof text); // 'string'

var back = JSON.parse(text);
console.log('parsed name:', back.name); // 'Alice'

/**
 * Pretty printing: the third argument is the indentation (number of spaces or a string).
 */
console.log(JSON.stringify(user, null, 2));

/**
 * The second argument is a REPLACER.
 * Pass an array of keys to keep only those keys.
 */
console.log('only name and age:', JSON.stringify(user, ['name', 'age']));

/**
 * What JSON.stringify skips or changes:
 */
var tricky = {
	keep: 'yes',
	skipFunction: function () {},
	skipUndefined: undefined,
	inArray: [function () {}, undefined],
	date: new Date(0),
	nan: NaN,
	infinity: Infinity,
};
console.log('tricky:', JSON.stringify(tricky));
// functions and undefined are removed; in arrays they become null
// Date becomes an ISO string; NaN and Infinity become null

/**
 * JSON.parse with a REVIVER: a function called for each value, can change it.
 */
var fromServer = '{"price": "12.50", "date": "2020-01-01T00:00:00.000Z"}';
var revived = JSON.parse(fromServer, function (key, value) {
	if (key === 'price') {
		return parseFloat(value); // turn the string into a number
	}
	return value;
});
console.log('revived price type:', typeof revived.price, revived.price);

/**
 * Deep copy trick: JSON round-trip creates a fresh copy of plain data.
 * It drops functions and dates become strings, so it works only for plain data.
 */
var original = { list: [1, 2, 3], inner: { value: 'x' } };
var copy = JSON.parse(JSON.stringify(original));
copy.inner.value = 'changed';
console.log('original still:', original.inner.value); // 'x'
console.log('copy changed:', copy.inner.value); // 'changed'

/**
 * Invalid JSON makes JSON.parse throw a SyntaxError. Always catch it with untrusted input.
 */
try {
	JSON.parse("{'single': 'quotes'}");
} catch (error) {
	console.log(error.name + ': ' + error.message);
}
