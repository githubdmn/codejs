import { describe, expect, it } from 'vitest';
import { first, identity } from './generics.js';

describe('identity', () => {
  it('returns the value it was given', () => {
    expect(identity(42)).toBe(42);
    expect(identity('hi')).toBe('hi');
  });
});

describe('first', () => {
  it('returns the first item of a non-empty array', () => {
    expect(first([1, 2, 3])).toBe(1);
  });

  it('returns undefined for an empty array', () => {
    expect(first([])).toBeUndefined();
  });
});
