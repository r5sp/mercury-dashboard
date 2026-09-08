import type { ReactNode } from 'react'
import { Delta } from './ui'
import { count, money, moneyExact } from '../lib/format'
import type { Pipeline, Totals } from '../lib/metrics'

interface KpiProps {
  label: string
  value: string
  title?: string
  change?: number | null
  foot: ReactNode
}

const Kpi = ({ label, value, title, change, foot }: KpiProps) => (
  <div className="card kpi">
    <div className="kpi__label">{label}</div>
    <div className="kpi__value" title={title}>
      {value}
    </div>
    <div className="kpi__foot">
      {change === undefined ? null : <Delta change={change} />}
      <span>{foot}</span>
    </div>
  </div>
)

interface KpiRowProps {
  current: Totals
  previous: Totals
  pipeline: Pipeline
  rangeDays: number
}

export function KpiRow({ current, previous, pipeline, rangeDays }: KpiRowProps) {
  const delta = (after: number, before: number) => (before === 0 ? null : (after - before) / before)
  const priorLabel = `vs prior ${rangeDays} days`

  return (
    <section className="kpis" aria-label="Headline figures">
      <Kpi
        label="Total revenue"
        value={money(current.revenue)}
        title={moneyExact(current.revenue)}
        change={delta(current.revenue, previous.revenue)}
        foot={priorLabel}
      />
      <Kpi
        label="Orders closed"
        value={count(current.orders)}
        change={delta(current.orders, previous.orders)}
        foot={priorLabel}
      />
      <Kpi
        label="Average order value"
        value={money(current.averageOrderValue)}
        title={moneyExact(current.averageOrderValue)}
        change={delta(current.averageOrderValue, previous.averageOrderValue)}
        foot={priorLabel}
      />
      <Kpi
        label="Open pipeline"
        value={money(pipeline.value)}
        title={moneyExact(pipeline.value)}
        foot={`${count(pipeline.count)} open · ${money(pipeline.weighted)} weighted`}
      />
    </section>
  )
}
