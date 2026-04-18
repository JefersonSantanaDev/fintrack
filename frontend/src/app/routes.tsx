import { Navigate, type RouteObject } from 'react-router-dom'

import { RedirectIfAuth } from '@/app/guards/RedirectIfAuth'
import { RequireAuth } from '@/app/guards/RequireAuth'
import { appPaths, defaultAppPath } from '@/app/paths'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignUpPage } from '@/features/auth'
import { AccountsPage } from '@/features/accounts'
import { BudgetsPage } from '@/features/budgets'
import { DashboardPage } from '@/features/dashboard'
import { FamilyPage } from '@/features/family'
import { GoalsPage } from '@/features/goals'
import { SettingsPage } from '@/features/settings'
import { TransactionsPage } from '@/features/transactions'
import { AppShell } from '@/shared/layout/AppShell'

export const appRoutes: RouteObject[] = [
  { path: appPaths.resetPassword, element: <ResetPasswordPage /> },
  {
    element: <RedirectIfAuth />,
    children: [
      { path: appPaths.login, element: <LoginPage /> },
      { path: appPaths.signup, element: <SignUpPage /> },
      { path: appPaths.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate replace to={defaultAppPath} /> },
          { path: appPaths.dashboard, element: <DashboardPage /> },
          { path: appPaths.transactions, element: <TransactionsPage /> },
          { path: appPaths.accounts, element: <AccountsPage /> },
          { path: appPaths.budgets, element: <BudgetsPage /> },
          { path: appPaths.goals, element: <GoalsPage /> },
          { path: appPaths.family, element: <FamilyPage /> },
          { path: appPaths.settings, element: <SettingsPage /> },
          { path: '*', element: <Navigate replace to={defaultAppPath} /> },
        ],
      },
    ],
  },
]
