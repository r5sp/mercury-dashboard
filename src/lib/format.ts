const compact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const exact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const plain = new Intl.NumberFormat('en-US')

/** $1.2M / $84.5K - for headline figures and axis ticks. */
export const money = (n: number): string => compact.format(n)

/** $1,248,300 - for tooltips and detail rows, where precision matters. */
export const moneyExact = (n: number): string => exact.format(n)

export const count = (n: number): string => plain.format(n)

export const percent = (fraction: number, digits = 0): string =>
  `${(fraction * 100).toFixed(digits)}%`

export const signedPercent = (fraction: number): string =>
  `${fraction >= 0 ? '+' : '−'}${Math.abs(fraction * 100).toFixed(1)}%`

const monthDay = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const monthOnly = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})

const fullDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export const shortDate = (isoDate: string): string =>
  monthDay.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`))

/** "Sep '26" - short enough for a six-bar axis, unambiguous about the year. */
export const monthLabel = (isoMonth: string): string => {
  const date = new Date(`${isoMonth}-01T00:00:00Z`)
  return `${monthOnly.format(date)} '${String(date.getUTCFullYear()).slice(2)}`
}

export const longDate = (isoDate: string): string =>
  fullDate.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`))

/** "3h ago", "Yesterday", "Aug 21" - relative near the present, absolute past a week. */
export function relativeTime(isoTimestamp: string, now: Date): string {
  const then = new Date(isoTimestamp)
  const minutes = Math.round((now.getTime() - then.getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return shortDate(isoTimestamp)
}

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
