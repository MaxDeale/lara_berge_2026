'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { addLine, removeLine, setQty, type CartLine } from './lines'

export type { CartLine, PrintSize } from './lines'

type CartState = {
  lines: CartLine[]
  drawerOpen: boolean
  add: (line: CartLine) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

/** Prices never live here: the server recomputes everything from Sanity at checkout. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      add: (line) => set((s) => ({ lines: addLine(s.lines, line), drawerOpen: true })),
      setQty: (key, qty) => set((s) => ({ lines: setQty(s.lines, key, qty) })),
      remove: (key) => set((s) => ({ lines: removeLine(s.lines, key) })),
      clear: () => set({ lines: [] }),
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
