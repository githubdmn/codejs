import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { NotesRepository } from './repository.js';

const DB_PATH = fileURLToPath(new URL('./demo.sqlite', import.meta.url));
const INIT_SQL = fileURLToPath(new URL('./init.sql', import.meta.url));

function main(): void {
  const db = new DatabaseSync(DB_PATH);
  db.exec(readFileSync(INIT_SQL, 'utf8'));

  const repo = new NotesRepository(db);

  repo.insert('first note');
  repo.insert('second note');
  repo.insert('third note');

  const notes = repo.list();
  for (const note of notes) {
    console.log(`#${note.id} [${note.createdAt}] ${note.body}`);
  }

  db.close();
}

main();
