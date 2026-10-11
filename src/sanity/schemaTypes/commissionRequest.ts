import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const COMMISSION_STATUS = [
  { title: 'New', value: 'new' },
  { title: 'Quoted', value: 'quoted' },
  { title: 'Deposit paid', value: 'deposit-paid' },
  { title: 'In progress', value: 'in-progress' },
  { title: 'Done', value: 'done' },
  { title: 'Declined', value: 'declined' },
] as const

const locked = { readOnly: true } as const

/** Sent from the commission form. Lara updates the status and keeps notes; the rest is locked. */
export const commissionRequest = defineType({
  name: 'commissionRequest',
  title: 'Commission request',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: [...COMMISSION_STATUS], layout: 'radio', direction: 'horizontal' },
      initialValue: 'new',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Your private notes',
      description: 'Quote, dates, anything to remember.',
      type: 'text',
      rows: 4,
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', ...locked }),
    defineField({ name: 'email', title: 'Email', type: 'string', ...locked }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Oil painting', value: 'oil' },
          { title: 'Digital illustration', value: 'digital' },
        ],
      },
      ...locked,
    }),
    defineField({ name: 'sizeOrUse', title: 'Size, or what it’s for', type: 'string', ...locked }),
    defineField({ name: 'budget', title: 'Budget', type: 'string', ...locked }),
    defineField({ name: 'deadline', title: 'Needed by', type: 'date', ...locked }),
    defineField({ name: 'gift', title: 'It’s a gift', type: 'boolean', ...locked }),
    defineField({ name: 'idea', title: 'Their idea', type: 'text', rows: 8, ...locked }),
    defineField({
      name: 'references',
      title: 'Reference photos',
      type: 'array',
      of: [defineArrayMember({ type: 'image' })],
      ...locked,
    }),
    defineField({
      name: 'sharePermission',
      title: 'Happy for you to share the finished piece',
      type: 'boolean',
      ...locked,
    }),
    defineField({ name: 'createdAt', title: 'Sent', type: 'datetime', ...locked }),
  ],
  orderings: [
    { title: 'Newest first', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { name: 'name', kind: 'kind', status: 'status', media: 'references.0' },
    prepare: ({ name, kind, status, media }) => ({
      title: name ?? 'Commission request',
      subtitle: `${kind === 'digital' ? 'Digital' : 'Oil'} · ${COMMISSION_STATUS.find((s) => s.value === status)?.title ?? status}`,
      media,
    }),
  },
})
