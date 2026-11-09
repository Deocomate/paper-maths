import express from 'express';
import { createClient } from '@libsql/client';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const WEB_DIR = path.join(ROOT, 'dist', 'web');

const stateBody = z.object({ db: z.record(z.string(), z.unknown()), updatedAt: z.number().int().nonnegative() });
const paperBody = z.object({ id: z.string().min(1).max(64) }).passthrough();

/** Builds the Express app. `dbUrl` is a libsql URL, e.g. "file:data/app.db" or ":memory:". */
export async function createApp({ dbUrl, webDir = WEB_DIR }) {
  const db = createClient({ url: dbUrl });
  await db.batch([
    'CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), json TEXT NOT NULL, updated_at INTEGER NOT NULL)',
    'CREATE TABLE IF NOT EXISTS papers (id TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at INTEGER NOT NULL)',
  ]);

  const app = express();
  app.disable('x-powered-by');
  // Imported papers carry their pictures as base64, so the limit is generous.
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/state', async (_req, res) => {
    const { rows } = await db.execute('SELECT json, updated_at FROM app_state WHERE id = 1');
    if (!rows.length) return res.json({ db: null, updatedAt: 0 });
    res.json({ db: JSON.parse(rows[0].json), updatedAt: Number(rows[0].updated_at) });
  });

  // Last write wins: an older write never replaces a newer one.
  app.put('/api/state', async (req, res) => {
    const body = stateBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: 'invalid state' });
    const { db: state, updatedAt } = body.data;
    await db.execute({
      sql: `INSERT INTO app_state (id, json, updated_at) VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at
            WHERE excluded.updated_at >= app_state.updated_at`,
      args: [JSON.stringify(state), updatedAt],
    });
    const { rows } = await db.execute('SELECT updated_at FROM app_state WHERE id = 1');
    res.json({ updatedAt: Number(rows[0].updated_at) });
  });

  app.get('/api/papers', async (_req, res) => {
    const { rows } = await db.execute('SELECT json FROM papers ORDER BY updated_at');
    res.json(rows.map((r) => JSON.parse(r.json)));
  });

  app.put('/api/papers/:id', async (req, res) => {
    const body = paperBody.safeParse(req.body);
    if (!body.success || body.data.id !== req.params.id) return res.status(400).json({ error: 'invalid paper' });
    await db.execute({
      sql: `INSERT INTO papers (id, json, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
      args: [req.params.id, JSON.stringify(body.data), Date.now()],
    });
    res.json({ ok: true });
  });

  app.delete('/api/papers/:id', async (req, res) => {
    await db.execute({ sql: 'DELETE FROM papers WHERE id = ?', args: [req.params.id] });
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
