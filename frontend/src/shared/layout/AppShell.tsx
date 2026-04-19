import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  ChevronRight,
  Crown,
  Eye,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Settings,
  ShieldCheck,
  Sun,
  Target,
  Users,
  Wallet,
} from 'lucide-react'

import { appPaths } from '@/app/paths'
import { useAuth } from '@/features/auth'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { FamilyOnboardingGate } from '@/shared/layout/FamilyOnboardingGate'
import { AppShellLoading } from '@/shared/layout/AppShellLoading'
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
    description: 'Lancamentos recentes com filtros prontos para o MVP.',
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

type FamilyRole = 'owner' | 'admin' | 'viewer'

const familyRoleLabel: Record<FamilyRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  viewer: 'Viewer',
}

const familyRoleBadgeVariant: Record<FamilyRole, 'success' | 'secondary' | 'outline'> = {
  owner: 'success',
  admin: 'secondary',
  viewer: 'outline',
}

const familyRoleIcon: Record<FamilyRole, typeof Crown> = {
  owner: Crown,
  admin: ShieldCheck,
  viewer: Eye,
}

function memberInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (!words.length) {
    return 'FT'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}

function pageMeta(pathname: string) {
  return routeMeta.find(item => pathname.startsWith(item.match)) ?? routeMeta[0]
}

const postLoginSkeletonDurationMs = 1400

export function AppShell() {
  const location = useLocation()
  const { user, logout, isSubmitting, isPostLoginLoading, finishPostLoginLoading } = useAuth()
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') {
      return 'dark'
    }

    return window.localStorage.getItem('fintrack-theme-mode') === 'light'
      ? 'light'
      : 'dark'
  })

  useEffect(() => {
    const isLight = themeMode === 'light'
    document.documentElement.setAttribute(
      'data-theme',
      isLight ? 'clickhouse-light' : 'clickhouse'
    )
    document.documentElement.classList.toggle('dark', !isLight)
    window.localStorage.setItem('fintrack-theme-mode', themeMode)
  }, [themeMode])

  useEffect(() => {
    if (!isPostLoginLoading) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      finishPostLoginLoading()
    }, postLoginSkeletonDurationMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isPostLoginLoading, finishPostLoginLoading])

  const currentMonth = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  }, [])

  const meta = pageMeta(location.pathname)
  const familyMembers = user?.family?.members ?? []
  const visibleFamilyMembers = familyMembers.slice(0, 3)
  const hiddenMembersCount = Math.max(0, familyMembers.length - visibleFamilyMembers.length)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-70" />
        <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-[2200px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-level-1)] sm:p-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <FinTrackLogo />
                <Badge variant="outline" className="capitalize">
                  {currentMonth}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Painel operacional
                </p>
                <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  {meta.title}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {meta.description}
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:flex sm:w-auto sm:items-center lg:justify-self-end">
              <Badge variant="outline" className="max-w-full justify-start sm:max-w-[320px]">
                <span className="truncate">{user?.name ?? 'Conta'}</span>
              </Badge>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button className="col-span-2 w-full justify-center sm:col-span-1 sm:w-auto">
                  Nova despesa
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-center sm:w-auto"
                  onClick={handleLogout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saindo...' : 'Sair'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="justify-self-end sm:justify-self-auto"
                  aria-label={
                    themeMode === 'dark'
                      ? 'Ativar tema claro'
                      : 'Ativar tema escuro'
                  }
                  onClick={() =>
                    setThemeMode(current =>
                      current === 'dark' ? 'light' : 'dark'
                    )
                  }
                >
                  {themeMode === 'dark' ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {user?.family ? (
              <div className="rounded-sm border border-border bg-background/70 p-3 sm:p-4 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Familia conectada
                  </p>
                  <Badge variant="outline">
                    {user.family.memberCount}{' '}
                    {user.family.memberCount === 1 ? 'membro' : 'membros'}
                  </Badge>
                </div>

                {visibleFamilyMembers.length > 0 ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {visibleFamilyMembers.map(member => {
                      const RoleIcon = familyRoleIcon[member.role]

                      return (
                        <div
                          key={member.id}
                          className="rounded-sm border border-border bg-card/70 p-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-primary/35 bg-primary/10 text-xs font-bold text-primary">
                                {memberInitials(member.name)}
                              </span>
                              <div className="min-w-0">
                                <p className="break-words text-sm font-semibold leading-tight text-foreground">
                                  {member.name}
                                  {member.isCurrentUser ? ' (voce)' : ''}
                                </p>
                                <p className="break-all text-xs text-muted-foreground sm:truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant={familyRoleBadgeVariant[member.role]}
                              className="w-fit shrink-0 self-start"
                            >
                              <RoleIcon className="size-3" />
                              {familyRoleLabel[member.role]}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}

                    {hiddenMembersCount > 0 ? (
                      <div className="rounded-sm border border-dashed border-border bg-background/40 p-3 lg:col-span-3">
                        <p className="text-sm font-medium text-foreground">
                          +{hiddenMembersCount}{' '}
                          {hiddenMembersCount === 1 ? 'membro adicional' : 'membros adicionais'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Veja todos na aba Familia.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum membro encontrado ainda para esta familia.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </header>

        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-level-1)]">
            {navigation.map(item => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-w-max items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary !text-primary-foreground hover:bg-primary hover:!text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:!text-foreground'
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
            <Card className="sticky top-4 border-border py-4">
              <CardContent className="space-y-5 px-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Navegacao
                  </p>
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
                            'flex items-center justify-between rounded-sm px-3 py-3 text-sm font-semibold transition-colors',
                            isActive
                              ? 'bg-primary !text-primary-foreground shadow-[var(--shadow-level-1)] hover:bg-primary hover:!text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:!text-foreground'
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

                <div className="rounded-sm border border-primary/40 bg-primary/8 p-4">
                  <p className="text-sm font-semibold text-foreground">Sprint atual</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estruturar o frontend do MVP, conectar autenticacao e preparar a API de transacoes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="min-w-0">
            {isPostLoginLoading ? <AppShellLoading /> : <Outlet />}
          </main>
        </div>
      </div>

      <FamilyOnboardingGate enabled={!isPostLoginLoading} />
    </div>
  )
}
