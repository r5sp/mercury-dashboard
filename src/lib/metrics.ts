import type {
  ActivityEvent,
  Dataset,
  LostDeal,
  Opportunity,
  Order,
  RangeKey,
  Rep,
  RepStatus,
} from '../data/types'

const DAY_MS = 86400000

export const dayKey = (isoTimestamp: string): string => isoTimestamp.slice(0, 10)
export const monthKey = (isoTimestamp: string): string => isoTimestamp.slice(0, 7)

const addDays = (isoDate: string, days: number): string =>
  new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10)

export interface Window {
  start: string
  end: string
  days: number
}

/** The `days` calendar days ending on `end`, inclusive of both ends. */
export function window(end: string, days: RangeKey | number): Window {
  return { start: addDays(end, -(days - 1)), end, days }
}

/** The equally long window immediately before `w` - the delta baseline. */
export function previousWindow(w: Window): Window {
  const end = addDays(w.start, -1)
  return { start: addDays(end, -(w.days - 1)), end, days: w.days }
}

const inWindow = (isoTimestamp: string, w: Window): boolean => {
  const d = dayKey(isoTimestamp)
  return d >= w.start && d <= w.end
}

export const ordersIn = (orders: Order[], w: Window): Order[] =>
  orders.filter((o) => inWindow(o.closedAt, w))

export const lostIn = (lost: LostDeal[], w: Window): LostDeal[] =>
  lost.filter((l) => inWindow(l.lostAt, w))

export interface Totals {
  revenue: number
  orders: number
  averageOrderValue: number
}

export function totals(orders: Order[]): Totals {
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0)
  return {
    revenue,
    orders: orders.length,
    averageOrderValue: orders.length ? revenue / orders.length : 0,
  }
}

export interface Pipeline {
  value: number
  weighted: number
  count: number
}

export function pipeline(opportunities: Opportunity[]): Pipeline {
  return {
    value: opportunities.reduce((sum, o) => sum + o.amount, 0),
    weighted: opportunities.reduce((sum, o) => sum + o.amount * o.probability, 0),
    count: opportunities.length,
  }
}

/**
 * Relative change from `before` to `after`. Null when there is no baseline to
 * divide by, so the UI can omit the delta instead of printing a fake infinity.
 */
export function change(after: number, before: number): number | null {
  if (before === 0) return null
  return (after - before) / before
}

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

/** One point per day across the whole window - zero-filled, so gaps stay visible. */
export function revenueSeries(orders: Order[], w: Window): RevenuePoint[] {
  const buckets = new Map<string, RevenuePoint>()
  for (let i = 0; i < w.days; i++) {
    const date = addDays(w.start, i)
    buckets.set(date, { date, revenue: 0, orders: 0 })
  }
  for (const order of orders) {
    const bucket = buckets.get(dayKey(order.closedAt))
    if (!bucket) continue
    bucket.revenue += order.amount
    bucket.orders += 1
  }
  return [...buckets.values()]
}

export interface ComparedPoint extends RevenuePoint {
  /** The same day-offset in the preceding window, for the ghost comparison line. */
  previousRevenue: number
  previousOrders: number
  previousDate: string
}

/**
 * Aligns the window with the one before it by position, not by date, so day one
 * of each sits at the same x. That is what makes the comparison readable.
 */
export function comparedSeries(
  orders: Order[],
  current: Window,
  previous: Window,
): ComparedPoint[] {
  const now = revenueSeries(ordersIn(orders, current), current)
  const before = revenueSeries(ordersIn(orders, previous), previous)
  return now.map((point, index) => ({
    ...point,
    previousRevenue: before[index]?.revenue ?? 0,
    previousOrders: before[index]?.orders ?? 0,
    previousDate: before[index]?.date ?? '',
  }))
}

export interface MonthPoint {
  month: string
  revenue: number
  orders: number
}

/** Trailing `months` calendar months ending in the month of `end`. */
export function monthlySeries(orders: Order[], end: string, months: number): MonthPoint[] {
  const endDate = new Date(`${end}T00:00:00Z`)
  const keys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() - i, 1))
    keys.push(d.toISOString().slice(0, 7))
  }
  const buckets = new Map(keys.map((month) => [month, { month, revenue: 0, orders: 0 }]))
  for (const order of orders) {
    const bucket = buckets.get(monthKey(order.closedAt))
    if (!bucket) continue
    bucket.revenue += order.amount
    bucket.orders += 1
  }
  return [...buckets.values()]
}

/** Evenly spaced buckets for a row sparkline - 12 points regardless of range. */
export function sparkline(points: RevenuePoint[], buckets = 12): number[] {
  if (points.length === 0) return []
  const size = points.length / buckets
  const out: number[] = []
  for (let i = 0; i < buckets; i++) {
    const from = Math.floor(i * size)
    const to = Math.max(from + 1, Math.floor((i + 1) * size))
    let sum = 0
    for (let j = from; j < to && j < points.length; j++) sum += points[j].revenue
    out.push(sum)
  }
  return out
}

export interface QuotaProgress {
  target: number
  attained: number
  attainment: number
  /** Attainment divided by the share of the quarter already elapsed. */
  pace: number
  elapsed: number
  daysLeft: number
  status: RepStatus
}

export function quotaProgress(
  rep: Rep,
  orders: Order[],
  quarter: { startsAt: string; endsAt: string },
  asOf: string,
): QuotaProgress {
  const start = new Date(`${quarter.startsAt}T00:00:00Z`).getTime()
  const end = new Date(`${quarter.endsAt}T00:00:00Z`).getTime()
  const now = new Date(`${asOf}T00:00:00Z`).getTime()
  const total = (end - start) / DAY_MS + 1
  const done = Math.min(Math.max((now - start) / DAY_MS + 1, 1), total)
  const elapsed = done / total

  const attained = orders
    .filter(
      (o) =>
        o.repId === rep.id &&
        o.closedAt >= quarter.startsAt &&
        o.closedAt <= quarter.endsAt,
    )
    .reduce((sum, o) => sum + o.amount, 0)

  const attainment = rep.quarterTarget ? attained / rep.quarterTarget : 0
  const pace = elapsed > 0 ? attainment / elapsed : 0
  const status: RepStatus = pace >= 1.05 ? 'ahead' : pace >= 0.9 ? 'on_track' : 'at_risk'

  return {
    target: rep.quarterTarget,
    attained,
    attainment,
    pace,
    elapsed,
    daysLeft: Math.max(0, Math.round(total - done)),
    status,
  }
}

export interface RepMetrics {
  rep: Rep
  revenue: number
  revenueChange: number | null
  orders: number
  averageOrderValue: number
  conversionRate: number
  wonCount: number
  lostCount: number
  pipeline: Pipeline
  spark: number[]
  quota: QuotaProgress
}

export interface RepMetricsInput {
  data: Dataset
  current: Window
  previous: Window
}

/** Everything the roster table and the detail panel need, computed per rep. */
export function repMetrics({ data, current, previous }: RepMetricsInput): RepMetrics[] {
  const currentOrders = ordersIn(data.orders, current)
  const previousOrders = ordersIn(data.orders, previous)
  const currentLost = lostIn(data.lostDeals, current)

  return data.reps.map((rep) => {
    const mine = currentOrders.filter((o) => o.repId === rep.id)
    const mineBefore = previousOrders.filter((o) => o.repId === rep.id)
    const wonCount = mine.length
    const lostCount = currentLost.filter((l) => l.repId === rep.id).length
    const revenue = mine.reduce((sum, o) => sum + o.amount, 0)
    const decided = wonCount + lostCount

    return {
      rep,
      revenue,
      revenueChange: change(revenue, mineBefore.reduce((sum, o) => sum + o.amount, 0)),
      orders: wonCount,
      averageOrderValue: wonCount ? revenue / wonCount : 0,
      conversionRate: decided ? wonCount / decided : 0,
      wonCount,
      lostCount,
      pipeline: pipeline(data.opportunities.filter((o) => o.repId === rep.id)),
      spark: sparkline(revenueSeries(mine, current)),
      quota: quotaProgress(rep, data.orders, data.meta.quarter, data.meta.generatedAt),
    }
  })
}

export const STATUS_LABEL: Record<RepStatus, string> = {
  ahead: 'Ahead',
  on_track: 'On track',
  at_risk: 'At risk',
}

export type SortKey =
  | 'name'
  | 'revenue'
  | 'orders'
  | 'conversionRate'
  | 'pipeline'
  | 'attainment'

export const SORT_LABEL: Record<SortKey, string> = {
  name: 'Name',
  revenue: 'Revenue',
  orders: 'Orders',
  conversionRate: 'Conversion',
  pipeline: 'Pipeline',
  attainment: 'Quota attainment',
}

const sortValue = (m: RepMetrics, key: SortKey): number | string => {
  switch (key) {
    case 'name':
      return m.rep.name
    case 'revenue':
      return m.revenue
    case 'orders':
      return m.orders
    case 'conversionRate':
      return m.conversionRate
    case 'pipeline':
      return m.pipeline.value
    case 'attainment':
      return m.quota.attainment
  }
}

export function sortReps(
  rows: RepMetrics[],
  key: SortKey,
  direction: 'asc' | 'desc',
): RepMetrics[] {
  const factor = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const x = sortValue(a, key)
    const y = sortValue(b, key)
    if (typeof x === 'string' || typeof y === 'string') {
      return String(x).localeCompare(String(y)) * factor
    }
    if (x === y) return a.rep.name.localeCompare(b.rep.name)
    return (x - y) * factor
  })
}

export const activityForRep = (activity: ActivityEvent[], repId: string): ActivityEvent[] =>
  activity.filter((event) => event.repId === repId)

export const opportunitiesForRep = (
  opportunities: Opportunity[],
  repId: string,
): Opportunity[] =>
  opportunities
    .filter((o) => o.repId === repId)
    .sort((a, b) => b.amount - a.amount)
