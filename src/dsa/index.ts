/**
 * Data structures & algorithms dispatcher. Routes `<book>/...` targets to the
 * matching book dispatcher, and loads anything else relative to `dsa/`.
 *
 * Usage: npm run start -- dsa/js-dsa-2e/chapter02
 */
import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Runner } from '../dispatch.types.js';
import { run as runJsDsa2e } from './js-dsa-2e/index.js';

const DSA_ROOT: string = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_BOOK: string = 'js-dsa-2e';
const BOOKS: Map<string, Runner> = new Map([['js-dsa-2e', runJsDsa2e]]);

export async function run(target: string = ''): Promise<void> {
  const [book = DEFAULT_BOOK, ...rest]: string[] = target.split('/').filter(Boolean);
  const runBook: Runner | undefined = BOOKS.get(book);
  if (runBook) {
    await runBook(rest.join('/'));
    return;
  }

  const absolute: string = resolve(DSA_ROOT, target);
  const entry: string = statSync(absolute, { throwIfNoEntry: false })?.isDirectory()
    ? join(absolute, 'index.ts')
    : absolute;
  await import(pathToFileURL(entry).href);
}
