import { forwardRef, type KeyboardEvent } from 'react'
import { Delta, Meter, Monogram, Sparkline, StatusPill } from './ui'
import { SearchIcon } from './icons'
import { count, money, moneyExact, percent } from '../lib/format'
import { SORT_LABEL, STATUS_LABEL, type RepMetrics, type SortKey } from '../lib/metrics'
import type { RepStatus } from '../data/types'

export interface RosterControls {
  query: string
  region: string
  status: string
  sortKey: SortKey
  sortDirection: 'asc' | 'desc'
}

interface RepRosterProps {
  rows: RepMetrics[]
  totalCount: number
  regions: string[]
  controls: RosterControls
  onControlsChange: (next: Partial<RosterControls>) => void
  onSort: (key: SortKey) => void
  onSelect: (repId: string) => void
  selectedId: string | null
  rangeDays: number
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'orders', label: 'Orders' },
  { key: 'conversionRate', label: 'Conv.' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'attainment', label: 'Quota' },
]

const STATUSES: RepStatus[] = ['ahead', 'on_track', 'at_risk']

export const RepRoster = forwardRef<HTMLInputElement, RepRosterProps>(function RepRoster(
  {
    rows,
    totalCount,
    regions,
    controls,
    onControlsChange,
    onSort,
    onSelect,
    selectedId,
    rangeDays,
  },
  searchRef,
) {
  const ariaSort = (key: SortKey) =>
    controls.sortKey === key
      ? controls.sortDirection === 'asc'
        ? ('ascending' as const)
        : ('descending' as const)
      : ('none' as const)

  const caret = (key: SortKey) =>
    controls.sortKey === key ? (controls.sortDirection === 'asc' ? '▲' : '▼') : ''

  const activate = (event: KeyboardEvent<HTMLTableRowElement>, repId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(repId)
    }
  }

  return (
    <section className="region" id="roster" aria-label="Sales representatives">
      <div className="region__head">
        <div>
          <h2 className="region__title">Representatives</h2>
          <p className="region__sub">
            Revenue, orders and conversion over the last {rangeDays} days. Quota is
            quarter-to-date, and the tick on each bar marks how much of the quarter has
            elapsed. Select a row for detail.
          </p>
        </div>
      </div>

      <div className="filters">
        <label className="field field--search">
          <SearchIcon />
          <span className="sr-only">Search representatives</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search name, region or role"
            value={controls.query}
            onChange={(event) => onControlsChange({ query: event.target.value })}
          />
        </label>

        <label>
          <span className="sr-only">Filter by region</span>
          <select
            className="select"
            value={controls.region}
            onChange={(event) => onControlsChange({ region: event.target.value })}
          >
            <option value="all">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filter by status</span>
          <select
            className="select"
            value={controls.status}
            onChange={(event) => onControlsChange({ status: event.target.value })}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="only-narrow">
          <span className="sr-only">Sort by</span>
          <select
            className="select"
            value={`${controls.sortKey}:${controls.sortDirection}`}
            onChange={(event) => {
              const [sortKey, sortDirection] = event.target.value.split(':')
              onControlsChange({
                sortKey: sortKey as SortKey,
                sortDirection: sortDirection as 'asc' | 'desc',
              })
            }}
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).flatMap((key) => [
              <option key={`${key}:desc`} value={`${key}:desc`}>
                {SORT_LABEL[key]}, high to low
              </option>,
              <option key={`${key}:asc`} value={`${key}:asc`}>
                {SORT_LABEL[key]}, low to high
              </option>,
            ])}
          </select>
        </label>

        <span className="filters__count">
          {rows.length}/{totalCount}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="empty__title">No representatives match those filters</div>
          <div>Clear the search box, or widen the region and status filters.</div>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col" aria-sort={ariaSort('name')}>
                  <button
                    type="button"
                    className={
                      controls.sortKey === 'name' ? 'table__sort table__sort--active' : 'table__sort'
                    }
                    onClick={() => onSort('name')}
                  >
                    Rep <span className="table__caret">{caret('name')}</span>
                  </button>
                </th>
                {COLUMNS.map((column) => (
                  <th key={column.key} scope="col" aria-sort={ariaSort(column.key)}>
                    <button
                      type="button"
                      className={
                        controls.sortKey === column.key
                          ? 'table__sort table__sort--active'
                          : 'table__sort'
                      }
                      onClick={() => onSort(column.key)}
                    >
                      {column.label} <span className="table__caret">{caret(column.key)}</span>
                    </button>
                  </th>
                ))}
                <th scope="col">Status</th>
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.rep.id}
                  tabIndex={0}
                  aria-selected={row.rep.id === selectedId}
                  onClick={() => onSelect(row.rep.id)}
                  onKeyDown={(event) => activate(event, row.rep.id)}
                >
                  <td data-label="Rep">
                    <span className="cell-person">
                      <Monogram name={row.rep.name} />
                      <span>
                        <span className="cell-person__name">{row.rep.name}</span>
                        <br />
                        <span className="cell-person__meta">
                          {row.rep.title} · {row.rep.region}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td data-label="Revenue">
                    <div title={moneyExact(row.revenue)}>{money(row.revenue)}</div>
                    <div className="cell-sub">
                      <Delta change={row.revenueChange} />
                    </div>
                  </td>
                  <td data-label="Orders">
                    <div>{count(row.orders)}</div>
                    <div className="cell-sub">{money(row.averageOrderValue)} avg</div>
                  </td>
                  <td data-label="Conv.">
                    <div>
                      {row.wonCount + row.lostCount === 0 ? '—' : percent(row.conversionRate)}
                    </div>
                    <div className="cell-sub">
                      {row.wonCount}W {row.lostCount}L
                    </div>
                  </td>
                  <td data-label="Pipeline">
                    <div title={moneyExact(row.pipeline.value)}>{money(row.pipeline.value)}</div>
                    <div className="cell-sub">{row.pipeline.count} open</div>
                  </td>
                  <td data-label="Quota">
                    <span className="cell-quota">
                      <span>{percent(row.quota.attainment)}</span>
                      <Meter
                        value={row.quota.attainment}
                        status={row.quota.status}
                        marker={row.quota.elapsed}
                        label={`${percent(row.quota.attainment)} of a ${money(
                          row.quota.target,
                        )} quarterly target, with ${percent(row.quota.elapsed)} of the quarter elapsed`}
                      />
                    </span>
                  </td>
                  <td data-label="Status">
                    <StatusPill status={row.quota.status} />
                  </td>
                  <td data-label="Trend">
                    <Sparkline
                      values={row.spark}
                      label={`Revenue trend over the last ${rangeDays} days`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
})
