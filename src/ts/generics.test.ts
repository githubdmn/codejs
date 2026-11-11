import { describe, expect, it } from 'vitest';
import {
  firstElement,
  isArray,
  pluck,
  type ElementOf,
  type IsArray,
  type Optional,
  type ReadonlyDeep,
} from './generics.js';

describe('pluck', () => {
  it('extracts a key from each item', () => {
    const people = [
      { name: 'Ada', age: 36 },
      { name: 'Alan', age: 41 },
    ];
    expect(pluck(people, 'name')).toEqual(['Ada', 'Alan']);
    expect(pluck(people, 'age')).toEqual([36, 41]);
  });

  it('returns an empty array for empty input', () => {
    const empty: { name: string }[] = [];
    expect(pluck(empty, 'name')).toEqual([]);
  });
});

describe('isArray', () => {
  it('returns true for arrays', () => {
    expect(isArray([1, 2, 3])).toBe(true);
  });

  it('returns false for non-arrays', () => {
    expect(isArray('hi')).toBe(false);
    expect(isArray(42)).toBe(false);
    expect(isArray({})).toBe(false);
  });
});

describe('firstElement', () => {
  it('returns the first element', () => {
    expect(firstElement([10, 20, 30])).toBe(10);
  });
});

describe('type-level sanity', () => {
  it('IsArray and ElementOf resolve as expected', () => {
    const a: IsArray<number[]> = true;
    const b: IsArray<string> = false;
    const c: ElementOf<readonly number[]> = 1;
    expect(a).toBe(true);
    expect(b).toBe(false);
    expect(c).toBe(1);
  });

  it('ReadonlyDeep and Optional are usable', () => {
    const frozen: ReadonlyDeep<{ a: { b: number } }> = { a: { b: 1 } };
    const partial: Optional<{ a: number; b: number }, 'b'> = { a: 1 };
    expect(frozen.a.b).toBe(1);
    expect(partial).toEqual({ a: 1 });
  });
});
