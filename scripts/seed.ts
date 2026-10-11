/**
 * Imports the starter content shown in the designs into Sanity.
 *
 *   npm run seed            create anything that's missing, leave existing documents alone
 *   npm run seed -- --force replace the seeded documents (overwrites Lara's edits to them!)
 *
 * Runs through `sanity exec --with-user-token`, so it uses your own Sanity login.
 * Every [bracketed] placeholder is kept on purpose: Lara fills those in.
 */
import { createReadStream, existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-10-01' })
const FORCE = process.argv.includes('--force')

const DESIGN = resolve(process.cwd(), 'design/assets')
const OLD_FULL_RES = resolve(process.cwd(), '../old one/lara_b_v2-master/public/assets/img/port2')

// ---------------------------------------------------------------------------
// helpers

let keyCounter = 0
const key = () => `k${(keyCounter++).toString(36).padStart(4, '0')}`

/** LexoRank-style ranks in the format @sanity/orderable-document-list writes */
const rank = (i: number) => `0|${(100000 + i * 4096).toString(36).padStart(6, '0')}:`

const uploaded = new Map<string, string>()
async function upload(path: string): Promise<string> {
  if (!existsSync(path)) throw new Error(`Missing image: ${path}`)
  const cached = uploaded.get(path)
  if (cached) return cached
  // Sanity de-duplicates identical files, so re-running doesn't create copies
  const asset = await client.assets.upload('image', createReadStream(path), {
    filename: basename(path),
  })
  uploaded.set(path, asset._id)
  process.stdout.write('.')
  return asset._id
}

type Hotspot = { x: number; y: number }
async function image(
  path: string,
  alt: string,
  hotspot?: Hotspot,
  extra: Record<string, unknown> = {},
) {
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: await upload(path) },
    ...(hotspot && {
      hotspot: { _type: 'sanity.imageHotspot', x: hotspot.x, y: hotspot.y, width: 1, height: 1 },
      crop: { _type: 'sanity.imageCrop', top: 0, bottom: 0, left: 0, right: 0 },
    }),
    alt,
    ...extra,
  }
}

type Span = string | { text: string; href: string }
/** A Portable Text paragraph. Pass strings, or { text, href } for links. */
function paragraph(...parts: Span[]) {
  const markDefs: Array<{ _key: string; _type: 'link'; href: string }> = []
  const children = parts.map((part) => {
    if (typeof part === 'string') return { _type: 'span', _key: key(), text: part, marks: [] }
    const mark = key()
    markDefs.push({ _key: mark, _type: 'link', href: part.href })
    return { _type: 'span', _key: key(), text: part.text, marks: [mark] }
  })
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children }
}

const printVariants = () =>
  [
    ['A4', '21 × 30 cm'],
    ['A3', '30 × 42 cm'],
    ['A2', '42 × 59 cm'],
  ].map(([size, dimensions]) => ({
    _type: 'printVariant',
    _key: key(),
    size,
    dimensions,
    active: true,
  }))

async function put(doc: { _id: string; _type: string; [k: string]: unknown }) {
  if (FORCE) await client.createOrReplace(doc)
  else await client.createIfNotExists(doc)
}

// ---------------------------------------------------------------------------
// artworks

const PAINTINGS = [
  {
    slug: 'firefly',
    title: '[Firefly painting]',
    file: 'firefly.jpg',
    alt: 'Oil painting of a red-haired woman in profile cradling a glowing firefly against a teal forest',
    status: 'available',
    details: [
      ['ff-face.jpg', 'Detail of the face in profile, soft brushstrokes', 'Detail: face'],
      [
        'ff-glow.jpg',
        'Detail of the glowing firefly painted in thick yellow and green strokes',
        'Detail: firefly glow',
      ],
      [
        'ff-sleeve.jpg',
        'Detail of a blue sleeve and red hair in loose oil strokes',
        'Detail: brushwork',
      ],
    ],
  },
  {
    slug: 'lantern',
    title: '[Lantern painting]',
    file: 'lantern.jpg',
    alt: 'Oil painting of a woman in a red and violet gown holding up a floating lantern in a dark wood',
    status: 'sold',
    hotspot: { x: 0.5, y: 0.2 },
  },
  {
    slug: 'cottage',
    title: '[Cottage painting]',
    file: 'cottage.jpg',
    alt: 'Oil painting of a crooked pink cottage with copper roofs in a sunlit forest clearing, an iron bridge over a stream',
    status: 'available',
    hotspot: { x: 0.42, y: 0.42 },
  },
] as const

// Gallery order from Gallery.dc.html. [file number in the old site, slug, alt text]
const DIGITAL: Array<[number, string, string]> = [
  [1, 'stag', 'Illustration of a stag whose antlers glow with lights on a snowy night'],
  [2, 'velvet-chair', 'Illustration of a woman lounging in a velvet chair while a spider dangles'],
  [39, 'octopus', 'Illustration of an octopus holding a lantern in the deep sea'],
  [3, 'firefly-girl', 'Illustration of a girl in a pale dress holding a firefly in the dark'],
  [
    6,
    'bear-picnic',
    'Illustration of a girl and a large bear sharing a tea picnic in an autumn forest',
  ],
  [4, 'mermaid', 'Illustration of a mermaid diving among bubbles'],
  [13, 'library', 'Illustration of a woman reading in a cluttered library full of cats'],
  [5, 'ghost-bride', 'Illustration of a ghostly bride beside a candlelit mirror'],
  [10, 'faun-dance', 'Illustration of a faun and a girl dancing under an eclipse'],
  [7, 'lantern-lady', 'Illustration of a woman with a lantern in a mossy forest'],
  [11, 'mushrooms', 'Illustration of mushrooms with sleepy faces and fireflies'],
  [12, 'mirror', 'Illustration of a girl climbing out of a mirror holding a lamp'],
  [14, 'balcony', 'Illustration of a woman on a balcony at night'],
  [22, 'fireside-story', 'Illustration of children listening to a story by the fire'],
  [26, 'armchair-cats', 'Illustration of a girl reading in an armchair piled with cats'],
  [27, 'fairy-reading', 'Illustration of a fairy reading among leaves'],
  [31, 'magician', 'Illustration of a magician with a rabbit in his workshop'],
  [34, 'witch-moon', 'Illustration of a witch on a broomstick before a full moon'],
  [35, 'pumpkin-queen', 'Illustration of a lady in a pumpkin gown'],
  [40, 'cauldron', 'Illustration of a witch stirring a glowing green cauldron'],
  [
    33,
    'jack-o-lantern',
    'Illustration of a woman carrying a glowing jack-o-lantern through a dark forest, framed in an oval',
  ],
  [17, 'christmas-gown', 'Illustration of a woman in a Christmas-tree gown'],
  [19, 'tree-roots', 'Illustration of a small figure walking through giant tree roots'],
]
const LOW_RES_DIGITAL = new Set([13, 19])

const titleFromSlug = (slug: string) =>
  slug
    .split('-')
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')

async function seedArtworks() {
  let order = 0
  for (const p of PAINTINGS) {
    const details = 'details' in p ? p.details : []
    await put({
      _id: `artwork-${p.slug}`,
      _type: 'artwork',
      needsInput:
        'Working title: please add the real title, size, year, price and a few words about it.\n' +
        'The photo is a low-res phone crop: replace it with a high-res, evenly lit photo or scan.',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      kind: 'painting',
      year: 2026,
      medium: 'Oil on canvas',
      dimensions: '[W × H cm]',
      description: [
        paragraph(
          '[A few lines from Lara about this painting: the story behind it, where the light comes from, what she hopes it feels like on a wall.]',
        ),
      ],
      featured: true,
      mainImage: await image(
        resolve(DESIGN, p.file),
        p.alt,
        'hotspot' in p ? p.hotspot : undefined,
      ),
      detailImages: await Promise.all(
        details.map(async ([file, alt, label]) => ({
          _key: key(),
          ...(await image(resolve(DESIGN, file), alt, undefined, { label })),
        })),
      ),
      original: { forSale: true, status: p.status },
      prints: { enabled: true, variants: printVariants() },
      orderRank: rank(order++),
    })
  }

  for (const [n, slug, alt] of DIGITAL) {
    await put({
      _id: `artwork-${slug}`,
      _type: 'artwork',
      needsInput:
        'Working title: please add the real title, year and print prices.' +
        (LOW_RES_DIGITAL.has(n)
          ? '\nThis file is quite small: replace it with a larger one if you have it.'
          : ''),
      title: `[${titleFromSlug(slug)} illustration]`,
      slug: { _type: 'slug', current: slug },
      kind: 'digital',
      medium: 'Digital illustration',
      featured: false,
      mainImage: await image(resolve(OLD_FULL_RES, `${n}.jpg`), alt),
      prints: { enabled: true, variants: printVariants() },
      orderRank: rank(order++),
    })
  }
  console.log(`\n✓ ${PAINTINGS.length} paintings and ${DIGITAL.length} digital illustrations`)
}

// ---------------------------------------------------------------------------
// FAQ (FAQ.dc.html and Commissions.dc.html)

const FAQ: Array<[section: string, question: string, answer: ReturnType<typeof paragraph>]> = [
  [
    'shipping',
    'Do you ship outside South Africa?',
    paragraph(
      'Yes, almost everywhere. International parcels are tracked and usually arrive in [x to y] working days. Import duties or taxes may be charged by your country on arrival.',
    ),
  ],
  [
    'shipping',
    'How long until my order arrives?',
    paragraph(
      'Originals and prints leave the studio within [x] working days. Within South Africa, the courier takes [x to y] working days after that.',
    ),
  ],
  [
    'shipping',
    'How are paintings packed?',
    paragraph(
      'Wrapped in glassine, corners protected, then boxed with plenty of padding. Prints travel flat between rigid board.',
    ),
  ],
  [
    'shipping',
    'Can I collect in person?',
    paragraph(
      'Yes, collection from [suburb, City] is free. Choose "Collect from the studio" at checkout and Lara will be in touch.',
    ),
  ],
  [
    'art',
    'Do originals come framed?',
    paragraph(
      'Paintings on stretched canvas arrive with painted sides and are wired, ready to hang without a frame. Prints are unframed and fit standard A-size frames.',
    ),
  ],
  [
    'art',
    'What paper are prints made on?',
    paragraph(
      '[Paper name], a [weight] gsm archival cotton paper, printed with pigment inks that last [100+] years out of direct sunlight.',
    ),
  ],
  [
    'art',
    'Will a sold painting ever come back?',
    paragraph(
      'Originals are one of a kind, but most sold paintings are available as signed prints. Or ',
      { text: 'commission something in the same spirit', href: '/commissions' },
      '.',
    ),
  ],
  [
    'commissions',
    'How much does a commission cost?',
    paragraph(
      'Oil paintings start at R[price] and digital illustrations at R[price], depending on size and detail. ',
      { text: 'Send your idea', href: '/commissions' },
      ' for an exact quote.',
    ),
  ],
  [
    'commissions',
    'How does payment work for commissions?',
    paragraph(
      'A [50]% deposit secures your spot, paid through a PayFast link Lara emails you. The balance is due when the piece is finished, before it ships.',
    ),
  ],
  [
    'commissions',
    'Can you paint my pet?',
    paragraph(
      'Yes, happily. Send a few clear photos in good light, and tell Lara a little about their personality.',
    ),
  ],
  [
    'commissions',
    "What if I don't love the sketch?",
    paragraph(
      'Changes at sketch stage are free. Once paint goes on canvas, bigger changes are quoted separately.',
    ),
  ],
  [
    'commissions',
    'Do you ship commissions abroad?',
    paragraph('Yes. Shipping is added to your quote. ', { text: 'More in the FAQ', href: '/faq' }),
  ],
  [
    'payments',
    'How can I pay?',
    paragraph(
      'Checkout runs through PayFast, so you can pay by credit or debit card, Instant EFT, SnapScan or Zapper. Lara never sees your card details.',
    ),
  ],
  [
    'payments',
    'What if something arrives damaged?',
    paragraph(
      'Email a photo within [x] days of delivery and Lara will make it right, with a replacement print or a refund.',
    ),
  ],
  [
    'payments',
    'Can I return a piece?',
    paragraph(
      '[Returns policy: e.g. originals and prints may be returned unused within x days; commissions are non-refundable once started.]',
    ),
  ],
]

// The Commissions page's "Good to know" questions, which the FAQ page doesn't show
const COMMISSIONS_PAGE_ONLY = new Set([
  'Can you paint my pet?',
  "What if I don't love the sketch?",
  'Do you ship commissions abroad?',
])

async function seedFaq() {
  for (const [i, [section, question, answer]] of FAQ.entries()) {
    await put({
      _id: `faq-${String(i + 1).padStart(2, '0')}`,
      _type: 'faqItem',
      question,
      answer: [answer],
      section,
      showOn: COMMISSIONS_PAGE_ONLY.has(question) ? 'commissions' : 'faq',
      orderRank: rank(i),
    })
  }
  console.log(`✓ ${FAQ.length} FAQ questions`)
}

// ---------------------------------------------------------------------------
// legal pages and settings

async function seedLegal() {
  await put({
    _id: 'legal-terms',
    _type: 'legalPage',
    title: 'Terms',
    slug: { _type: 'slug', current: 'terms' },
    body: [paragraph('[Terms and conditions of sale, to come from Lara.]')],
  })
  await put({
    _id: 'legal-privacy',
    _type: 'legalPage',
    title: 'Privacy',
    slug: { _type: 'slug', current: 'privacy' },
    body: [
      paragraph(
        '[Privacy policy, to come from Lara: what is collected at checkout and through the forms, and how it is used.]',
      ),
    ],
  })
  console.log('✓ Terms and Privacy pages')
}

const ref = (id: string) => ({ _type: 'reference', _ref: id })
const note = (label: string, text: string) => ({ _type: 'studioNote', _key: key(), label, text })

async function seedSettings() {
  await put({
    _id: 'siteSettings',
    _type: 'siteSettings',
    heroArtwork: ref('artwork-cottage'),
    heroMotion: 'drift-fireflies',
    introHeading: 'Small enchanted worlds,',
    introHeadingItalic: 'painted by hand',
    introText:
      'Lanterns that float in the dark, fireflies cupped in careful hands, and crooked cottages at the end of the path. Real oil paint, real brushes, and usually a cat supervising from the table.',
    helloText: [
      'A self-confessed crazy cat lady and lover of all things whimsical, usually found behind an easel with a cup of tea going cold beside it.',
      "If there's a little world you'd love to see on your wall, I paint commissions in oil, and draw digital illustrations too.",
    ],
    portrait: await image(
      resolve(DESIGN, 'portrait.jpg'),
      "Lara's illustrated self-portrait in an ornate oval frame, holding a paintbrush",
    ),

    aboutEyebrow: 'the long version',
    aboutHeading: "Hello, I'm Lara",
    aboutBody: [
      paragraph(
        "I've been drawing for as long as I can remember: witches, stags, cats in armchairs, and the odd octopus carrying a lantern. For years most of that lived on a screen, drawn with a stylus.",
      ),
      paragraph(
        'Then I fell head over heels for oil paint. These days I do both: slow, glowing oil paintings of small enchanted worlds, and digital illustrations whenever a story calls for one.',
      ),
      paragraph(
        "I'm a self-confessed crazy cat lady, a lover of all things whimsical, and I can't paint without a cup of tea going cold somewhere nearby.",
      ),
    ],
    aboutPhoto: await image(
      resolve(DESIGN, 'lara-photo.jpg'),
      'Lara smiling among green leaves, wearing a pink top',
    ),
    aboutPhotoCaption: 'Lara, somewhere between the easel and the kettle',
    studioNotes: [
      note('works in', 'Oil on canvas and board. Digital illustration in [software].'),
      note('paints about', 'Fairy tales, deep forests, lantern light and quiet everyday magic.'),
      note('studio assistants', '[Cat names], who mostly sit on the reference photos.'),
      note('based in', '[City], South Africa. Shipping everywhere.'),
    ],

    shopOriginalsArtwork: ref('artwork-firefly'),
    shopPrintsArtwork: ref('artwork-octopus'),
    shopCommissionsArtwork: ref('artwork-lantern'),
    commissionOilArtwork: ref('artwork-lantern'),
    commissionDigitalArtwork: ref('artwork-armchair-cats'),

    shippingCourier: {
      label: 'Courier, door to door',
      note: 'Anywhere in South Africa · [x to y] working days',
    },
    shippingCollect: {
      label: 'Collect from the studio',
      note: '[City] · by arrangement',
      price: 0,
    },
    shippingInternational: {
      label: 'International shipping',
      note: 'Tracked · [x to y] working days · duties may apply',
    },
    collectionArea: '[suburb, City]',
    dispatchOriginals: '[x] working days',
    dispatchPrints: '[x] working days',
    deliverySA: '[x to y] working days',
    deliveryInternational: '[x to y] working days',

    printPaperName: '[paper name]',
    printPaperDetails: '[weight] gsm archival cotton paper',
    printLightfast: '[100+]',

    commissionOilTurnaround: '[x to y] weeks',
    commissionDigitalTurnaround: '[x to y] weeks',
    commissionOilSizes: '[A4] to [size]',
    commissionDigitalRounds: '[2]',
    commissionReplyDays: '[x] working days',
    commissionOilSizeOptions: [
      'Small, about [30 × 40 cm]',
      'Medium, about [40 × 50 cm]',
      'Large, about [60 × 80 cm]',
      'Something else',
    ],
    commissionBudgetOptions: ['R[range 1]', 'R[range 2]', 'R[range 3]', 'Not sure yet'],

    replyTime: '[1 to 2 working days]',
    city: '[City]',

    seoTitle: 'Lara Berge Artworks',
    seoDescription:
      'Original oil paintings, signed fine art prints and commissions by Lara Berge, a South African painter and illustrator.',
  })
  console.log('✓ Settings')
}

// ---------------------------------------------------------------------------

async function main() {
  const { projectId, dataset } = client.config()
  console.log(
    `Seeding ${projectId}/${dataset}${FORCE ? ' (--force: replacing seeded documents)' : ''}`,
  )
  await seedArtworks()
  await seedFaq()
  await seedLegal()
  await seedSettings()
  console.log('Done. Open /studio to see it.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
