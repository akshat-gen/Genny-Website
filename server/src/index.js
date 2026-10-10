import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDemoRequest } from './validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/demo-request', async (req, res) => {
  const { data, errors } = validateDemoRequest(req.body);
  if (errors) return res.status(400).json({ ok: false, errors });

  // TODO(demo-form): deliver the request to its real destination
  // (CRM such as HubSpot, a Formspree form, or a transactional email).
  // No endpoint has been chosen yet, so the request is only logged.
  console.log('[demo-request]', new Date().toISOString(), data);

  res.json({ ok: true });
});

app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

// Self-hosted production (`npm start`): serve the built React app from the same origin.
// On Vercel the client is its own service and express.static is ignored.
if (!process.env.VERCEL && fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

// On Vercel the exported app runs as a function; locally it listens on PORT.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Genessence API listening on http://localhost:${PORT}`);
  });
}

export default app;
