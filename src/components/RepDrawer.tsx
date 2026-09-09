import { useEffect, useRef } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ActivityFeed } from './ActivityFeed'
import { Figure, Meter, Monogram, StatusPill } from './ui'
import { CloseIcon } from './icons'
import { count, money, moneyExact, monthLabel, percent, shortDate } from '../lib/format'
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
          <span className="legend__mark" />
          Revenue
        </span>
        <span className="tooltip__value">{moneyExact(point.revenue)}</span>
      </div>
      <div className="tooltip__row">
        <span className="tooltip__key" style={{ paddingLeft: 21 }}>
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
  const weightedShare = metrics.pipeline.value
    ? metrics.pipeline.weighted / metrics.pipeline.value
    : 0

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${rep.name} detail`}
      >
        <header className="drawer__head">
          <Monogram name={rep.name} large />
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
          <section className="panel quota">
            <div className="label panel__title">{quarterLabel} target</div>
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
                {percent(quota.attainment)} attained · {percent(quota.elapsed)} of the quarter
                elapsed
              </span>
              <span>
                {quota.pace >= 1
                  ? `Running ${percent(quota.pace - 1)} ahead of pace`
                  : `Running ${percent(1 - quota.pace)} behind pace`}{' '}
                · {quota.daysLeft} days left
              </span>
            </div>
          </section>

          <section className="panel">
            <div className="label panel__title">Last {rangeDays} days</div>
            <div className="figures">
              <Figure
                label="Revenue"
                value={money(metrics.revenue)}
                sub={`${count(metrics.orders)} orders closed`}
              />
              <Figure
                label="Average order"
                value={money(metrics.averageOrderValue)}
                sub="Closed-won deals"
              />
              <Figure
                label="Conversion"
                value={
                  metrics.wonCount + metrics.lostCount === 0
                    ? '—'
                    : percent(metrics.conversionRate)
                }
                sub={`${metrics.wonCount} won / ${metrics.lostCount} lost`}
              />
              <Figure
                label="Open pipeline"
                value={money(metrics.pipeline.value)}
                sub={`${metrics.pipeline.count} deals · ${percent(weightedShare)} weighted`}
              />
            </div>
          </section>

          <section className="panel">
            <div className="label panel__title">Monthly performance</div>
            <p className="region__sub" style={{ margin: '0 0 6px' }}>
              Closed-won revenue by month.
              {bestMonth
                ? ` Best month ${monthLabel(bestMonth.month)} at ${money(bestMonth.revenue)}.`
                : ''}
            </p>
            <div className="mini-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={monthLabel}
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                    stroke="var(--rule-strong)"
                    tickLine={false}
                  />
                  <YAxis
                    width={48}
                    tickFormatter={(value: number) => money(value)}
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                    stroke="var(--rule-strong)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<MonthTooltip />} cursor={{ fill: 'var(--hover)' }} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--data)"
                    maxBarSize={22}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel">
            <div className="label panel__title">Open opportunities ({opportunities.length})</div>
            {opportunities.length === 0 ? (
              <p className="region__sub" style={{ margin: 0 }}>
                No open opportunities.
              </p>
            ) : (
              <ul className="opps">
                {opportunities.map((opp) => (
                  <li key={opp.id} className="opp">
                    <span className="opp__body">
                      <span className="opp__account">{opp.account}</span>
                      <span className="opp__meta">
                        {opp.product} · closes {shortDate(opp.expectedCloseAt)}
                      </span>
                    </span>
                    <span className="opp__right">
                      <span className="opp__amount" title={moneyExact(opp.amount)}>
                        {money(opp.amount)}
                      </span>
                      <span className="opp__stage">
                        {opp.stage} · {percent(opp.probability)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel" style={{ padding: '16px 0 0' }}>
            <div className="label panel__title" style={{ padding: '0 20px' }}>
              Recent activity
            </div>
            <ActivityFeed events={activity} reps={reps} now={now} bare anonymous limit={12} />
          </section>
        </div>
      </aside>
    </>
  )
}
