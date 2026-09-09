import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { count, longDate, money, moneyExact, shortDate } from '../lib/format'
import type { RangeKey } from '../data/types'
import type { ComparedPoint } from '../lib/metrics'

export type Measure = 'revenue' | 'orders'

interface TooltipProps {
  active?: boolean
  label?: string | number
  payload?: { payload: ComparedPoint }[]
  measure: Measure
}

function ChartTooltip({ active, label, payload, measure }: TooltipProps) {
  if (!active || !payload?.length || typeof label !== 'string') return null
  const point = payload[0].payload
  const now = measure === 'revenue' ? point.revenue : point.orders
  const before = measure === 'revenue' ? point.previousRevenue : point.previousOrders
  const format = (value: number) => (measure === 'revenue' ? moneyExact(value) : count(value))
  const change = before === 0 ? null : (now - before) / before

  return (
    <div className="tooltip">
      <div className="tooltip__date">{longDate(label)}</div>
      <div className="tooltip__row">
        <span className="tooltip__key">
          <span className="legend__mark" />
          This period
        </span>
        <span className="tooltip__value">{format(now)}</span>
      </div>
      <div className="tooltip__row">
        <span className="tooltip__key">
          <span className="legend__mark legend__mark--ghost" />
          {point.previousDate ? shortDate(point.previousDate) : 'Prior period'}
        </span>
        <span className="tooltip__value">{format(before)}</span>
      </div>
      {change === null ? null : (
        <div className="tooltip__row">
          <span className="tooltip__key" style={{ paddingLeft: 21 }}>
            Change
          </span>
          <span
            className="tooltip__value"
            style={{ color: change >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {change >= 0 ? '+' : '−'}
            {Math.abs(change * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

interface RevenueChartProps {
  points: ComparedPoint[]
  measure: Measure
  onMeasureChange: (measure: Measure) => void
  range: RangeKey
}

/**
 * The plotted series is data ink; the prior period is a muted hairline behind it.
 * Colour is not used to distinguish them - weight and value are.
 */
export function RevenueChart({ points, measure, onMeasureChange, range }: RevenueChartProps) {
  const isRevenue = measure === 'revenue'

  const stats = useMemo(() => {
    if (points.length === 0) return null
    const total = points.reduce((sum, p) => sum + p.revenue, 0)
    const orders = points.reduce((sum, p) => sum + p.orders, 0)
    const best = points.reduce((a, b) => (b.revenue > a.revenue ? b : a))
    const quiet = points.filter((p) => p.orders === 0).length
    return { total, orders, best, quiet, average: total / points.length }
  }, [points])

  const previousKey = isRevenue ? 'previousRevenue' : 'previousOrders'

  return (
    <section className="region" id="overview" aria-label="Revenue over time">
      <div className="region__head">
        <div>
          <h2 className="region__title">
            {isRevenue ? 'Revenue' : 'Orders closed'}, last {range} days
          </h2>
          <p className="region__sub">
            Closed-won, by the day the deal was signed, against the {range} days before it.
          </p>
        </div>
        <div className="region__tools">
          <div className="toggle" role="group" aria-label="Measure">
            {(['revenue', 'orders'] as Measure[]).map((option) => (
              <button
                key={option}
                type="button"
                className="toggle__option"
                aria-pressed={measure === option}
                onClick={() => onMeasureChange(option)}
              >
                {option === 'revenue' ? 'Revenue' : 'Orders'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-stats">
        <div className="chart-stat">
          <div className="label">Daily average</div>
          <div className="chart-stat__value">
            {isRevenue && stats
              ? money(stats.average)
              : stats
                ? (stats.orders / points.length).toFixed(1)
                : '—'}
          </div>
        </div>
        <div className="chart-stat">
          <div className="label">Best day</div>
          <div className="chart-stat__value">
            {stats ? `${money(stats.best.revenue)}` : '—'}
            <span className="cell-sub"> {stats ? shortDate(stats.best.date) : ''}</span>
          </div>
        </div>
        <div className="chart-stat">
          <div className="label">Days with no close</div>
          <div className="chart-stat__value">{stats ? stats.quiet : '—'}</div>
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="var(--grid)" strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              minTickGap={range === 7 ? 8 : range === 30 ? 30 : 52}
              tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              stroke="var(--rule-strong)"
              tickLine={false}
            />
            <YAxis
              width={56}
              tickFormatter={(value: number) => (isRevenue ? money(value) : String(value))}
              tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              stroke="var(--rule-strong)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ChartTooltip measure={measure} />}
              cursor={{ stroke: 'var(--rule-strong)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey={previousKey}
              stroke="var(--data-ghost)"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey={measure}
              stroke="var(--data)"
              strokeWidth={1.75}
              fill="var(--data-wash)"
              activeDot={{ r: 3.5, fill: 'var(--data)', stroke: 'var(--surface)', strokeWidth: 2 }}
              dot={
                range === 7
                  ? { r: 3, fill: 'var(--data)', stroke: 'var(--surface)', strokeWidth: 1.5 }
                  : false
              }
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="legend">
        <span className="legend__key">
          <span className="legend__mark" />
          Last {range} days
        </span>
        <span className="legend__key">
          <span className="legend__mark legend__mark--ghost" />
          Prior {range} days
        </span>
      </div>
    </section>
  )
}
