# Lara Berge Artworks

Portfolio and shop for Lara Berge: original oil paintings, signed fine art prints, and commissions. Lara runs the content herself in the embedded Sanity Studio at `/studio`; payments go through PayFast.

- **Lara's guide:** [docs/LARA.md](docs/LARA.md)
- **Still to fill in:** [docs/PLACEHOLDERS.md](docs/PLACEHOLDERS.md)
- **Design source of truth:** [design/DESIGN.md](design/DESIGN.md) and `design/screens/`

## Stack

Next.js 16.4 (App Router, Cache Components, Partial Prefetching) · TypeScript · Tailwind CSS v4 · Sanity v6 (embedded Studio) · PayFast · Resend · Zustand · Zod · Vitest · Playwright.

## Local setup

Requires Node 22+.

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run dev                  # http://localhost:3000, Studio at /studio
```

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | The usual |
| `npm run lint` / `typecheck` / `format` | Checks (run lint, typecheck and build before calling anything done) |
| `npm test` | Unit tests (formatZAR, cart rules, PayFast signatures) |
| `npm run test:e2e` | Playwright against a production build on the `development` dataset |
| `npm run seed` | Imports the starter content into Sanity (never overwrites edited docs; `-- --force` does) |
| `npm run seed:test-prices` | Puts fake prices into a non-production dataset for testing checkout |

## Environment variables

| Variable | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs: PayFast return/cancel/notify URLs, canonical tags, sitemap, emails. No trailing slash. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `fe80yxg1` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (the tests use `development`) |
| `SANITY_API_READ_TOKEN` | **Viewer** token. The dataset is private (orders hold customer details), so the site reads with this. |
| `SANITY_API_WRITE_TOKEN` | **Editor** token. Writes orders, reservations and commission requests. Server only. |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the Sanity webhook (any long random string). |
| `PAYFAST_MODE` | `sandbox` or `live` |
| `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE` | From the PayFast dashboard (Settings → Developer settings). Leave empty and checkout says payments aren't on yet. |
| `RESEND_API_KEY` | Resend API key. Without it (or `MAIL_FROM`) emails are logged and skipped, never sent. |
| `MAIL_FROM` | e.g. `Lara Berge Artworks <hello@yourdomain.co.za>` on a domain verified in Resend |
| `LARA_EMAIL` | Lara's inbox for new orders, commission requests and contact messages |
| `CRON_SECRET` | Bearer token for `/api/cron/release-reservations` |

`EMAIL_TEST_OUTBOX` (test only) writes emails to a JSON-lines file instead of sending.

## How it fits together

### Content (Sanity)

- Studio is embedded at `/studio` (`sanity.config.ts`, desk structure in `src/sanity/structure.ts`). Lara logs in with her Sanity account; invite her in sanity.io/manage → Members.
- Schemas live in `src/sanity/schemaTypes/`. Prices are stored as integer **cents** but typed in rands (custom input in `src/sanity/components/RandsInput.tsx`).
- Pages read content through `sanityFetch` (`src/sanity/client.ts`), which runs inside `'use cache'` and is tagged by document type. Every page is prerendered.
- **Edits go live through a webhook.** In sanity.io/manage → API → Webhooks, add:
  - URL: `https://<domain>/api/revalidate`, method `POST`, dataset `production`
  - Trigger on create, update and delete; filter `_type in ["artwork", "siteSettings", "faqItem", "legalPage"]`
  - Projection: `{_type}`
  - Secret: the same value as `SANITY_REVALIDATE_SECRET`

  Without it, content changes only appear after a redeploy.
- Datasets: `production` (private, Lara's real content) and `development` (private, a seeded copy with fake prices for testing). CORS origins: add the production domain (with credentials) next to `http://localhost:3000`.

### Orders and payments (PayFast)

1. **Cart** (`src/lib/cart`): persisted Zustand store of `{ artworkId, type, size?, qty }`. No prices.
2. **Checkout** (`src/app/actions/checkout.ts`): the summary and the charge are priced on the server from fresh Sanity data (`src/lib/orders/pricing.ts`).
3. **`placeOrder`** re-validates everything, then in one Sanity transaction reserves each original for 30 minutes (`ifRevisionID`, so two buyers can't both get it) and creates a `pending` order with an unguessable id (`order-…`, used in URLs and as `m_payment_id`) and a human reference (`LB-0042`). The browser then posts a signed form to PayFast.
4. **ITN** (`src/app/api/payfast/itn/route.ts`): replies 200 immediately, then checks signature, source host, amount and PayFast's `/eng/query/validate`; idempotent on `pf_payment_id`. `COMPLETE` marks the order paid and originals sold and sends the emails; `FAILED`/`CANCELLED` releases the reservations. Every notification is logged on the order.
5. **Order page** `/order/[id]` polls briefly until the ITN lands.
6. **Reservations** are released when the shopper cancels at PayFast, by the cron every 15 minutes, and checkout ignores expired ones anyway.

The signature follows the official docs and PHP SDK (field order, PHP `urlencode`, passphrase) and is unit-tested. **Note:** PayFast's *shared* sandbox merchant (10000100) currently has a passphrase nobody published, so it rejects every signed request. Create your own free sandbox account at sandbox.payfast.co.za and use its merchant ID, key and passphrase.

**Testing ITNs** needs a public URL: use a Netlify deploy preview, or run `cloudflared tunnel --url http://localhost:3000` and set `NEXT_PUBLIC_SITE_URL` to the tunnel URL before starting the dev server.

**Going live:** set `PAYFAST_MODE=live` and the live merchant ID, key and passphrase, make sure `NEXT_PUBLIC_SITE_URL` is the real https domain (PayFast posts ITNs to `<site>/api/payfast/itn`, sent per transaction, so nothing to configure in the dashboard), then do one small real purchase and refund it.

### Email (Resend)

Verify the sending domain in Resend, set `RESEND_API_KEY`, `MAIL_FROM` and `LARA_EMAIL`. Templates are in `src/lib/email/templates.ts` (HTML and plain text): order confirmation, new order for Lara, commission received for Lara, commission auto-reply, contact message and auto-reply.

### Forms

Contact and commission forms are server actions with Zod validation, a honeypot field and a per-IP rate limit (in memory, so per server instance). Commission reference photos (up to 5) are downscaled in the browser to fit the 4.5 MB request limit, then resized and re-encoded with sharp (dropping EXIF/GPS) and stored as Sanity image assets. Image assets are reachable by their (unguessable) URL even though the dataset is private.

## Deploying

The site currently runs on **Netlify**. It also works on Vercel.

1. Create the site from the GitHub repo; Next.js is detected automatically.
2. Add every variable from the table above (production values).
3. **Cron:** Netlify runs `netlify/functions/release-reservations.mts` every 15 minutes (it needs `CRON_SECRET`; `URL` is set by Netlify). On Vercel, `vercel.json` does the same. Vercel's Hobby plan only allows daily crons, which is fine because checkout ignores expired reservations.
4. Add the Sanity webhook and the production CORS origin (see above).
5. Point the domain at the site and update `NEXT_PUBLIC_SITE_URL`.
6. Next.js has a security release due on 14 October 2026: update `next` and `eslint-config-next` before launch.

## Tests

```bash
npx playwright install chromium            # once
NEXT_PUBLIC_SANITY_DATASET=development npm run seed
NEXT_PUBLIC_SANITY_DATASET=development npm run seed:test-prices
npm run test:e2e
```

The suite builds the site against the `development` dataset with PayFast's public sandbox credentials and an email outbox file. It covers every route at 390 and 1440 wide (status, no sideways scrolling, axe WCAG 2.1 AA), gallery tabs and the lightbox, a full checkout up to a signed PayFast payload (the PayFast request is intercepted), and the forms. It creates test orders and commission requests in `development` only.

## Project map

```
src/app/(site)/        pages with the site header and footer (+ @modal lightbox slot)
src/app/(checkout)/    checkout with its slim header
src/app/studio/        embedded Sanity Studio
src/app/api/           revalidate webhook, PayFast ITN, reservation cron
src/app/actions/       server actions: checkout, contact, commission
src/components/        UI; see /dev/components in development for the showcase
src/lib/               cart, orders, payfast, email, forms, SEO helpers
src/sanity/            client, queries, schemas, Studio structure
scripts/               seed and test-price scripts
e2e/                   Playwright tests
```

## Known gaps

- **Lighthouse (mobile, simulated slow 4G):** Performance 83 to 86 on Home, Gallery and artwork pages; Accessibility 100, SEO 100, Best practices 96, CLS 0. The brief's 95 isn't reached: LCP is about 4.1 s under throttling, mostly the main artwork image arriving from Sanity's CDN plus three display fonts. Better photos at sensible sizes, dropping the hero's fade-in, or self-hosting fewer font files would close the gap.
- **Analytics:** the brief asked for Vercel Analytics, which only works on Vercel, so it isn't installed while the site is on Netlify.
- **`npm audit`** reports advisories in Sanity's CLI tooling and ESLint dependencies, not in code that handles visitor input; the suggested fixes downgrade packages.
