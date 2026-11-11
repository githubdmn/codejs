/**
 * Returns the index of `target` in `sorted`, or -1 if it is not present.
 * `sorted` must be in ascending order.
 */
export function binarySearch(sorted: readonly number[], target: number): number {
  let low = 0;
  let high = sorted.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const value = sorted[mid];

    if (value === undefined) return -1;
    if (value === target) return mid;

    if (value < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
