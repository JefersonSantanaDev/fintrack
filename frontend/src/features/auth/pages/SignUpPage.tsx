import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, KeyRound, Mail, UserRound } from 'lucide-react'

import { appPaths, defaultAppPath } from '@/app/paths'
import { useAuth } from '@/features/auth/model/AuthProvider'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, isSubmitting } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas precisam ser iguais.')
      return
    }

    try {
      await signUp({ name, email, password })
      navigate(defaultAppPath, { replace: true })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel cadastrar.'
      setError(message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-20%] h-96 w-96 rounded-full bg-emerald-500/18 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-96 w-96 rounded-full bg-teal-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-90" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <Card className="w-full rounded-[28px] border bg-card/90 backdrop-blur">
          <CardHeader className="space-y-4">
            <FinTrackLogo className="justify-center" />
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl">Criar conta</CardTitle>
              <CardDescription>
                Configure seu acesso para organizar as financas da familia em um painel unico.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Seu nome"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="No minimo 6 caracteres"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Falha no cadastro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ja tem conta?{' '}
                <Link className="font-medium text-primary hover:underline" to={appPaths.login}>
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
