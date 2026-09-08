import type { ReactNode } from 'react'
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  CrossIcon,
  PlusIcon,
  TrophyIcon,
} from './icons'
import { money, relativeTime } from '../lib/format'
import type { ActivityEvent, ActivityType, Rep } from '../data/types'

const ICON: Record<ActivityType, ReactNode> = {
  deal_won: <CheckIcon />,
  deal_lost: <CrossIcon />,
  opportunity_advanced: <ArrowRightIcon />,
  opportunity_created: <PlusIcon />,
  target_reached: <TrophyIcon />,
  meeting_logged: <CalendarIcon />,
}

const TONE: Record<ActivityType, string> = {
  deal_won: 'var(--good-text)',
  deal_lost: 'var(--critical-text)',
  opportunity_advanced: 'var(--series-1)',
  opportunity_created: 'var(--ink-2)',
  target_reached: 'var(--good-text)',
  meeting_logged: 'var(--muted)',
}

/**
 * Inside a rep's own panel the name is already in the header, so the line drops
 * it and leads with the verb instead.
 */
function line(event: ActivityEvent, repName: string | null): ReactNode {
  const account = <strong style={{ fontWeight: 570 }}>{event.account}</strong>
  const lead = (withName: string, alone: string): ReactNode =>
    repName === null ? (
      alone
    ) : (
      <>
        <span className="feed__who">{repName}</span> {withName}
      </>
    )

  switch (event.type) {
    case 'deal_won':
      return <>{lead('closed', 'Closed')} {account}</>
    case 'deal_lost':
      return <>{lead('lost', 'Lost')} {account}</>
    case 'opportunity_advanced':
      return <>{lead('moved', 'Moved')} {account} to {event.detail}</>
    case 'opportunity_created':
      return <>{lead('opened a new opportunity at', 'Opened a new opportunity at')} {account}</>
    case 'target_reached':
      return lead('reached quarterly target', 'Reached quarterly target')
    case 'meeting_logged':
      return <>{lead('logged a meeting with', 'Logged a meeting with')} {account}</>
  }
}

const SECOND_LINE: Record<ActivityType, (event: ActivityEvent) => string> = {
  deal_won: (event) => event.detail,
  deal_lost: (event) => event.detail,
  opportunity_advanced: () => 'Open opportunity',
  opportunity_created: (event) => event.detail,
  target_reached: (event) => event.detail,
  meeting_logged: (event) => event.detail,
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  reps: Rep[]
  now: Date
  title?: string
  subtitle?: string
  limit?: number
  bare?: boolean
  /** Omit the rep name - for a panel that already names the person. */
  anonymous?: boolean
}

export function ActivityFeed({
  events,
  reps,
  now,
  title = 'Recent activity',
  subtitle = 'Across the whole team',
  limit = 40,
  bare = false,
  anonymous = false,
}: ActivityFeedProps) {
  const nameOf = (repId: string) =>
    anonymous ? null : reps.find((rep) => rep.id === repId)?.name ?? 'Unknown rep'
  const shown = events.slice(0, limit)

  const list = (
    <ul className="feed__list">
      {shown.length === 0 ? (
        <li className="empty">Nothing logged in this period.</li>
      ) : (
        shown.map((event) => (
          <li key={event.id} className="feed__item">
            <span className="feed__icon" style={{ color: TONE[event.type] }}>
              {ICON[event.type]}
            </span>
            <span className="feed__body">
              <span className="feed__line">{line(event, nameOf(event.repId))}</span>
              <span className="feed__meta">
                {event.amount !== null && event.type !== 'target_reached' ? (
                  <span className="feed__amount">{money(event.amount)}</span>
                ) : null}
                <span>{SECOND_LINE[event.type](event)}</span>
                <span aria-hidden>·</span>
                <time dateTime={event.at}>{relativeTime(event.at, now)}</time>
              </span>
            </span>
          </li>
        ))
      )}
    </ul>
  )

  if (bare) return list

  return (
    <section className="card feed" aria-label={title}>
      <div className="card__head" style={{ paddingBottom: 12 }}>
        <div>
          <h2 className="card__title">{title}</h2>
          <p className="card__sub">{subtitle}</p>
        </div>
      </div>
      {list}
    </section>
  )
}
