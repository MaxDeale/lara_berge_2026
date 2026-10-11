/**
 * Puts obviously fake prices into a NON-production dataset so checkout can be tested
 * end to end before Lara has priced anything.
 *
 *   NEXT_PUBLIC_SANITY_DATASET=development npm run seed:test-prices
 *
 * Refuses to touch the production dataset.
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-10-01' })
const { dataset } = client.config()

async function main() {
  if (!dataset || dataset === 'production') {
    throw new Error('Refusing to put test prices into the production dataset.')
  }
  const artworks = await client.fetch<
    Array<{ _id: string; kind: string; variants?: Array<{ _key: string; size: string }> }>
  >(`*[_type == "artwork"]{ _id, kind, "variants": prints.variants[]{ _key, size } }`)
  const printPrice: Record<string, number> = { A4: 85000, A3: 125000, A2: 185000 }
  const originalPrice: Record<string, number> = {
    'artwork-firefly': 450000,
    'artwork-cottage': 380000,
    'artwork-lantern': 420000,
  }

  const tx = client.transaction()
  for (const a of artworks) {
    const set: Record<string, number> = {}
    for (const v of a.variants ?? [])
      set[`prints.variants[_key=="${v._key}"].price`] = printPrice[v.size]
    if (originalPrice[a._id]) set['original.price'] = originalPrice[a._id]
    tx.patch(a._id, (p) => p.set(set))
  }
  tx.patch('siteSettings', (p) =>
    p.set({
      'shippingCourier.price': 15000,
      'shippingInternational.price': 45000,
      'shippingCollect.price': 0,
    }),
  )
  await tx.commit()
  console.log(`✓ Test prices set on ${artworks.length} artworks in ${dataset}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
