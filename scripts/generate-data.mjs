/**
 * Generates the fictional dataset that ships with Mercury.
 *
 * Deterministic: a fixed seed means `npm run generate:data` reproduces
 * src/data/mercury.json byte for byte. Rerun it to move the window forward.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../src/data/mercury.json')

/** mulberry32 - small, fast, seeded PRNG. */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SEED = Number(process.env.MERCURY_SEED ?? 20260929)
const rand = rng(SEED)
const pick = (list) => list[Math.floor(rand() * list.length)]
const between = (lo, hi) => lo + rand() * (hi - lo)
const intBetween = (lo, hi) => Math.floor(between(lo, hi + 1))
const round = (n, to) => Math.round(n / to) * to
const DAY_MS = 86400000

// The dataset ends "today" so the dashboard always looks current.
const TODAY = new Date('2026-09-08T00:00:00Z')
const DAYS = 245
const iso = (d) => d.toISOString().slice(0, 10)
const dayOffset = (n) => new Date(TODAY.getTime() - n * 86400000)

const REGIONS = ['West', 'Northeast', 'Midwest', 'South', 'EMEA']

/**
 * `strength` scales revenue per rep, `momentum` tilts recent days up or down.
 * Together they spread reps across ahead / on track / at risk without the
 * status ever being hard-coded - App derives it from the numbers.
 */
const REPS = [
  { id: 'r-01', name: 'Priya Raghunathan', title: 'Enterprise AE', region: 'West',      strength: 1.34, momentum:  0.30, pace: 1.38 },
  { id: 'r-02', name: 'Marcus Okonkwo',    title: 'Enterprise AE', region: 'Northeast', strength: 1.18, momentum:  0.16, pace: 1.33 },
  { id: 'r-03', name: 'Dana Whitfield',    title: 'Senior AE',     region: 'Midwest',   strength: 1.02, momentum:  0.05, pace: 1.02 },
  { id: 'r-04', name: 'Tobias Lindqvist',  title: 'Enterprise AE', region: 'EMEA',      strength: 1.09, momentum: -0.02, pace: 0.97 },
  { id: 'r-05', name: 'Renata Alvarez',    title: 'Senior AE',     region: 'South',     strength: 0.96, momentum:  0.22, pace: 1.14 },
  { id: 'r-06', name: 'Kenji Watanabe',    title: 'Senior AE',     region: 'West',      strength: 0.91, momentum: -0.18, pace: 0.84 },
  { id: 'r-07', name: 'Amara Diallo',      title: 'Mid-Market AE', region: 'EMEA',      strength: 0.84, momentum:  0.11, pace: 1.06 },
  { id: 'r-08', name: 'Colin Brady',       title: 'Mid-Market AE', region: 'Northeast', strength: 0.72, momentum: -0.26, pace: 0.72 },
  { id: 'r-09', name: 'Sofia Marchetti',   title: 'Mid-Market AE', region: 'Midwest',   strength: 0.78, momentum:  0.04, pace: 0.94 },
  { id: 'r-10', name: 'Devon Ashcroft',    title: 'Commercial AE', region: 'South',     strength: 0.64, momentum: -0.34, pace: 0.63 },
]

const ACCOUNTS = [
  'Northwind Logistics', 'Halcyon Health', 'Brightline Energy', 'Cobalt Freight',
  'Verdant Agritech', 'Lumen Retail Group', 'Sable Financial', 'Ironwood Manufacturing',
  'Aperture Biosciences', 'Kestrel Aerospace', 'Tidewater Utilities', 'Marlowe Hotels',
  'Sundial Media', 'Granite Insurance', 'Blue Harbor Shipping', 'Orchid Pharmaceuticals',
  'Foundry Robotics', 'Pinecrest Education', 'Solstice Apparel', 'Meridian Telecom',
  'Cadence Payments', 'Junipero Foods', 'Atlas Mining Co.', 'Riverbend Municipal',
  'Onyx Data Centers', 'Fairweather Airlines', 'Silverpine Timber', 'Beacon Credit Union',
  'Quarry Lane Legal', 'Thornfield Estates',
]

const PRODUCTS = [
  'Mercury Platform', 'Mercury Platform + Analytics', 'Fleet Telemetry Suite',
  'Compliance Module', 'Onboarding & Migration', 'Premium Support',
  'API Volume Tier', 'Workforce Add-on',
]

const STAGES = [
  { name: 'Discovery', probability: 0.15 },
  { name: 'Qualification', probability: 0.3 },
  { name: 'Proposal', probability: 0.5 },
  { name: 'Negotiation', probability: 0.7 },
  { name: 'Contracting', probability: 0.85 },
]

const SEGMENT_BY_TITLE = {
  'Enterprise AE': { lo: 42_000, hi: 320_000, rate: 0.55 },
  'Senior AE': { lo: 26_000, hi: 190_000, rate: 0.7 },
  'Mid-Market AE': { lo: 14_000, hi: 96_000, rate: 0.95 },
  'Commercial AE': { lo: 7_000, hi: 48_000, rate: 1.2 },
}

/** Weekday-heavy, quarter-end-heavy, gently growing deal flow. */
function dayWeight(offset, rep) {
  const date = dayOffset(offset)
  const weekday = date.getUTCDay()
  let w = weekday === 0 ? 0.12 : weekday === 6 ? 0.2 : 1
  // Sales reps land deals at month end.
  const dom = date.getUTCDate()
  if (dom >= 27) w *= 1.32
  else if (dom <= 3) w *= 0.88
  // Recent days weighted by the rep's momentum; older days flat.
  const recency = 1 - offset / DAYS
  w *= 1 + rep.momentum * recency
  // Whole-business seasonal drift upward.
  w *= 0.64 + 0.70 * recency
  return Math.max(w, 0.05)
}

const orders = []
const lostDeals = []
let orderSeq = 1000
let lostSeq = 5000

for (const rep of REPS) {
  const seg = SEGMENT_BY_TITLE[rep.title]
  for (let offset = DAYS - 1; offset >= 0; offset--) {
    const expected = 0.5 * seg.rate * rep.strength * dayWeight(offset, rep)
    let count = Math.floor(expected)
    if (rand() < expected - count) count += 1
    for (let i = 0; i < count; i++) {
      const skew = Math.pow(rand(), 2.1) // most deals small, a few very large
      const amount = round(seg.lo + skew * (seg.hi - seg.lo), 250)
      orders.push({
        id: `ORD-${orderSeq++}`,
        repId: rep.id,
        account: pick(ACCOUNTS),
        product: pick(PRODUCTS),
        amount,
        closedAt: iso(dayOffset(offset)),
      })
    }
    // Lost deals drive the conversion rate. Weaker reps lose more.
    const lossExpected = expected * between(1.15, 2.6) / Math.max(rep.strength, 0.5)
    let lossCount = Math.floor(lossExpected)
    if (rand() < lossExpected - lossCount) lossCount += 1
    for (let i = 0; i < lossCount; i++) {
      const skew = Math.pow(rand(), 2.1)
      lostDeals.push({
        id: `LST-${lostSeq++}`,
        repId: rep.id,
        account: pick(ACCOUNTS),
        amount: round(seg.lo + skew * (seg.hi - seg.lo), 250),
        lostAt: iso(dayOffset(offset)),
        reason: pick(['Budget frozen', 'Lost to incumbent', 'No decision', 'Timing slipped', 'Lost on price']),
      })
    }
  }
}

orders.sort((a, b) => (a.closedAt < b.closedAt ? -1 : a.closedAt > b.closedAt ? 1 : 0))

/**
 * Quotas are derived, not invented: each target is back-solved from the rep's
 * realized quarter-to-date revenue and the pace we want that rep to be running
 * at. The dashboard then computes attainment forward from the same orders, so
 * the badge, the bar and the revenue column can never disagree.
 */
const QUARTER = { startsAt: '2026-07-01', endsAt: '2026-09-30' }
const quarterDays =
  (new Date(`${QUARTER.endsAt}T00:00:00Z`) - new Date(`${QUARTER.startsAt}T00:00:00Z`)) / DAY_MS + 1
const quarterElapsed =
  ((TODAY - new Date(`${QUARTER.startsAt}T00:00:00Z`)) / DAY_MS + 1) / quarterDays

const targetById = new Map()
for (const rep of REPS) {
  const attained = orders
    .filter((o) => o.repId === rep.id && o.closedAt >= QUARTER.startsAt && o.closedAt <= QUARTER.endsAt)
    .reduce((sum, o) => sum + o.amount, 0)
  targetById.set(rep.id, round(attained / (quarterElapsed * rep.pace), 25_000))
}

// Open pipeline.
const opportunities = []
let oppSeq = 7000
for (const rep of REPS) {
  const seg = SEGMENT_BY_TITLE[rep.title]
  const count = intBetween(4, 9)
  for (let i = 0; i < count; i++) {
    const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(Math.pow(rand(), 1.3) * STAGES.length))]
    const skew = Math.pow(rand(), 1.7)
    opportunities.push({
      id: `OPP-${oppSeq++}`,
      repId: rep.id,
      account: pick(ACCOUNTS),
      product: pick(PRODUCTS),
      amount: round(seg.lo + skew * (seg.hi - seg.lo) * 1.4, 500),
      stage: stage.name,
      probability: stage.probability,
      expectedCloseAt: iso(new Date(TODAY.getTime() + intBetween(4, 88) * 86400000)),
      lastTouchAt: iso(dayOffset(intBetween(0, 21))),
    })
  }
}
opportunities.sort((a, b) => b.amount - a.amount)

// Recent activity feed. Won-deal events reuse real orders so the feed agrees
// with the numbers above it.
const activity = []
let actSeq = 9000
const recentOrders = orders.slice(-90).reverse()
for (const order of recentOrders.slice(0, 34)) {
  activity.push({
    id: `ACT-${actSeq++}`,
    type: 'deal_won',
    repId: order.repId,
    account: order.account,
    amount: order.amount,
    detail: order.product,
    at: `${order.closedAt}T${String(intBetween(9, 18)).padStart(2, '0')}:${String(intBetween(0, 59)).padStart(2, '0')}:00Z`,
  })
}
for (const opp of opportunities) {
  if (rand() > 0.45) continue
  activity.push({
    id: `ACT-${actSeq++}`,
    type: rand() > 0.42 ? 'opportunity_advanced' : 'opportunity_created',
    repId: opp.repId,
    account: opp.account,
    amount: opp.amount,
    detail: opp.stage,
    at: `${opp.lastTouchAt}T${String(intBetween(8, 19)).padStart(2, '0')}:${String(intBetween(0, 59)).padStart(2, '0')}:00Z`,
  })
}
for (const lost of lostDeals.slice(-40)) {
  if (rand() > 0.3) continue
  activity.push({
    id: `ACT-${actSeq++}`,
    type: 'deal_lost',
    repId: lost.repId,
    account: lost.account,
    amount: lost.amount,
    detail: lost.reason,
    at: `${lost.lostAt}T${String(intBetween(9, 18)).padStart(2, '0')}:${String(intBetween(0, 59)).padStart(2, '0')}:00Z`,
  })
}
// Milestones - only for reps who have genuinely cleared the quarterly number.
for (const rep of REPS.filter((r) => r.pace * quarterElapsed >= 1)) {
  activity.push({
    id: `ACT-${actSeq++}`,
    type: 'target_reached',
    repId: rep.id,
    account: null,
    amount: rep.quarterTarget,
    detail: 'Q3 quota cleared',
    at: `${iso(dayOffset(intBetween(1, 12)))}T15:${String(intBetween(0, 59)).padStart(2, '0')}:00Z`,
  })
}
for (const rep of REPS) {
  const n = intBetween(1, 3)
  for (let i = 0; i < n; i++) {
    activity.push({
      id: `ACT-${actSeq++}`,
      type: 'meeting_logged',
      repId: rep.id,
      account: pick(ACCOUNTS),
      amount: null,
      detail: pick(['Exec briefing', 'Technical deep dive', 'Renewal review', 'Security review', 'Pricing workshop']),
      at: `${iso(dayOffset(intBetween(0, 10)))}T${String(intBetween(8, 18)).padStart(2, '0')}:${String(intBetween(0, 59)).padStart(2, '0')}:00Z`,
    })
  }
}
activity.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))

const payload = {
  meta: {
    company: 'Mercury',
    generatedAt: iso(TODAY),
    windowDays: DAYS,
    currency: 'USD',
    quarter: { label: 'Q3 2026', ...QUARTER },
    regions: REGIONS,
    note: 'Fictional data generated by scripts/generate-data.mjs. No real customers or people.',
  },
  reps: REPS.map(({ strength: _s, momentum: _m, pace: _p, ...rest }) => ({
    ...rest,
    quarterTarget: targetById.get(rest.id),
  })),
  orders,
  lostDeals,
  opportunities,
  activity: activity.slice(0, 80),
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`)

const revenue = orders.reduce((s, o) => s + o.amount, 0)
console.log(
  `wrote ${OUT}\n  reps: ${payload.reps.length}\n  orders: ${orders.length}` +
    `\n  lost: ${lostDeals.length}\n  opportunities: ${opportunities.length}` +
    `\n  activity: ${payload.activity.length}\n  revenue (245d): $${revenue.toLocaleString('en-US')}`,
)
