console.log('\tDate and RegExp\n');

/**
 * DATE
 * Dates store the number of milliseconds since 1 January 1970 UTC (the "epoch").
 * Months are counted from 0: January = 0, December = 11.
 */
var now = new Date();
console.log('now:', now);
console.log('timestamp (ms):', now.getTime());
console.log('Date.now() ES5 timestamp:', Date.now()); // same idea without creating a Date

// new Date(year, monthIndex, day, hours, minutes, seconds)
var birthday = new Date(1990, 4, 15); // 15 May 1990 (month 4 = May)
console.log('year:', birthday.getFullYear()); // 1990
console.log('month (0-11):', birthday.getMonth()); // 4
console.log('day of month:', birthday.getDate()); // 15
console.log('day of week (0=Sunday):', birthday.getDay());

// from a string in ISO format
var fromString = new Date('2020-02-29T12:00:00Z');
console.log('ISO string:', fromString.toISOString()); // 2020-02-29T12:00:00.000Z

/**
 * Adding days: change the day and let Date fix the overflow.
 */
var later = new Date(2020, 0, 31);
later.setDate(later.getDate() + 1); // 1 February 2020
console.log('31 Jan + 1 day:', later.getMonth(), later.getDate()); // 1 1

/**
 * Comparing dates: compare the timestamps with < > or subtract.
 */
var older = new Date(2000, 0, 1);
var newer = new Date(2010, 0, 1);
console.log('older < newer:', older < newer); // true
console.log('difference in years (approx):', (newer - older) / (365 * 24 * 60 * 60 * 1000));

/**
 * Note: Date objects are mutable. setDate, setMonth, etc. change the object.
 */

/**
 * REGULAR EXPRESSIONS (RegExp)
 * A pattern written between slashes: /pattern/flags
 *   g - global, find all matches, not just the first
 *   i - ignore case
 *   m - multiline, ^ and $ match at each line
 */
var pattern = /cat/;
console.log('test "concatenate":', pattern.test('concatenate')); // true - 'cat' is inside
console.log('test "dog":', pattern.test('dog')); // false

/**
 * Case-insensitive and global flags
 */
var text = 'Cat, cat, CAT';
console.log('match with i and g:', text.match(/cat/gi)); // ['Cat', 'cat', 'CAT']
console.log('match without g:', text.match(/cat/i)); // only the first match, plus extra info

/**
 * Character classes and quantifiers
 *   \d  digit        \w  letter, digit or _       \s  whitespace
 *   +   one or more  *   zero or more            ?   optional
 *   ^   start        $   end
 */
var phone = /^\d{3}-\d{4}$/; // three digits, dash, four digits
console.log('valid phone 555-1234:', phone.test('555-1234')); // true
console.log('valid phone 5551234:', phone.test('5551234')); // false

/**
 * Capturing groups with ( ) let you pull parts of a match out.
 */
var dateText = '2024-06-30';
var parts = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
console.log('year group:', parts[1], 'month group:', parts[2], 'day group:', parts[3]);

/**
 * exec returns the match and the groups, and null when there is no match.
 */
var result = /(\w+)@(\w+)\.com/.exec('contact alice@example.com today');
console.log('user:', result[1], 'domain:', result[2]); // alice, example

/**
 * replace with a RegExp and the g flag replaces ALL matches.
 */
console.log('replace all spaces:', 'a b c'.replace(/ /g, '_')); // 'a_b_c'
console.log('swap groups:', 'Smith, John'.replace(/(\w+), (\w+)/, '$2 $1')); // 'John Smith'

/**
 * RegExp can also be built from a string when the pattern is not known in advance.
 */
var word = 'hello';
var dynamic = new RegExp('^' + word + '$', 'i');
console.log('dynamic test:', dynamic.test('HELLO')); // true
