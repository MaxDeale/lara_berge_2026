# Kickoff: build Lara Berge Artworks

You're building the complete Lara Berge Artworks website in this folder (`lara_berge_2026`) as a production-ready Next.js project. Read `CLAUDE.md` first, then `design/DESIGN.md`, then skim every file in `design/screens/`. The designs are approved. Your job is to turn them into a real, fast, accessible site that Lara can run herself and that takes real payments through PayFast.

Work through the phases below in order. At the end of each phase: run lint, typecheck and build, commit with a clear message, and give me a short summary with anything you need from me. Don't start the next phase while the current one is failing. If something in this brief conflicts with the designs, or looks wrong, stop and ask rather than guess.

---

## What the site does

Lara is an oil painter who also draws digital illustrations. The site has to:

1. **Show the work.** A gallery with two collections, Paintings and Digital illustration, plus a lightbox.
2. **Sell originals.** Each one is one of a kind. Once paid it's marked sold but stays visible, with a link to its prints.
3. **Sell signed fine art prints** of paintings and digital pieces, in A4, A3 and A2, each size with its own price.
4. **Take commission requests** (oil or digital) through a form with reference image uploads. There's no checkout for these: Lara quotes by email and sends a PayFast payment link for the deposit herself.
5. **Take payment through PayFast:** card, Instant EFT, SnapScan, Zapper. Delivery is courier within SA, collection from the studio, or international shipping.
6. **Let Lara manage everything without a developer:** artworks, prices, sold status, prints, homepage hero, FAQ, shipping rates, and viewing orders and commission requests.

## Screens to build (spec file in brackets)

| Route                | Screen                                                                                          | Spec                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `/`                  | Home                                                                                            | `Main.dc.html` (desktop), `MobileHome.dc.html` (phone) |
| `/gallery`           | Gallery with tabs `?tab=paintings` / `?tab=digital`                                             | `Gallery.dc.html`                                      |
| `/gallery/[slug]`    | Lightbox as an intercepting route (`@modal`) over the gallery, plus a full page on direct visit | `Lightbox.dc.html`                                     |
| `/about`             | About                                                                                           | `About.dc.html`                                        |
| `/contact`           | Contact form with a sent state                                                                  | `Contact.dc.html`                                      |
| `/shop`              | Shop landing                                                                                    | `Shop.dc.html`                                         |
| `/shop/originals`    | Originals with All / Available / Sold filter                                                    | `Originals.dc.html`                                    |
| `/shop/prints`       | Prints with All / From paintings / Digital filter                                               | `Prints.dc.html`                                       |
| `/shop/[slug]`       | Artwork product page (original and/or print options)                                            | `Painting.dc.html`                                     |
| `/commissions`       | Commissions info and request form                                                               | `Commissions.dc.html`                                  |
| cart drawer          | Global slide-in drawer opened from the header                                                   | `Cart.dc.html`                                         |
| `/checkout`          | Checkout                                                                                        | `Checkout.dc.html`                                     |
| `/order/[id]`        | Order confirmed, plus failed, cancelled and still-confirming states                             | `Confirmed.dc.html`                                    |
| `/faq`               | FAQ, which also covers shipping and returns                                                     | `FAQ.dc.html`                                          |
| `/terms`, `/privacy` | Legal pages: plain text from Sanity, laid out like the FAQ column                               | FAQ layout                                             |
| 404                  | `not-found.tsx`                                                                                 | `NotFound.dc.html`                                     |
| `/studio`            | Embedded Sanity Studio                                                                          | n/a                                                    |

Shared components to match exactly: `Header.dc.html` and `Footer.dc.html`. On phones the header becomes the hamburger, logo and cart layout with a full-screen menu shown in `MobileHome.dc.html`.

---

## Phase 0: Scaffold

- Create the app with the latest stable `create-next-app`: TypeScript, App Router, Tailwind, ESLint, `src/` dir, `@/*` alias. Next.js 16.x is current. A Next.js security release is due on 14 October 2026, so make sure the installed version includes it before launch.
- Add Prettier, a `typecheck` script, Zod, Zustand, Resend, Playwright, and the Sanity packages (`sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/vision`).
- `git init`, add a sensible `.gitignore`, and write `.env.example` with every variable listed under Environment below.
- Copy `design/assets/logo-name.png`, the signs and the doodads into `public/brand/` (they're design elements, not CMS content).

## Phase 1: Design system and shared components

Build these to match the screens. Put them in `src/components/` with small, typed props.

- **Tokens:** Tailwind v4 `@theme` with every colour from CLAUDE.md, the three fonts loaded via `next/font/google`, and the spacing, radius and shadow values used in the screens (mats `0 12px 28px -16px rgba(59,53,48,.32)`, arched frames `border-radius: 210px 210px 4px 4px` with a 10px paper border).
- **Header:** hand-lettered logo with "artworks" in IM Fell English SC under it; text nav Home, Gallery, Shop, About, Contact with the hand-drawn swash underline on hover and the active page; cart icon with a live count. On phones: hamburger, centred logo, cart, and a full-screen menu that traps focus and closes on Escape.
- **Spider:** thread plus spider, dangling. It's a stand-in SVG, so build it as a component that takes an `src` so Lara's real drawing can drop in later.
- **Footer:** links, Instagram and email icons, the "Secure payments by PayFast" line, and the optional sitting grey cat doodad.
- **Branch:** an SVG component with `wide` (Home signs) and `short` (page titles) variants. Copy the paths, leaves, berries and rustling leaves from `Main.dc.html` and `Gallery.dc.html`.
- **HangingSign:** a sign image that sways on a nail pivot and swings on hover. Gallery, Shop, About and Contact use the painted sign PNGs. Make the image a prop, because Lara will paint Digital, Prints and Commissions signs later.
- **Hero:** blur-to-sharp reveal, slow drift and zoom, rising firefly motes, curved bottom edge. Its motion mode (drift + fireflies, drift only, or still) is set in Sanity.
- Also build: `Mat` (painting in a paper mat), `ArchFrame`, `PrintOnTable` (prints list presentation), `Button` (primary mauve and italic text-link styles), `Eyebrow`, `Breadcrumb`, `FilterChips`, `Tabs`, `Accordion` (native `<details>`), form fields, and `PriceTag` using `formatZAR()`.
- Make a `/dev/components` page (excluded from production builds) that shows every component so I can check them.

## Phase 2: Content model (Sanity)

Set up an embedded Studio at `/studio`. I'll create the Sanity project when you ask. Give me the exact command, or run `npx sanity@latest init` and let me answer the prompts.

Schemas:

- **artwork**
  - `title`, `slug`, `kind` (painting | digital), `year`, `medium`, `dimensions` (string, e.g. "40 × 50 cm"), `description` (portable text), `mainImage` (with hotspot and required alt), `detailImages[]` (with alt)
  - `featured` (bool), `orderRank` for manual drag ordering in the Studio
  - `original`: `forSale` (bool), `price` (ZAR cents), `status` (available | reserved | sold, read-only in the Studio), `reservedUntil` (datetime, hidden)
  - `prints`: `enabled` (bool), `variants[]` of `{ size: A4 | A3 | A2, dimensions, price (ZAR cents), active }`
- **siteSettings** (singleton)
  - hero artwork, hero motion, intro heading and text, "Hello, I'm Lara" copy and portrait
  - about page copy and photo, studio notes
  - shipping rates (SA courier, international, collection, each with label, note and price), dispatch times
  - commission settings (oil "from" price, digital "from" price, turnaround notes, deposit %)
  - print paper name and details
  - contact email, Instagram handle, SEO defaults
- **faqItem**: `question`, `answer` (portable text), `section` (shipping | art | commissions | payments), `orderRank`
- **legalPage**: `title`, `slug`, `body`
- **order** (written by the server only, read-only in the Studio)
  - `reference` (e.g. `LB-0042`), `status` (pending | paid | failed | cancelled | shipped), `items[]` (artwork reference, type original or print, size, unit price, qty), customer, delivery method and address, `subtotal`, `shipping`, `total`, notes, gift flag
  - PayFast fields: `pf_payment_id`, `payment_status`, raw ITN payload, timestamps
- **commissionRequest** (server-written): name, email, kind, size or use, budget, deadline, gift flag, idea, `references[]` (image assets), share-permission flag, status (new | quoted | deposit paid | in progress | done | declined), internal notes

Studio desk structure: Artworks (split into Paintings and Digital), Orders (newest first, filterable by status), Commission requests, FAQ, Legal, and Settings as a singleton. Keep the labels friendly, because Lara is the user, not a developer.

**Seed script (`npm run seed`):** import the 3 paintings and 23 digital illustrations shown in `Gallery.dc.html` as artwork documents.

- For the digital pieces, use the full-resolution files at `../old one/lara_b_v2-master/public/assets/img/port2/<N>.jpg`. `design/assets/illus-<N>.jpg` maps to `<N>.jpg` there.
- Paintings: `design/assets/firefly.jpg`, `lantern.jpg`, `cottage.jpg` (low-res phone crops, flagged as needing replacement), with details from `ff-face.jpg`, `ff-glow.jpg` and `ff-sleeve.jpg`.
- Titles: use bracketed working titles like "[Firefly painting]" and mark them as needing Lara's input. Set lantern as sold, firefly and cottage as available, prints enabled on all.
- Seed FAQ items and settings from the copy in `FAQ.dc.html` and the other screens, keeping every [bracketed] placeholder as is.

## Phase 3: Pages

Build every route in the table above against the content model, matching the designs at all four widths.

- Use `next/image` with the Sanity loader for all artwork, plus responsive `sizes` and blur placeholders.
- Gallery tab state lives in the URL. Use a masonry column layout for digital and a matted grid for paintings.
- The lightbox is an intercepting route with prev/next, keyboard arrows and Escape, swipe on touch, and focus management. It should feel instant.
- Product page: option cards (Original / Fine art print), size pills, live price, add to cart, accordions, and "You might also love". If the original is sold, default to prints and show a "sold" note. If there are no prints and the original is sold, show "commission something similar".
- Revalidate content with Sanity webhooks hitting `/api/revalidate` (tag-based), so Lara's edits go live within seconds.

## Phase 4: Cart, checkout and PayFast

- **Cart:** Zustand, persisted. Each line is `{ artworkId, type: 'original' | 'print', size? , qty }`. Originals are qty 1, one of a kind. The drawer opens on add-to-cart and from the header icon.
- **Checkout page:** Zod-validated details form. The delivery method (courier, collect, international) switches the address fields and shipping cost. The summary is server-rendered from Sanity, never from client prices.
- **`createOrder` server action:**
  1. Re-fetch every item from Sanity and validate availability and prices.
  2. For originals, atomically set `status: reserved` with `reservedUntil` 30 minutes out, using a Sanity transaction with an `ifRevisionID` check so two buyers can't reserve the same piece.
  3. Create a `pending` order with a human reference.
  4. Build the PayFast payload and redirect via an auto-submitting form.
  - Expired reservations are released by a Vercel Cron route, and also lazily on read.
- **PayFast** (check every detail against the official developer docs at developers.payfast.co.za before implementing, and tell me if anything below is out of date):
  - Process URL is `https://www.payfast.co.za/eng/process` for live, `https://sandbox.payfast.co.za/eng/process` for sandbox, switched by `PAYFAST_MODE`.
  - Fields: `merchant_id`, `merchant_key`, `return_url` (`/order/[id]`), `cancel_url` (`/checkout?cancelled=1`), `notify_url` (`/api/payfast/itn`), buyer name and email, `m_payment_id` (order id), `amount` (2 decimals), `item_name` (e.g. "Lara Berge Artworks order LB-0042").
  - Signature: MD5 of the non-empty fields, in PayFast's documented field order, URL-encoded with spaces as `+`, with `&passphrase=` appended. Cover it with unit tests against PayFast's published examples.
- **ITN route (`/api/payfast/itn`):**
  - Respond 200 straight away, then validate:
    1. The signature matches.
    2. The source IP resolves from PayFast's hosts (`www.payfast.co.za`, `sandbox.payfast.co.za`, `w1w.payfast.co.za`, `w2w.payfast.co.za`).
    3. `amount_gross` equals the order total.
    4. A server-to-server POST to PayFast's `/eng/query/validate` returns `VALID`.
  - It must be idempotent, keyed on `pf_payment_id`.
  - On `COMPLETE`: order becomes `paid`, reserved originals become `sold`, the buyer gets a confirmation email and Lara gets a new-order email with the delivery details.
  - On `FAILED` or `CANCELLED`: release reservations and update the order.
  - Log every ITN to the order.
- **Order page:** shows "confirming your payment…" and polls briefly until the ITN lands, then shows the paid state. It also handles the failed and cancelled states from the design. Order ids in URLs must be unguessable (use a random id, not the human reference).
- Run the whole flow end to end in the PayFast sandbox. For local ITN testing, tell me what tunnel to run (e.g. `cloudflared`), or test on a Vercel preview deployment.

## Phase 5: Forms and email

- **Commission form:** server action with Zod validation and up to 5 reference images (max 10 MB each, images only, resized server-side), uploaded to Sanity assets. It creates a `commissionRequest`, emails Lara with everything and the image links, and sends the customer an auto-reply. The kind toggle (oil/digital) switches the size options exactly as in the design.
- **Contact form:** server action that emails Lara and sends an auto-reply.
- Spam protection on both: a honeypot field plus simple IP rate limiting. Ask me before adding Turnstile.
- **Email templates (React Email or plain JSX with Resend):** order confirmation, new order (to Lara), commission received, commission auto-reply, contact auto-reply. Brand them simply: cream background, logo, IM Fell-style serif fallback stack, mauve links.

## Phase 6: SEO, performance, polish

- Per-page metadata, Open Graph images (artwork-based for product pages), `sitemap.ts`, `robots.ts`, canonical URLs.
- JSON-LD: `VisualArtwork` plus `Product`/`Offer` in ZAR with availability on product pages, and `Person` for Lara on About.
- Performance: hero image priority-loaded, fonts subset, no layout shift. Lighthouse 95+ on mobile for Home, Gallery and a product page.
- Accessibility pass with axe via Playwright. Fix everything.
- Playwright tests:
  - Navigate every route at 390 and 1440 wide.
  - Gallery tabs and the lightbox.
  - Add an original and a print to the cart, then complete checkout to the PayFast redirect (assert the signed payload).
  - Commission and contact form submissions (with email sending mocked).
- Analytics: Vercel Analytics only.

## Phase 7: Handover

- `README.md`: local setup, env vars, the seed script, how Sanity, PayFast and Resend fit together, how to switch PayFast from sandbox to live, and Vercel deploy steps (project, env vars, cron, Sanity webhook to `/api/revalidate`, PayFast notify URL on the production domain).
- `docs/LARA.md`: a plain-language guide for Lara on adding a painting, marking prints, changing prices and shipping, reading orders and updating commission statuses, with screenshots of the Studio.
- A final checklist of every [bracketed] placeholder still in content, so Lara and I can fill them in.

---

## Environment

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=
SANITY_REVALIDATE_SECRET=
PAYFAST_MODE=sandbox
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
RESEND_API_KEY=
MAIL_FROM=
LARA_EMAIL=
CRON_SECRET=
```

## Things you'll need from me (ask when you reach them)

- Creating the Sanity project and a write token
- PayFast sandbox merchant ID, key and passphrase (live ones only at launch)
- A Resend API key and a verified sending domain
- The production domain
- Lara's real photos, titles, prices and copy. Until then, keep the [bracketed] placeholders visible rather than inventing anything.

## Not in scope (don't build)

Newsletter, user accounts and logins, reviews, discount codes, multi-currency, a blog. Keep the site exactly as quiet as the designs.

Start with Phase 0. Before writing any code, read `CLAUDE.md`, `design/DESIGN.md` and all the screens, then reply with a short plan for Phases 0 and 1 and any questions.
