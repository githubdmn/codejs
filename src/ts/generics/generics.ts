export function identity<T>(value: T): T {
  return value;
}

export function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
