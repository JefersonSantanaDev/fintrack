import { useEffect, useRef, useState } from 'react'
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
import { ApiRequestError } from '@/shared/lib/api-client'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type SignUpStep = 'start' | 'verify'
const OTP_LENGTH = 6

function createEmptyOtpDigits() {
  return Array.from({ length: OTP_LENGTH }, () => '')
}

interface SignUpTouchedFields {
  name: boolean
  email: boolean
  password: boolean
  confirmPassword: boolean
  verificationCode: boolean
}

function extractRetryInSeconds(message: string) {
  const match = message.match(/(\d+)\s*s\b/i)
  if (!match) {
    return 60
  }

  const retryInSeconds = Number(match[1])
  return Number.isFinite(retryInSeconds) && retryInSeconds > 0 ? retryInSeconds : 60
}

function formatCountdown(seconds: number) {
  if (seconds <= 0) {
    return '0s'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  if (remainingSeconds === 0) {
    return `${minutes}min`
  }

  return `${minutes}min ${remainingSeconds}s`
}

export function SignUpPage() {
  const navigate = useNavigate()
  const { startSignUp, verifySignUp, resendSignUpCode, isSubmitting } = useAuth()

  const [step, setStep] = useState<SignUpStep>('start')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationDigits, setVerificationDigits] = useState<string[]>(() => createEmptyOtpDigits())
  const [pendingEmail, setPendingEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendRetryInSeconds, setResendRetryInSeconds] = useState(0)
  const [codeExpiresInSeconds, setCodeExpiresInSeconds] = useState(0)
  const [touched, setTouched] = useState<SignUpTouchedFields>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    verificationCode: false,
  })
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([])

  const verificationCode = verificationDigits.join('')

  const nameRequiredError = touched.name && !name.trim() ? 'Preencha este campo.' : null
  const emailRequiredError = touched.email && !email.trim() ? 'Preencha este campo.' : null
  const passwordRequiredError = touched.password && !password ? 'Preencha este campo.' : null
  const confirmPasswordRequiredError =
    touched.confirmPassword && !confirmPassword ? 'Preencha este campo.' : null
  const verificationCodeError =
    touched.verificationCode && !/^\d{6}$/.test(verificationCode.trim())
      ? 'Digite os 6 digitos do codigo.'
      : null

  const focusOtpInput = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, OTP_LENGTH - 1))
    otpInputRefs.current[boundedIndex]?.focus()
  }

  const handleOtpChange = (index: number, rawValue: string) => {
    const normalizedDigits = rawValue.replace(/\D/g, '')
    setTouched(prev => ({ ...prev, verificationCode: true }))

    if (!normalizedDigits) {
      setVerificationDigits(current => {
        const next = [...current]
        next[index] = ''
        return next
      })
      return
    }

    setVerificationDigits(current => {
      const next = [...current]

      if (normalizedDigits.length === 1) {
        next[index] = normalizedDigits
        return next
      }

      for (let offset = 0; offset < normalizedDigits.length; offset += 1) {
        const targetIndex = index + offset
        if (targetIndex >= OTP_LENGTH) {
          break
        }
        next[targetIndex] = normalizedDigits[offset] ?? ''
      }

      return next
    })

    if (normalizedDigits.length === 1) {
      focusOtpInput(index + 1)
      return
    }

    focusOtpInput(index + normalizedDigits.length)
  }

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      setTouched(prev => ({ ...prev, verificationCode: true }))

      setVerificationDigits(current => {
        const next = [...current]

        if (next[index]) {
          next[index] = ''
          return next
        }

        const previousIndex = Math.max(index - 1, 0)
        if (index > 0) {
          next[previousIndex] = ''
          window.requestAnimationFrame(() => focusOtpInput(previousIndex))
        }

        return next
      })
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusOtpInput(index - 1)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusOtpInput(index + 1)
      return
    }

    if (event.key === ' ') {
      event.preventDefault()
    }
  }

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()

    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pastedDigits) {
      return
    }

    setTouched(prev => ({ ...prev, verificationCode: true }))
    setVerificationDigits(() => {
      const next = createEmptyOtpDigits()
      for (let index = 0; index < OTP_LENGTH; index += 1) {
        next[index] = pastedDigits[index] ?? ''
      }
      return next
    })

    focusOtpInput(pastedDigits.length - 1)
  }

  useEffect(() => {
    if (resendRetryInSeconds <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setResendRetryInSeconds(current => {
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
  }, [resendRetryInSeconds])

  useEffect(() => {
    if (codeExpiresInSeconds <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCodeExpiresInSeconds(current => {
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
  }, [codeExpiresInSeconds])

  useEffect(() => {
    if (step !== 'verify') {
      return
    }

    window.requestAnimationFrame(() => {
      focusOtpInput(0)
    })
  }, [step])

  const handleStartSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(prev => ({
      ...prev,
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    }))

    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    const rawPassword = password
    const rawConfirmPassword = confirmPassword

    if (!normalizedName || !normalizedEmail || !rawPassword || !rawConfirmPassword) {
      toast.error('Preencha nome, email e senha.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      toast.error('Informe um email valido.')
      return
    }

    if (rawPassword.length < 6) {
      toast.error('A senha precisa ter no minimo 6 caracteres.')
      return
    }

    if (rawPassword !== rawConfirmPassword) {
      toast.error('As senhas precisam ser iguais.')
      return
    }

    try {
      const challenge = await startSignUp({
        name: normalizedName,
        email: normalizedEmail,
        password: rawPassword,
      })
      setPendingEmail(challenge.email)
      setStep('verify')
      setVerificationDigits(createEmptyOtpDigits())
      setTouched(prev => ({ ...prev, verificationCode: false }))
      setResendRetryInSeconds(challenge.resendAvailableInSeconds)
      setCodeExpiresInSeconds(challenge.expiresInSeconds)
      toast.success(challenge.message)
    } catch (submitError) {
      if (submitError instanceof ApiRequestError && submitError.statusCode === 429) {
        const retryInSeconds = extractRetryInSeconds(submitError.message)
        setResendRetryInSeconds(retryInSeconds)
      }

      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel iniciar cadastro.'
      toast.error(message)
    }
  }

  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(prev => ({ ...prev, verificationCode: true }))

    const code = verificationCode.trim()

    if (!/^\d{6}$/.test(code)) {
      toast.error('Digite o codigo de 6 digitos.')
      return
    }

    try {
      await verifySignUp({ email: pendingEmail, code })
      toast.success('Conta verificada com sucesso.')
      navigate(defaultAppPath, { replace: true })
    } catch (submitError) {
      if (submitError instanceof ApiRequestError && submitError.statusCode === 429) {
        const retryInSeconds = extractRetryInSeconds(submitError.message)
        setResendRetryInSeconds(current => (current > retryInSeconds ? current : retryInSeconds))
      }

      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel verificar o codigo.'
      toast.error(message)
    }
  }

  const handleResendCode = async () => {
    if (!pendingEmail) {
      toast.error('Informe o email para reenviar o codigo.')
      return
    }

    if (resendRetryInSeconds > 0) {
      toast.error(`Aguarde ${resendRetryInSeconds}s para reenviar.`)
      return
    }

    try {
      const challenge = await resendSignUpCode(pendingEmail)
      setResendRetryInSeconds(challenge.resendAvailableInSeconds)
      setCodeExpiresInSeconds(challenge.expiresInSeconds)
      toast.success(challenge.message)
    } catch (submitError) {
      if (submitError instanceof ApiRequestError && submitError.statusCode === 429) {
        const retryInSeconds = extractRetryInSeconds(submitError.message)
        setResendRetryInSeconds(retryInSeconds)
      }

      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel reenviar o codigo.'
      toast.error(message)
    }
  }

  const moveBackToStart = () => {
    setStep('start')
    setPendingEmail('')
    setVerificationDigits(createEmptyOtpDigits())
    setResendRetryInSeconds(0)
    setCodeExpiresInSeconds(0)
    setTouched(prev => ({ ...prev, verificationCode: false }))
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
                    ].map((stepItem, index) => (
                      <div key={stepItem.label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{stepItem.label}</span>
                          <span>{stepItem.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <motion.div
                            className="h-1.5 rounded-full bg-primary"
                            initial={{ width: '12%' }}
                            animate={{ width: `${stepItem.value}%` }}
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
                  <h2 className="text-3xl font-bold tracking-tight">
                    {step === 'start' ? 'Criar sua conta' : 'Verificar cadastro'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {step === 'start'
                      ? 'Primeiro enviamos um codigo para confirmar seu email com seguranca.'
                      : `Digite o codigo enviado para ${pendingEmail}.`}
                  </p>
                </div>
              </div>

              {step === 'start' ? (
                <form className="space-y-5" onSubmit={handleStartSubmit} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={event => {
                          setName(event.target.value)
                          setTouched(prev => ({ ...prev, name: true }))
                        }}
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
                        onChange={event => {
                          setEmail(event.target.value)
                          setTouched(prev => ({ ...prev, email: true }))
                        }}
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
                        onChange={event => {
                          setPassword(event.target.value)
                          setTouched(prev => ({ ...prev, password: true }))
                        }}
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
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                        onChange={event => {
                          setConfirmPassword(event.target.value)
                          setTouched(prev => ({ ...prev, confirmPassword: true }))
                        }}
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
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {confirmPasswordRequiredError ? (
                      <p className="text-xs text-destructive">{confirmPasswordRequiredError}</p>
                    ) : null}
                  </div>

                  <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando codigo...' : 'Continuar'}
                    {!isSubmitting ? <ArrowRight className="size-4" /> : null}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Ja tem conta?{' '}
                    <Link className="font-semibold text-foreground hover:text-primary hover:underline" to={appPaths.login}>
                      Entrar
                    </Link>
                  </p>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleVerifySubmit} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Codigo de verificacao</Label>
                    <div className="space-y-2" onPaste={handleOtpPaste}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {verificationDigits.map((digit, index) => (
                          <input
                            key={`otp-${index + 1}`}
                            ref={element => {
                              otpInputRefs.current[index] = element
                            }}
                            id={index === 0 ? 'verificationCode' : undefined}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? 'one-time-code' : 'off'}
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={event => handleOtpChange(index, event.target.value)}
                            onKeyDown={event => handleOtpKeyDown(index, event)}
                            onBlur={() => setTouched(prev => ({ ...prev, verificationCode: true }))}
                            aria-label={`Digito ${index + 1} do codigo`}
                            aria-invalid={verificationCodeError ? 'true' : 'false'}
                            className="h-12 w-11 rounded-md border border-border bg-card text-center text-2xl font-black text-foreground caret-[#faff69] outline-none transition-[border-color,box-shadow,color] focus:border-[#faff69] focus:text-[#faff69] focus:shadow-[0_0_0_3px_rgba(250,255,105,0.2)] focus-visible:outline-none focus-visible:ring-0 sm:h-14 sm:w-12"
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Dica: voce pode colar o codigo completo.
                      </p>
                    </div>
                    {verificationCodeError ? (
                      <p className="text-xs text-destructive">{verificationCodeError}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2 rounded-sm border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    <p>Codigo expira em: {formatCountdown(codeExpiresInSeconds)}</p>
                    <p>
                      Reenvio disponivel em:{' '}
                      {resendRetryInSeconds > 0 ? formatCountdown(resendRetryInSeconds) : 'agora'}
                    </p>
                  </div>

                  <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Verificando...' : 'Finalizar cadastro'}
                    {!isSubmitting ? <ArrowRight className="size-4" /> : null}
                  </Button>

                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 min-w-[170px] px-4"
                      onClick={moveBackToStart}
                    >
                      Alterar dados
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10"
                      onClick={handleResendCode}
                      disabled={isSubmitting || resendRetryInSeconds > 0}
                    >
                      {resendRetryInSeconds > 0
                        ? `Reenviar em ${formatCountdown(resendRetryInSeconds)}`
                        : 'Reenviar codigo'}
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Ja tem conta?{' '}
                    <Link className="font-semibold text-foreground hover:text-primary hover:underline" to={appPaths.login}>
                      Entrar
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
