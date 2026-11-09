import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const WEB_DIR = path.join(ROOT, 'dist', 'web');

const stateBody = z.object({ db: z.record(z.string(), z.unknown()), updatedAt: z.number().int().nonnegative() });
const paperBody = z.object({ id: z.string().min(1).max(64) }).passthrough();

/** Builds the Express app. `dbFile` is a SQLite path, or ":memory:" for tests. */
export function createApp({ dbFile, webDir = WEB_DIR }) {
  const db = new DatabaseSync(dbFile);
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), json TEXT NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS papers (id TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at INTEGER NOT NULL);
  `);

  const app = express();
  app.disable('x-powered-by');
  // Imported papers carry their pictures as base64, so the limit is generous.
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/state', (_req, res) => {
    const row = db.prepare('SELECT json, updated_at FROM app_state WHERE id = 1').get();
    if (!row) return res.json({ db: null, updatedAt: 0 });
    res.json({ db: JSON.parse(row.json), updatedAt: Number(row.updated_at) });
  });

  // Last write wins: an older write never replaces a newer one.
  app.put('/api/state', (req, res) => {
    const body = stateBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'invalid state' });
    const { db: state, updatedAt } = body.data;
    db.prepare(`INSERT INTO app_state (id, json, updated_at) VALUES (1, ?, ?)
                ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at
                WHERE excluded.updated_at >= app_state.updated_at`).run(JSON.stringify(state), updatedAt);
    const row = db.prepare('SELECT updated_at FROM app_state WHERE id = 1').get();
    res.json({ updatedAt: Number(row.updated_at) });
  });

  app.get('/api/papers', (_req, res) => {
    res.json(db.prepare('SELECT json FROM papers ORDER BY updated_at').all().map((r) => JSON.parse(r.json)));
  });

  app.put('/api/papers/:id', (req, res) => {
    const body = paperBody.safeParse(req.body);
    if (!body.success || body.data.id !== req.params.id) return res.status(400).json({ error: 'invalid paper' });
    db.prepare(`INSERT INTO papers (id, json, updated_at) VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`)
      .run(req.params.id, JSON.stringify(body.data), Date.now());
    res.json({ ok: true });
  });

  app.delete('/api/papers/:id', (req, res) => {
    db.prepare('DELETE FROM papers WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  // The site is one static page that routes on the URL hash.
  app.use(express.static(webDir));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));
  app.use((err, _req, res, _next) => {
    const status = err.status && err.status < 500 ? err.status : 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: status === 500 ? 'server error' : err.message });
  });

  return { app, close: () => db.close() };
}
