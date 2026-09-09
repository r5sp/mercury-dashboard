import type { ReactNode } from 'react'
import { Delta } from './ui'
import { count, money, moneyExact } from '../lib/format'
import type { Pipeline, Totals } from '../lib/metrics'

interface CellProps {
  label: string
  value: string
  title?: string
  change?: number | null
  foot: ReactNode
}

const Cell = ({ label, value, title, change, foot }: CellProps) => (
  <div className="band__cell">
    <div className="label">{label}</div>
    <div className="band__value" title={title}>
      {value}
    </div>
    <div className="band__foot">
      {change === undefined ? null : <Delta change={change} />}
      <span>{foot}</span>
    </div>
  </div>
)

interface SummaryBandProps {
  current: Totals
  previous: Totals
  pipeline: Pipeline
  rangeDays: number
}

/**
 * Four figures in one divided band rather than four floating cards - the band is
 * the page's masthead, and hairlines do the separating.
 */
export function SummaryBand({ current, previous, pipeline, rangeDays }: SummaryBandProps) {
  const delta = (after: number, before: number) => (before === 0 ? null : (after - before) / before)
  const prior = `prior ${rangeDays}d`

  return (
    <section className="band" aria-label="Headline figures">
      <Cell
        label="Revenue"
        value={money(current.revenue)}
        title={moneyExact(current.revenue)}
        change={delta(current.revenue, previous.revenue)}
        foot={prior}
      />
      <Cell
        label="Orders closed"
        value={count(current.orders)}
        change={delta(current.orders, previous.orders)}
        foot={prior}
      />
      <Cell
        label="Average order value"
        value={money(current.averageOrderValue)}
        title={moneyExact(current.averageOrderValue)}
        change={delta(current.averageOrderValue, previous.averageOrderValue)}
        foot={prior}
      />
      <Cell
        label="Open pipeline"
        value={money(pipeline.value)}
        title={moneyExact(pipeline.value)}
        foot={`${count(pipeline.count)} open · ${money(pipeline.weighted)} weighted`}
      />
    </section>
  )
}
