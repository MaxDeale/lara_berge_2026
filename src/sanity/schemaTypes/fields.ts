import { defineArrayMember, defineField } from 'sanity'
import { RandsInput } from '../components/RandsInput'

/** A price in ZAR cents, typed in rands by Lara. */
export function priceField(options: {
  name: string
  title: string
  description?: string
  hidden?: (ctx: { parent?: Record<string, unknown> }) => boolean
  readOnly?: boolean
  required?: boolean
  group?: string
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description ?? 'In rands, e.g. 1250',
    type: 'number',
    hidden: options.hidden,
    readOnly: options.readOnly,
    group: options.group,
    components: { input: RandsInput },
    validation: (rule) => {
      const base = rule.integer().min(0)
      return options.required ? base.required() : base
    },
  })
}

/** An image that always carries alt text. */
export function imageWithAlt(options: {
  name: string
  title: string
  description?: string
  required?: boolean
  group?: string
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: 'image',
    group: options.group,
    options: { hotspot: true },
    fields: [altField()],
    validation: options.required ? (rule) => rule.required() : undefined,
  })
}

export function altField() {
  return defineField({
    name: 'alt',
    title: 'Describe the picture',
    description:
      'For people using screen readers, and for Google. One sentence about what is in it, e.g. "Oil painting of a woman cradling a glowing firefly in a teal forest".',
    type: 'string',
    validation: (rule) => rule.required().error('Please describe the picture'),
  })
}

/** Simple rich text: paragraphs, bold, italic and links. No headings. */
export function simpleBlockContent(options: {
  name: string
  title: string
  group?: string
  description?: string
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    group: options.group,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [{ title: 'Paragraph', value: 'normal' }],
        lists: [{ title: 'Bullets', value: 'bullet' }],
        marks: {
          decorators: [
            { title: 'Bold', value: 'strong' },
            { title: 'Italic', value: 'em' },
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [
                defineField({
                  name: 'href',
                  title: 'Address',
                  description: 'A page on this site like /commissions, or a full web address',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
              ],
            },
          ],
        },
      }),
    ],
  })
}
