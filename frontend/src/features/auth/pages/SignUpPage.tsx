import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleCheckBig,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { appPaths, defaultAppPath } from '@/app/paths'
import { useAuth } from '@/features/auth/model/AuthProvider'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface SignUpTouchedFields {
  name: boolean
  email: boolean
  password: boolean
  confirmPassword: boolean
}

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, isSubmitting } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState<SignUpTouchedFields>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const nameRequiredError = touched.name && !name.trim() ? 'Preencha este campo.' : null
  const emailRequiredError = touched.email && !email.trim() ? 'Preencha este campo.' : null
  const passwordRequiredError = touched.password && !password ? 'Preencha este campo.' : null
  const confirmPasswordRequiredError =
    touched.confirmPassword && !confirmPassword ? 'Preencha este campo.' : null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    const rawPassword = password
    const rawConfirmPassword = confirmPassword

    if (!normalizedName || !normalizedEmail || !rawPassword || !rawConfirmPassword) {
      const message = 'Preencha nome, email e senha.'
      toast.error(message)
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      const message = 'Informe um email valido.'
      toast.error(message)
      return
    }

    if (rawPassword.length < 6) {
      const message = 'A senha precisa ter no minimo 6 caracteres.'
      toast.error(message)
      return
    }

    if (rawPassword !== rawConfirmPassword) {
      const message = 'As senhas precisam ser iguais.'
      toast.error(message)
      return
    }

    try {
      await signUp({ name: normalizedName, email: normalizedEmail, password: rawPassword })
      navigate(defaultAppPath, { replace: true })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar.'
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
                  Comece com sua familia
                </Badge>
                <h1 className="max-w-md text-5xl font-black leading-[1.02] tracking-tight text-foreground">
                  Crie sua conta e comece a organizar as financas da casa hoje.
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  Defina seu perfil e evolua com uma rotina financeira simples, visual e colaborativa.
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
                  <p className="text-sm">Visao unica para receitas, gastos e objetivos</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <p className="text-sm">Conta protegida e pronta para uso familiar</p>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheckBig className="size-5 text-primary" />
                  <p className="text-sm">Onboarding rapido em menos de 2 minutos</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="space-y-6">
                <FinTrackLogo />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Criar sua conta</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure seu acesso para organizar as financas da familia em um painel unico.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={event => { setName(event.target.value); setTouched(prev => ({ ...prev, name: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                      autoComplete="name"
                      placeholder="Seu nome"
                      className="h-11 pl-9"
                      aria-invalid={nameRequiredError ? 'true' : 'false'}
                    />
                  </div>
                  {nameRequiredError ? <p className="text-xs text-destructive">{nameRequiredError}</p> : null}
                </div>

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
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={event => { setPassword(event.target.value); setTouched(prev => ({ ...prev, password: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      autoComplete="new-password"
                      placeholder="No minimo 6 caracteres"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={event => { setConfirmPassword(event.target.value); setTouched(prev => ({ ...prev, confirmPassword: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                      autoComplete="new-password"
                      placeholder="Repita a senha"
                      className="h-11 pl-9 pr-10"
                      aria-invalid={confirmPasswordRequiredError ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowConfirmPassword(current => !current)}
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {confirmPasswordRequiredError ? (
                    <p className="text-xs text-destructive">{confirmPasswordRequiredError}</p>
                  ) : null}
                </div>

                <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                  {!isSubmitting ? <ArrowRight className="size-4" /> : null}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Ja tem conta?{' '}
                  <Link className="font-semibold text-foreground hover:text-primary hover:underline" to={appPaths.login}>
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
