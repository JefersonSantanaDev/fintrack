export type MetricTone = 'success' | 'warning' | 'neutral'

export interface SummaryMetric {
  id: string
  label: string
  value: number
  change: string
  tone: MetricTone
}

export interface Account {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'cash' | 'credit'
  owners: string
  balance: number
}

export interface Budget {
  id: string
  category: string
  spent: number
  limit: number
}

export interface Goal {
  id: string
  name: string
  currentAmount: number
  targetAmount: number
  targetDate: string
  status: 'on_track' | 'attention'
}

export interface FamilyMember {
  id: string
  name: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  focus: string
}

export interface Transaction {
  id: string
  description: string
  category: string
  account: string
  date: string
  amount: number
  status: 'paid' | 'scheduled'
}
