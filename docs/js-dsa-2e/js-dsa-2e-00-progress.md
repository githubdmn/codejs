# Learning JavaScript DSA (2e) — Progress

Book: *Learning JavaScript Data Structures and Algorithms, 2nd Ed.* (Loiane Groner)

## Chapters

| Chapter | Lesson                                       | Practice file                                        | Tests                                                     | Status      |
|---------|----------------------------------------------|------------------------------------------------------|-----------------------------------------------------------|-------------|
| Ch2     | [Arrays](./js-dsa-2e-chapter02-01-arrays.md) | `src/dsa/js-dsa-2e/chapter02/chapter02-01-arrays.ts` | `src/dsa/js-dsa-2e/chapter02/chapter02-01-arrays.test.ts` | In progress |

## Run

| Command                                                       | What it does                                  |
|---------------------------------------------------------------|-----------------------------------------------|
| `npm start`                                                   | Runs the current chapter (`chapter02`)        |
| `npm start -- dsa/js-dsa-2e/chapter02/chapter02-01-arrays.ts` | Runs the practice file through the dispatcher |
| `npx vitest run src/dsa/js-dsa-2e/chapter02`                  | Runs only Chapter 2 tests                     |

## Chapter 2 exercises

Status: `Not started` · `In progress` · `Done`

Each function's tests are `it.todo` placeholders until it is implemented. Replace them with real `it(...)` blocks as you
go.

| #  | Exercise                          | Function(s)                                 | Status      |
|----|-----------------------------------|---------------------------------------------|-------------|
| 1  | Reverse in place                  | `reverseInPlace`                            | Not started |
| 2  | Rotate array by k                 | `rotateRight`                               | Not started |
| 3  | Deduplicate sorted array          | `dedupeSorted`                              | Not started |
| 4  | Matrix transpose (fill-bug proof) | `buggyMatrix`, `correctMatrix`, `transpose` | Not started |
| 5  | Merge two sorted arrays           | `mergeSorted`                               | Not started |
| 6  | `groupBy` with `reduce`           | `groupBy`                                   | Not started |
| 7  | Prefix-sum `rangeSum`             | `createPrefixSum`                           | Not started |
| 8  | Unique values                     | `uniqueValues`                              | Not started |
| 9  | Binary search                     | `binarySearch`                              | Not started |
| 10 | Sparse array fix                  | `fixedDenseMap`                             | Not started |

## Log

- 2026-11-12: Practice file and `npm start` wiring created. Test file added with a `main()` check and `todo`
  placeholders. No exercises implemented yet.
