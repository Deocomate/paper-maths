import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

let server, base, close;

before(async () => {
  const made = await createApp({ dbUrl: ':memory:', webDir: '.' });
  close = made.close;
  await new Promise((r) => { server = made.app.listen(0, r); });
  base = `http://localhost:${server.address().port}`;
});
after(() => { server.close(); close(); });

const put = (url, body) => fetch(base + url, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('health', async () => {
  assert.deepEqual(await (await fetch(base + '/api/health')).json(), { ok: true });
});

test('state starts empty, saves, and keeps the newest write', async () => {
  assert.deepEqual(await (await fetch(base + '/api/state')).json(), { db: null, updatedAt: 0 });
  assert.equal((await put('/api/state', { db: { current: 'L1' }, updatedAt: 200 })).status, 200);
  await put('/api/state', { db: { current: 'OLD' }, updatedAt: 100 });
  const got = await (await fetch(base + '/api/state')).json();
  assert.equal(got.db.current, 'L1');
  assert.equal(got.updatedAt, 200);
});

test('state rejects a body without db', async () => {
  assert.equal((await put('/api/state', { updatedAt: 1 })).status, 400);
});

test('papers: create, list, replace, delete', async () => {
  assert.equal((await put('/api/papers/u1', { id: 'u1', title: 'Mock' })).status, 200);
  await put('/api/papers/u1', { id: 'u1', title: 'Mock v2' });
  let list = await (await fetch(base + '/api/papers')).json();
  assert.equal(list.length, 1);
  assert.equal(list[0].title, 'Mock v2');
  await fetch(base + '/api/papers/u1', { method: 'DELETE' });
  list = await (await fetch(base + '/api/papers')).json();
  assert.equal(list.length, 0);
});

test('paper id must match the URL', async () => {
  assert.equal((await put('/api/papers/a', { id: 'b' })).status, 400);
});

test('unknown api route is a JSON 404', async () => {
  const r = await fetch(base + '/api/nope');
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), { error: 'not found' });
});
