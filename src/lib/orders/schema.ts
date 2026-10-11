import { z } from 'zod'

export const DELIVERY_METHODS = ['courier', 'collect', 'international'] as const
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]

export const cartLineSchema = z.object({
  artworkId: z.string().min(1).max(120),
  type: z.enum(['original', 'print']),
  size: z.enum(['A4', 'A3', 'A2']).optional(),
  qty: z.number().int().min(1).max(10),
})

export const cartSchema = z.array(cartLineSchema).min(1, 'Your cart is empty').max(30)

const req = (msg: string, max = 120) => z.string().trim().min(1, msg).max(max)

const address = z.object({
  line1: req('Please add your street address', 200),
  suburb: z.string().trim().max(120).default(''),
  city: req('Please add your city'),
  province: z.string().trim().max(120).default(''),
  postalCode: req('Please add your postal code', 20),
  country: req('Please choose a country'),
})

const details = {
  firstName: req('Please add your first name', 100),
  lastName: req('Please add your last name', 100),
  email: z.email({ error: "That email doesn't look quite right" }).trim().max(100),
  phone: z
    .string()
    .trim()
    .min(7, 'Please add a phone number for the courier')
    .max(30)
    .regex(/^[+\d\s()-]+$/, 'Only numbers, spaces and + please'),
  notes: z.string().trim().max(1000).default(''),
  gift: z.boolean().default(false),
}

/** Checkout details. The address is only needed when something is being shipped. */
export const checkoutSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('courier'),
    ...details,
    address: address.extend({ country: z.literal('South Africa') }),
  }),
  z.object({
    method: z.literal('international'),
    ...details,
    address: address.refine((a) => a.country !== 'South Africa', {
      message: 'For South Africa, choose courier',
      path: ['country'],
    }),
  }),
  z.object({ method: z.literal('collect'), ...details }),
])

export type CheckoutInput = z.infer<typeof checkoutSchema>
