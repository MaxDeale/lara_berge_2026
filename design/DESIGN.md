# Lara Berge Artworks: design reference

The source designs live on the Claude Design canvas "Lara Berge Artworks" (18 artboards). This folder is a local copy of that canvas:

- `screens/*.dc.html` are the design files, one per screen. Images in them are referenced as `/_blob/<id>`. `assets.md` maps each id to a file in `assets/`.
- `assets/` holds the web-ready images (Lara's paintings, digital illustrations, hand-painted signs, doodads, logo lettering).

## Brand

- **Name:** Lara Berge Artworks. The logo is Lara's own hand-lettered "Lara Bergé" (`assets/logo-name.png`), with "artworks" set underneath in IM Fell English SC, letter-spaced, in mauve.
- **Feel:** quiet storybook. Warm cream page, muted colour, generous space. Lara's paintings and drawings supply all the whimsy, so there are no coloured section backgrounds.

### Colour

| Token | Hex | Use |
|---|---|---|
| cream (page) | `#F6F2EA` | page background |
| paper | `#FBF9F4` | painting mats, cards, form fields |
| ink | `#3B3530` | main text |
| ink-soft | `#4E4640` | body copy |
| muted | `#6F655D` | captions and meta text (passes AA on cream) |
| mauve | `#6E5268` | buttons, links, accents |
| mauve-light | `#9C7F94` / `#C9B6C3` | underline swashes and link borders (decoration only) |
| hairline | `#E1D8CB` / `#D6CCBE` | dividers and input borders |
| bark | `#7A5E48`, outline `#3B2E25` | the hand-drawn branch |
| leaf greens | `#8E9B6B` `#74835A` `#A7B087`, vein `#45512F` | branch leaves |
| berries | `#8C6A86` | small accents on the branch |
| night (lightbox) | `#231E1B` | lightbox overlay |

### Type (Google Fonts)

- **IM Fell English** (with its italic): headings, nav, buttons, prices.
- **IM Fell English SC**: small letter-spaced eyebrows such as "fresh off the easel".
- **Alegreya**: body copy, forms, meta text.

### Motion (all of it switches off under `prefers-reduced-motion`)

- **Hero:** blur-to-sharp reveal, then a slow drift and zoom (28s, alternating), with firefly motes rising through the image. The bottom edge is an elliptical curve (`clip-path: ellipse(78% 100% at 50% 0%)`).
- **Hanging signs:** sway idly by ±1.8°, pivoting at the nail. On hover they swing harder.
- **Branch:** some leaves rustle (rotate 7°).
- **Spider:** hangs on a thread top-right of the header and gently dangles. It's a stand-in until Lara sends her own drawing.
- **Nav:** a hand-drawn swash underline draws in on hover and on the active link.

## Screens and flows

| Screen | File | Notes |
|---|---|---|
| Home | Main | Hero; intro; three signs (Gallery/Shop/About) on a leafy branch; new paintings; digital illustration strip; "Hello, I'm Lara"; footer |
| Gallery | Gallery | Tabs: **Paintings** and **Digital illustration**. Click a piece to open the lightbox |
| Lightbox | Lightbox | Prev/next; "Order a print" and "Commission something similar" |
| About | About | Photo in an arched frame, story, studio notes, close-up brushwork |
| Contact | Contact | Form with a sent state; email, Instagram, commission nudge |
| Shop | Shop | Three arched doors: Originals / Prints / Commissions; how buying works |
| Originals | Originals | Filter: All / Available / Sold. Sold pieces stay visible and link to prints |
| Prints | Prints | Filter: All / From paintings / Digital; prints shown as paper on a table |
| Painting page | Painting | Image + detail thumbnails; choose Original or Print (A4/A3/A2); add to cart |
| Commissions | Commissions | Oil or Digital; 4-step process; inquiry form with reference upload; sent state |
| Cart | Cart | Slide-in drawer, quantity for prints, originals marked one of a kind |
| Checkout | Checkout | Details, delivery (courier / collect / international), summary, **Pay with PayFast** |
| Order confirmed | Confirmed | Paid state + payment-failed state (switch in Tweaks) |
| FAQ | FAQ | Shipping, originals & prints, commissions, payments & returns |
| 404 | NotFound | Spider drops in on its thread |
| Phone | MobileHome | 390px Home with a full-screen menu. Every page is fluid and stacks at phone width |
| Shared | Header, Footer | Used by every page |

**Purchase flow:** Painting page, Add to cart, Cart drawer, Checkout, PayFast hosted payment, return to Order confirmed (or the failed state). The PayFast ITN webhook marks originals as sold.

**Commission flow:** the inquiry form emails Lara. She replies with a quote and sketch, then emails a PayFast payment link for the deposit. The balance is paid before shipping.

## Still needed from Lara

- High-res, evenly lit photos or scans of each painting, plus titles, sizes, years and prices.
- Her own spider drawing.
- Painted signs for: Digital / Illustrations, Prints, Commissions.
- Real copy in her voice wherever the designs show [brackets]: city, cat names, delivery times, paper name, commission prices, deposit %, returns policy, email and Instagram handle.
