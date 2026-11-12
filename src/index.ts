import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { run as runDsa } from './dsa/index.js';

const SRC_ROOT = fileURLToPath(new URL('.', import.meta.url));

async function main(): Promise<void> {
  const target = (process.argv[2] ?? '').replace(/\\/g, '/');

  if (target === '') {
    console.error('usage: npm run start -- <path-under-src>');
    console.error('example: npm run start -- dsa/js-dsa-2e/chapter02');
    process.exitCode = 1;
    return;
  }

  // Remove the target so the invoked file only sees its own arguments.
  process.argv.splice(2, 1);

  try {
    if (target.startsWith('dsa/')) {
      await runDsa(target.slice('dsa/'.length));
      return;
    }

    const absolute = resolve(SRC_ROOT, target);
    const entry = statSync(absolute, { throwIfNoEntry: false })?.isDirectory()
      ? join(absolute, 'index.ts')
      : absolute;
    await import(pathToFileURL(entry).href);
  } catch (err) {
    console.error(`failed to run ${target}:`, err);
    process.exitCode = 1;
  }
}

void main();
