import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleCheckBig,
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
  const [touched, setTouched] = useState<SignUpTouchedFields>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const nameRequiredError = touched.name && !name.trim() ? 'Preencha este campo.' : null
  const emailRequiredError = touched.email && !email.trim() ? 'Preencha este campo.' : null
  const passwordRequiredError = touched.password && !password.trim() ? 'Preencha este campo.' : null
  const confirmPasswordRequiredError =
    touched.confirmPassword && !confirmPassword.trim() ? 'Preencha este campo.' : null

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
    const normalizedPassword = password.trim()
    const normalizedConfirmPassword = confirmPassword.trim()

    if (!normalizedName || !normalizedEmail || !normalizedPassword || !normalizedConfirmPassword) {
      const message = 'Preencha nome, email e senha.'
      toast.error(message)
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      const message = 'Informe um email valido.'
      toast.error(message)
      return
    }

    if (normalizedPassword.length < 6) {
      const message = 'A senha precisa ter no minimo 6 caracteres.'
      toast.error(message)
      return
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      const message = 'As senhas precisam ser iguais.'
      toast.error(message)
      return
    }

    try {
      await signUp({ name: normalizedName, email: normalizedEmail, password: normalizedPassword })
      navigate(defaultAppPath, { replace: true })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar.'
      toast.error(message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-18%] h-96 w-96 rounded-full bg-cyan-500/18 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-emerald-500/14 blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-90" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[30px] border bg-card/80 shadow-2xl shadow-cyan-500/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden min-h-[640px] overflow-hidden lg:block">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-600 via-sky-600 to-emerald-600" />
            <div className="absolute -left-20 bottom-8 h-56 w-56 rounded-full border border-white/20 bg-white/10 blur-sm" />
            <div className="absolute -right-24 top-16 h-72 w-72 rounded-full border border-white/20 bg-cyan-200/20 blur-sm" />

            <div className="relative flex h-full flex-col p-10 text-white">
              <div className="space-y-5">
                <Badge className="rounded-full border-white/25 bg-white/15 px-3 py-1 text-white hover:bg-white/20">
                  Comece com sua familia
                </Badge>
                <h1 className="max-w-md text-4xl font-semibold leading-tight">
                  Crie sua conta e comece a organizar as financas da casa hoje.
                </h1>
                <p className="max-w-md text-sm text-cyan-50/90">
                  Defina seu perfil e evolua com uma rotina financeira simples, visual e colaborativa.
                </p>
              </div>

              <motion.div
                className="relative mt-8 px-1"
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
                        <div className="flex items-center justify-between text-[11px] text-emerald-50/80">
                          <span>{step.label}</span>
                          <span>{step.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/20">
                          <motion.div
                            className="h-1.5 rounded-full bg-linear-to-r from-emerald-100 to-cyan-200"
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

              <div className="mt-auto space-y-4 rounded-3xl border border-white/20 bg-black/20 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <ChartNoAxesCombined className="size-5" />
                  <p className="text-sm">Visao unica para receitas, gastos e objetivos</p>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5" />
                  <p className="text-sm">Conta protegida e pronta para uso familiar</p>
                </div>
                <div className="flex items-center gap-3">
                  <CircleCheckBig className="size-5" />
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
                  <h2 className="text-3xl font-semibold tracking-tight">Criar sua conta</h2>
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
                      type="password"
                      value={password}
                      onChange={event => { setPassword(event.target.value); setTouched(prev => ({ ...prev, password: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      autoComplete="new-password"
                      placeholder="No minimo 6 caracteres"
                      className="h-11 pl-9"
                      aria-invalid={passwordRequiredError ? 'true' : 'false'}
                    />
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
                      type="password"
                      value={confirmPassword}
                      onChange={event => { setConfirmPassword(event.target.value); setTouched(prev => ({ ...prev, confirmPassword: true })) }}
                      onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                      autoComplete="new-password"
                      placeholder="Repita a senha"
                      className="h-11 pl-9"
                      aria-invalid={confirmPasswordRequiredError ? 'true' : 'false'}
                    />
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
                  <Link className="font-medium text-primary hover:underline" to={appPaths.login}>
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
