'use client'

import { useSyncExternalStore } from 'react'
import { useCart } from './store'

const subscribe = (onChange: () => void) => useCart.persist.onFinishHydration(onChange)

/** True once the saved cart has been read from this browser (always false on the server) */
export function useCartHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useCart.persist.hasHydrated(),
    () => false,
  )
}
