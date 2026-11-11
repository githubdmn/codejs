import { describe, expect, it } from 'vitest';
import { Stack } from './index.js';

describe('Stack', () => {
	it('pops values in LIFO order', () => {
		const stack = new Stack<number>();
		stack.push(1);
		stack.push(2);

		expect(stack.pop()).toBe(2);
		expect(stack.size).toBe(1);
	});

	it('reports empty state', () => {
		const stack = new Stack<string>();

		expect(stack.isEmpty()).toBe(true);
		expect(stack.peek()).toBeUndefined();
	});
});
