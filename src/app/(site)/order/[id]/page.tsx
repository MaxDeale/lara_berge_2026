import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { OrderView } from '@/components/order/OrderView'
import { or } from '@/lib/artwork'
import { getOrder } from '@/lib/orders/orders'
import { instagramUrl } from '@/lib/site'
import { getSettings } from '@/sanity/queries'

export const metadata: Metadata = { title: 'Your order', robots: { index: false, follow: false } }

/** Where PayFast sends the shopper back. The id is random, so order pages can't be guessed. */
export default function OrderPage({ params }: PageProps<'/order/[id]'>) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <Order params={params} />
    </Suspense>
  )
}

async function Order({ params }: { params: PageProps<'/order/[id]'>['params'] }) {
  const { id } = await params
  const [order, s] = await Promise.all([getOrder(id), getSettings()])
  if (!order) notFound()
  return (
    <OrderView
      orderId={order._id}
      initialStatus={order.status}
      reference={order.reference}
      firstName={order.customer.firstName}
      email={order.customer.email}
      total={order.total}
      collect={order.delivery.method === 'collect'}
      dispatch={or(s.dispatchOriginals, '[x] working days')}
      instagram={instagramUrl(s.instagramHandle)}
      items={order.items.map((i) => ({
        title: i.title,
        label:
          i.type === 'original' ? 'original' : `${i.size} print${i.qty > 1 ? ` × ${i.qty}` : ''}`,
        total: i.unitPrice * i.qty,
        image: i.image ?? null,
      }))}
    />
  )
}
