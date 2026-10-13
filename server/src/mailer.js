// All email sending for the site lives here. The route and the form only call
// sendDemoRequestEmails(). Delivery uses Microsoft Graph (Mail.Send, OAuth client
// credentials): nodemailer builds the full MIME message (HTML + plain text,
// display name, Bcc) and Graph sends it from the website mailbox. To change
// provider, replace deliver() below and nothing else.
import nodemailer from 'nodemailer';

const BRAND = { navy: '#0B2545', ink: '#081A33', cyan: '#00A9CE', cyan2: '#5ad8ff', muted: '#5A6472', line: '#D5DBE1', grey: '#F2F4F6' };
const COMPANY = 'Genessence Consulting Pvt Ltd';
const GRAPH = 'https://graph.microsoft.com/v1.0';

function config() {
  const env = process.env;
  const from = (env.MAIL_FROM || '').trim();
  const tenant = (env.MS_TENANT_ID || '').trim();
  const clientId = (env.MS_CLIENT_ID || '').trim();
  const clientSecret = env.MS_CLIENT_SECRET || '';
  const internalTo = (env.DEMO_INTERNAL_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
  const marketing = (env.DEMO_MARKETING_EMAIL || '').trim();
  const missing = Object.entries({ MAIL_FROM: from, MS_TENANT_ID: tenant, MS_CLIENT_ID: clientId, MS_CLIENT_SECRET: clientSecret, DEMO_INTERNAL_TO: internalTo.length, DEMO_MARKETING_EMAIL: marketing })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { from, tenant, clientId, clientSecret, internalTo, marketing, missing };
}

export class MailerError extends Error {}
export class MailerConfigError extends MailerError {}

// App-only access token, cached until shortly before it expires.
let token = { value: '', expires: 0 };
async function accessToken(cfg) {
  if (token.value && Date.now() < token.expires) return token.value;
  const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new MailerError(`token request failed (${res.status}): ${body.error || ''} ${body.error_description?.split('\n')[0] || ''}`.trim());
  }
  token = { value: body.access_token, expires: Date.now() + (Number(body.expires_in) || 3600) * 1000 - 120_000 };
  return token.value;
}

// Builds the raw RFC 822 message (kept Bcc so Graph delivers to it).
const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' });
async function buildMime(message) {
  const info = await composer.sendMail({ ...message, keepBcc: true });
  return info.message;
}

/** The single delivery point: POST /users/{from}/sendMail with a base64 MIME body. */
async function deliver(cfg, message) {
  const mime = await buildMime({ from: { name: 'Genessence', address: cfg.from }, ...message });
  const res = await fetch(`${GRAPH}/users/${encodeURIComponent(cfg.from)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken(cfg)}`, 'Content-Type': 'text/plain' },
    body: mime.toString('base64')
  });
  if (res.status !== 202) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) token = { value: '', expires: 0 };
    throw new MailerError(`Graph sendMail failed (${res.status}): ${body.error?.code || ''} ${body.error?.message || ''}`.trim());
  }
}

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const istTime = (d) =>
  d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

export function internalAlert(d, when) {
  const rows = [['Name', d.name], ['Email', d.email], ['Company', d.company], ['Annual direct spend', d.spend], ['Received', when]];
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:${BRAND.grey};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;margin:0 auto;background:#fff;border:1px solid ${BRAND.line};border-radius:8px">
    <tr><td style="padding:18px 24px;background:${BRAND.navy};border-radius:8px 8px 0 0;color:#fff;font-size:15px;font-weight:bold">New demo request</td></tr>
    <tr><td style="padding:16px 24px 24px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid ${BRAND.line};color:${BRAND.muted};white-space:nowrap;vertical-align:top">${k}</td><td style="padding:10px 0;border-bottom:1px solid ${BRAND.line};font-weight:bold">${escapeHtml(v)}</td></tr>`).join('')}
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted}">Reply to this email to respond to ${escapeHtml(d.name)} directly.</p>
    </td></tr>
  </table></body></html>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  return { subject: `New demo request — ${d.company}`, html, text };
}

export function welcome(d) {
  const first = d.name.split(/\s+/)[0];
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:${BRAND.grey};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;margin:0 auto;background:#fff;border:1px solid ${BRAND.line};border-radius:8px;overflow:hidden">
    <tr><td style="padding:22px 28px;background:${BRAND.navy}">
      <span style="font-size:20px;font-weight:bold;letter-spacing:1px;color:#fff">GEN<span style="color:${BRAND.cyan2}">ESS</span>ENCE</span><br>
      <span style="font-size:10px;letter-spacing:2px;color:#9fb0cc">PROCUREMENT INTELLIGENCE</span>
    </td></tr>
    <tr><td style="height:3px;background:${BRAND.cyan};line-height:3px;font-size:0">&nbsp;</td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 14px;font-size:18px;font-weight:bold;color:${BRAND.navy}">Hi ${escapeHtml(first)},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:23px">Thanks for your interest in Genessence. We've received your request for an architecture review for ${escapeHtml(d.company)}.</p>
      <p style="margin:0 0 22px;font-size:15px;line-height:23px">Our engineering procurement team will reach out shortly with access to the secure NDA portal, so you can share a test BOM under reciprocal NDA.</p>
      <p style="margin:0;font-size:15px;line-height:23px">Regards,<br><strong style="color:${BRAND.navy}">${COMPANY}</strong></p>
    </td></tr>
    <tr><td style="padding:14px 28px;background:${BRAND.grey};font-size:11px;color:${BRAND.muted}">You received this email because you requested a demo on the Genessence website.</td></tr>
  </table></body></html>`;
  const text = `Hi ${first},

Thanks for your interest in Genessence. We've received your request for an architecture review for ${d.company}.

Our engineering procurement team will reach out shortly with access to the secure NDA portal, so you can share a test BOM under reciprocal NDA.

Regards,
${COMPANY}`;
  return { subject: 'Thanks for your interest in Genessence', html, text };
}


/**
 * Sends the internal alert, then the visitor's welcome email.
 * Resolves once the internal alert is delivered (the lead is captured); a
 * failed welcome email is logged but does not fail the request.
 */
export async function sendDemoRequestEmails(data, now = new Date()) {
  const cfg = config();
  if (cfg.missing.length) throw new MailerConfigError('Missing env: ' + cfg.missing.join(', '));

  const alert = internalAlert(data, istTime(now));
  await deliver(cfg, { to: cfg.internalTo, replyTo: data.email, ...alert });

  const hello = welcome(data);
  try {
    await deliver(cfg, { to: data.email, bcc: cfg.marketing, replyTo: cfg.marketing, ...hello });
  } catch (err) {
    console.error('[mailer] welcome email failed:', err?.message || err);
  }
}
