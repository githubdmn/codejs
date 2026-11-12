/**
 * Chapters from "Learning JavaScript Data Structures and Algorithms" (2e).
 * Each chapter lives in its own subdirectory with a runnable entrypoint.
 *
 * Usage: npm run start -- dsa/js-dsa-2e/chapter02
 */
import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

interface RunnableModule {
  main?: () => void;
}

const BOOK_ROOT: string = fileURLToPath(new URL('.', import.meta.url));
// Chapter that runs when no target is given. Change this to switch chapters.
const CURRENT_CHAPTER: string = 'chapter02';

export async function run(target: string = ''): Promise<void> {
  const absolute: string = resolve(BOOK_ROOT, target || CURRENT_CHAPTER);
  const entry: string = statSync(absolute, { throwIfNoEntry: false })?.isDirectory()
    ? join(absolute, 'index.ts')
    : absolute;

  const loaded: RunnableModule = await import(pathToFileURL(entry).href);
  loaded.main?.();
}
