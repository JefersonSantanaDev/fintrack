import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'

function applyInitialTheme() {
  if (typeof window === 'undefined') {
    return
  }

  const storedMode = window.localStorage.getItem('fintrack-theme-mode')
  const isLight = storedMode === 'light'

  document.documentElement.setAttribute(
    'data-theme',
    isLight ? 'clickhouse-light' : 'clickhouse'
  )
  document.documentElement.classList.toggle('dark', !isLight)
}

applyInitialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
