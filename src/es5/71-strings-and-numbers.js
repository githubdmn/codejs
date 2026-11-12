console.log('\tStrings and numbers\n');

/**
 * Strings are IMMUTABLE: every string method returns a NEW string.
 * The original is never changed.
 */
var text = '  Hello, World!  ';
console.log('length:', text.length); // 17 - spaces count

console.log('trim:', '[' + text.trim() + ']'); // removes spaces at both ends
console.log('upper:', text.toUpperCase());
console.log('lower:', text.toLowerCase());

console.log('charAt(2):', 'Hello'.charAt(2)); // 'l'
console.log('char code of A:', 'A'.charCodeAt(0)); // 65

/**
 * Searching
 */
var sentence = 'the quick brown fox';
console.log('indexOf("quick"):', sentence.indexOf('quick')); // 4
console.log('indexOf("cat"):', sentence.indexOf('cat')); // -1 when not found
console.log('lastIndexOf("o"):', sentence.lastIndexOf('o')); // 17

/**
 * Cutting a string
 * slice(start, end)      - negative numbers count from the end, end not included
 * substring(start, end)  - like slice but negative numbers become 0
 */
console.log('slice(4, 9):', sentence.slice(4, 9)); // 'quick'
console.log('slice(-3):', sentence.slice(-3)); // 'fox'
console.log('substring(4, 9):', sentence.substring(4, 9)); // 'quick'

/**
 * Splitting and joining
 */
var csv = 'red,green,blue';
var colors = csv.split(','); // ['red', 'green', 'blue']
console.log('split:', colors);
console.log('join back:', colors.join(' | '));

/**
 * replace replaces the FIRST match only, unless you use a global RegExp (see file 72).
 */
console.log('replace first:', 'a-a-a'.replace('a', 'b')); // 'b-a-a'

/**
 * Checking the start and content of a string: ES5 only has indexOf.
 * (startsWith, includes are ES2015+.)
 */
var url = 'https://example.com';
console.log('starts with https?', url.indexOf('https') === 0); // true

/**
 * Repeating a string: ES5 has no repeat(). Use join on an array.
 */
var line = new Array(11).join('-'); // 10 dashes
console.log(line);

/**
 * NUMBERS are all 64-bit floating point in ES5. This causes surprises.
 */
console.log('0.1 + 0.2 =', 0.1 + 0.2); // 0.30000000000000004
console.log('is it exactly 0.3?', 0.1 + 0.2 === 0.3); // false

/**
 * toFixed rounds to a number of decimal places and returns a STRING.
 */
console.log('toFixed(2):', (3.14159).toFixed(2)); // '3.14'
console.log('toFixed type:', typeof (3.14159).toFixed(2)); // 'string'

/**
 * Converting strings to numbers
 */
console.log('parseInt("42px"):', parseInt('42px', 10)); // 42 - stops at the first non-digit
console.log('parseFloat("3.5kg"):', parseFloat('3.5kg')); // 3.5
console.log('Number("42"):', Number('42')); // 42 - strict: fails on mixed text
console.log('Number("42px"):', Number('42px')); // NaN
console.log('always pass a radix to parseInt, e.g. parseInt("08", 10)');

/**
 * NaN (not a number) is never equal to anything, not even itself.
 * Use isNaN to test for it.
 */
console.log('NaN === NaN:', NaN === NaN); // false
console.log('isNaN("abc"):', isNaN('abc')); // true

/**
 * Useful built-in number limits (all ES1 / ES5)
 */
console.log('MAX_VALUE:', Number.MAX_VALUE);
console.log('MIN_VALUE:', Number.MIN_VALUE);
console.log('Infinity:', 1 / 0); // Infinity
