# Still to fill in

Every [bracketed] placeholder left in the content, from a scan of the live Sanity dataset on 11 October 2026. They show on the website exactly as written until they're replaced. Everything here is edited in the Studio; nothing needs code.

## Photos and artworks

- [ ] **High-res photos of the three paintings.** Firefly, Lantern and Cottage are low-res phone crops. Replace each **Main picture** (Artworks → Paintings → *painting* → Pictures). Evenly lit, straight on, as large as possible.
- [ ] **Larger files for two digital pieces:** Library (#13, 910 px wide) and Tree roots (#19, 702 px wide).
- [ ] **Real titles** for all 26 artworks, currently working titles like `[Firefly painting]` and `[Stag illustration]`. The *Web address* can stay as it is.
- [ ] **Painting details:** size (`[W × H cm]`), year and a few words about each painting (currently `[A few lines from Lara about this painting…]`).
- [ ] **Years** for the digital illustrations (the gallery shows `[year]`).
- [ ] **Prices:** the three originals, and A4, A3 and A2 print prices on every artwork. Nothing can be bought until these are set.
- [ ] Clear each artwork's **Notes for Lara** box when it's done.
- [ ] **Home page picture:** Settings → Home is temporarily set to the stag illustration until better painting photos arrive.
- [ ] Lara's own **spider drawing** (to replace the stand-in in the header), and painted signs for **Digital**, **Prints** and **Commissions**. These are design files, so send them to Max.

## Settings

**Shipping**
- [ ] Courier price, and its note: `Anywhere in South Africa · [x to y] working days`
- [ ] International price, and its note: `Tracked · [x to y] working days · duties may apply`
- [ ] Collection note `[City] · by arrangement` and **Where people collect from** `[suburb, City]`
- [ ] Originals leave the studio within `[x] working days`; prints within `[x] working days`
- [ ] Courier time in SA `[x to y] working days`; international `[x to y] working days`

**Prints**
- [ ] Paper name `[paper name]`, details `[weight] gsm archival cotton paper`, lasts `[100+]` years

**Commissions**
- [ ] Starting prices for oil and digital (show as `from R[price]`)
- [ ] How long each takes: `[x to y] weeks` (oil and digital)
- [ ] Oil size range `[A4] to [size]`; digital rounds of tweaks `[2]`
- [ ] Deposit percentage (shows as `[50]%` until set)
- [ ] You reply within `[x] working days`
- [ ] Oil size choices on the form: `Small, about [30 × 40 cm]`, `Medium, about [40 × 50 cm]`, `Large, about [60 × 80 cm]`
- [ ] Budget choices: `R[range 1]`, `R[range 2]`, `R[range 3]`

**Contact**
- [ ] Email shown on the site (shows `hello@[domain]`)
- [ ] Instagram handle (shows `@[instagram handle]`)
- [ ] Reply time `[1 to 2 working days]`
- [ ] City `[City]`

**About**
- [ ] Studio notes: `Digital illustration in [software]`, `[Cat names], who mostly sit on the reference photos`, `[City], South Africa`

## FAQ answers

- [ ] *Do you ship outside South Africa?* `[x to y]` working days
- [ ] *How long until my order arrives?* `[x]` and `[x to y]` working days
- [ ] *Can I collect in person?* `[suburb, City]`
- [ ] *What paper are prints made on?* `[Paper name]`, `[weight]` gsm, `[100+]` years
- [ ] *How much does a commission cost?* oil and digital `R[price]`
- [ ] *How does payment work for commissions?* `[50]`% deposit
- [ ] *What if something arrives damaged?* within `[x]` days
- [ ] *Can I return a piece?* The whole answer is a placeholder for the **returns policy**.

## Legal pages

- [ ] **Terms**: currently `[Terms and conditions of sale, to come from Lara.]`
- [ ] **Privacy**: currently a placeholder. It should cover what's collected at checkout and through the forms, and how it's used.

## For Max (not content)

- [ ] PayFast: own sandbox account to finish testing, then live merchant ID, key and passphrase
- [ ] Resend: API key, verified sending domain, `MAIL_FROM`, `LARA_EMAIL`
- [ ] Production domain → `NEXT_PUBLIC_SITE_URL`, Sanity CORS origin, Sanity webhook
- [ ] `CRON_SECRET` on the host
- [ ] Invite Lara to the Sanity project (sanity.io/manage → Members)
- [ ] Update Next.js for the 14 October 2026 security release
