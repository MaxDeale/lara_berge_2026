import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { imageWithAlt, priceField, simpleBlockContent } from './fields'

const shippingRate = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    group: 'shipping',
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({ name: 'label', title: 'Name at checkout', type: 'string' }),
      defineField({ name: 'note', title: 'Small print under it', type: 'string' }),
      priceField({ name: 'price', title: 'Price', description: 'In rands. Use 0 for free.' }),
    ],
  })

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'home', title: 'Home', default: true },
    { name: 'about', title: 'About' },
    { name: 'pictures', title: 'Shop & commission pictures' },
    { name: 'shipping', title: 'Shipping' },
    { name: 'prints', title: 'Prints' },
    { name: 'commissions', title: 'Commissions' },
    { name: 'contact', title: 'Contact' },
    { name: 'seo', title: 'Google & sharing' },
  ],
  fields: [
    // Home
    defineField({
      name: 'heroArtwork',
      title: 'Big painting at the top of the home page',
      type: 'reference',
      to: [{ type: 'artwork' }],
      group: 'home',
    }),
    defineField({
      name: 'heroMotion',
      title: 'How the big painting moves',
      type: 'string',
      group: 'home',
      options: {
        list: [
          { title: 'Slow drift with fireflies', value: 'drift-fireflies' },
          { title: 'Slow drift only', value: 'drift' },
          { title: 'Still', value: 'still' },
        ],
        layout: 'radio',
      },
      initialValue: 'drift-fireflies',
    }),
    defineField({ name: 'introHeading', title: 'Welcome heading', type: 'string', group: 'home' }),
    defineField({
      name: 'introHeadingItalic',
      title: 'Welcome heading: the italic ending',
      description: 'Shown in mauve italics after the heading, e.g. "painted by hand"',
      type: 'string',
      group: 'home',
    }),
    defineField({ name: 'introText', title: 'Welcome text', type: 'text', rows: 3, group: 'home' }),
    defineField({
      name: 'helloText',
      title: '"Hello, I\'m Lara" text',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 2 })],
      description: 'One box per paragraph.',
      group: 'home',
    }),
    imageWithAlt({ name: 'portrait', title: 'Self-portrait next to it', group: 'home' }),

    // About
    defineField({
      name: 'aboutEyebrow',
      title: 'Small line above the heading',
      type: 'string',
      group: 'about',
    }),
    defineField({ name: 'aboutHeading', title: 'Heading', type: 'string', group: 'about' }),
    simpleBlockContent({ name: 'aboutBody', title: 'Your story', group: 'about' }),
    imageWithAlt({ name: 'aboutPhoto', title: 'Photo of you', group: 'about' }),
    defineField({
      name: 'aboutPhotoCaption',
      title: 'Photo caption',
      type: 'string',
      group: 'about',
    }),
    defineField({
      name: 'studioNotes',
      title: 'Studio notes',
      type: 'array',
      group: 'about',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'studioNote',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              description: 'e.g. "works in"',
              type: 'string',
            }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label', subtitle: 'text' } },
        }),
      ],
    }),

    // Pictures on the Shop and Commissions pages
    defineField({
      name: 'shopOriginalsArtwork',
      title: 'Shop page: "Original paintings" door',
      type: 'reference',
      to: [{ type: 'artwork' }],
      group: 'pictures',
    }),
    defineField({
      name: 'shopPrintsArtwork',
      title: 'Shop page: "Fine art prints" door',
      type: 'reference',
      to: [{ type: 'artwork' }],
      group: 'pictures',
    }),
    defineField({
      name: 'shopCommissionsArtwork',
      title: 'Shop page: "Commissions" door',
      type: 'reference',
      to: [{ type: 'artwork' }],
      group: 'pictures',
    }),
    defineField({
      name: 'commissionOilArtwork',
      title: 'Commissions page: "in oil" picture',
      type: 'reference',
      to: [{ type: 'artwork' }],
      group: 'pictures',
    }),
    defineField({
      name: 'commissionDigitalArtwork',
      title: 'Commissions page: "or digital" picture',
      type: 'reference',
      to: [{ type: 'artwork' }],
      group: 'pictures',
    }),

    // Shipping
    shippingRate('shippingCourier', 'Courier within South Africa'),
    shippingRate('shippingCollect', 'Collection from the studio'),
    shippingRate('shippingInternational', 'International shipping'),
    defineField({
      name: 'collectionArea',
      title: 'Where people collect from',
      description: 'Shown at checkout, e.g. "Kloof, Durban". Never your street address.',
      type: 'string',
      group: 'shipping',
    }),
    defineField({
      name: 'dispatchOriginals',
      title: 'Originals leave the studio within',
      description: 'e.g. "3 working days"',
      type: 'string',
      group: 'shipping',
    }),
    defineField({
      name: 'dispatchPrints',
      title: 'Prints are printed and sent within',
      type: 'string',
      group: 'shipping',
    }),
    defineField({
      name: 'deliverySA',
      title: 'Courier time in South Africa',
      description: 'e.g. "2 to 4 working days"',
      type: 'string',
      group: 'shipping',
    }),
    defineField({
      name: 'deliveryInternational',
      title: 'International delivery time',
      type: 'string',
      group: 'shipping',
    }),

    // Prints
    defineField({ name: 'printPaperName', title: 'Paper name', type: 'string', group: 'prints' }),
    defineField({
      name: 'printPaperDetails',
      title: 'Paper details',
      description: 'e.g. "308 gsm archival cotton paper"',
      type: 'string',
      group: 'prints',
    }),
    defineField({
      name: 'printLightfast',
      title: 'Lasts this long',
      description: 'e.g. "100+"',
      type: 'string',
      group: 'prints',
    }),

    // Commissions
    priceField({
      name: 'commissionOilFrom',
      title: 'Oil paintings start at',
      group: 'commissions',
    }),
    priceField({
      name: 'commissionDigitalFrom',
      title: 'Digital illustrations start at',
      group: 'commissions',
    }),
    defineField({
      name: 'commissionOilTurnaround',
      title: 'Oil: how long it takes',
      description: 'e.g. "4 to 6 weeks"',
      type: 'string',
      group: 'commissions',
    }),
    defineField({
      name: 'commissionDigitalTurnaround',
      title: 'Digital: how long it takes',
      type: 'string',
      group: 'commissions',
    }),
    defineField({
      name: 'commissionOilSizes',
      title: 'Oil: size range line',
      description: 'e.g. "A4 to 60 × 80 cm"',
      type: 'string',
      group: 'commissions',
    }),
    defineField({
      name: 'commissionDigitalRounds',
      title: 'Digital: rounds of tweaks',
      type: 'string',
      group: 'commissions',
    }),
    defineField({
      name: 'commissionDepositPercent',
      title: 'Deposit (%)',
      type: 'number',
      group: 'commissions',
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'commissionReplyDays',
      title: 'You reply within',
      description: 'e.g. "3 working days"',
      type: 'string',
      group: 'commissions',
    }),
    defineField({
      name: 'commissionOilSizeOptions',
      title: 'Oil size choices on the form',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'commissions',
    }),
    defineField({
      name: 'commissionBudgetOptions',
      title: 'Budget choices on the form',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'commissions',
    }),

    // Contact
    defineField({
      name: 'contactEmail',
      title: 'Email shown on the site',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram handle',
      description: 'Without the @',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'replyTime',
      title: 'You usually reply within',
      description: 'e.g. "1 to 2 working days"',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'city',
      title: 'City',
      description: 'Used on About and checkout, e.g. "Durban"',
      type: 'string',
      group: 'contact',
    }),

    // SEO
    defineField({ name: 'seoTitle', title: 'Site name in Google', type: 'string', group: 'seo' }),
    defineField({
      name: 'seoDescription',
      title: 'Description in Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.max(170).warning('Google shows about 160 characters'),
    }),
    imageWithAlt({
      name: 'seoImage',
      title: 'Picture when a link is shared',
      description: 'Used when there is no artwork to show. 1200 × 630 works best.',
      group: 'seo',
    }),
  ],
  preview: { prepare: () => ({ title: 'Settings' }) },
})
