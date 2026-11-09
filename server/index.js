import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 8080;
const dbFile = process.env.DB_FILE || path.join('data-store', 'app.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const { app } = createApp({ dbFile });
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`Paper Maths running at http://${host}:${port}`));
