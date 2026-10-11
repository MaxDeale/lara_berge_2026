'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type PrintSize = 'A4' | 'A3' | 'A2'

export type CartLine = {
  artworkId: string
  type: 'original' | 'print'
  size?: PrintSize
  qty: number
}

type CartState = {
  lines: CartLine[]
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

/** Prices never live here: the server recomputes everything from Sanity at checkout. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: 'lb-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // Rehydrated after mount by <CartHydrator /> so server and client render the same first frame.
      skipHydration: true,
    },
  ),
)

export const selectCount = (state: CartState) =>
  state.lines.reduce((total, line) => total + line.qty, 0)
