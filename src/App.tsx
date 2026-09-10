import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityFeed } from './components/ActivityFeed'
import { CommandPalette } from './components/CommandPalette'
import { Rail } from './components/Rail'
import { RepDrawer } from './components/RepDrawer'
import { RepRoster, type RosterControls } from './components/RepRoster'
import { RevenueChart, type Measure } from './components/RevenueChart'
import { SummaryBand } from './components/SummaryBand'
import { dataset } from './data'
import { nextTheme, readStoredTheme, storeTheme, type Theme } from './lib/theme'
import type { RangeKey } from './data/types'
import {
  activityForRep,
  comparedSeries,
  monthlySeries,
  opportunitiesForRep,
  ordersIn,
  pipeline,
  previousWindow,
  repMetrics,
  sortReps,
  totals,
  window as makeWindow,
  type SortKey,
} from './lib/metrics'

export default function App() {
  // Lilac is the default the client asked for; a stored choice still wins.
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? 'lilac')
  const [range, setRange] = useState<RangeKey>(30)
  const [measure, setMeasure] = useState<Measure>('revenue')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [controls, setControls] = useState<RosterControls>({
    query: '',
    region: 'all',
    status: 'all',
    sortKey: 'revenue',
    sortDirection: 'desc',
  })

  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storeTheme(theme)
  }, [theme])

  const cycleTheme = useCallback(() => {
    setTheme((current) => nextTheme(current))
  }, [])

  const asOf = dataset.meta.generatedAt
  const now = useMemo(() => new Date(`${asOf}T20:00:00Z`), [asOf])

  const current = useMemo(() => makeWindow(asOf, range), [asOf, range])
  const previous = useMemo(() => previousWindow(current), [current])

  const currentTotals = useMemo(() => totals(ordersIn(dataset.orders, current)), [current])
  const previousTotals = useMemo(() => totals(ordersIn(dataset.orders, previous)), [previous])
  const openPipeline = useMemo(() => pipeline(dataset.opportunities), [])

  const series = useMemo(
    () => comparedSeries(dataset.orders, current, previous),
    [current, previous],
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

  /** Keyboard-first: the palette, the period, search focus and the theme. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === '/') {
        event.preventDefault()
        searchInput.current?.focus()
      } else if (event.key === '1') {
        setRange(7)
      } else if (event.key === '2') {
        setRange(30)
      } else if (event.key === '3') {
        setRange(90)
      } else if (event.key.toLowerCase() === 't') {
        cycleTheme()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [cycleTheme])

  return (
    <div className="shell">
      <Rail
        range={range}
        onRangeChange={setRange}
        theme={theme}
        onThemeChange={setTheme}
        asOf={asOf}
        quarterLabel={dataset.meta.quarter.label}
      />

      <main className="main">
        <header className="topbar">
          <h1 className="topbar__title">Sales performance</h1>
          <span className="topbar__crumb">last {range} days</span>
          <div className="topbar__spacer" />
          <button
            type="button"
            className="command-hint"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open the command palette"
          >
            Jump to&hellip;
            <span className="kbd">⌘K</span>
          </button>
        </header>

        <SummaryBand
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

        <div className="split">
          <RepRoster
            ref={searchInput}
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

        <p className="note">{dataset.meta.note}</p>
      </main>

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

      {paletteOpen ? (
        <CommandPalette
          rows={allMetrics}
          onSelectRep={setSelectedId}
          onRangeChange={setRange}
          onThemeChange={setTheme}
          theme={theme}
          onClose={() => setPaletteOpen(false)}
        />
      ) : null}
    </div>
  )
}
