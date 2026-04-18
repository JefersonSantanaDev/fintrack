import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleCheckBig,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import { appPaths } from '@/app/paths'
import { requestPasswordRecovery } from '@/features/auth/services/auth.service'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)

  const emailRequiredError = touchedEmail && !email.trim() ? 'Preencha este campo.' : null

  const submitRequest = async () => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      toast.error('Informe seu email para recuperar a senha.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      toast.error('Informe um email valido.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await requestPasswordRecovery(normalizedEmail)
      setIsSubmitted(true)
      toast.success(response.message)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel solicitar recuperacao de senha.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouchedEmail(true)
    await submitRequest()
  }

  const handleResend = async () => {
    setTouchedEmail(true)
    await submitRequest()
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
                  Recuperacao segura
                </Badge>
                <h1 className="max-w-md text-5xl font-black leading-[1.02] tracking-tight text-foreground">
                  Recupere o acesso da sua familia em poucos passos.
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  Enviamos orientacoes para seu email com o mesmo padrao de seguranca do FinTrack.
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
                    <ChartNoAxesCombined className="size-5 text-primary" />
                    <p className="text-sm">Fluxo protegido com mensagens discretas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-5 text-primary" />
                    <p className="text-sm">Sem vazamento de informacao sobre contas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CircleCheckBig className="size-5 text-primary" />
                    <p className="text-sm">Retorno rapido para continuar no app</p>
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
                  <h2 className="text-3xl font-bold tracking-tight">Esqueci minha senha</h2>
                  <p className="text-sm text-muted-foreground">
                    Informe o email da conta para receber as instrucoes de recuperacao.
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
                      onChange={event => {
                        setEmail(event.target.value)
                        setTouchedEmail(true)
                      }}
                      onBlur={() => setTouchedEmail(true)}
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

                <Button type="submit" className="h-11 w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar instrucoes'}
                  {!isSubmitting ? <ArrowRight className="size-4" /> : null}
                </Button>

                {isSubmitted ? (
                  <div className="rounded-sm border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                    Solicitação registrada. Se o email estiver cadastrado, voce recebera as instrucoes de recuperacao.
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <Link
                    className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                    to={appPaths.login}
                  >
                    Voltar para login
                  </Link>

                  {isSubmitted ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10"
                      onClick={handleResend}
                      disabled={isSubmitting}
                    >
                      Reenviar email
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
