import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDemoRequest } from './validate.js';
import { sendDemoRequestEmails, MailerConfigError } from './mailer.js';
import { createRateLimiter, clientIp } from './rateLimit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const demoLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

app.post('/api/demo-request', async (req, res) => {
  const rate = demoLimiter(clientIp(req));
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  // Honeypot: a hidden "website" field real visitors never fill. Pretend success.
  if (typeof req.body?.website === 'string' && req.body.website.trim()) {
    return res.json({ ok: true });
  }

  const { data, errors } = validateDemoRequest(req.body);
  if (errors) return res.status(400).json({ ok: false, errors });

  try {
    await sendDemoRequestEmails(data);
    return res.json({ ok: true });
  } catch (err) {
    // Provider error details stay in the server logs only.
    console.error('[demo-request] email failed:', err instanceof MailerConfigError ? err.message : err?.message || err);
    return res.status(err instanceof MailerConfigError ? 500 : 502).json({ ok: false, error: 'send_failed' });
  }
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
