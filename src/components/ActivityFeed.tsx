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
  deal_won: <CheckIcon size={11} />,
  deal_lost: <CrossIcon size={11} />,
  opportunity_advanced: <ArrowRightIcon size={11} />,
  opportunity_created: <PlusIcon size={11} />,
  target_reached: <TrophyIcon size={11} />,
  meeting_logged: <CalendarIcon size={11} />,
}

const TONE: Record<ActivityType, string> = {
  deal_won: 'var(--positive)',
  deal_lost: 'var(--negative)',
  opportunity_advanced: 'var(--ink-2)',
  opportunity_created: 'var(--ink-2)',
  target_reached: 'var(--positive)',
  meeting_logged: 'var(--muted)',
}

const KIND: Record<ActivityType, string> = {
  deal_won: 'Won',
  deal_lost: 'Lost',
  opportunity_advanced: 'Advanced',
  opportunity_created: 'Opened',
  target_reached: 'Milestone',
  meeting_logged: 'Meeting',
}

/**
 * Inside a rep's own panel the name is in the header already, so the line drops
 * it and leads with the verb instead.
 */
function line(event: ActivityEvent, repName: string | null): ReactNode {
  const account = <span style={{ fontWeight: 500 }}>{event.account}</span>
  const lead = (withName: string, alone: string): ReactNode =>
    repName === null ? (
      alone
    ) : (
      <>
        <span className="ledger__who">{repName}</span> {withName}
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
      return <>{lead('opened an opportunity at', 'Opened an opportunity at')} {account}</>
    case 'target_reached':
      return lead('reached quarterly target', 'Reached quarterly target')
    case 'meeting_logged':
      return <>{lead('met with', 'Met with')} {account}</>
  }
}

interface ActivityFeedProps {
  events: ActivityEvent[]
  reps: Rep[]
  now: Date
  limit?: number
  bare?: boolean
  anonymous?: boolean
}

export function ActivityFeed({
  events,
  reps,
  now,
  limit = 50,
  bare = false,
  anonymous = false,
}: ActivityFeedProps) {
  const nameOf = (repId: string) =>
    anonymous ? null : (reps.find((rep) => rep.id === repId)?.name ?? 'Unknown rep')
  const shown = events.slice(0, limit)

  const list = (
    <ul className="ledger">
      {shown.length === 0 ? (
        <li className="empty">Nothing logged in this period.</li>
      ) : (
        shown.map((event) => (
          <li key={event.id} className="ledger__item">
            <time className="ledger__when" dateTime={event.at}>
              {relativeTime(event.at, now)}
            </time>
            <div>
              <div className="ledger__line">{line(event, nameOf(event.repId))}</div>
              <div className="ledger__meta">
                <span className="ledger__tag" style={{ color: TONE[event.type] }}>
                  {ICON[event.type]}
                  {KIND[event.type]}
                </span>
                {event.amount !== null && event.type !== 'target_reached' ? (
                  <span className="ledger__amount">{money(event.amount)}</span>
                ) : null}
                <span>{event.detail}</span>
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
  )

  if (bare) return list

  return (
    <aside className="split__aside" id="activity" aria-label="Recent activity">
      <div className="region__head" style={{ paddingBottom: 12 }}>
        <div>
          <h2 className="region__title">Activity</h2>
          <p className="region__sub">Team-wide, newest first.</p>
        </div>
      </div>
      {list}
    </aside>
  )
}
