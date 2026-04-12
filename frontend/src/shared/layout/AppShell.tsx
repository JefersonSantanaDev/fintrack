import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  ChevronRight,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Settings,
  Sun,
  Target,
  Users,
  Wallet,
} from 'lucide-react'

import { appPaths } from '@/app/paths'
import { useAuth } from '@/features/auth'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

const navigation = [
  { to: appPaths.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: appPaths.transactions, label: 'Transacoes', icon: ArrowLeftRight },
  { to: appPaths.accounts, label: 'Contas', icon: Wallet },
  { to: appPaths.budgets, label: 'Orcamentos', icon: PiggyBank },
  { to: appPaths.goals, label: 'Metas', icon: Target },
  { to: appPaths.family, label: 'Familia', icon: Users },
  { to: appPaths.settings, label: 'Configuracoes', icon: Settings },
]

const routeMeta = [
  {
    match: appPaths.dashboard,
    title: 'Visao geral da familia',
    description: 'Total guardado, orcamento e progresso financeiro em um unico painel.',
  },
  {
    match: appPaths.transactions,
    title: 'Fluxo de caixa',
    description: 'Lançamentos recentes com filtros prontos para o MVP.',
  },
  {
    match: appPaths.accounts,
    title: 'Contas e reservas',
    description: 'Contas bancarias, carteira e caixas da familia organizados.',
  },
  {
    match: appPaths.budgets,
    title: 'Orcamentos mensais',
    description: 'Limites por categoria com acompanhamento visual claro.',
  },
  {
    match: appPaths.goals,
    title: 'Metas compartilhadas',
    description: 'Objetivos financeiros com ritmo, prazo e valor acumulado.',
  },
  {
    match: appPaths.family,
    title: 'Colaboracao familiar',
    description: 'Membros, papeis e combinados operacionais do sistema.',
  },
  {
    match: appPaths.settings,
    title: 'Preferencias do produto',
    description: 'Area reservada para tema, alertas e integracoes futuras.',
  },
]

function pageMeta(pathname: string) {
  return routeMeta.find(item => pathname.startsWith(item.match)) ?? routeMeta[0]
}

export function AppShell() {
  const location = useLocation()
  const { user, logout, isSubmitting } = useAuth()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('fintrack-theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'green')
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem('fintrack-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const currentMonth = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  }, [])

  const meta = pageMeta(location.pathname)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-90" />
        <div className="absolute left-[-8%] top-[-12%] h-80 w-80 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute bottom-[-14%] right-[-6%] h-96 w-96 rounded-full bg-amber-400/12 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border bg-card/85 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <FinTrackLogo />
                <Badge variant="success">MVP familiar</Badge>
                <Badge variant="outline" className="capitalize">
                  {currentMonth}
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {meta.title}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {meta.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Badge variant="secondary" className="max-w-max">
                {user?.name ?? 'Conta'}
              </Badge>
              <Button className="justify-start bg-primary sm:justify-center">
                Nova despesa
              </Button>
              <Button
                variant="ghost"
                className="justify-start sm:justify-center"
                onClick={handleLogout}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saindo...' : 'Sair'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Alternar tema"
                onClick={() => setIsDark(current => !current)}
              >
                {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto rounded-[24px] border bg-card/85 p-2 shadow-sm backdrop-blur">
            {navigation.map(item => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-w-max items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <Card className="sticky top-4 rounded-[28px] border bg-card/85 py-4 shadow-sm backdrop-blur">
              <CardContent className="space-y-5 px-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Navegacao</p>
                  <p className="text-sm text-muted-foreground">
                    Estrutura visual inicial do FinTrack para dashboard, contas e planejamento familiar.
                  </p>
                </div>

                <Separator />

                <nav className="space-y-1.5">
                  {navigation.map(item => {
                    const Icon = item.icon

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )
                        }
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="size-4" />
                          {item.label}
                        </span>
                        <ChevronRight className="size-4 opacity-70" />
                      </NavLink>
                    )
                  })}
                </nav>

                <Separator />

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                  <p className="text-sm font-medium text-foreground">Sprint atual</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estruturar o frontend do MVP, conectar autenticao e preparar a API de transacoes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
