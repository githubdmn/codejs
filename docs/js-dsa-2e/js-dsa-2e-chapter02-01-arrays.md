# Chapter 2 Deep Dive: Arrays

> **Progress tracker:** [js-dsa-2e-00-progress.md](./js-dsa-2e-00-progress.md)
> **Practice file:** `src/dsa/js-dsa-2e/chapter02/chapter02-01-arrays.ts` (run with `npm start`)
>
> **Path note:** Use `src/dsa/js-dsa-2e/` for code and sibling `*.test.ts` files, per `CONVENTIONS.md`. The real
> typecheck is `npx tsc -p src/tsconfig.json --noEmit`; `npm run typecheck` checks nothing.

## Part 1 — What an Array Actually Is (the mental model)

Before touching code, let's nail the mental model. The book describes arrays as simple memory structures, but that
hides the important truth.

### In C/Java: arrays are **contiguous, fixed-size memory**

```
Memory:  [ 31.9 ][ 35.3 ][ 42.4 ][ 52.0 ][ 60.8 ]
Index:      0       1       2       3       4
Address:  1000    1008    1016    1024    1032   (8 bytes each)
```

- Access `arr[3]` is **O(1)** because address = `base + 3 * elementSize` — pure arithmetic.
- Inserting in the middle requires **shifting** every element to the right. O(n).
- Growing beyond the fixed size requires allocating a whole new block and **copying** everything.

### In JavaScript: arrays are **objects** (not raw memory)

This is the single most important thing to internalize:

```javascript
const arr = [1, 2, 3];
typeof arr;           // "object"  ← NOT "array"
Array.isArray(arr);   // true      ← the *correct* way to check
```

A JS array is a special kind of object with:

- Numeric keys (`0`, `1`, `2`, …) that act as indices
- A magic `length` property
- Built-in methods from `Array.prototype`
- **No fixed capacity** — the engine resizes it for you

That flexibility is why every operation *feels* easy in JS. It's not a small detail; it's the reason the rest of this
chapter is about cost.

### The hidden cost (what the book glosses over)

"Grows dynamically" doesn't mean "free." Under the hood, V8 (Chrome's engine):

- Keeps a backing store that is larger than the array's `length`.
- When you `push` past capacity, it **reallocates** a bigger store and **copies** all elements. The exact growth
  policy is an implementation detail.
- This amortizes to **O(1) average** per `push` — but a single `push` can occasionally be O(n).

That "amortized O(1)" phrase is worth remembering — it comes up again in hash tables (Chapter 7).

---

## Part 2 — Creating Arrays: The Gotchas

The book mentions three ways, but only briefly. Let's dissect:

```javascript
const a = new Array();        // []
const b = new Array(7);       // [ <7 empty items> ]  ← NOT [7]!
const c = new Array(1, 2, 3); // [1, 2, 3]
const d = [];                 // []           ← preferred
const e = [1, 2, 3];          // [1, 2, 3]    ← preferred
```

### The `new Array(n)` trap

```javascript
new Array(3);        // [ <3 empty items> ]  — length 3, no elements
new Array(3).length; // 3
new Array(3).fill(0); // [0, 0, 0]          — now real elements
new Array(3).map(x => 1); // [ <3 empty items> ]  ← map SKIPS holes!
```

**Interview trap**: `new Array(3).map(() => 1)` returns `[ <3 empty items> ]`, not `[1,1,1]`. Why? Because `.map` only
calls the callback for **existing** indices, and a sparse array has no elements at indices 0, 1, 2. This is a classic
bug.

**Fix**: use `Array.from({ length: 3 }, () => 1)` or `Array(3).fill(0).map(...)`.

### Sparse arrays — a whole category of bugs

```javascript
const a = [1, , 3];     // [1, <empty>, 3]  — length 3, only 2 elements
a.length;               // 3
1 in a;                 // false   ← hole at index 1
a.forEach(x => console.log(x)); // logs 1, then 3 — skips the hole
JSON.stringify(a);      // "[1,null,3]"  ← hole becomes null
```

**Why this matters for DSA**: When you implement your own structures with arrays, always `push` (dense) rather than
assigning to arbitrary high indices. Sparse arrays tank performance and confuse iteration.

---

## Part 3 — The Operations Deep Dive

The book lists methods. Let's rank them by **actual cost**, because that's what you'll be asked in interviews.

### The complexity table (memorize this)

| Operation           | Method                | Complexity         | Why                            |
|---------------------|-----------------------|--------------------|--------------------------------|
| **Append**          | `push(x)`             | **O(1) amortized** | Add at end; occasional realloc |
| **Pop**             | `pop()`               | **O(1)**           | Just decrement length          |
| **Prepend**         | `unshift(x)`          | **O(n)**           | Shift all n elements right     |
| **Remove first**    | `shift()`             | **O(n)**           | Shift all n-1 elements left    |
| **Access**          | `arr[i]`              | **O(1)**           | Direct index                   |
| **Insert middle**   | `splice(i, 0, x)`     | **O(n)**           | Shift tail                     |
| **Remove middle**   | `splice(i, 1)`        | **O(n)**           | Shift tail                     |
| **Search**          | `indexOf(x)`          | **O(n)**           | Linear scan                    |
| **Search (sorted)** | —                     | **O(log n)**       | Use binary search (Ch10)       |
| **Sort**            | `sort(cmp)`           | **O(n log n)**     | V8 uses Timsort                |
| **Iterate**         | `forEach` / `for..of` | **O(n)**           | One pass                       |

**The core asymmetry**: end = fast, front/middle = slow. Every data structure in this book is an *answer* to "how do I
avoid this asymmetry?"

- **Stack** → uses only `push`/`pop` → everything O(1)
- **Queue** → needs `push` + `shift` → but `shift` is O(n)! → **Linked List solves this** (Ch5)
- **Deque** (not in this book but good to know) → circular buffer → O(1) both ends

---

## Part 4 — `splice`, the Swiss Army Knife

The book shows `splice` once. Here's the full picture — you'll use it constantly.

### Signature

```javascript
arr.splice(start, deleteCount, ...itemsToInsert)
```

### The four behaviors

```javascript
const a = [1, 2, 3, 4, 5];

// 1. Remove from middle
a.splice(1, 2);           // a = [1, 4, 5], returns [2, 3]

// 2. Insert at position
const b = [1, 2, 3];
b.splice(1, 0, 99);       // b = [1, 99, 2, 3], returns []

// 3. Replace
const c = [1, 2, 3, 4];
c.splice(1, 2, 'x', 'y'); // c = [1, 'x', 'y', 4], returns [2, 3]

// 4. Remove from end
const d = [1, 2, 3];
d.splice(-1, 1);          // d = [1, 2], returns [3]
```

### Why `splice` is O(n)

It **mutates in place**, shifting every element after `start` by `deleteCount - itemsToInsert.length`. That shift is O(
n).

### The `slice` vs `splice` trap

```javascript
arr.slice(start, end)   // NON-mutating, returns copy
arr.splice(start, end)  // MUTATING, modifies original
```

**Slice** ends at `end` (exclusive). **Splice** takes a `count`. They're cousins with completely different semantics — a
classic interview question.

### `splice` returning removed elements

This is a beautiful, under-used fact:

```javascript
const [removed] = [1, 2, 3, 4].splice(1, 1);  // removed = 2
```

You can grab removed elements directly, no `indexOf` + `splice` two-step.

---

## Part 5 — `map` / `filter` / `reduce` — the functional core

The book covers these but only briefly. This trio is the **foundation of functional JS** (Chapter 11 will lean on this
hard).

### `map` — transform 1:1

```javascript
[1, 2, 3].map(x => x * 2);     // [2, 4, 6]
```

- Returns **new array**, same length.
- Never use `map` for side effects — that's `forEach`.
- `map` **skips holes**: the callback never runs for empty slots, and the holes stay in the result. This is the sparse
  array trap again.

```javascript
[1, , 3].map(x => x * 2);      // [2, <1 empty item>, 6]
```

### `filter` — keep matching

```javascript
[1, 2, 3, 4].filter(x => x % 2 === 0);  // [2, 4]
```

- Returns **new array**, length ≤ original.
- Always returns a dense array (holes become removed).

### `reduce` — fold to one value

```javascript
[1, 2, 3, 4].reduce((sum, x) => sum + x, 0);  // 10
```

Signature: `reduce(callback(accumulator, current, index, array), initialValue)`

**The `initialValue` trap**:

```javascript
[].reduce((a, b) => a + b);                          // ❌ TypeError — reduce of empty array
[].reduce((a, b) => a + b, 0);                       // ✅ 0
[{ x: 1 }, { x: 2 }].reduce((a, b) => a + b.x);      // ❌ "[object Object]2" — no initial value, so a starts as {x: 1}
[{ x: 1 }, { x: 2 }].reduce((a, b) => a + b.x, 0);   // ✅ 3
```

**Always pass an initial value** unless you're *absolutely* sure the array is non-empty and you understand the types.

### Composing them (this is where it gets fun)

```javascript
// Sum of squares of even numbers
[1, 2, 3, 4, 5, 6]
  .filter(x => x % 2 === 0)   // [2, 4, 6]
  .map(x => x * x)             // [4, 16, 36]
  .reduce((a, b) => a + b, 0); // 56
```

That pipeline is the **functional core** in one line. You'll reuse this pattern constantly.

---

## Part 6 — Sorting: The Trap Everyone Falls Into

The book gives this example:

```javascript
numbers.sort((a, b) => a - b);
```

Here's *why* it works and what happens without it.

### Default sort is **lexicographic** (string-based)

```javascript
[10, 9, 1, 100, 2].sort();
// [1, 10, 100, 2, 9]  ← WRONG for numbers
```

Because every element is coerced to a string and compared character-by-character (`"10"` < `"2"` because `'1' < '2'`).

### The compare function contract

```javascript
arr.sort((a, b) => {
  // return NEGATIVE → a comes before b
  // return POSITIVE → b comes before a
  // return 0        → leave as-is (stable in modern V8)
  return a - b;  // ascending
  // return b - a; // descending
});
```

### Why `a - b` works but `a < b ? -1 : ...` is safer

`a - b` returns a **number**, which is what `sort` expects. But if `a` or `b` is a string, `a - b` coerces to number and
can give `NaN`. `localeCompare` is the safe choice for strings:

```javascript
['Ana', 'ana', 'John'].sort((a, b) => a.localeCompare(b));
// case-insensitive, locale-aware
```

### Stability (advanced, but interview-common)

Modern V8 guarantees **stable sort** (ES2019+). That means:

```javascript
[{ n: 'a', v: 1 }, { n: 'b', v: 1 }, { n: 'c', v: 0 }].sort((x, y) => x.v - y.v);
// [{n: 'c', v: 0}, {n: 'a', v: 1}, {n: 'b', v: 1}]
//           ↑ 'a' stays before 'b' — stability preserved
```

Before ES2019, stability was **not guaranteed** — you had to sort by a tiebreaker. This matters when sorting objects.

---

## Part 7 — The ES6+ Additions, with real use cases

The book lists these. Here's what each one is *actually for*.

### `for...of` (preferred loop)

```javascript
for (const x of arr) console.log(x);
```

- Cleaner than `for (let i = 0; i < arr.length; i++)`.
- **Works with any iterable** (arrays, strings, Sets, Maps, generators).
- Can `break` and `continue`, unlike `forEach`.

### `Array.from(arrayLike, mapFn?)`

```javascript
Array.from('abc');              // ['a', 'b', 'c']  ← string is iterable
Array.from({ length: 3 });        // [undefined, undefined, undefined]
Array.from({ length: 3 }, (_, i) => i * 2); // [0, 2, 4]  ← map is built-in
Array.from(new Set([1, 2, 2, 3])); // [1, 2, 3]          ← dedupe
```

`Array.from` is the **correct** answer for `new Array(n).map(...)` traps.

### `Array.of(...)` — the "just build an array" method

```javascript
Array.of(7);        // [7]      ← unlike new Array(7) which is [<7 empty>]
Array.of(1, 2, 3);  // [1, 2, 3]
```

### `fill(value, start?, end?)`

```javascript
new Array(5).fill(0);           // [0, 0, 0, 0, 0]
[1, 2, 3, 4, 5].fill(9, 1, 3);      // [1, 9, 9, 4, 5]  (start inclusive, end exclusive)
```

### `copyWithin(target, start, end?)`

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 3);  // [4,5,3,4,5]  — copies [3..] to [0..]
```

Useful for **shifting elements inside a fixed-size buffer** (circular buffers, heaps — you'll see this in Ch10).

### `find` / `findIndex`

```javascript
const people = [{ name: 'A', age: 20 }, { name: 'B', age: 30 }];
people.find(p => p.age > 25);       // {name: 'B', age: 30}
people.findIndex(p => p.age > 25);  // 1
people.find(p => p.age > 100);      // undefined
```

**`find` vs `filter` vs `some`**:

- `find` → first match, returns element
- `filter` → all matches, returns array
- `some` → at least one match, returns boolean
- `every` → all match, returns boolean

### `includes` (ES2016)

```javascript
[1, 2, 3].includes(2);   // true
[1, 2, 3].includes('2'); // false  ← strict equality
```

- **Unlike `indexOf`**, `includes` finds `NaN`:
  - `[NaN].indexOf(NaN)` → `-1`
  - `[NaN].includes(NaN)` → `true`

### Iterator protocol (`@@iterator`, `entries`, `keys`, `values`)

```javascript
const arr = ['a', 'b'];
const it = arr[Symbol.iterator]();
it.next(); // {value: 'a', done: false}
it.next(); // {value: 'b', done: false}
it.next(); // {value: undefined, done: true}

// entries: index + value pairs
[...arr.entries()]; // [[0, 'a'], [1, 'b']]

// keys: indices
[...arr.keys()];    // [0, 1]

// values: elements
[...arr.values()];  // ['a', 'b']
```

**Why this matters**: iterators are how `for...of` works. When you implement your own `Set` (Ch6) and `Map` (Ch7),
you'll want to support iteration the same way — you'll hand out an object with a `next()` method.

---

## Part 8 — Typed Arrays

Typed arrays are a special case worth knowing, even though this chapter's exercises use normal arrays.

### What they are

Fixed-type, fixed-size, backed by **raw binary buffers**. Not objects.

```javascript
const buf = new ArrayBuffer(16);       // 16 bytes of raw memory
const i32 = new Int32Array(buf);       // view as 4 × 32-bit integers
i32[0] = 42;
i32[1] = -7;
```

### The 9 types

| Type                | Bytes | Range                         |
|---------------------|-------|-------------------------------|
| `Int8Array`         | 1     | -128..127                     |
| `Uint8Array`        | 1     | 0..255                        |
| `Uint8ClampedArray` | 1     | 0..255 (clamps, doesn't wrap) |
| `Int16Array`        | 2     | -32768..32767                 |
| `Uint16Array`       | 2     | 0..65535                      |
| `Int32Array`        | 4     | -2^31..2^31-1                 |
| `Uint32Array`       | 4     | 0..2^32-1                     |
| `Float32Array`      | 4     | IEEE 754 single               |
| `Float64Array`      | 8     | IEEE 754 double               |

### When to use them

1. **Binary data** — image pixels, audio samples, file or network protocols.
2. **Interop with WebAssembly** — `ArrayBuffer` is the shared memory model.
3. **Large numeric data** — typed storage can be faster than generic arrays. Measure before relying on it.

### When not to use them

- Generic business logic.
- Anything with mixed types.

**DSA relevance**: typed arrays are *fixed-size*, the opposite of JS's dynamic arrays. A fixed-size heap (a likely topic
in Chapter 10) matches that model, even if you implement it with normal arrays.

---

## Part 9 — The 2D Matrix (the practical core)

Chapter 8 (Trees) and Chapter 9 (Graphs) will use matrices. Let's front-load the technique.

### Building a dense 2D matrix correctly

```javascript
// WRONG — this creates `rows` references to the SAME array
const bad = new Array(3).fill(new Array(3).fill(0));
bad[0][0] = 1;
bad[1][0]; // 1  ← BUG! All rows share memory

// CORRECT — one array per row
const m = Array.from({ length: 3 }, () => new Array(3).fill(0));
m[0][0] = 1;
m[1][0]; // 0  ← good
```

**This is the #1 JS matrix bug.** Memorize `Array.from({length}, () => new Array(...))`.

### Iterating a matrix

```javascript
for (let i = 0; i < m.length; i++) {        // rows
  for (let j = 0; j < m[i].length; j++) {  // cols
    console.log(m[i][j]);
  }
}
```

### Adjacency matrix (preview of Chapter 9)

```javascript
// Adjacency matrix — 5 nodes, 0 = no edge, 1 = edge
const adj = [
  [0, 1, 0, 1, 0],
  [1, 0, 1, 0, 0],
  [0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0],
];
```

Adjacency matrices are a standard graph representation. Chapter 9 covers graphs.

### The jagged array

```javascript
const jagged = [[1], [2, 3], [4, 5, 6]];  // rows of different lengths
```

Perfectly legal — and sometimes you *want* it (adjacency lists, sparse data).

---

## Part 10 — Interview-Level Array Patterns

These will show up again in Chapters 10–12, but they're grounded in Chapter 2. Worth previewing.

### Pattern 1: Two pointers

```javascript
// Reverse in place — O(1) space
function reverse(arr) {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]];  // ES6 swap
    l++;
    r--;
  }
  return arr;
}
```

### Pattern 2: Sliding window

```javascript
// Max sum of any k consecutive elements — O(n)
function maxSumWindow(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let max = sum;
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];   // add right, remove left
    if (sum > max) max = sum;
  }
  return max;
}
```

### Pattern 3: Prefix sums

```javascript
// Answer "sum of arr[i..j]" in O(1) after O(n) preprocessing
function prefixSums(arr) {
  const pre = [0];
  for (let i = 0; i < arr.length; i++) pre[i + 1] = pre[i] + arr[i];
  return pre; // rangeSum(i, j) = pre[j+1] - pre[i]
}
```

### Pattern 4: In-place deduplication (sorted)

```javascript
// LeetCode "Remove Duplicates from Sorted Array" — returns new length
function dedupeSorted(arr) {
  if (arr.length === 0) return 0;
  let w = 1;
  for (let r = 1; r < arr.length; r++) {
    if (arr[r] !== arr[w - 1]) arr[w++] = arr[r];
  }
  return w;
}
```

### Pattern 5: The `reduce` "build anything" trick

```javascript
// Group by property — a classic
const people = [{ city: 'NY' }, { city: 'LA' }, { city: 'NY' }];
const byCity = people.reduce((acc, p) => {
  (acc[p.city] ||= []).push(p);
  return acc;
}, {});
// { NY: [...], LA: [...] }
```

That last one shows reduce is a general **fold** — it can build arrays, objects, Maps, anything.

---

## Part 11 — Chapter 2 exercises

Each exercise exercises a chapter-2 concept and previews a later chapter. Practice them in the file listed in the
[progress tracker](./js-dsa-2e-00-progress.md).

1. **Reverse in place** (two pointers) — O(n) time, O(1) space. Test with empty, single, even/odd lengths.
2. **Rotate array by k** — implement three ways: (a) three reverses, (b) `splice` + `unshift`, (c) cyclic replacements.
   Compare complexities.
3. **Deduplicate sorted array** (in-place, two pointers) — return new length. (LeetCode 26.)
4. **Matrix transpose** — must use `Array.from` trick for dense matrix. Prove the `fill(new Array())` bug exists by
   writing both.
5. **Merge two sorted arrays** — returns new sorted array. O(n+m). (LeetCode 88 — the classic.)
6. **`groupBy` function** — build a generic one using `reduce`. Should work for any array and any key-selector fn.
7. **Prefix-sum class** — `rangeSum(i, j)` in O(1) after O(n) preprocess. Test edge cases (empty range, full range,
   single element).
8. **Find all unique values** — implement with `Set` preview, then with `filter` + `indexOf` (O(n²)), then compare.
9. **Binary search on sorted array** — O(log n). Preview Ch10.
10. **Sparse array investigation** — write a script that proves `[1,,3].map(x=>x*2)` skips the hole, and fix it with
    `Array.from`.

### Not covered here

- `Array.prototype.flat` / `flatMap` (ES2019) — useful, not core to DSA.
- `Array.prototype.at(-1)` (ES2022) — `arr.at(-1)` reads better than `arr[arr.length - 1]`.
- `Object.freeze` for immutability patterns.

---

## How to work through this chapter

1. Read Parts 1–10.
2. Implement one function at a time in `src/dsa/js-dsa-2e/chapter02/chapter02-01-arrays.ts`, in the order listed in the
   progress tracker.
3. Replace the matching `it.todo` in `chapter02-01-arrays.test.ts` with real tests, then run
   `npx vitest run src/dsa/js-dsa-2e/chapter02`.
4. Update the status in `js-dsa-2e-00-progress.md`.
5. Run `npm start` to confirm the practice file still runs. Before finishing, run
   `npx tsc -p src/tsconfig.json --noEmit`; expect only the `node:sqlite` errors.

---

## Final meta-note

The most valuable thing you'll get out of Chapter 2 isn't the methods — it's the **asymmetry** (end = O(1), front = O(
n)) and the **dense-vs-sparse** distinction. Every subsequent data structure is a response to one of those two problems.
Keep those in mind as you push through Chapters 3–9.

When Chapter 2 is done, move on to Chapter 3: Stacks. That's where the question "how do I keep O(1) on both ends?"
starts to matter, and it motivates the stack/queue/linked-list trio.
