import type { KeyboardEvent } from 'react'
import { Avatar, Delta, Meter, Sparkline, StatusPill } from './ui'
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

const NUMERIC_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'orders', label: 'Orders' },
  { key: 'conversionRate', label: 'Conversion' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'attainment', label: 'Quota' },
]

const STATUSES: RepStatus[] = ['ahead', 'on_track', 'at_risk']

export function RepRoster({
  rows,
  totalCount,
  regions,
  controls,
  onControlsChange,
  onSort,
  onSelect,
  selectedId,
  rangeDays,
}: RepRosterProps) {
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
    <section className="card" aria-label="Sales representatives">
      <div className="card__head">
        <div>
          <h2 className="card__title">Sales representatives</h2>
          <p className="card__sub">
            Revenue, orders and conversion over the last {rangeDays} days. Quota is
            quarter-to-date. Select a row for detail.
          </p>
        </div>
      </div>

      <div className="roster__filters">
        <label className="field field--search">
          <SearchIcon />
          <span className="sr-only">Search representatives</span>
          <input
            type="search"
            placeholder="Search by name, region or role"
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

        <div className="roster__mobile-sort">
          <label style={{ flex: 1 }}>
            <span className="sr-only">Sort by</span>
            <select
              className="select"
              value={controls.sortKey}
              onChange={(event) => onControlsChange({ sortKey: event.target.value as SortKey })}
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  Sort: {SORT_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              onControlsChange({
                sortDirection: controls.sortDirection === 'asc' ? 'desc' : 'asc',
              })
            }
          >
            {controls.sortDirection === 'asc' ? '▲ Asc' : '▼ Desc'}
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="empty__title">No representatives match those filters</div>
          <div>Clear the search box or widen the region and status filters.</div>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col" aria-sort={ariaSort('name')}>
                  <button type="button" className="table__sort" onClick={() => onSort('name')}>
                    Rep <span className="table__caret">{caret('name')}</span>
                  </button>
                </th>
                <th scope="col">Region</th>
                {NUMERIC_COLUMNS.map((column) => (
                  <th key={column.key} scope="col" aria-sort={ariaSort(column.key)}>
                    <button
                      type="button"
                      className="table__sort"
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
                      <Avatar name={row.rep.name} />
                      <span>
                        <span className="cell-person__name">{row.rep.name}</span>
                        <br />
                        <span className="cell-person__meta">{row.rep.title}</span>
                      </span>
                    </span>
                  </td>
                  <td data-label="Region">{row.rep.region}</td>
                  <td data-label="Revenue">
                    <span className="cell-stack">
                      <span className="cell-strong" title={moneyExact(row.revenue)}>
                        {money(row.revenue)}
                      </span>
                      <span className="cell-stack__sub">
                        <Delta change={row.revenueChange} />
                      </span>
                    </span>
                  </td>
                  <td data-label="Orders">
                    <span className="cell-stack">
                      <span className="cell-strong">{count(row.orders)}</span>
                      <span className="cell-stack__sub">{money(row.averageOrderValue)} avg</span>
                    </span>
                  </td>
                  <td data-label="Conversion">
                    <span className="cell-stack">
                      {/* No won and no lost deals means there is no rate to state. */}
                      <span className="cell-strong">
                        {row.wonCount + row.lostCount === 0 ? '—' : percent(row.conversionRate)}
                      </span>
                      <span className="cell-stack__sub">
                        {row.wonCount}W / {row.lostCount}L
                      </span>
                    </span>
                  </td>
                  <td data-label="Pipeline">
                    <span className="cell-stack">
                      <span className="cell-strong" title={moneyExact(row.pipeline.value)}>
                        {money(row.pipeline.value)}
                      </span>
                      <span className="cell-stack__sub">{row.pipeline.count} open</span>
                    </span>
                  </td>
                  <td data-label="Quota">
                    <span className="cell-quota">
                      <span className="cell-strong">{percent(row.quota.attainment)}</span>
                      <Meter
                        value={row.quota.attainment}
                        status={row.quota.status}
                        marker={row.quota.elapsed}
                        label={`${percent(row.quota.attainment)} of a ${money(
                          row.quota.target,
                        )} quarterly target`}
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

      <p className="table-note">
        Showing {rows.length} of {totalCount} representatives. The tick on each quota bar marks
        how much of the quarter has elapsed, so a fill short of the tick is behind pace.
      </p>
    </section>
  )
}
