import { describe, expect, it } from 'vitest';
import { Stack } from './stack.js';

describe('Stack', () => {
  it('is empty when created', () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty()).toBe(true);
    expect(stack.size()).toBe(0);
  });

  it('pushes and pops in LIFO order', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    expect(stack.size()).toBe(3);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
    expect(stack.isEmpty()).toBe(true);
  });

  it('peeks at the top without removing it', () => {
    const stack = new Stack<string>();
    stack.push('a');
    stack.push('b');
    expect(stack.peek()).toBe('b');
    expect(stack.size()).toBe(2);
  });

  it('throws when popping from an empty stack', () => {
    const stack = new Stack<number>();
    expect(() => stack.pop()).toThrow('Stack is empty');
  });

  it('throws when peeking at an empty stack', () => {
    const stack = new Stack<number>();
    expect(() => stack.peek()).toThrow('Stack is empty');
  });
});
