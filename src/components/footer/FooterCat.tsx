'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { brand } from '@/lib/brand'

// Pages where the designs leave the cat off (they already have a doodad near the footer)
const CAT_FREE = ['/contact', '/commissions', '/order']

/** The grey cat sitting on the footer rule. */
export function FooterCat({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const pathname = usePathname()
  if (!alwaysShow && CAT_FREE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null
  }
  return (
    <Image
      src={brand.doodads.greyCat}
      alt=""
      sizes="96px"
      className="absolute right-7 bottom-[calc(100%-26px)] block h-auto w-[74px] md:right-16 md:bottom-[calc(100%-40px)] md:w-24"
    />
  )
}
