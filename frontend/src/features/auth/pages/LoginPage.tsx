import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Lock, Mail } from 'lucide-react'

import { appPaths, defaultAppPath } from '@/app/paths'
import { useAuth } from '@/features/auth/model/AuthProvider'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface FromState {
  from?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isSubmitting } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fromState = location.state as FromState | null
  const nextPath = fromState?.from ?? defaultAppPath

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      await login({ email, password })
      navigate(nextPath, { replace: true })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nao foi possivel entrar.'
      setError(message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-15%] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-8%] h-96 w-96 rounded-full bg-amber-400/14 blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-90" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <Card className="w-full rounded-[28px] border bg-card/90 backdrop-blur">
          <CardHeader className="space-y-4">
            <FinTrackLogo className="justify-center" />
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl">Entrar no FinTrack</CardTitle>
              <CardDescription>
                Acesse seu painel financeiro familiar. Para testar rapido: `jeferson@fintrack.app` e
                `senha123`.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
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
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Falha no login</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ainda nao tem conta?{' '}
                <Link className="font-medium text-primary hover:underline" to={appPaths.signup}>
                  Criar cadastro
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
