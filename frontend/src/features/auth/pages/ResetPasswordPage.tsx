import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  CircleCheckBig,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { appPaths } from '@/app/paths'
import { confirmPasswordRecovery } from '@/features/auth/services/auth.service'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface ResetTouchedFields {
  password: boolean
  confirmPassword: boolean
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const recoveryToken = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [touched, setTouched] = useState<ResetTouchedFields>({
    password: false,
    confirmPassword: false,
  })

  const hasValidToken = recoveryToken.length > 0
  const passwordRequiredError = touched.password && !password ? 'Preencha este campo.' : null
  const confirmPasswordRequiredError =
    touched.confirmPassword && !confirmPassword ? 'Preencha este campo.' : null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({
      password: true,
      confirmPassword: true,
    })

    if (!hasValidToken) {
      toast.error('Link de recuperacao invalido. Solicite um novo email.')
      return
    }

    if (!password || !confirmPassword) {
      toast.error('Preencha os campos de senha.')
      return
    }

    if (password.length < 6) {
      toast.error('A senha precisa ter no minimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas precisam ser iguais.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await confirmPasswordRecovery({
        token: recoveryToken,
        password,
      })

      setIsDone(true)
      toast.success(response.message)

      window.setTimeout(() => {
        navigate(appPaths.login, { replace: true })
      }, 1400)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel redefinir a senha.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
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
                  Recuperacao protegida
                </Badge>
                <h1 className="max-w-md text-5xl font-black leading-[1.02] tracking-tight text-foreground">
                  Defina uma nova senha e volte para sua rotina financeira.
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  O link de recuperacao do FinTrack expira automaticamente para reforcar a seguranca da conta.
                </p>
              </div>

              <motion.div
                className="relative mt-8 px-1 pb-8"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-5 text-primary" />
                    <p className="text-sm">Token unico com expiracao automatica</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="size-5 text-primary" />
                    <p className="text-sm">Sessoes antigas sao revogadas ao trocar senha</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CircleCheckBig className="size-5 text-primary" />
                    <p className="text-sm">Acesso rapido ao login apos confirmacao</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="space-y-6">
                <FinTrackLogo />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Redefinir senha</h2>
                  <p className="text-sm text-muted-foreground">
                    Crie uma nova senha para entrar novamente no FinTrack.
                  </p>
                </div>
              </div>

              {!hasValidToken ? (
                <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive">
                  Link invalido ou ausente. Solicite uma nova recuperacao de senha no login.
                </div>
              ) : null}

              {isDone ? (
                <div className="rounded-sm border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                  Senha atualizada. Redirecionando para o login...
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={event => {
                        setPassword(event.target.value)
                        setTouched(prev => ({ ...prev, password: true }))
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      autoComplete="new-password"
                      placeholder="No minimo 6 caracteres"
                      className="h-11 pl-9 pr-10"
                      aria-invalid={passwordRequiredError ? 'true' : 'false'}
                      disabled={isSubmitting || isDone}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowPassword(current => !current)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      disabled={isSubmitting || isDone}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordRequiredError ? <p className="text-xs text-destructive">{passwordRequiredError}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={event => {
                        setConfirmPassword(event.target.value)
                        setTouched(prev => ({ ...prev, confirmPassword: true }))
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                      autoComplete="new-password"
                      placeholder="Repita a nova senha"
                      className="h-11 pl-9 pr-10"
                      aria-invalid={confirmPasswordRequiredError ? 'true' : 'false'}
                      disabled={isSubmitting || isDone}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowConfirmPassword(current => !current)}
                      aria-label={showConfirmPassword ? 'Ocultar confirmacao de senha' : 'Mostrar confirmacao de senha'}
                      disabled={isSubmitting || isDone}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmPasswordRequiredError ? (
                    <p className="text-xs text-destructive">{confirmPasswordRequiredError}</p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full gap-2"
                  disabled={isSubmitting || isDone || !hasValidToken}
                >
                  {isSubmitting ? 'Atualizando senha...' : 'Salvar nova senha'}
                  {!isSubmitting ? <ArrowRight className="size-4" /> : null}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Voltou a lembrar?{' '}
                  <Link
                    className="font-semibold text-foreground hover:text-primary hover:underline"
                    to={appPaths.login}
                  >
                    Entrar
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
