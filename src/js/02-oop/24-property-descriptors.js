console.log('Property descriptors\n');

let person = { name: 'Alice' };

/**
 * Using keys like this gives the key's value only
 * these keys are not with properties
 * the result is: name
 * as string
 */
for (let key in person) console.log(key);

/**
 * For accessing properties with keys
 * Object.keys() is used
 * Also, in that case the keys have properties
 * the result is: ['name']
 * with properties that can prevent properties
 * bein enumerated
 */

const keys = Object.keys(person);
console.log(keys);

//

const proto = Object.getPrototypeOf(person);
console.log(proto);
const descriptor = Object.getOwnPropertyDescriptor(proto, 'toString');
console.log(descriptor);
/** :30 output
 * {
 *    configurable: true, // that means the object member can be deleted
 *    enumerable: false, // the when iterate therough person object,
 *     // toString() cannot be seen
 *    writable: true, // the method implementation can be overwritten
 *    value: [Function: toString]
 */

let man = { name: 'Adam' };
Object.defineProperty(man, 'name', {
	writable: false,
});

man.name = 'John'; // the name cannot be changed
console.log(man); // the output is { name: 'Adam' }

let woman = { name: 'Eve' };
Object.defineProperty(woman, 'name', {
	enumerable: false,
});
console.log(Object.keys(woman)); // the output is an empty array []

let girl = { name: 'Jane' };
Object.defineProperty(girl, 'name', {
	configurable: false,
});
delete person.name; // this will be ignored
console.log(girl); // the output is { name: 'Jane' } name property is not deleted
