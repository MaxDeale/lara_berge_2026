import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function icon(
  paths: React.ReactNode,
  defaults: { viewBox?: string; strokeWidth?: number; size?: number } = {},
) {
  const { viewBox = '0 0 24 24', strokeWidth = 1.5, size: defaultSize = 22 } = defaults
  function Icon({ size = defaultSize, ...props }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {paths}
      </svg>
    )
  }
  return Icon
}

export const CartIcon = icon(
  <>
    <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </>,
  { strokeWidth: 1.3 },
)

export const CloseIcon = icon(<path d="M5 5l14 14M19 5L5 19" />)

export const ChevronLeftIcon = icon(<path d="M15 5l-7 7 7 7" />)
export const ChevronRightIcon = icon(<path d="M9 5l7 7-7 7" />)

export const HamburgerIcon = icon(
  <path d="M2 3c7-1.5 15 1 22 0M2 10c8 1 14-1 22 0M2 17c6-1 15 1.5 22 0" />,
  { viewBox: '0 0 26 20', size: 26 },
)

export const InstagramIcon = icon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </>,
  { strokeWidth: 1.4, size: 21 },
)

export const MailIcon = icon(
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </>,
  { strokeWidth: 1.4 },
)

export const LockIcon = icon(
  <>
    <rect x="5" y="10" width="14" height="10" rx="1.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>,
  { strokeWidth: 1.6, size: 16 },
)

export const UploadIcon = icon(
  <>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </>,
  { strokeWidth: 1.4, size: 30 },
)

export const CheckIcon = icon(<path d="M5 12l5 5 9-10" />, { strokeWidth: 2, size: 20 })

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M12 2l2 7 7 3-7 2-2 8-2-8-7-2 7-3z" fill="currentColor" />
    </svg>
  )
}
