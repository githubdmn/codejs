import { fileURLToPath } from 'node:url';

// --- Constrained generics ---------------------------------------------------

export function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

// --- Conditional types ------------------------------------------------------

export type IsArray<T> = T extends readonly unknown[] ? true : false;

export type ElementOf<T> = T extends readonly (infer U)[] ? U : never;

// --- Mapped types -----------------------------------------------------------

export type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// --- Runtime helpers used by tests -----------------------------------------

export function isArray<T>(value: T): IsArray<T> {
  return Array.isArray(value) as IsArray<T>;
}

export function firstElement<T>(items: readonly T[]): ElementOf<readonly T[]> {
  return items[0] as ElementOf<readonly T[]>;
}

// --- Demo -------------------------------------------------------------------

function main(): void {
  const people = [
    { name: 'Ada', age: 36 },
    { name: 'Alan', age: 41 },
  ];

  console.log('pluck names:', pluck(people, 'name'));
  console.log('pluck ages:', pluck(people, 'age'));

  console.log('isArray([1,2,3]):', isArray([1, 2, 3]));
  console.log('isArray("hi"):', isArray('hi'));

  console.log('firstElement([10,20,30]):', firstElement([10, 20, 30]));

  const frozen: ReadonlyDeep<{ a: { b: number } }> = { a: { b: 1 } };
  console.log('ReadonlyDeep value:', frozen.a.b);

  const partial: Optional<{ a: number; b: number }, 'b'> = { a: 1 };
  console.log('Optional value:', partial);
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  main();
}
