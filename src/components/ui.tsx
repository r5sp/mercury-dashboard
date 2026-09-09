import type { ReactNode } from 'react'
import { STATUS_LABEL } from '../lib/metrics'
import type { RepStatus } from '../data/types'
import { initials, signedPercent } from '../lib/format'

/** Status is never colour alone: a dot always sits beside its written label. */
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
export function Delta({ change }: { change: number | null }) {
  if (change === null) return <span className="delta delta--flat">new</span>
  const direction = Math.abs(change) < 0.001 ? 'flat' : change > 0 ? 'up' : 'down'
  const text = change >= 1.5 ? `${(1 + change).toFixed(1)}×` : signedPercent(change)
  const glyph = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '–'
  return (
    <span className={`delta delta--${direction}`}>
      {glyph}
      {text}
    </span>
  )
}

export const Monogram = ({ name, large }: { name: string; large?: boolean }) => (
  <span className={large ? 'monogram monogram--lg' : 'monogram'} aria-hidden>
    {initials(name)}
  </span>
)

interface MeterProps {
  /** 0-1+, clamped for display. */
  value: number
  status?: RepStatus
  /** Tick marking where pace should be - the share of the quarter elapsed. */
  marker?: number
  label: string
}

export const Meter = ({ value, status, marker, label }: MeterProps) => (
  <div className="meter" role="img" aria-label={label} title={label}>
    <div
      className={status ? `meter__fill meter__fill--${status}` : 'meter__fill'}
      style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
    />
    {marker === undefined ? null : (
      <span className="meter__pace" style={{ left: `${Math.min(99.5, marker * 100)}%` }} />
    )}
  </div>
)

/** A trend hint in data ink. Every value it draws is also in the table. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return <span className="cell-sub">&ndash;</span>
  const width = 72
  const height = 20
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = width / (values.length - 1)
  const points = values.map((v, i) => [i * step, height - ((v - min) / span) * (height - 3) - 1.5])
  const path = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const last = points[points.length - 1]
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path d={path} fill="none" stroke="var(--data)" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill="var(--data)" />
    </svg>
  )
}

export const Figure = ({
  label,
  value,
  sub,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
}) => (
  <div className="figure">
    <div className="label">{label}</div>
    <div className="figure__value">{value}</div>
    {sub ? <div className="figure__sub">{sub}</div> : null}
  </div>
)
