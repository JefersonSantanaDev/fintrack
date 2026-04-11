import { Navigate, Outlet } from 'react-router-dom'

import { defaultAppPath } from '@/app/paths'
import { AuthLoadingScreen } from '@/app/guards/AuthLoadingScreen'
import { useAuth } from '@/features/auth/model/AuthProvider'

export function RedirectIfAuth() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate replace to={defaultAppPath} />
  }

  return <Outlet />
}
