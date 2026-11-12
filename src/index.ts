import { statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Runner } from './dispatch.types.js';
import { run as runDsa } from './dsa/index.js';

const SRC_ROOT: string = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_TARGET: string = 'dsa';
const TOPICS: Map<string, Runner> = new Map([['dsa', runDsa]]);

async function main(): Promise<void> {
  const target: string = (process.argv[2] ?? DEFAULT_TARGET).replace(/\\/g, '/');

  if (target === '') {
    console.error('usage: npm run start -- <path-under-src>');
    console.error('example: npm run start -- dsa/js-dsa-2e/chapter02');
    process.exitCode = 1;
    return;
  }

  // Remove the target so the invoked file only sees its own arguments.
  process.argv.splice(2, 1);

  try {
    const [topic = '', ...rest]: string[] = target.split('/');
    const runTopic: Runner | undefined = TOPICS.get(topic);
    if (runTopic) {
      await runTopic(rest.join('/'));
      return;
    }

    const absolute: string = resolve(SRC_ROOT, target);
    const entry: string = statSync(absolute, { throwIfNoEntry: false })?.isDirectory()
      ? join(absolute, 'index.ts')
      : absolute;
    await import(pathToFileURL(entry).href);
  } catch (err: unknown) {
    console.error(`failed to run ${target}:`, err);
    process.exitCode = 1;
  }
}

void main();
