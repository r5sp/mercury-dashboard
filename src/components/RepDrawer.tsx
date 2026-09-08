import { useEffect, useRef } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ActivityFeed } from './ActivityFeed'
import { Avatar, Meter, Stat, StatusPill } from './ui'
import { CloseIcon } from './icons'
import {
  count,
  money,
  moneyExact,
  monthLabel,
  percent,
  shortDate,
} from '../lib/format'
import type { ActivityEvent, Opportunity, Rep } from '../data/types'
import type { MonthPoint, RepMetrics } from '../lib/metrics'

interface MonthTooltipProps {
  active?: boolean
  label?: string | number
  payload?: { payload: MonthPoint }[]
}

function MonthTooltip({ active, label, payload }: MonthTooltipProps) {
  if (!active || !payload?.length || typeof label !== 'string') return null
  const point = payload[0].payload
  return (
    <div className="tooltip">
      <div className="tooltip__date">{monthLabel(label)}</div>
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

interface RepDrawerProps {
  metrics: RepMetrics
  monthly: MonthPoint[]
  opportunities: Opportunity[]
  activity: ActivityEvent[]
  reps: Rep[]
  now: Date
  quarterLabel: string
  rangeDays: number
  onClose: () => void
}

export function RepDrawer({
  metrics,
  monthly,
  opportunities,
  activity,
  reps,
  now,
  quarterLabel,
  rangeDays,
  onClose,
}: RepDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const { rep, quota } = metrics
  const bestMonth = monthly.reduce<MonthPoint | null>(
    (best, point) => (best === null || point.revenue > best.revenue ? point : best),
    null,
  )

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside
        className="drawer"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${rep.name} detail`}
      >
        <header className="drawer__head">
          <Avatar name={rep.name} large />
          <div className="drawer__identity">
            <h2 className="drawer__name">{rep.name}</h2>
            <p className="drawer__role">
              {rep.title} · {rep.region}
            </p>
            <StatusPill status={quota.status} />
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            ref={closeButton}
            aria-label="Close detail panel"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="drawer__body">
          <section className="section">
            <h3 className="section__title">{quarterLabel} target</h3>
            <div className="quota">
              <div className="quota__row">
                <span className="quota__value" title={moneyExact(quota.attained)}>
                  {money(quota.attained)}
                </span>
                <span className="quota__target">of {money(quota.target)}</span>
              </div>
              <Meter
                value={quota.attainment}
                status={quota.status}
                marker={quota.elapsed}
                label={`${percent(quota.attainment)} of target attained, ${percent(
                  quota.elapsed,
                )} of the quarter elapsed`}
              />
              <div className="quota__foot">
                <span>
                  <strong>{percent(quota.attainment)}</strong> attained ·{' '}
                  {percent(quota.elapsed)} of quarter elapsed
                </span>
                <span>
                  {quota.pace >= 1
                    ? `Running ${percent(quota.pace - 1)} ahead of pace`
                    : `Running ${percent(1 - quota.pace)} behind pace`}{' '}
                  · {quota.daysLeft} days left
                </span>
              </div>
            </div>
          </section>

          <section className="section">
            <h3 className="section__title">Last {rangeDays} days</h3>
            <div className="stat-grid">
              <Stat
                label="Revenue"
                value={money(metrics.revenue)}
                sub={`${count(metrics.orders)} orders closed`}
              />
              <Stat
                label="Average order value"
                value={money(metrics.averageOrderValue)}
                sub="Closed-won deals"
              />
              <Stat
                label="Conversion rate"
                value={percent(metrics.conversionRate)}
                sub={`${metrics.wonCount} won / ${metrics.lostCount} lost`}
              />
              <Stat
                label="Open pipeline"
                value={money(metrics.pipeline.value)}
                sub={`${metrics.pipeline.count} opportunities · ${money(
                  metrics.pipeline.weighted,
                )} weighted`}
              />
            </div>
          </section>

          <section className="section">
            <h3 className="section__title">Monthly performance</h3>
            <p className="card__sub" style={{ marginBottom: 8 }}>
              Closed-won revenue by month.
              {bestMonth ? ` Best month ${monthLabel(bestMonth.month)} at ${money(bestMonth.revenue)}.` : ''}
            </p>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={monthLabel}
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    stroke="var(--axis)"
                    tickLine={false}
                  />
                  <YAxis
                    width={48}
                    tickFormatter={(value: number) => money(value)}
                    tick={{ fill: 'var(--muted)', fontSize: 11 }}
                    stroke="var(--axis)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<MonthTooltip />} cursor={{ fill: 'var(--hover)' }} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--series-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="section">
            <h3 className="section__title">
              Open opportunities ({opportunities.length})
            </h3>
            {opportunities.length === 0 ? (
              <p className="card__sub">No open opportunities.</p>
            ) : (
              <ul className="opp-list">
                {opportunities.map((opp) => (
                  <li key={opp.id} className="opp">
                    <span className="opp__body">
                      <span className="opp__account">{opp.account}</span>
                      <span className="opp__meta">
                        {opp.product} · closes {shortDate(opp.expectedCloseAt)}
                      </span>
                    </span>
                    <span>
                      <span className="opp__amount" title={moneyExact(opp.amount)}>
                        {money(opp.amount)}
                      </span>
                      <br />
                      <span className="opp__stage">
                        {opp.stage} · {percent(opp.probability)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="section">
            <h3 className="section__title">Recent activity</h3>
            <div className="card" style={{ overflow: 'hidden' }}>
              <ActivityFeed
                events={activity}
                reps={reps}
                now={now}
                bare
                anonymous
                limit={12}
              />
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}
