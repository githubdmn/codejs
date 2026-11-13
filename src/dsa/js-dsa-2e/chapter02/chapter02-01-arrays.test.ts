import { afterEach, describe, expect, it, vi } from 'vitest';
import { main, reverseInPlace } from './chapter02-01-arrays.js';

describe('main', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the practice banner', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    main();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('practice file'));
  });
});

describe('reverseInPlace', () => {
  it('reverses the array in place and returns it', () => {
    const input = [1, 2, 3, 4, 5];
    const expected = [5, 4, 3, 2, 1];

    const result = reverseInPlace(input);

    expect(result).toEqual(expected);
    expect(result).toBe(input);
    expect(input).toEqual(expected);
  });

  it('handles empty and single-element arrays', () => {
    const empty: number[] = [];
    expect(reverseInPlace(empty)).toEqual([]);

    const single = [42];
    expect(reverseInPlace(single)).toEqual([42]);
  });
});

describe('rotateRight', () => {
  it.todo('rotates elements right by k');
  it.todo('handles k larger than the array length');
});

describe('dedupeSorted', () => {
  it.todo('returns the count of unique values and moves them to the front');
  it.todo('handles empty arrays');
});

describe('buggyMatrix', () => {
  it.todo('shares one row reference across all rows');
});

describe('correctMatrix', () => {
  it.todo('creates independent rows');
});

describe('transpose', () => {
  it.todo('swaps rows and columns');
});

describe('mergeSorted', () => {
  it.todo('merges two sorted arrays into one sorted array');
  it.todo('handles an empty input');
});

describe('groupBy', () => {
  it.todo('groups items by the key returned from keyFn');
});

describe('createPrefixSum', () => {
  it.todo('answers rangeSum(i, j) inclusively');
  it.todo('handles the full range and a single element');
});

describe('uniqueValues', () => {
  it.todo('returns each value once, preserving first-seen order');
});

describe('binarySearch', () => {
  it.todo('returns the index of a present target');
  it.todo('returns -1 when the target is absent');
});

describe('fixedDenseMap', () => {
  it.todo('maps sparse input into a dense array');
});
