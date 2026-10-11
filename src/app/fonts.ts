import { Alegreya, IM_Fell_English, IM_Fell_English_SC } from 'next/font/google'

export const imFell = IM_Fell_English({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-im-fell',
  fallback: ['Georgia', 'serif'],
})

export const imFellSC = IM_Fell_English_SC({
  weight: '400',
  subsets: ['latin'],
  // Only used for small eyebrow labels, never above-the-fold body text: don't compete with the
  // fonts the first paint needs
  preload: false,
  variable: '--font-im-fell-sc',
  fallback: ['Georgia', 'serif'],
})

export const alegreya = Alegreya({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-alegreya',
  fallback: ['Georgia', 'serif'],
})

export const fontVariables = `${imFell.variable} ${imFellSC.variable} ${alegreya.variable}`
