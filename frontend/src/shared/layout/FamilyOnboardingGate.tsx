import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react'

import { appPaths } from '@/app/paths'
import { useFamilyOnboarding } from '@/features/dashboard/hooks/use-family-onboarding'
import { FinTrackLogo } from '@/shared/branding/FinTrackLogo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface FamilyOnboardingGateProps {
  enabled: boolean
}

type DecisionMode = 'invite' | 'solo' | null

interface InviteDraft {
  id: string
  name: string
  email: string
}

const inviteEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxInviteCount = 8

function formatMemberLabel(count: number) {
  return count === 1 ? '1 membro' : `${count} membros`
}

export function FamilyOnboardingGate({ enabled }: FamilyOnboardingGateProps) {
  const navigate = useNavigate()
  const {
    onboarding,
    isLoading,
    isDismissing,
    isInviting,
    hasLoadedSuccessfully,
    errorMessage,
    dismiss,
    inviteMembers,
    reload,
  } = useFamilyOnboarding()

  const [decisionMode, setDecisionMode] = useState<DecisionMode>(null)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [pendingInvites, setPendingInvites] = useState<InviteDraft[]>([])
  const [inviteFormError, setInviteFormError] = useState<string | null>(null)

  const shouldShowOnboarding = onboarding?.shouldShowOnboarding ?? false
  const shouldBlockLoading = enabled && isLoading
  const shouldBlockOnLoadFailure = enabled && !isLoading && !hasLoadedSuccessfully
  const isModalOpen = enabled && !isLoading && shouldShowOnboarding
  const familyName = onboarding?.family?.name ?? 'Familia FinTrack'

  const isBusy = isDismissing || isInviting
  const inviteCtaLabel = useMemo(() => {
    if (!pendingInvites.length) {
      return 'Convidar membros agora'
    }

    return `Convidar ${formatMemberLabel(pendingInvites.length)} e continuar`
  }, [pendingInvites.length])

  const handleContinueSolo = async () => {
    setDecisionMode('solo')
    const dismissed = await dismiss()
    if (dismissed) {
      setDecisionMode(null)
      return
    }
    setDecisionMode(null)
  }

  const handleAddInvite = () => {
    if (pendingInvites.length >= maxInviteCount) {
      setInviteFormError(`Voce pode convidar no maximo ${maxInviteCount} membros por vez.`)
      return
    }

    const nextName = inviteName.trim()
    const nextEmail = inviteEmail.trim().toLowerCase()

    if (nextName.length < 2) {
      setInviteFormError('Informe um nome com pelo menos 2 caracteres.')
      return
    }

    if (!inviteEmailPattern.test(nextEmail)) {
      setInviteFormError('Informe um email valido para o membro.')
      return
    }

    const isDuplicated = pendingInvites.some(member => member.email === nextEmail)
    if (isDuplicated) {
      setInviteFormError('Esse email ja foi adicionado na lista.')
      return
    }

    setPendingInvites(current => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: nextName,
        email: nextEmail,
      },
    ])
    setInviteName('')
    setInviteEmail('')
    setInviteFormError(null)
  }

  const handleRemoveInvite = (inviteId: string) => {
    setPendingInvites(current => current.filter(member => member.id !== inviteId))
    setInviteFormError(null)
  }

  const handleInviteNow = async () => {
    if (!pendingInvites.length) {
      setInviteFormError('Adicione ao menos 1 membro para convidar.')
      return
    }

    setDecisionMode('invite')

    const inviteResult = await inviteMembers(
      pendingInvites.map(member => ({
        name: member.name,
        email: member.email,
      })),
    )

    if (!inviteResult) {
      setDecisionMode(null)
      return
    }

    const dismissed = await dismiss()

    if (dismissed) {
      setPendingInvites([])
      setInviteFormError(null)
      navigate(appPaths.family)
      setDecisionMode(null)
      return
    }

    setDecisionMode(null)
  }

  if (!enabled) {
    return null
  }

  return (
    <>
      {shouldBlockLoading ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-[min(92vw,28rem)] rounded-lg border border-border bg-card p-6 text-center shadow-[var(--shadow-level-2)]">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-sm border border-border bg-background">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
            <p className="text-base font-semibold">Preparando seu onboarding</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos configurando o ambiente da sua familia para comecar com seguranca.
            </p>
          </div>
        </div>
      ) : null}

      {shouldBlockOnLoadFailure ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/76 backdrop-blur-md">
          <div className="w-[min(92vw,30rem)] rounded-lg border border-primary/35 bg-card p-6 shadow-[var(--shadow-level-2)]">
            <p className="text-base font-semibold">Nao foi possivel validar o onboarding</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Para sua seguranca, precisamos concluir essa etapa antes de liberar o sistema.
            </p>
            {errorMessage ? (
              <p className="mt-4 rounded-sm border border-warning/70 bg-warning/20 px-3 py-2 text-sm text-warning-foreground">
                {errorMessage}
              </p>
            ) : null}
            <Button className="mt-5 w-full" onClick={() => void reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={isModalOpen} onOpenChange={() => undefined}>
        <DialogContent
          showClose={false}
          className="flex max-h-[calc(100vh-1.5rem)] flex-col border-primary/30 bg-card p-0 sm:max-h-[calc(100vh-2.5rem)] sm:max-w-3xl lg:max-w-4xl"
          overlayClassName="bg-black/76 backdrop-blur-md"
          onEscapeKeyDown={event => event.preventDefault()}
          onPointerDownOutside={event => event.preventDefault()}
          onInteractOutside={event => event.preventDefault()}
        >
          <div className="border-b border-border bg-[radial-gradient(circle_at_top,var(--primary)/22,transparent_60%)] px-5 py-4 sm:px-7 sm:py-5">
            <DialogHeader showBrand={false} className="space-y-3.5 text-left">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FinTrackLogo variant="icon" />
                  <div>
                    <p className="text-base font-semibold">Boas-vindas ao FinTrack</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      configuracao inicial obrigatoria
                    </p>
                  </div>
                </div>
                <Badge variant="success">MVP familiar</Badge>
              </div>
              <DialogTitle className="max-w-3xl text-2xl leading-tight sm:text-3xl">
                Como voce quer iniciar sua familia financeira?
              </DialogTitle>
              <DialogDescription className="max-w-3xl text-sm leading-relaxed sm:text-base">
                Adicione os primeiros membros agora com nome e email, ou siga sozinho e convide
                depois na aba Familia.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
            <div className="rounded-sm border border-border bg-background p-4">
              <p className="flex items-center gap-2 text-base font-semibold">
                <Users className="size-5 text-primary" />
                Familia atual: {familyName}
              </p>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Seu acesso owner ja foi criado. Para continuar, escolha entre convidar membros agora
                ou finalizar onboarding sozinho.
              </p>
            </div>

            <div className="rounded-sm border border-border bg-background p-4">
              <div className="mb-3">
                <p className="text-base font-semibold">Convites iniciais da familia</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Preencha nome e email para cada membro que voce deseja convidar neste momento.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="family-onboarding-member-name">Nome do membro</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="family-onboarding-member-name"
                      value={inviteName}
                      onChange={event => setInviteName(event.target.value)}
                      placeholder="Ex: Maria Santana"
                      className="h-11 pl-10"
                      disabled={isBusy}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="family-onboarding-member-email">Email do membro</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="family-onboarding-member-email"
                      value={inviteEmail}
                      onChange={event => setInviteEmail(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleAddInvite()
                        }
                      }}
                      placeholder="maria@exemplo.com"
                      className="h-11 pl-10"
                      disabled={isBusy}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 sm:min-w-40"
                  onClick={handleAddInvite}
                  disabled={isBusy}
                >
                  <Plus />
                  Adicionar
                </Button>
              </div>

              {inviteFormError ? (
                <div className="mt-3 rounded-sm border border-warning/70 bg-warning/20 px-3 py-2 text-sm text-warning-foreground">
                  {inviteFormError}
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                {pendingInvites.length ? (
                  pendingInvites.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{member.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInvite(member.id)}
                        disabled={isBusy}
                      >
                        <Trash2 />
                        Remover
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-sm border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
                    Nenhum membro adicionado ainda.
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                Convites na fila: {pendingInvites.length}/{maxInviteCount}
              </p>
            </div>

            {errorMessage ? (
              <div className="rounded-sm border border-warning/70 bg-warning/20 px-4 py-3 text-sm text-warning-foreground">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-between sm:px-7 sm:py-5">
            <Button
              variant="outline"
              className="w-full text-base sm:min-h-12 sm:flex-1"
              onClick={() => void handleContinueSolo()}
              disabled={isBusy}
            >
              {decisionMode === 'solo' ? (
                <>
                  <Loader2 className="animate-spin" />
                  Salvando...
                </>
              ) : (
                'Continuar sozinho por enquanto'
              )}
            </Button>

            <Button
              className="w-full text-base sm:min-h-12 sm:flex-1"
              onClick={() => void handleInviteNow()}
              disabled={isBusy || pendingInvites.length === 0}
            >
              {decisionMode === 'invite' ? (
                <>
                  <Loader2 className="animate-spin" />
                  Enviando convites...
                </>
              ) : (
                <>
                  <UserPlus />
                  {inviteCtaLabel}
                  <ArrowRight />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
