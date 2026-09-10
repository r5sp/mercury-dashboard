import { useEffect, useMemo, useRef, useState } from 'react'
import { money, percent } from '../lib/format'
import { STATUS_LABEL, type RepMetrics } from '../lib/metrics'
import { THEMES, type Theme } from '../lib/theme'
import type { RangeKey } from '../data/types'

export interface PaletteAction {
  id: string
  label: string
  hint?: string
  run: () => void
}

interface CommandPaletteProps {
  rows: RepMetrics[]
  onSelectRep: (repId: string) => void
  onRangeChange: (range: RangeKey) => void
  onThemeChange: (theme: Theme) => void
  theme: Theme
  onClose: () => void
}

/**
 * Cmd/Ctrl-K. Jumping to a person by typing three letters is most of what makes
 * a dashboard feel like a tool rather than a page.
 */
export function CommandPalette({
  rows,
  onSelectRep,
  onRangeChange,
  onThemeChange,
  theme,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
  }, [])

  const actions: PaletteAction[] = useMemo(
    () => [
      { id: 'r7', label: 'Reporting period: last 7 days', hint: '1', run: () => onRangeChange(7) },
      { id: 'r30', label: 'Reporting period: last 30 days', hint: '2', run: () => onRangeChange(30) },
      { id: 'r90', label: 'Reporting period: last 90 days', hint: '3', run: () => onRangeChange(90) },
      ...THEMES.map((option) => ({
        id: `theme-${option.value}`,
        label: `Theme: ${option.label}`,
        hint: option.value === theme ? 'current' : undefined,
        run: () => onThemeChange(option.value),
      })),
    ],
    [onRangeChange, onThemeChange, theme],
  )

  const needle = query.trim().toLowerCase()

  const reps = useMemo(
    () =>
      rows.filter((row) =>
        needle
          ? `${row.rep.name} ${row.rep.region} ${row.rep.title}`.toLowerCase().includes(needle)
          : true,
      ),
    [rows, needle],
  )

  const commands = useMemo(
    () => actions.filter((action) => (needle ? action.label.toLowerCase().includes(needle) : true)),
    [actions, needle],
  )

  const flat = useMemo(
    () => [
      ...reps.map((row) => ({ kind: 'rep' as const, row })),
      ...commands.map((action) => ({ kind: 'action' as const, action })),
    ],
    [reps, commands],
  )

  useEffect(() => {
    setCursor(0)
  }, [query])

  const run = (index: number) => {
    const entry = flat[index]
    if (!entry) return
    if (entry.kind === 'rep') onSelectRep(entry.row.rep.id)
    else entry.action.run()
    onClose()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((c) => Math.min(c + 1, flat.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(cursor)
    }
  }

  let index = -1

  return (
    <div
      className="palette-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={input}
          className="palette__input"
          placeholder="Jump to a representative, or type a command"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Command palette search"
        />

        <ul className="palette__list">
          {reps.length > 0 ? (
            <li className="palette__section label">Representatives</li>
          ) : null}
          {reps.map((row) => {
            index += 1
            const mine = index
            return (
              <li key={row.rep.id}>
                <button
                  type="button"
                  className="palette__item"
                  data-active={cursor === mine}
                  onMouseEnter={() => setCursor(mine)}
                  onClick={() => run(mine)}
                >
                  <span>{row.rep.name}</span>
                  <span className="palette__meta">
                    {row.rep.region} · {money(row.revenue)} · {percent(row.quota.attainment)}{' '}
                    {STATUS_LABEL[row.quota.status].toLowerCase()}
                  </span>
                </button>
              </li>
            )
          })}

          {commands.length > 0 ? <li className="palette__section label">Commands</li> : null}
          {commands.map((action) => {
            index += 1
            const mine = index
            return (
              <li key={action.id}>
                <button
                  type="button"
                  className="palette__item"
                  data-active={cursor === mine}
                  onMouseEnter={() => setCursor(mine)}
                  onClick={() => run(mine)}
                >
                  <span>{action.label}</span>
                  {action.hint ? <span className="palette__meta">{action.hint}</span> : null}
                </button>
              </li>
            )
          })}

          {flat.length === 0 ? (
            <li className="empty">
              <div className="empty__title">Nothing matches “{query}”</div>
            </li>
          ) : null}
        </ul>

        <div className="palette__foot">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span>esc to dismiss</span>
        </div>
      </div>
    </div>
  )
}
