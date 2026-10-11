'use client'

import { useEffect } from 'react'
import { useCart } from './store'

export function CartHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate()
  }, [])
  return null
}
