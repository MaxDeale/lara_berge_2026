import { ImageIcon } from '@sanity/icons/Image'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { altField, imageWithAlt, priceField, simpleBlockContent } from './fields'

export const PRINT_SIZES = [
  { title: 'A4', value: 'A4', dimensions: '21 × 30 cm' },
  { title: 'A3', value: 'A3', dimensions: '30 × 42 cm' },
  { title: 'A2', value: 'A2', dimensions: '42 × 59 cm' },
] as const

export const ORIGINAL_STATUS = [
  { title: 'Available', value: 'available' },
  { title: 'Reserved (someone is paying right now)', value: 'reserved' },
  { title: 'Sold', value: 'sold' },
]

export const artwork = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  icon: ImageIcon,
  orderings: [orderRankOrdering],
  groups: [
    { name: 'about', title: 'About the piece', default: true },
    { name: 'images', title: 'Pictures' },
    { name: 'original', title: 'Original' },
    { name: 'prints', title: 'Prints' },
  ],
  fields: [
    defineField({
      name: 'needsInput',
      title: 'Notes for Lara',
      description: 'Things still to fill in or replace. Clear this once it is done.',
      type: 'text',
      rows: 2,
      group: 'about',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'about',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      description: 'The end of the page address, e.g. firefly → /shop/firefly. Click Generate.',
      type: 'slug',
      group: 'about',
      options: { source: 'title', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind of work',
      type: 'string',
      group: 'about',
      options: {
        list: [
          { title: 'Oil painting', value: 'painting' },
          { title: 'Digital illustration', value: 'digital' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'painting',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'year', title: 'Year', type: 'number', group: 'about' }),
    defineField({
      name: 'medium',
      title: 'Medium',
      description: 'e.g. "Oil on stretched canvas" or "Digital illustration"',
      type: 'string',
      group: 'about',
    }),
    defineField({
      name: 'dimensions',
      title: 'Size of the original',
      description: 'e.g. "40 × 50 cm"',
      type: 'string',
      group: 'about',
      hidden: ({ parent }) => parent?.kind === 'digital',
    }),
    simpleBlockContent({
      name: 'description',
      title: 'A few words about it',
      description: 'The story behind it, where the light comes from, how it feels on a wall.',
      group: 'about',
    }),
    defineField({
      name: 'featured',
      title: 'Show on the home page',
      description: 'Featured paintings appear under "New paintings" on the home page.',
      type: 'boolean',
      group: 'about',
      initialValue: false,
    }),

    imageWithAlt({
      name: 'mainImage',
      title: 'Main picture',
      description: 'Evenly lit, straight on, and as large as you have it.',
      required: true,
      group: 'images',
    }),
    defineField({
      name: 'detailImages',
      title: 'Close-ups',
      description: 'Up to three details, shown as thumbnails on the shop page.',
      type: 'array',
      group: 'images',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            altField(),
            defineField({
              name: 'label',
              title: 'Short label',
              description: 'e.g. "Detail: face"',
              type: 'string',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(3),
    }),

    defineField({
      name: 'original',
      title: 'The original',
      type: 'object',
      group: 'original',
      options: { collapsible: false },
      hidden: ({ parent }) => parent?.kind === 'digital',
      fields: [
        defineField({
          name: 'forSale',
          title: 'Is the original for sale?',
          type: 'boolean',
          initialValue: false,
        }),
        priceField({
          name: 'price',
          title: 'Price of the original',
          hidden: ({ parent }) => !parent?.forSale,
        }),
        defineField({
          name: 'status',
          title: 'Status',
          description:
            'Updated automatically when someone pays. You can mark a piece sold yourself if it sells somewhere else. Locked while someone is checking out.',
          type: 'string',
          options: { list: ORIGINAL_STATUS, layout: 'radio' },
          initialValue: 'available',
          hidden: ({ parent }) => !parent?.forSale,
          readOnly: ({ value }) => value === 'reserved',
        }),
        defineField({
          name: 'reservedUntil',
          title: 'Reserved until',
          type: 'datetime',
          hidden: true,
          readOnly: true,
        }),
      ],
      validation: (rule) =>
        rule
          .custom((value: { forSale?: boolean; price?: number } | undefined) =>
            value?.forSale && typeof value.price !== 'number'
              ? 'Add a price, or the original can’t be bought yet'
              : true,
          )
          .warning(),
    }),

    defineField({
      name: 'prints',
      title: 'Signed prints',
      type: 'object',
      group: 'prints',
      options: { collapsible: false },
      fields: [
        defineField({
          name: 'enabled',
          title: 'Sell prints of this piece',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'variants',
          title: 'Sizes',
          description: 'Each size has its own price. Untick "Available" to pause a size.',
          type: 'array',
          hidden: ({ parent }) => !parent?.enabled,
          of: [
            defineArrayMember({
              type: 'object',
              name: 'printVariant',
              title: 'Size',
              fields: [
                defineField({
                  name: 'size',
                  title: 'Size',
                  type: 'string',
                  options: {
                    list: PRINT_SIZES.map(({ title, value }) => ({ title, value })),
                    layout: 'radio',
                    direction: 'horizontal',
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'dimensions',
                  title: 'Paper size',
                  description: 'e.g. "30 × 42 cm"',
                  type: 'string',
                }),
                priceField({ name: 'price', title: 'Price' }),
                defineField({
                  name: 'active',
                  title: 'Available',
                  type: 'boolean',
                  initialValue: true,
                }),
              ],
              preview: {
                select: {
                  size: 'size',
                  price: 'price',
                  active: 'active',
                  dimensions: 'dimensions',
                },
                prepare: ({ size, price, active, dimensions }) => ({
                  title: `${size ?? 'Size'}${dimensions ? ` · ${dimensions}` : ''}`,
                  subtitle: `${typeof price === 'number' ? `R${price / 100}` : 'R[price]'}${active === false ? ' · paused' : ''}`,
                }),
              },
            }),
          ],
          initialValue: PRINT_SIZES.map(({ value, dimensions }) => ({
            _type: 'printVariant',
            size: value,
            dimensions,
            active: true,
          })),
          validation: (rule) =>
            rule.custom((variants: Array<{ size?: string }> | undefined) => {
              const sizes = (variants ?? []).map((v) => v.size)
              return new Set(sizes).size === sizes.length
                ? true
                : 'Each size should only appear once'
            }),
        }),
      ],
    }),

    orderRankField({ type: 'artwork', newItemPosition: 'before' }),
  ],
  preview: {
    select: {
      title: 'title',
      kind: 'kind',
      media: 'mainImage',
      status: 'original.status',
      forSale: 'original.forSale',
      needsInput: 'needsInput',
    },
    prepare: ({ title, kind, media, status, forSale, needsInput }) => {
      const parts = [kind === 'digital' ? 'Digital' : 'Painting']
      if (kind !== 'digital') parts.push(forSale ? (status ?? 'available') : 'not for sale')
      if (needsInput) parts.push('✎ needs your input')
      return { title, subtitle: parts.join(' · '), media }
    },
  },
})
