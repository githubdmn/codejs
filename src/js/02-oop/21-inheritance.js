console.log('Prototypal inheritance\n');

/**
 * Every object in JS inhehits from global "base" object prototype.
 *
 *
 */

// Example of true prototypal inheritance style
// in JavaScript.

// object creation using the literal
// object notation {}.
const foo = { name: 'foo', one: 1, two: 2 };

// Another object.
const bar = { two: 'two', three: 3 };

// Object.setPrototypeOf() is a method introduced in ECMAScript 2015.
// For the sake of simplicity, let us pretend
// that the following line works regardless of the
// engine used:
Object.setPrototypeOf(bar, foo); // foo is now the prototype of bar.

// If we try to access foo's properties from bar
// from now on, we'll succeed.
bar.one; // Resolves to 1.

// The child object's properties are also accessible.
bar.three; // Resolves to 3.

// Own properties shadow prototype properties
bar.two; // Resolves to "two"
bar.name; // unaffected, resolves to "foo"
foo.name; // Resolves to "foo"

/** */

const foo = { one: 1, two: 2 };

// bar.[[prototype]] = foo
const bar = Object.create(foo);

bar.three = 3;

bar.one; // 1
bar.two; // 2
bar.three; // 3
