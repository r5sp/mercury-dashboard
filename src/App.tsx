import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityFeed } from './components/ActivityFeed'
import { KpiRow } from './components/KpiRow'
import { RepDrawer } from './components/RepDrawer'
import { RepRoster, type RosterControls } from './components/RepRoster'
import { RevenueChart, type Measure } from './components/RevenueChart'
import { Segmented } from './components/ui'
import { MoonIcon, SunIcon } from './components/icons'
import { dataset } from './data'
import type { RangeKey } from './data/types'
import { longDate } from './lib/format'
import {
  activityForRep,
  monthlySeries,
  opportunitiesForRep,
  ordersIn,
  pipeline,
  previousWindow,
  repMetrics,
  revenueSeries,
  sortReps,
  totals,
  window as makeWindow,
  type SortKey,
} from './lib/metrics'

const RANGES: { value: RangeKey; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mercury.theme'

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  try {
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme())
  const [range, setRange] = useState<RangeKey>(30)
  const [measure, setMeasure] = useState<Measure>('revenue')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [controls, setControls] = useState<RosterControls>({
    query: '',
    region: 'all',
    status: 'all',
    sortKey: 'revenue',
    sortDirection: 'desc',
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* private browsing - the choice just does not persist */
    }
  }, [theme])

  const asOf = dataset.meta.generatedAt
  const now = useMemo(() => new Date(`${asOf}T20:00:00Z`), [asOf])

  const current = useMemo(() => makeWindow(asOf, range), [asOf, range])
  const previous = useMemo(() => previousWindow(current), [current])

  const currentTotals = useMemo(() => totals(ordersIn(dataset.orders, current)), [current])
  const previousTotals = useMemo(() => totals(ordersIn(dataset.orders, previous)), [previous])
  const openPipeline = useMemo(() => pipeline(dataset.opportunities), [])

  const series = useMemo(
    () => revenueSeries(ordersIn(dataset.orders, current), current),
    [current],
  )

  const allMetrics = useMemo(
    () => repMetrics({ data: dataset, current, previous }),
    [current, previous],
  )

  const rows = useMemo(() => {
    const needle = controls.query.trim().toLowerCase()
    const filtered = allMetrics.filter((row) => {
      if (controls.region !== 'all' && row.rep.region !== controls.region) return false
      if (controls.status !== 'all' && row.quota.status !== controls.status) return false
      if (!needle) return true
      return `${row.rep.name} ${row.rep.region} ${row.rep.title}`.toLowerCase().includes(needle)
    })
    return sortReps(filtered, controls.sortKey, controls.sortDirection)
  }, [allMetrics, controls])

  const selected = useMemo(
    () => allMetrics.find((row) => row.rep.id === selectedId) ?? null,
    [allMetrics, selectedId],
  )

  const selectedMonthly = useMemo(
    () =>
      selected
        ? monthlySeries(
            dataset.orders.filter((order) => order.repId === selected.rep.id),
            asOf,
            6,
          )
        : [],
    [selected, asOf],
  )

  const updateControls = useCallback((next: Partial<RosterControls>) => {
    setControls((previousControls) => ({ ...previousControls, ...next }))
  }, [])

  const onSort = useCallback((key: SortKey) => {
    setControls((previousControls) => {
      if (previousControls.sortKey === key) {
        return {
          ...previousControls,
          sortDirection: previousControls.sortDirection === 'asc' ? 'desc' : 'asc',
        }
      }
      return { ...previousControls, sortKey: key, sortDirection: key === 'name' ? 'asc' : 'desc' }
    })
  }, [])

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="masthead__mark" aria-hidden>
            M
          </span>
          <div>
            <h1 className="masthead__title">Mercury</h1>
            <p className="masthead__subtitle">Sales performance · {dataset.meta.quarter.label}</p>
          </div>
        </div>
        <div className="masthead__spacer" />
        <div className="masthead__meta">
          <span className="masthead__asof">Data as of {longDate(asOf)}</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="toolbar">
        <span className="toolbar__label" id="range-label">
          Reporting period
        </span>
        <Segmented label="Reporting period" options={RANGES} value={range} onChange={setRange} />
        <div className="toolbar__spacer" />
      </div>

      <KpiRow
        current={currentTotals}
        previous={previousTotals}
        pipeline={openPipeline}
        rangeDays={range}
      />

      <RevenueChart
        points={series}
        measure={measure}
        onMeasureChange={setMeasure}
        range={range}
      />

      <div className="columns">
        <RepRoster
          rows={rows}
          totalCount={allMetrics.length}
          regions={dataset.meta.regions}
          controls={controls}
          onControlsChange={updateControls}
          onSort={onSort}
          onSelect={setSelectedId}
          selectedId={selectedId}
          rangeDays={range}
        />
        <ActivityFeed events={dataset.activity} reps={dataset.reps} now={now} />
      </div>

      <p className="table-note" style={{ borderTop: 0, paddingLeft: 0 }}>
        {dataset.meta.note}
      </p>

      {selected ? (
        <RepDrawer
          metrics={selected}
          monthly={selectedMonthly}
          opportunities={opportunitiesForRep(dataset.opportunities, selected.rep.id)}
          activity={activityForRep(dataset.activity, selected.rep.id)}
          reps={dataset.reps}
          now={now}
          quarterLabel={dataset.meta.quarter.label}
          rangeDays={range}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  )
}
