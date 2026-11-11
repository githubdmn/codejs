// Generators and iterables (ES2015+)

function* range(start, end, step = 1) {
	for (let i = start; i < end; i += step) {
		yield i;
	}
}

const evens = {
	*[Symbol.iterator]() {
		for (const n of range(0, 10)) {
			if (n % 2 === 0) {
				yield n;
			}
		}
	},
};

for (const n of evens) {
	console.log(n);
}
