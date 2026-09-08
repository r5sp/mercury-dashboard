interface IconProps {
  size?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const SearchIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="7" cy="7" r="4.25" />
    <path d="M10.2 10.2 14 14" />
  </svg>
)

export const CloseIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
)

export const SunIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9" />
  </svg>
)

export const MoonIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6a5.6 5.6 0 1 0 7 7Z" />
  </svg>
)

export const TrophyIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 2.5h6v3a3 3 0 0 1-6 0v-3Z" />
    <path d="M5 3.5H3.2a2.3 2.3 0 0 0 1.9 2.4M11 3.5h1.8a2.3 2.3 0 0 1-1.9 2.4" />
    <path d="M8 8.5v2.5M5.8 13.5h4.4" />
  </svg>
)

export const CheckIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 8.4l3.1 3.1L13 4.6" />
  </svg>
)

export const CrossIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
  </svg>
)

export const ArrowRightIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" />
  </svg>
)

export const PlusIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M8 3.2v9.6M3.2 8h9.6" />
  </svg>
)

export const CalendarIcon = ({ size = 14 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
    <path d="M2.5 6.5h11M5.5 2.2v2M10.5 2.2v2" />
  </svg>
)
