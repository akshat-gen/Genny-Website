# Genessence website

Production port of the approved Claude Design handoff (`../handoff/genessence-website-handoff`).

- `client/`: React 18 + Vite + TypeScript. The design's CSS is copied verbatim into `src/styles/global.css`.
- `server/`: Node + Express. Exposes `POST /api/demo-request` and, in production, serves the built client.

## Run

```bash
npm install
npm run dev      # API on :4000, site on http://localhost:5173 (proxies /api)
npm run build    # builds client/dist
npm start        # Express serves client/dist + API on http://localhost:4000
```

## Deploy (Vercel)

The repo deploys as one Vercel project with two [services](https://vercel.com/docs/services), defined in `vercel.json`:

| Service | Root | Framework | Public path |
| --- | --- | --- | --- |
| `client` | `client/` | Vite | `/(.*)`, with `/products/:slug` falling back to `index.html` |
| `server` | `server/` | Express (`src/index.js`, default export) | `/api/(.*)`, receives the full `/api/...` path |

The browser calls the API on the same domain (`/api/demo-request`), so no service bindings are needed.
Run both together locally with `vercel dev` (or `npm run dev` for the Vite + Express setup).

## Demo form email (Microsoft 365 via Microsoft Graph)

`POST /api/demo-request` (Express, `server/src/index.js`) validates the request, applies a honeypot (`website` field) and a per-IP rate limit of 5 requests per 10 minutes, then calls `sendDemoRequestEmails()` in **`server/src/mailer.js`**, the only module that knows how mail is sent. It sends:

1. **Internal alert** to `DEMO_INTERNAL_TO`: "New demo request — {company}", with name, email, company, spend and time (IST). Reply-To is the visitor.
2. **Welcome email** to the visitor (HTML and plain text). If `DEMO_MARKETING_EMAIL` is set it is BCC'd and used as Reply-To; otherwise replies go to `MAIL_FROM`.

Both are sent from `MAIL_FROM` with the display name "Genessence". `mailer.js` builds each message with nodemailer (MIME) and sends it through **Microsoft Graph** `POST /users/{MAIL_FROM}/sendMail`, using an app-only OAuth token (client credentials). No mailbox password or SMTP AUTH is involved, so this is not affected by Microsoft retiring Basic Auth for SMTP (off by default from the end of December 2026).

### Environment variables

Set these in `server/.env.local` for local development (see `server/.env.example`), and in Vercel under Project → Settings → Environment Variables for deploys. They are read only by the server and never sent to the browser.

| Variable | Value |
| --- | --- |
| `MAIL_FROM` | The Microsoft 365 mailbox that sends the mail, e.g. `website@yourdomain.com` |
| `MS_TENANT_ID` | Directory (tenant) ID of the app registration |
| `MS_CLIENT_ID` | Application (client) ID of the app registration |
| `MS_CLIENT_SECRET` | Client secret **value** of the app registration |
| `DEMO_INTERNAL_TO` | Comma-separated internal recipients of the alert |
| `DEMO_MARKETING_EMAIL` | *Optional.* Marketing inbox, BCC'd on welcome emails and used as their Reply-To. If empty, no BCC is sent and replies go to `MAIL_FROM` |

### Microsoft 365 / Entra setup (admin, once)

1. **Sending mailbox.** Use an existing licensed mailbox or a shared mailbox (Microsoft 365 admin center → Teams & groups → Shared mailboxes). Its address goes in `MAIL_FROM`.
2. **Register an app.** Microsoft Entra admin center (entra.microsoft.com) → Identity → Applications → **App registrations → New registration**. Name it e.g. "Genessence Website Mailer", choose single tenant, and leave the redirect URI empty. From the Overview page, copy the **Application (client) ID** → `MS_CLIENT_ID` and the **Directory (tenant) ID** → `MS_TENANT_ID`.
3. **Create a client secret.** In the app → **Certificates & secrets → Client secrets → New client secret**, with a 12 or 24 month expiry. Copy the **Value** (not the Secret ID) → `MS_CLIENT_SECRET`. Set a reminder to rotate it before it expires.
4. **Grant permission to send.** In the app → **API permissions → Add a permission → Microsoft Graph → Application permissions → Mail.Send → Add**, then click **Grant admin consent for <tenant>**. The status should show a green tick.
5. **Restrict it to the website mailbox (strongly recommended).** Without this, Mail.Send lets the app send as *any* mailbox in the tenant. In Exchange Online PowerShell (`Connect-ExchangeOnline` as an Exchange admin):

   ```powershell
   New-DistributionGroup -Name "Website Mail Senders" -Type Security -Members website@yourdomain.com
   New-ApplicationAccessPolicy -AppId <MS_CLIENT_ID> -PolicyScopeGroupId "Website Mail Senders" -AccessRight RestrictAccess -Description "Website mailer may only send as the website mailbox"
   Test-ApplicationAccessPolicy -Identity website@yourdomain.com -AppId <MS_CLIENT_ID>   # AccessCheckResult: Granted
   Test-ApplicationAccessPolicy -Identity someone.else@yourdomain.com -AppId <MS_CLIENT_ID>  # AccessCheckResult: Denied
   ```

   The policy can take up to an hour to apply. (Microsoft's newer "RBAC for Applications" in Exchange Online can be used instead.)
6. **Display name.** The From header uses "Genessence". If Outlook shows the mailbox's own name instead, set the mailbox's display name to "Genessence" in the admin center.

**Troubleshooting** (errors appear only in the server logs): `token request failed (401) invalid_client` means a wrong secret value or ID; `Graph sendMail failed (403) ErrorAccessDenied` means admin consent is missing or the access policy excludes `MAIL_FROM`; `(404) ErrorInvalidUser` means `MAIL_FROM` is not a mailbox in the tenant.

## Where things live

| What | Where |
| --- | --- |
| Copy and data (ARCH, STEPS, SUITE, NAV, NODES, BASE/LO/HI/MAXQ) | `client/src/lib/content.ts` |
| One component per section, in page order | `client/src/components/` |
| Pages: home and `/products/<slug>` | `client/src/pages/` |
| Product page content (steps, capabilities, deep dive, related) | `client/src/lib/products.ts` |
| Shared sample quote used across sections | `SAMPLE` in `client/src/lib/content.ts` |
| Scroll reveal (`armed`, `seen-<section>`) | `client/src/hooks/useReveal.ts` |
| Header progress / scroll-spy | `client/src/hooks/useScrollState.ts` |
| `motion` flag + reduced-motion check | `client/src/lib/motion.ts` (`MOTION`) |
| Demo form validation + `submitDemoRequest(data)` | `client/src/lib/demoForm.ts` |
| Email sending (Microsoft Graph) | `server/src/mailer.js` |
| Server-side validation | `server/src/validate.js` |
| API (Express app, exported for Vercel) | `server/src/index.js` |
| SEO: title, description, OG, favicon, robots, sitemap | `client/index.html`, `client/public/` |

## TODO

- **Case studies:** every product page shows two "Coming soon" slots (`CaseStudies` in `client/src/pages/ProductPage.tsx`). Replace them when real customer stories are available.

- **Rotate the Graph client secret** before it expires (Entra → App registrations → Certificates & secrets).
- **Domain:** the canonical URL, OG URL, `robots.txt` and `sitemap.xml` assume `https://www.genessence.ai/`. Update them if the domain is different.
