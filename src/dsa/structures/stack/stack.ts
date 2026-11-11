/**
 * A generic LIFO stack backed by an array.
 */
export class Stack<T> {
  private readonly items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T {
    const item = this.items.pop();
    if (item === undefined) {
      throw new Error('Stack is empty');
    }
    return item;
  }

  peek(): T {
    const item = this.items[this.items.length - 1];
    if (item === undefined) {
      throw new Error('Stack is empty');
    }
    return item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
