import {
  ActivityIcon,
  CheckIcon,
  MercuryMark,
  MoonIcon,
  OverviewIcon,
  PeopleIcon,
  SunIcon,
} from './icons'
import { longDate } from '../lib/format'
import type { RangeKey } from '../data/types'

const RANGES: { value: RangeKey; label: string; key: string }[] = [
  { value: 7, label: 'Last 7 days', key: '1' },
  { value: 30, label: 'Last 30 days', key: '2' },
  { value: 90, label: 'Last 90 days', key: '3' },
]

const SECTIONS: { id: string; label: string; icon: typeof OverviewIcon }[] = [
  { id: 'overview', label: 'Overview', icon: OverviewIcon },
  { id: 'roster', label: 'Representatives', icon: PeopleIcon },
  { id: 'activity', label: 'Activity', icon: ActivityIcon },
]

interface RailProps {
  range: RangeKey
  onRangeChange: (range: RangeKey) => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  asOf: string
  quarterLabel: string
}

export function Rail({
  range,
  onRangeChange,
  theme,
  onThemeToggle,
  asOf,
  quarterLabel,
}: RailProps) {
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="rail" aria-label="Dashboard">
      <div className="rail__brand">
        <span className="rail__glyph">
          <MercuryMark />
        </span>
        <span className="rail__word">Mercury</span>
      </div>

      <div className="rail__nav">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className="rail__link"
            onClick={() => jump(section.id)}
          >
            <section.icon />
            {section.label}
          </button>
        ))}
      </div>

      <div className="rail__group">
        <div className="label">Reporting period</div>
      </div>
      <div className="rail__nav">
        {RANGES.map((option) => (
          <button
            key={option.value}
            type="button"
            className="preset"
            aria-pressed={option.value === range}
            onClick={() => onRangeChange(option.value)}
          >
            <span className="preset__check">
              <CheckIcon />
            </span>
            {option.label}
            <span className="preset__key">{option.key}</span>
          </button>
        ))}
      </div>

      <div className="rail__foot">
        <div className="rail__stamp">
          {quarterLabel}
          <br />
          as of {longDate(asOf)}
        </div>
        <div className="rail__actions">
          <button
            type="button"
            className="icon-button"
            onClick={onThemeToggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title="Toggle theme (t)"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  )
}
