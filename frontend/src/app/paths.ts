export const appPaths = {
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  transactions: '/transactions',
  accounts: '/accounts',
  budgets: '/budgets',
  goals: '/goals',
  family: '/family',
  settings: '/settings',
} as const

export const defaultAppPath = appPaths.dashboard
