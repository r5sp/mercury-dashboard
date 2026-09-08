import type { ReactNode } from 'react'
import { STATUS_LABEL } from '../lib/metrics'
import type { RepStatus } from '../data/types'
import { initials, signedPercent } from '../lib/format'

interface SegmentedProps<T extends string | number> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className="segmented__option"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Status is never colour alone: a dot plus its written label, always. */
export const StatusPill = ({ status }: { status: RepStatus }) => (
  <span className={`status status--${status}`}>
    <span className="status__dot" />
    {STATUS_LABEL[status]}
  </span>
)

/**
 * A percentage past about +150% stops being readable, so a big jump switches to
 * a multiple ("3.4x") - the form a sales team already uses for that size of move.
 */
export function Delta({ change, suffix }: { change: number | null; suffix?: string }) {
  if (change === null) return <span className="delta delta--flat">New</span>
  const direction = Math.abs(change) < 0.001 ? 'flat' : change > 0 ? 'up' : 'down'
  const glyph = direction === 'up' ? '\u25b2' : direction === 'down' ? '\u25bc' : '\u25a0'
  const text = change >= 1.5 ? `${(1 + change).toFixed(1)}\u00d7` : signedPercent(change)
  return (
    <span className={`delta delta--${direction}`}>
      <span aria-hidden>{glyph}</span>
      {text}
      {suffix ? <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{suffix}</span> : null}
    </span>
  )
}

export const Avatar = ({ name, large }: { name: string; large?: boolean }) => (
  <span className={large ? 'avatar avatar--lg' : 'avatar'} aria-hidden>
    {initials(name)}
  </span>
)

interface MeterProps {
  /** 0-1+, clamped for display. */
  value: number
  status?: RepStatus
  /** Optional tick marking where pace should be, e.g. quarter elapsed. */
  marker?: number
  label: string
}

export const Meter = ({ value, status, marker, label }: MeterProps) => (
  <div
    className="meter"
    role="img"
    aria-label={label}
    title={label}
  >
    <div
      className={status ? `meter__fill meter__fill--${status}` : 'meter__fill'}
      style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
    />
    {marker === undefined ? null : (
      <span className="meter__pace" style={{ left: `${Math.min(99, marker * 100)}%` }} />
    )}
  </div>
)

/** A single-series trend hint. Decorative: every value is in the table too. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return <span className="cell-stack__sub">—</span>
  const width = 84
  const height = 26
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = width / (values.length - 1)
  const points = values.map((v, i) => [i * step, height - ((v - min) / span) * (height - 4) - 2])
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path d={path} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="var(--series-1)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  )
}

export const Stat = ({
  label,
  value,
  sub,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
}) => (
  <div className="stat">
    <div className="stat__label">{label}</div>
    <div className="stat__value">{value}</div>
    {sub ? <div className="stat__sub">{sub}</div> : null}
  </div>
)
