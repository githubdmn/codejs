import { describe, expect, it } from 'vitest';
import { binarySearch } from './binary-search.js';

describe('binarySearch', () => {
  it('finds a value in the middle', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 5)).toBe(2);
  });

  it('finds the first and last values', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 1)).toBe(0);
    expect(binarySearch([1, 3, 5, 7, 9], 9)).toBe(4);
  });

  it('returns -1 when the value is absent', () => {
    expect(binarySearch([1, 3, 5, 7, 9], 4)).toBe(-1);
  });

  it('returns -1 for an empty array', () => {
    expect(binarySearch([], 1)).toBe(-1);
  });
});
