
# Chapter 2 Deep Dive: Arrays

## Part 1 — What an Array Actually Is (the mental model)

Before touching code, let's nail the mental model. The book *says* "an array is the simplest memory data structure" —
but that hides the important truth:

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

This is why the book says "JavaScript arrays are mutable objects... the object will grow dynamically." It's not a small
detail — it's the reason every operation *feels* easy in JS.

### The hidden cost (what the book glosses over)

"Grows dynamically" doesn't mean "free." Under the hood, V8 (Chrome's engine):

- Starts with a **small backing store** (e.g., 4 slots).
- When you `push` past capacity, it **reallocates** (roughly 1.5–2× the old size) and **copies** all elements.
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
- `map` never skips holes? **Wrong** — `map` DOES skip holes (sparse array trap again).

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
[].reduce((a, b) => a + b);           // ❌ TypeError — reduce of empty array
[].reduce((a, b) => a + b, 0);        // ✅ 0
[{ x: 1 }, { x: 2 }].reduce((a, b) => a.x + b.x); // ❌ 1 + undefined... → NaN
[{ x: 1 }, { x: 2 }].reduce((a, b) => a + b.x, 0); // ✅ 3
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
- **Cannot** break early? Wrong — `for...of` *can* `break`/`continue`. It's `forEach` that can't.

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

## Part 8 — Typed Arrays (the book's weakest section)

The book barely scratches this. Here's the actual value.

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

### When to actually use them

1. **WebGL / graphics** — pixel data, vertices.
2. **Binary file parsing** — PNG, WAV, protocols.
3. **Performance-critical numeric loops** — V8 optimizes these far better than normal arrays (no boxing).
4. **Interop with C/WebAssembly** — `ArrayBuffer` is the shared memory model.

### When NOT to use them

- Generic business logic.
- Anything with mixed types.
- You lose `map`/`filter` returning typed arrays without effort (they return typed arrays, which surprises people).

**DSA relevance**: Typed arrays are *fixed-size* by definition — the exact opposite of JS's dynamic arrays. In Chapter
10 (heap sort), you'll build a **fixed-size heap array**; that's the *conceptual* model TypedArrays give you — even if
you use normal arrays.

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

### The graph-of-matrix pattern (foreshadowing Ch9)

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

That's Dijkstra's input format in Chapter 9. Keep it in mind.

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

## Part 11 — What the book gets right and what it underplays

### Gets right

- Complexity tradeoffs of push/pop vs unshift/shift ✅
- `splice` for arbitrary mutation ✅
- Iterator methods (`map`/`filter`/`reduce`) as the foundation of functional JS ✅
- Typed arrays as a *special* case ✅

### Underplays (we fixed above)

- **`new Array(n)` trap** — big one
- **Sparse arrays** — never mentioned, but bites everyone
- **`Array.from` with mapper** — the correct way to build dense matrices
- **`a - b` comparator is not safe for strings** — needs `localeCompare`
- **Amortized cost** of `push` — "grows dynamically" is glossed over
- **`Array.prototype.sort` stability** — matters for objects
- **`fill(new Array(...))` matrix bug** — the #1 gotcha in 2D
- **`reduce` without initial value** — catastrophic bug source

### Deliberately skipped (fine for a beginner book, but note)

- **Iteration protocol** deep dive (aider will help you here)
- **`Array.prototype.flat` / `flatMap`** — ES2019, useful but not DSA-core
- **`Array.prototype.at(-1)`** — ES2022, `arr.at(-1)` beats `arr[arr.length - 1]`
- **`Object.freeze`** for immutability patterns

---

## Part 12 — Chapter 2 exercises to give aider

Here are exercises I'd actually give you. Each one exercises a chapter-2 concept *and* previews a later chapter.

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

---

## Now, prompts for aider

Given the `books/<slug>/ROADMAP.md` structure we agreed on, here's a **sequence of prompts** for Chapter 2. Paste them
one at a time.

### Prompt 0 — setup (one-time)

```text
/read CONVENTIONS.md
/read ROADMAP.md
/read books/js-dsa-2e/ROADMAP.md

We are working on Chapter 2: Arrays of "Learning JavaScript Data Structures and Algorithms, 2e" (Loiane Groner).

Please confirm the following before we start:
1. Book code lives in src/dsa/chapter-02/, tests in tests/dsa/chapter-02/.
2. Language is TypeScript, strict mode.
3. Do NOT implement exercises for me unless I ask. If I ask "how would I approach X", give me pseudocode or a skeleton, not the full solution.
4. After every code change, run `npm run typecheck` and `npm test`.

Just confirm and wait. Do not create files yet.
```

### Prompt 1 — scaffolding + first exercise

```text
Create src/dsa/chapter-02/exercises.ts with the following exported function skeletons (bodies = throw new Error('Not implemented')):

- reverseInPlace<T>(arr: T[]): T[]
- rotateRight<T>(arr: T[], k: number): T[]
- dedupeSorted(arr: number[]): number
- transpose(matrix: number[][]): number[][]
- mergeSorted(a: number[], b: number[]): number[]
- groupBy<T, K extends PropertyKey>(arr: T[], keyFn: (x: T) => K): Record<K, T[]>
- createPrefixSum(arr: number[]): { rangeSum(i: number, j: number): number }
- binarySearch(arr: number[], target: number): number

Also create tests/dsa/chapter-02/exercises.test.ts with:
- A basic happy-path test for each function.
- At least one edge case per function (empty array, single element, out of range, etc.).

Do NOT implement the functions yet. Just the skeletons and tests. Then run `npm test` and show me the output — it should fail with "Not implemented", which is expected.
```

### Prompt 2 — first exercise, guided

```text
Now let's implement `reverseInPlace` and `rotateRight` in src/dsa/chapter-02/exercises.ts.

Rules:
1. Before writing code, give me a 2–3 sentence plan for each, including the time/space complexity.
2. Then write the implementations.
3. Then run `npm test` — do not stop until both pass.
4. If a test fails, explain WHY it failed before fixing it.
```

### Prompt 3 — the matrix lesson

```text
Before we implement `transpose`, I want to make sure I understand the sparse-matrix trap.

In src/dsa/chapter-02/matrix-demo.ts, create two exported functions:
- buggyMatrix(rows: number, cols: number): number[][]  — using new Array(rows).fill(new Array(cols).fill(0))
- correctMatrix(rows: number, cols: number): number[][] — using Array.from

Also create tests/dsa/chapter-02/matrix-demo.test.ts with a test that:
- Mutates buggyMatrix(3,3)[0][0] = 99 and asserts that buggyMatrix(3,3)[1][0] === 99 (proving the bug).
- Mutates correctMatrix(3,3)[0][0] = 99 and asserts that correctMatrix(3,3)[1][0] === 0 (proving it's fixed).

Explain in a comment in the source file what is happening in memory.
```

### Prompt 4 — reduce + functional pipeline

```text
Implement `groupBy` and `mergeSorted` in src/dsa/chapter-02/exercises.ts.

Requirements:
1. `groupBy` must use `Array.prototype.reduce`. Signature: `groupBy<T, K extends PropertyKey>(arr: T[], keyFn: (x: T) => K): Record<K, T[]>`.
2. `mergeSorted` must be O(n+m) and not use `sort` internally.
3. For each, first tell me the plan in 2–3 sentences.
4. Then write the code.
5. Run `npm test` and iterate until green.

After that, add a new test called "functional pipeline" that composes filter + map + reduce to compute the sum of squares of even numbers in [1..10].
```

### Prompt 5 — prefix sums + binary search

```text
Implement `createPrefixSum` and `binarySearch` in src/dsa/chapter-02/exercises.ts.

Requirements:
1. `createPrefixSum` returns an object with a `rangeSum(i, j)` method that answers the sum of arr[i..j] in O(1). The preprocess step is O(n).
2. `binarySearch` returns the index of target, or -1 if not found. Assumes arr is sorted. Must be O(log n) — no fallback to `indexOf`.
3. Edge cases: empty array, target before the first element, target after the last element, duplicate values (return ANY valid index).
4. First give me pseudocode, then implement, then run `npm test`.

Add tests for: empty arr, target not present, target at boundaries, duplicate values.
```

### Prompt 6 — the sparse-array investigation

```text
Create src/dsa/chapter-02/sparse-investigation.ts that demonstrates these three behaviors with exported functions and a comment for each:

1. `mapSkipsHoles()` — show that [1,,3].map(x => x*2) leaves a hole.
2. `forEachSkipsHoles()` — show that forEach skips the hole.
3. `JSONStringifiesHolesAsNull()` — show that JSON.stringify([1,,3]) === '[1,null,3]'.

Write tests/dsa/chapter-02/sparse-investigation.test.ts asserting the exact observed behaviors.
Also add a `fixedDenseMap()` function that maps [1,,3] into [2, undefined, 6] using Array.from.

Explain why this matters when implementing data structures with arrays.
```

### Prompt 7 — wrap up

```text
/read books/js-dsa-2e/ROADMAP.md

Chapter 2 is done. Please:
1. Run `npm run typecheck` and `npm test`.
2. Summarize for me: which functions are in src/dsa/chapter-02/ and how many tests cover them.
3. If all green, update books/js-dsa-2e/ROADMAP.md: mark Ch2 as [x] Completed, and move the "← current" marker to Ch3.
```

---

## Final meta-note

The most valuable thing you'll get out of Chapter 2 isn't the methods — it's the **asymmetry** (end = O(1), front = O(
n)) and the **dense-vs-sparse** distinction. Every subsequent data structure is a response to one of those two problems.
Keep those in mind as you push through Chapters 3–9.

When you're done with the prompts and everything is green, tell me and we'll do **Chapter 3: Stacks** — and this time
the book starts asking "how do I keep O(1) on both ends?" which is the real motivation for the stack/queue/linked-list
trio.
