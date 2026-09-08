import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Segmented } from './ui'
import { count, longDate, money, moneyExact, shortDate } from '../lib/format'
import type { RangeKey } from '../data/types'
import type { RevenuePoint } from '../lib/metrics'

export type Measure = 'revenue' | 'orders'

interface TooltipPayload {
  active?: boolean
  label?: string | number
  payload?: { payload: RevenuePoint }[]
}

function ChartTooltip({ active, label, payload }: TooltipPayload) {
  if (!active || !payload?.length || typeof label !== 'string') return null
  const point = payload[0].payload
  return (
    <div className="tooltip">
      <div className="tooltip__date">{longDate(label)}</div>
      <div className="tooltip__row">
        <span className="tooltip__key">
          <span className="tooltip__swatch" />
          Revenue
        </span>
        <span className="tooltip__value">{moneyExact(point.revenue)}</span>
      </div>
      <div className="tooltip__row">
        <span className="tooltip__key" style={{ paddingLeft: 14 }}>
          Orders
        </span>
        <span className="tooltip__value">{count(point.orders)}</span>
      </div>
    </div>
  )
}

interface RevenueChartProps {
  points: RevenuePoint[]
  measure: Measure
  onMeasureChange: (measure: Measure) => void
  range: RangeKey
}

export function RevenueChart({ points, measure, onMeasureChange, range }: RevenueChartProps) {
  const { best, average } = useMemo(() => {
    if (points.length === 0) return { best: null, average: 0 }
    const top = points.reduce((a, b) => (b.revenue > a.revenue ? b : a))
    const total = points.reduce((sum, p) => sum + p.revenue, 0)
    return { best: top, average: total / points.length }
  }, [points])

  const tickGap = range === 7 ? 8 : range === 30 ? 28 : 48
  const isRevenue = measure === 'revenue'

  return (
    <section className="card chart-card" aria-label="Revenue over time">
      <div className="card__head">
        <div>
          <h2 className="card__title">
            {isRevenue ? 'Revenue' : 'Orders closed'} · last {range} days
          </h2>
          <p className="card__sub">Closed-won, by day the deal was signed</p>
        </div>
        <div className="card__tools">
          <Segmented
            label="Measure"
            value={measure}
            onChange={onMeasureChange}
            options={[
              { value: 'revenue', label: 'Revenue' },
              { value: 'orders', label: 'Orders' },
            ]}
          />
        </div>
      </div>

      <div className="chart-card__figures">
        <div>
          <div className="chart-figure__label">Daily average</div>
          <div className="chart-figure__value">
            {isRevenue
              ? money(average)
              : (points.reduce((s, p) => s + p.orders, 0) / Math.max(points.length, 1)).toFixed(1)}
          </div>
        </div>
        <div>
          <div className="chart-figure__label">Best day</div>
          <div className="chart-figure__value">
            {best ? `${money(best.revenue)} · ${shortDate(best.date)}` : '—'}
          </div>
        </div>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 6, right: 14, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="var(--grid)" strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              minTickGap={tickGap}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              stroke="var(--axis)"
              tickLine={false}
            />
            <YAxis
              width={54}
              tickFormatter={(value: number) => (isRevenue ? money(value) : String(value))}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              stroke="var(--axis)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey={measure}
              stroke="var(--series-1)"
              strokeWidth={2}
              strokeLinejoin="round"
              fill="var(--series-1-wash)"
              activeDot={{
                r: 4,
                fill: 'var(--series-1)',
                stroke: 'var(--surface)',
                strokeWidth: 2,
              }}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
