import type { Metadata } from 'next'
import { CheckoutView } from '@/components/checkout/CheckoutView'
import { or } from '@/lib/artwork'
import { getSettings } from '@/sanity/queries'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default async function CheckoutPage() {
  const s = await getSettings()
  return <CheckoutView collectionArea={or(s.collectionArea, '[suburb, City]')} />
}
