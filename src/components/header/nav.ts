export type NavItem = { label: string; href: string; matches: string[] }

export const MAIN_NAV: NavItem[] = [
  { label: 'Home', href: '/', matches: [] },
  { label: 'Gallery', href: '/gallery', matches: ['/gallery'] },
  // Commissions sits under Shop in the designs
  { label: 'Shop', href: '/shop', matches: ['/shop', '/commissions'] },
  { label: 'About', href: '/about', matches: ['/about'] },
  { label: 'Contact', href: '/contact', matches: ['/contact'] },
]

export function isActive(item: NavItem, pathname: string | null): boolean {
  if (!pathname) return false
  if (item.href === '/') return pathname === '/'
  return item.matches.some((m) => pathname === m || pathname.startsWith(`${m}/`))
}
