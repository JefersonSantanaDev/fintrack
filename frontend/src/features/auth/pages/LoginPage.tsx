import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleCheckBig,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import { appPaths, defaultAppPath } from '@/app/paths'
import { useAuth } from '@/features/auth/model/AuthProvider'
import { ApiRequestError } from '@/shared/lib/api-client'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface FromState {
  from?: string
}

interface LoginTouchedFields {
  email: boolean
  password: boolean
}

function extractRetryInSeconds(message: string) {
  const match = message.match(/(\d+)\s*s\b/i)
  if (!match) {
    return 60
  }

  const retryInSeconds = Number(match[1])
  return Number.isFinite(retryInSeconds) && retryInSeconds > 0 ? retryInSeconds : 60
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isSubmitting } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<LoginTouchedFields>({ email: false, password: false })
  const [rateLimitRetryInSeconds, setRateLimitRetryInSeconds] = useState(0)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  const fromState = location.state as FromState | null
  const nextPath = fromState?.from ?? defaultAppPath
  const emailRequiredError = touched.email && !email.trim() ? 'Preencha este campo.' : null
  const passwordRequiredError = touched.password && !password ? 'Preencha este campo.' : null
  const isRateLimited = rateLimitRetryInSeconds > 0

  useEffect(() => {
    if (!isRateLimited) {
      return
    }

    const intervalId = window.setInterval(() => {
      setRateLimitRetryInSeconds(current => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isRateLimited])

  useEffect(() => {
    if (!isRateLimited && rateLimitMessage) {
      setRateLimitMessage(null)
    }
  }, [isRateLimited, rateLimitMessage])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({ email: true, password: true })
    const normalizedEmail = email.trim()
    const rawPassword = password

    if (!normalizedEmail || !rawPassword) {
      const message = 'Email e senha sao obrigatorios.'
      toast.error(message)
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      const message = 'Informe um email valido.'
      toast.error(message)
      return
    }

    if (isRateLimited) {
      toast.error(`Aguarde ${rateLimitRetryInSeconds}s para tentar novamente.`)
      return
    }

    try {
      setRateLimitMessage(null)
      await login({ email: normalizedEmail, password: rawPassword })
      navigate(nextPath, { replace: true })
    } catch (submitError) {
      if (submitError instanceof ApiRequestError && submitError.statusCode === 429) {
        const retryInSeconds = extractRetryInSeconds(submitError.message)
        setRateLimitRetryInSeconds(retryInSeconds)
        setRateLimitMessage(submitError.message)
        toast.error(submitError.message)
        return
      }

      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel entrar.'
      toast.error(message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-70" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-level-2)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden min-h-[640px] border-r border-border p-10 lg:block">
            <div className="relative flex h-full flex-col">
              <div className="space-y-5">
                <Badge variant="outline" className="uppercase tracking-[0.14em]">
                  Painel familiar inteligente
                </Badge>
                <h1 className="max-w-md text-5xl font-black leading-[1.02] tracking-tight text-foreground">
                  Controle seu dinheiro em um unico lugar com sua familia.
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  Organize entradas, saidas e metas com mais clareza e menos planilha.
                </p>
              </div>

              <motion.div
                className="relative mt-8 px-1 pb-8"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <div className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: 'Planejamento mensal', value: 82 },
                      { label: 'Controle de gastos', value: 74 },
                      { label: 'Reserva financeira', value: 68 },
                    ].map((step, index) => (
                      <div key={step.label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{step.label}</span>
                          <span>{step.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <motion.div
                            className="h-1.5 rounded-full bg-primary"
                            initial={{ width: '12%' }}
                            animate={{ width: `${step.value}%` }}
                            transition={{
                              delay: index * 0.12,
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: 'reverse',
                              repeatDelay: 1.4,
                              ease: 'easeInOut',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <div className="mt-auto space-y-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-level-1)]">
                <div className="flex items-center gap-3">
                  <ChartNoAxesCombined className="size-5 text-primary" />
                  <p className="text-sm">Visao consolidada por pessoa e categoria</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <p className="text-sm">Acesso protegido para toda a familia</p>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheckBig className="size-5 text-primary" />
                  <p className="text-sm">Metas e contas recorrentes com acompanhamento</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="space-y-6">
                <FinTrackLogo />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Entrar no FinTrack</h2>
                  <p className="text-sm text-muted-foreground">
                    Acesse seu painel financeiro familiar para acompanhar tudo em tempo real.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={event => { setEmail(event.target.value); setTouched(prev => ({ ...prev, email: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                      autoComplete="email"
                      placeholder="voce@exemplo.com"
                      className="h-11 pl-9"
                      aria-invalid={emailRequiredError ? 'true' : 'false'}
                    />
                  </div>
                  {emailRequiredError ? (
                    <p className="text-xs text-destructive">{emailRequiredError}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      className="text-xs font-semibold text-muted-foreground hover:text-primary hover:underline"
                      to={appPaths.forgotPassword}
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={event => { setPassword(event.target.value); setTouched(prev => ({ ...prev, password: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      className="h-11 pl-9 pr-10"
                      aria-invalid={passwordRequiredError ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowPassword(current => !current)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {passwordRequiredError ? (
                    <p className="text-xs text-destructive">{passwordRequiredError}</p>
                  ) : null}
                </div>

                <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting || isRateLimited}>
                  {isSubmitting
                    ? 'Entrando...'
                    : isRateLimited
                      ? `Tente novamente em ${rateLimitRetryInSeconds}s`
                      : 'Entrar agora'}
                  {!isSubmitting && !isRateLimited ? <ArrowRight className="size-4" /> : null}
                </Button>
                {rateLimitMessage ? (
                  <p
                    className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    role="status"
                    aria-live="polite"
                  >
                    {isRateLimited
                      ? `Muitas tentativas. Aguarde ${rateLimitRetryInSeconds}s para tentar novamente.`
                      : rateLimitMessage}
                  </p>
                ) : null}

                <p className="text-center text-sm text-muted-foreground">
                  Ainda nao tem conta?{' '}
                  <Link className="font-semibold text-foreground hover:text-primary hover:underline" to={appPaths.signup}>
                    Criar cadastro
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
