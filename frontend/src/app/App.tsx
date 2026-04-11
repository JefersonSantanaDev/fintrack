import { BrowserRouter, useRoutes } from 'react-router-dom'

import { appRoutes } from '@/app/routes'
import { AuthProvider } from '@/features/auth'
import { Toaster } from '@/shared/ui/sonner'

function AppRouter() {
  return useRoutes(appRoutes)
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
