/**
 * Data structures & algorithms dispatcher. Routes `dsa/<book>/...` targets
 * to the matching book dispatcher, and loads anything else relative to `dsa/`.
 *
 * Usage: npm run start -- dsa/js-dsa-2e/chapter02
 */
import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { run as runBook } from './js-dsa-2e/index.js';

const DSA_ROOT = fileURLToPath(new URL('.', import.meta.url));
const BOOK_PREFIX = 'js-dsa-2e/';

export async function run(target: string): Promise<void> {
  if (target === '') {
    throw new Error('usage: npm run start -- dsa/<book-or-topic>/<chapter>');
  }

  if (target.startsWith(BOOK_PREFIX)) {
    await runBook(target.slice(BOOK_PREFIX.length));
    return;
  }

  const absolute = resolve(DSA_ROOT, target);
  const entry = statSync(absolute, { throwIfNoEntry: false })?.isDirectory()
    ? join(absolute, 'index.ts')
    : absolute;
  await import(pathToFileURL(entry).href);
}
