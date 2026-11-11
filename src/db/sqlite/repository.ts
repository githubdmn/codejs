import { DatabaseSync } from 'node:sqlite';

export interface Note {
  id: number;
  body: string;
  createdAt: string;
}

interface NoteRow {
  id: number;
  body: string;
  created_at: string;
}

export class NotesRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  insert(body: string): Note {
    const createdAt = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO notes (body, created_at) VALUES (?, ?)');
    const result = stmt.run(body, createdAt);
    const id = Number(result.lastInsertRowid);
    return { id, body, createdAt };
  }

  list(): Note[] {
    const stmt = this.db.prepare('SELECT id, body, created_at FROM notes ORDER BY id');
    const rows = stmt.all() as NoteRow[];
    return rows.map((row) => ({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
    }));
  }
}
