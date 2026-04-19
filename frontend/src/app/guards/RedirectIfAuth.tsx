import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { appPaths, defaultAppPath } from '@/app/paths'
import { AuthLoadingScreen } from '@/app/guards/AuthLoadingScreen'
import { useAuth } from '@/features/auth/model/AuthProvider'

export function RedirectIfAuth() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  const isFamilyInviteSignUp =
    location.pathname === appPaths.signup
    && new URLSearchParams(location.search).get('source') === 'family-invite'

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated && !isFamilyInviteSignUp) {
    return <Navigate replace to={defaultAppPath} />
  }

  return <Outlet />
}
