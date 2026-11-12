/**
 * Chapters from "Learning JavaScript Data Structures and Algorithms" (2e).
 * Each chapter lives in its own subdirectory with a runnable entrypoint.
 *
 * Usage: npm run start -- dsa/js-dsa-2e/chapter02
 */
import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BOOK_ROOT = fileURLToPath(new URL('.', import.meta.url));

export async function run(target: string): Promise<void> {
  if (target === '') {
    throw new Error('usage: npm run start -- dsa/js-dsa-2e/<chapter>');
  }

  const absolute = resolve(BOOK_ROOT, target);
  const entry = statSync(absolute, { throwIfNoEntry: false })?.isDirectory()
    ? join(absolute, 'index.ts')
    : absolute;
  await import(pathToFileURL(entry).href);
}
