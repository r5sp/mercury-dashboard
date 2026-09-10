interface IconProps {
  size?: number
}

const stroke = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

/**
 * The mark: a rising column set against a baseline - a ledger entry, not a logo
 * from a template. Drawn rather than imported so it inherits the accent colour.
 */
export const MercuryMark = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none">
    <path d="M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <path d="M6 20V13M11 20V8M16 20V15M21 20V4" stroke="currentColor" strokeWidth="2.4" />
  </svg>
)

export const SearchIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="M10.2 10.2 14 14" />
  </svg>
)

export const CloseIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
)

export const SunIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.6v1.3M8 13.1v1.3M1.6 8h1.3M13.1 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9" />
  </svg>
)

export const MoonIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6a5.6 5.6 0 1 0 7 7Z" />
  </svg>
)

/** Half-filled disc: the light-but-tinted middle setting. */
export const HalfDiscIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <circle cx="8" cy="8" r="5" />
    <path d="M8 3a5 5 0 0 1 0 10Z" fill="currentColor" stroke="none" />
  </svg>
)

export const CheckIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M3 8.4l3.1 3.1L13 4.6" />
  </svg>
)

export const CrossIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
  </svg>
)

export const ArrowRightIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" />
  </svg>
)

export const PlusIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M8 3.2v9.6M3.2 8h9.6" />
  </svg>
)

export const CalendarIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <rect x="2.5" y="3.5" width="11" height="10" />
    <path d="M2.5 6.5h11M5.5 2.2v2M10.5 2.2v2" />
  </svg>
)

export const TrophyIcon = ({ size = 13 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M5 2.5h6v3a3 3 0 0 1-6 0v-3Z" />
    <path d="M5 3.5H3.2a2.3 2.3 0 0 0 1.9 2.4M11 3.5h1.8a2.3 2.3 0 0 1-1.9 2.4" />
    <path d="M8 8.5v2.5M5.8 13.5h4.4" />
  </svg>
)

export const OverviewIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M2.5 12.5h11M4.5 12.5V7M8 12.5V3.5M11.5 12.5V9" />
  </svg>
)

export const PeopleIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <circle cx="6" cy="6" r="2.4" />
    <path d="M2 13c0-2.2 1.8-3.6 4-3.6S10 10.8 10 13" />
    <path d="M11 4.2a2.2 2.2 0 0 1 0 4M12.4 12.9c0-1.6-.7-2.6-1.9-3.1" />
  </svg>
)

export const ActivityIcon = ({ size = 14 }: IconProps) => (
  <svg {...stroke(size)}>
    <path d="M1.8 8.5h3l1.7-4.6 2.6 8 1.6-3.4h3.5" />
  </svg>
)
