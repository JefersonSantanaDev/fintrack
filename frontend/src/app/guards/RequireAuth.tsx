import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { appPaths } from '@/app/paths'
import { AuthLoadingScreen } from '@/app/guards/AuthLoadingScreen'
import { useAuth } from '@/features/auth/model/AuthProvider'

export function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate replace to={appPaths.login} state={{ from }} />
  }

  return <Outlet />
}
