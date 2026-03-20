import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'questions.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    _db = new Database(DB_PATH);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS used_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        question TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_topic ON used_questions (topic);
    `);
  }
  return _db;
}

export function getRecentQuestions(topic: string, limit = 60): string[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT question FROM used_questions WHERE topic = ? ORDER BY created_at DESC LIMIT ?')
    .all(topic, limit) as { question: string }[];
  return rows.map((r) => r.question);
}

export function saveQuestions(topic: string, questions: string[]): void {
  const db = getDb();
  const insert = db.prepare('INSERT INTO used_questions (topic, question) VALUES (?, ?)');
  const insertAll = db.transaction((qs: string[]) => {
    for (const q of qs) insert.run(topic, q);
  });
  insertAll(questions);
}
