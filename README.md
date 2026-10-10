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
| Server-side validation | `server/src/validate.js` |
| API (Express app, exported for Vercel) | `server/src/index.js` |
| SEO: title, description, OG, favicon, robots, sitemap | `client/index.html`, `client/public/` |

## TODO

- **Case studies:** every product page shows two "Coming soon" slots (`CaseStudies` in `client/src/pages/ProductPage.tsx`). Replace them when real customer stories are available.

- **Demo form backend:** `server/src/index.js` validates the request and logs it only. Wire it to the real destination (HubSpot, Formspree, email); look for `TODO(demo-form)`.
- **Domain:** the canonical URL, OG URL, `robots.txt` and `sitemap.xml` assume `https://www.genessence.ai/`. Update them if the domain is different.
