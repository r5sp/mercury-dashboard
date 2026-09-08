export type RangeKey = 7 | 30 | 90

export type RepStatus = 'ahead' | 'on_track' | 'at_risk'

export interface Rep {
  id: string
  name: string
  title: string
  region: string
  quarterTarget: number
}

export interface Order {
  id: string
  repId: string
  account: string
  product: string
  amount: number
  closedAt: string
}

export interface LostDeal {
  id: string
  repId: string
  account: string
  amount: number
  lostAt: string
  reason: string
}

export interface Opportunity {
  id: string
  repId: string
  account: string
  product: string
  amount: number
  stage: string
  probability: number
  expectedCloseAt: string
  lastTouchAt: string
}

export type ActivityType =
  | 'deal_won'
  | 'deal_lost'
  | 'opportunity_advanced'
  | 'opportunity_created'
  | 'target_reached'
  | 'meeting_logged'

export interface ActivityEvent {
  id: string
  type: ActivityType
  repId: string
  account: string | null
  amount: number | null
  detail: string
  at: string
}

export interface Dataset {
  meta: {
    company: string
    generatedAt: string
    windowDays: number
    currency: string
    quarter: { label: string; startsAt: string; endsAt: string }
    regions: string[]
    note: string
  }
  reps: Rep[]
  orders: Order[]
  lostDeals: LostDeal[]
  opportunities: Opportunity[]
  activity: ActivityEvent[]
}
