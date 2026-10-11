import { BasketIcon } from '@sanity/icons/Basket'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { priceField } from './fields'

export const ORDER_STATUS = [
  { title: 'Waiting for payment', value: 'pending' },
  { title: 'Paid: ready to wrap', value: 'paid' },
  { title: 'Shipped or collected', value: 'shipped' },
  { title: 'Payment failed', value: 'failed' },
  { title: 'Cancelled', value: 'cancelled' },
] as const

export const DELIVERY_METHODS = [
  { title: 'Courier in South Africa', value: 'courier' },
  { title: 'Collect from the studio', value: 'collect' },
  { title: 'International', value: 'international' },
] as const

const locked = { readOnly: true } as const

/**
 * Written by the server at checkout and by PayFast's payment notification.
 * In the Studio, Lara can only move a paid order to "shipped" and keep notes.
 */
export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: BasketIcon,
  groups: [
    { name: 'order', title: 'Order', default: true },
    { name: 'payment', title: 'Payment details' },
  ],
  fields: [
    defineField({
      name: 'reference',
      title: 'Order number',
      type: 'string',
      group: 'order',
      ...locked,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      description:
        'Set to "Shipped or collected" once the parcel has left. Payment statuses update themselves.',
      type: 'string',
      group: 'order',
      options: { list: [...ORDER_STATUS], layout: 'radio' },
      // Only a paid order can be moved on by hand
      readOnly: ({ value }) => value !== 'paid' && value !== 'shipped',
    }),
    defineField({
      name: 'items',
      title: 'What they bought',
      type: 'array',
      group: 'order',
      ...locked,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'orderItem',
          fields: [
            defineField({
              name: 'artwork',
              title: 'Artwork',
              type: 'reference',
              to: [{ type: 'artwork' }],
              weak: true,
            }),
            defineField({ name: 'title', title: 'Title at time of order', type: 'string' }),
            defineField({
              name: 'type',
              title: 'Original or print',
              type: 'string',
              options: { list: ['original', 'print'] },
            }),
            defineField({ name: 'size', title: 'Print size', type: 'string' }),
            priceField({ name: 'unitPrice', title: 'Price each' }),
            defineField({ name: 'qty', title: 'Quantity', type: 'number' }),
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              size: 'size',
              qty: 'qty',
              price: 'unitPrice',
              media: 'artwork.mainImage',
            },
            prepare: ({ title, type, size, qty, price, media }) => ({
              title: `${title ?? 'Artwork'}${qty > 1 ? ` × ${qty}` : ''}`,
              subtitle: `${type === 'print' ? `Print ${size ?? ''}` : 'Original'} · R${(price ?? 0) / 100}`,
              media,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      group: 'order',
      ...locked,
      fields: [
        defineField({ name: 'firstName', title: 'First name', type: 'string' }),
        defineField({ name: 'lastName', title: 'Last name', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
      ],
    }),
    defineField({
      name: 'delivery',
      title: 'Delivery',
      type: 'object',
      group: 'order',
      ...locked,
      fields: [
        defineField({
          name: 'method',
          title: 'Method',
          type: 'string',
          options: { list: [...DELIVERY_METHODS] },
        }),
        defineField({ name: 'line1', title: 'Street address', type: 'string' }),
        defineField({ name: 'suburb', title: 'Suburb', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'province', title: 'Province or region', type: 'string' }),
        defineField({ name: 'postalCode', title: 'Postal code', type: 'string' }),
        defineField({ name: 'country', title: 'Country', type: 'string' }),
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Their note to you',
      type: 'text',
      rows: 3,
      group: 'order',
      ...locked,
    }),
    defineField({
      name: 'gift',
      title: 'It’s a gift (leave the price out of the parcel)',
      type: 'boolean',
      group: 'order',
      ...locked,
    }),
    priceField({ name: 'subtotal', title: 'Subtotal', readOnly: true, group: 'order' }),
    priceField({ name: 'shipping', title: 'Shipping', readOnly: true, group: 'order' }),
    priceField({ name: 'total', title: 'Total', readOnly: true, group: 'order' }),
    defineField({
      name: 'internalNotes',
      title: 'Your private notes',
      description: 'Only you see these.',
      type: 'text',
      rows: 3,
      group: 'order',
    }),

    defineField({
      name: 'createdAt',
      title: 'Placed',
      type: 'datetime',
      group: 'payment',
      ...locked,
    }),
    defineField({ name: 'paidAt', title: 'Paid', type: 'datetime', group: 'payment', ...locked }),
    defineField({
      name: 'pfPaymentId',
      title: 'PayFast payment ID',
      type: 'string',
      group: 'payment',
      ...locked,
    }),
    defineField({
      name: 'paymentStatus',
      title: 'PayFast status',
      type: 'string',
      group: 'payment',
      ...locked,
    }),
    defineField({
      name: 'itnLog',
      title: 'Payment notifications from PayFast',
      type: 'array',
      group: 'payment',
      ...locked,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'itnEntry',
          fields: [
            defineField({ name: 'receivedAt', title: 'Received', type: 'datetime' }),
            defineField({ name: 'paymentStatus', title: 'Status', type: 'string' }),
            defineField({ name: 'outcome', title: 'What we did', type: 'string' }),
            defineField({ name: 'payload', title: 'Raw notification', type: 'text' }),
          ],
          preview: { select: { title: 'paymentStatus', subtitle: 'outcome', date: 'receivedAt' } },
        }),
      ],
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'createdDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: {
      reference: 'reference',
      status: 'status',
      first: 'customer.firstName',
      last: 'customer.lastName',
      total: 'total',
    },
    prepare: ({ reference, status, first, last, total }) => ({
      title: `${reference ?? 'Order'} · ${[first, last].filter(Boolean).join(' ')}`,
      subtitle: `${ORDER_STATUS.find((s) => s.value === status)?.title ?? status} · R${(total ?? 0) / 100}`,
    }),
  },
})
