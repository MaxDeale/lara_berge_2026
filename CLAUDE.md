# Lara Berge Artworks

E-commerce and portfolio site for Lara Berge, a South African oil painter and digital illustrator. She sells original paintings and signed fine art prints, and takes commissions (oil and digital). Max (her fiancé, a senior full-stack engineer) owns the codebase. Lara manages content herself through the CMS, so anything she edits must live in Sanity, not in code.

## Stack

- Next.js 16 (App Router, TypeScript, React Server Components, Server Actions), deployed on Vercel
- Tailwind CSS v4 with the brand tokens below defined in `@theme`
- Sanity (embedded Studio at `/studio`) for all content, orders and commission requests
- PayFast for payments (hosted redirect checkout, ITN webhook). Stripe is not available to SA merchants, so don't suggest it.
- Resend for transactional email
- Zustand (persisted to localStorage) for the cart
- Zod for every server-side input

## Source of truth for the design

- `design/DESIGN.md`: brand, palette, type, motion, page map and flows. Read it before any UI work.
- `design/screens/*.dc.html`: one approved design per screen. These are HTML with inline styles, written in a design-tool format (`<x-dc>`, `<sc-if>`, `<sc-for>`, `{{holes}}`, `<dc-import>`, a `DCLogic` class). Treat them as a pixel-level visual spec and port them to React components. Never ship that runtime or the format itself.
- `design/assets.md`: maps the `/_blob/<id>` image references in the screens to files in `design/assets/`.
- When code and design disagree, the design wins unless Max says otherwise.

## Brand tokens (mirror these exactly)

Colours: cream `#F6F2EA` (page), paper `#FBF9F4`, ink `#3B3530`, ink-soft `#4E4640`, muted `#6F655D`, mauve `#6E5268` (buttons, links), mauve-light `#9C7F94` and `#C9B6C3` (decoration only), hairline `#E1D8CB` and `#D6CCBE`, bark `#7A5E48` with outline `#3B2E25`, leaves `#8E9B6B` `#74835A` `#A7B087` (vein `#45512F`), berries `#8C6A86`, night `#231E1B` (lightbox).

Fonts via `next/font/google`: IM Fell English (regular and italic) for headings, nav, buttons and prices. IM Fell English SC for small letter-spaced eyebrows. Alegreya for body text and forms.

No coloured section backgrounds. The artwork brings the colour.

## Conventions

- Server Components by default. Add `"use client"` only for interactivity: cart, tabs, filters, lightbox, mobile menu, forms.
- All prices are integers in ZAR cents in the data layer. Format them with one `formatZAR()` helper as `R1 250` (en-ZA grouping, no decimals unless cents are non-zero).
- Never trust prices, availability or shipping cost from the client. Recompute everything on the server from Sanity at checkout.
- Every animation sits behind `prefers-reduced-motion: reduce`.
- Accessibility: real `<button>`/`<a>`/`<label>`, visible focus (`2px solid #6E5268`), 44px minimum touch targets, AA contrast. Decorative images get `alt=""`; artwork gets descriptive alt text from Sanity.
- Mobile first. Check every page at 390, 768, 1280 and 1440 wide.
- UI copy: warm and a little playful, in Lara's voice, with South African English spelling (colour, favourite). No em dashes in copy.
- Secrets only in env vars, never committed. Keep `.env.example` up to date.

## Commands

- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test:e2e` (Playwright)
- `npm run seed`: imports the design assets into Sanity as starter content

Before calling a phase done, run lint, typecheck and build, and they must all pass.

## Ask Max before

- Adding a dependency outside the stack above
- Changing the content model after Lara has started entering content
- Anything that touches live PayFast credentials or sends real email to customers
- Pushing to a remote or deploying

## Next.js version notes

Next 16.4 runs with `cacheComponents` and `partialPrefetching` on. Read the bundled docs before using an API you are unsure of:

@AGENTS.md
