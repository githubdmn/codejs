console.log('\tArrays and their ES5 methods\n');

/**
 * An array is an ordered list of values, indexed from 0.
 * Arrays are objects, so typeof [] is 'object' (see file 68).
 */
var fruits = ['apple', 'banana', 'cherry'];
console.log('length:', fruits.length); // 3
console.log('first:', fruits[0]); // 'apple'

/**
 * MUTATING methods change the array itself.
 */
var list = [1, 2, 3];
list.push(4); // add to end        -> [1, 2, 3, 4]
list.pop(); // remove from end     -> [1, 2, 3]
list.unshift(0); // add to start   -> [0, 1, 2, 3]
list.shift(); // remove from start -> [1, 2, 3]
console.log('after push/pop/unshift/shift:', list);

list.reverse(); // -> [3, 2, 1]
console.log('reverse:', list);

// splice(startIndex, deleteCount, itemsToInsert...)
var letters = ['a', 'b', 'c', 'd'];
var removed = letters.splice(1, 2); // removes 'b' and 'c'
console.log('splice removed:', removed, 'array now:', letters); // ['b','c'], ['a','d']
letters.splice(1, 0, 'x', 'y'); // insert without removing
console.log('splice inserted:', letters); // ['a','x','y','d']

/**
 * NON-MUTATING methods return a new value and leave the original alone.
 */
var nums = [10, 20, 30, 40];
console.log('slice(1, 3):', nums.slice(1, 3)); // [20, 30] - end is not included
console.log('concat:', nums.concat([50, 60])); // [10, 20, 30, 40, 50, 60]
console.log('join:', nums.join(' - ')); // '10 - 20 - 30 - 40'
console.log('indexOf(30):', nums.indexOf(30)); // 2
console.log('indexOf(99):', nums.indexOf(99)); // -1 when not found
console.log('original still:', nums);

/**
 * sort uses the string order by default, so numbers need a comparator.
 */
console.log('default sort:', [10, 9, 1].sort()); // [1, 10, 9] - compared as strings!
console.log('numeric sort:', [10, 9, 1].sort(function (a, b) {
	return a - b; // negative: a first, positive: b first
})); // [1, 9, 10]

/**
 * ES5 ITERATION METHODS: each takes a callback(value, index, array)
 */
var prices = [5, 12, 8, 20];

prices.forEach(function (price, index) {
	console.log('forEach', index, price); // runs the callback for each item, returns nothing
});

// map: returns a NEW array of the same length
var withTax = prices.map(function (price) {
	return price * 1.2;
});
console.log('map:', withTax);

// filter: returns a NEW array with only the items where the callback returns true
var expensive = prices.filter(function (price) {
	return price > 10;
});
console.log('filter:', expensive); // [12, 20]

// reduce: combines all items into ONE value. accumulator starts at the 2nd argument.
var total = prices.reduce(function (sum, price) {
	return sum + price;
}, 0);
console.log('reduce sum:', total); // 45

// some: true if AT LEAST ONE item passes
console.log('some > 15:', prices.some(function (p) { return p > 15; })); // true

// every: true if ALL items pass
console.log('every > 4:', prices.every(function (p) { return p > 4; })); // true

/**
 * Chaining: each method returns a new array, so you can chain them.
 */
var sumOfExpensive = prices
	.filter(function (p) {
		return p > 7;
	})
	.reduce(function (sum, p) {
		return sum + p;
	}, 0);
console.log('chained sum:', sumOfExpensive); // 12 + 8 + 20 = 40

/**
 * Array.isArray checks whether a value is an array (see file 68).
 */
console.log('isArray:', Array.isArray(prices)); // true
