import { fileURLToPath } from 'node:url';

/**
 * Chapter 2 practice file. Fill in each function; they throw until implemented.
 */

export function main(): void {
  console.log('chapter02-01-arrays: practice file. Implement the exercises in this file.');
}

export function reverseInPlace<T>(arr: T[]): T[] {
  let l = 0;
  let r = arr.length - 1;
  while (l < r) {
    // The loop invariant keeps both indices in range, so the `!` is safe.
    [arr[l], arr[r]] = [arr[r]!, arr[l]!];
    l++;
    r--;
  }
  return arr;
}

export function rotateRight<T>(arr: T[], k: number): T[] {
  throw new Error('Not implemented');
}

export function dedupeSorted(arr: number[]): number {
  throw new Error('Not implemented');
}

export function buggyMatrix(rows: number, cols: number): number[][] {
  throw new Error('Not implemented');
}

export function correctMatrix(rows: number, cols: number): number[][] {
  throw new Error('Not implemented');
}

export function transpose(matrix: number[][]): number[][] {
  throw new Error('Not implemented');
}

export function mergeSorted(a: number[], b: number[]): number[] {
  throw new Error('Not implemented');
}

export function groupBy<T, K extends PropertyKey>(arr: T[], keyFn: (x: T) => K): Record<K, T[]> {
  throw new Error('Not implemented');
}

export function createPrefixSum(arr: number[]): { rangeSum(i: number, j: number): number } {
  throw new Error('Not implemented');
}

export function uniqueValues<T>(arr: T[]): T[] {
  throw new Error('Not implemented');
}

export function binarySearch(arr: number[], target: number): number {
  throw new Error('Not implemented');
}

export function fixedDenseMap(arr: (number | undefined)[]): (number | undefined)[] {
  throw new Error('Not implemented');
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  main();
}
