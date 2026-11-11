# Binary Search

Returns the index of a target value in a sorted array, or `-1` if the value is not present.

## Usage

```ts
import { binarySearch } from './binary-search.js';

binarySearch([1, 3, 5, 7, 9], 5); // 2
binarySearch([1, 3, 5, 7, 9], 4); // -1
binarySearch([], 1);              // -1
```

## Notes

- The input array must be sorted in ascending order. Results are undefined otherwise.
- Runs in O(log n) time and O(1) space.

## Tests

Tests live next to the source in `binary-search.test.ts`:

```bash
npm test
```
