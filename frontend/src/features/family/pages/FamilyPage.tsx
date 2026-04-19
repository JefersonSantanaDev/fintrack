import { FormEvent, useMemo, useState } from 'react'
import {
  Crown,
  Eye,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { useFamilyWorkspace } from '@/features/family/hooks/use-family-workspace'
import type {
  FamilyInviteMemberInput,
  FamilyMember,
  FamilyRole,
} from '@/features/family/services/family.service'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface InviteDraft {
  id: string
  name: string
  email: string
}

const inviteEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxInviteCount = 8

type EditableFamilyRole = Exclude<FamilyRole, 'owner'>

const roleLabel: Record<FamilyRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  viewer: 'Viewer',
}

const roleIcon: Record<FamilyRole, typeof Crown> = {
  owner: Crown,
  admin: ShieldCheck,
  viewer: Eye,
}

const roleBadgeVariant: Record<FamilyRole, 'success' | 'secondary' | 'outline'> = {
  owner: 'success',
  admin: 'secondary',
  viewer: 'outline',
}

function toMemberInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return 'FT'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function formatSentAt(value: string) {
  const sentAt = new Date(value)

  if (Number.isNaN(sentAt.getTime())) {
    return 'agora'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(sentAt)
}

function FamilyPageLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="rounded-lg bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-sm" />
          <Skeleton className="h-20 rounded-sm" />
          <Skeleton className="h-20 rounded-sm" />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg bg-card">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-24 rounded-sm" />
            <Skeleton className="h-24 rounded-sm" />
            <Skeleton className="h-24 rounded-sm" />
          </CardContent>
        </Card>

        <Card className="rounded-lg bg-card">
          <CardHeader>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 rounded-sm" />
            <Skeleton className="h-20 rounded-sm" />
            <Skeleton className="h-20 rounded-sm" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function FamilyPage() {
  const {
    workspace,
    isLoading,
    isBusy,
    actingMemberId,
    actingInvitationId,
    errorMessage,
    reload,
    inviteMembers,
    changeRole,
    removeMember,
    resendInvitation,
    cancelInvitation,
  } = useFamilyWorkspace()

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFormError, setInviteFormError] = useState<string | null>(null)
  const [inviteQueue, setInviteQueue] = useState<InviteDraft[]>([])
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<FamilyMember | null>(null)

  const canInviteMembers = workspace?.permissions.canInviteMembers ?? false
  const canManageMembers = workspace?.permissions.canManageMembers ?? false
  const canManageRoles = workspace?.permissions.canManageRoles ?? false

  const activeMembers = workspace?.members ?? []
  const invitations = workspace?.invitations ?? []

  const currentRoleLabel = workspace ? roleLabel[workspace.currentUserRole] : 'Membro'

  const inviteQueueCtaLabel = useMemo(() => {
    if (!inviteQueue.length) {
      return 'Enviar convites'
    }

    if (inviteQueue.length === 1) {
      return 'Enviar 1 convite'
    }

    return `Enviar ${inviteQueue.length} convites`
  }, [inviteQueue.length])

  const resetInviteForm = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteFormError(null)
    setInviteQueue([])
  }

  const addInviteToQueue = () => {
    if (inviteQueue.length >= maxInviteCount) {
      setInviteFormError(`Voce pode convidar no maximo ${maxInviteCount} membros por vez.`)
      return
    }

    const normalizedName = inviteName.trim()
    const normalizedEmail = inviteEmail.trim().toLowerCase()

    if (normalizedName.length < 2) {
      setInviteFormError('Informe um nome com pelo menos 2 caracteres.')
      return
    }

    if (!inviteEmailPattern.test(normalizedEmail)) {
      setInviteFormError('Informe um email valido para o membro.')
      return
    }

    const isDuplicatedInQueue = inviteQueue.some(member => member.email === normalizedEmail)
    if (isDuplicatedInQueue) {
      setInviteFormError('Esse email ja esta na fila de convites.')
      return
    }

    setInviteQueue(current => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: normalizedName,
        email: normalizedEmail,
      },
    ])

    setInviteName('')
    setInviteEmail('')
    setInviteFormError(null)
  }

  const handleQueueInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!inviteQueue.length) {
      setInviteFormError('Adicione ao menos 1 membro na fila para enviar convites.')
      return
    }

    const payload: FamilyInviteMemberInput[] = inviteQueue.map(member => ({
      name: member.name,
      email: member.email,
    }))

    const response = await inviteMembers(payload)
    if (!response) {
      return
    }

    const ignoredMessage =
      response.ignoredCount > 0
        ? ` ${response.ignoredCount} convite(s) foram ignorados por duplicidade ou membro existente.`
        : ''

    toast.success(`${response.message}${ignoredMessage}`)
    resetInviteForm()
    setIsInviteDialogOpen(false)
  }

  const handleRoleChange = async (member: FamilyMember, nextRole: EditableFamilyRole) => {
    if (member.role === nextRole) {
      return
    }

    const updated = await changeRole(member.id, nextRole)
    if (updated) {
      toast.success(`Papel de ${member.name} atualizado para ${roleLabel[nextRole]}.`)
    }
  }

  const openRemoveMemberDialog = (member: FamilyMember) => {
    setMemberPendingRemoval(member)
  }

  const closeRemoveMemberDialog = () => {
    if (isBusy) {
      return
    }

    setMemberPendingRemoval(null)
  }

  const handleConfirmRemoveMember = async () => {
    if (!memberPendingRemoval) {
      return
    }

    const removed = await removeMember(memberPendingRemoval.id)
    if (removed) {
      toast.success(`${memberPendingRemoval.name} foi removido(a) da familia.`)
      setMemberPendingRemoval(null)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    const resent = await resendInvitation(invitationId)
    if (resent) {
      toast.success('Convite reenviado com sucesso.')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const canceled = await cancelInvitation(invitationId)
    if (canceled) {
      toast.success('Convite cancelado com sucesso.')
    }
  }

  if (isLoading) {
    return <FamilyPageLoadingSkeleton />
  }

  if (!workspace) {
    return (
      <Card className="rounded-lg bg-card">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar a familia</CardTitle>
          <CardDescription>
            Tente novamente para recuperar os dados do seu espaco familiar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void reload()}>
            <RefreshCw />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <Alert variant="warning" className="border-warning/60 bg-warning/20">
          <Users />
          <AlertTitle>Atencao no fluxo da familia</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog
        open={Boolean(memberPendingRemoval)}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeRemoveMemberDialog()
          }
        }}
      >
        <DialogContent className="w-[min(96vw,34rem)] border-primary/35 bg-card p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>Remover membro da familia</DialogTitle>
            <DialogDescription>
              Essa acao remove o acesso da pessoa ao workspace familiar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="rounded-sm border border-destructive/35 bg-destructive/10 p-3">
              <p className="text-sm font-semibold text-foreground">
                {memberPendingRemoval?.name ?? 'Membro selecionado'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {memberPendingRemoval?.email ?? 'email@exemplo.com'}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Depois de remover, essa pessoa nao podera visualizar nem editar dados da familia.
            </p>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={closeRemoveMemberDialog}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy || !memberPendingRemoval}
              onClick={() => void handleConfirmRemoveMember()}
            >
              {isBusy ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Remover membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="rounded-lg bg-card">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle>Workspace familiar</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void reload()}
                  disabled={isBusy}
                  aria-label="Atualizar workspace familiar"
                >
                  <RefreshCw className={isBusy ? 'animate-spin' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                Atualizar workspace
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Gerencie membros, papeis e convites ativos no espaco {workspace.name}.
          </CardDescription>
          <div className="flex w-full flex-wrap items-center gap-2">
            <Badge variant="outline">{currentRoleLabel}</Badge>
            <Badge variant="secondary">{workspace.memberCount} membro(s)</Badge>
            <Badge variant="info">{invitations.length} convite(s) pendente(s)</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg bg-card">
          <CardHeader>
            <CardTitle>Membros da familia</CardTitle>
            <CardDescription>
              Defina papeis de colaboracao e mantenha apenas quem deve participar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeMembers.map(member => {
              const RoleIcon = roleIcon[member.role]
              const isRoleActionBusy = actingMemberId === member.id && isBusy
              const canEditRole =
                canManageRoles && !member.isCurrentUser && member.role !== 'owner'
              const canRemoveMember =
                canManageMembers && !member.isCurrentUser && member.role !== 'owner'

              return (
                <div key={member.id} className="rounded-sm border border-border bg-background/60 p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
                          {toMemberInitials(member.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-foreground">
                            {member.name}
                            {member.isCurrentUser ? ' (voce)' : ''}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>

                      <Badge variant={roleBadgeVariant[member.role]} className="shrink-0">
                        <RoleIcon />
                        {roleLabel[member.role]}
                      </Badge>
                    </div>

                    {canEditRole || canRemoveMember ? (
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        {canEditRole ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={member.role === 'admin' ? 'secondary' : 'outline'}
                              disabled={isBusy}
                              onClick={() => void handleRoleChange(member, 'admin')}
                            >
                              {isRoleActionBusy && member.role !== 'admin' ? (
                                <Loader2 className="animate-spin" />
                              ) : null}
                              Admin
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={member.role === 'viewer' ? 'secondary' : 'outline'}
                              disabled={isBusy}
                              onClick={() => void handleRoleChange(member, 'viewer')}
                            >
                              {isRoleActionBusy && member.role !== 'viewer' ? (
                                <Loader2 className="animate-spin" />
                              ) : null}
                              Viewer
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Esse papel nao pode ser alterado por este perfil.
                          </p>
                        )}

                        {canRemoveMember ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="justify-center border border-destructive/45 text-destructive hover:border-destructive/65 hover:bg-destructive/10 hover:text-destructive"
                            disabled={isBusy}
                            onClick={() => openRemoveMemberDialog(member)}
                          >
                            {isRoleActionBusy ? <Loader2 className="animate-spin" /> : <Trash2 />}
                            Remover
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-lg bg-card">
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Convites pendentes</CardTitle>
                <CardDescription>
                  Reenvie ou cancele convites antes de novos membros entrarem na familia.
                </CardDescription>
              </div>
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={nextOpen => {
                  setIsInviteDialogOpen(nextOpen)
                  if (!nextOpen) {
                    resetInviteForm()
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={!canInviteMembers}
                    title={canInviteMembers ? undefined : 'Seu perfil nao pode convidar membros.'}
                  >
                    <Plus />
                    Novo convite
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[min(96vw,64rem)] sm:max-w-4xl border-primary/35 bg-card p-0">
                  <DialogHeader className="border-b border-border px-8 py-6">
                    <DialogTitle>Convidar membros da familia</DialogTitle>
                    <DialogDescription>
                      Adicione nome e email para montar sua fila de convites desta rodada.
                    </DialogDescription>
                  </DialogHeader>

                  <form className="space-y-6 px-8 py-6" onSubmit={event => void handleQueueInviteSubmit(event)}>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="family-invite-name">Nome</Label>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="family-invite-name"
                            value={inviteName}
                            onChange={event => setInviteName(event.target.value)}
                            placeholder="Ex: Maria Santana"
                            className="h-11 pl-10"
                            disabled={isBusy}
                            maxLength={80}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="family-invite-email">Email</Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="family-invite-email"
                            value={inviteEmail}
                            onChange={event => setInviteEmail(event.target.value)}
                            placeholder="maria@exemplo.com"
                            className="h-11 pl-10"
                            disabled={isBusy}
                            maxLength={254}
                            onKeyDown={event => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                addInviteToQueue()
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-11 w-full sm:w-auto sm:min-w-44"
                        onClick={addInviteToQueue}
                        disabled={isBusy}
                      >
                        <Plus />
                        Adicionar
                      </Button>
                    </div>

                    {inviteFormError ? (
                      <div className="rounded-sm border border-warning/60 bg-warning/20 px-3 py-2 text-sm text-warning-foreground">
                        {inviteFormError}
                      </div>
                    ) : null}

                    <div className="space-y-2 rounded-sm border border-border bg-background/60 p-3">
                      {inviteQueue.length ? (
                        inviteQueue.map(member => (
                          <div
                            key={member.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                              <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={isBusy}
                              onClick={() =>
                                setInviteQueue(current => current.filter(item => item.id !== member.id))
                              }
                            >
                              <X />
                              Remover
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-sm border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
                          Nenhum convite na fila ainda.
                        </p>
                      )}
                    </div>

                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Convites na fila: {inviteQueue.length}/{maxInviteCount}
                    </p>

                    <DialogFooter className="border-t border-border pt-5 sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetInviteForm()
                          setIsInviteDialogOpen(false)
                        }}
                        disabled={isBusy}
                      >
                        Cancelar
                      </Button>

                      <Button type="submit" disabled={isBusy || inviteQueue.length === 0}>
                        {isBusy ? <Loader2 className="animate-spin" /> : <Users />}
                        {inviteQueueCtaLabel}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="space-y-3">
              {invitations.length ? (
                invitations.map(invitation => (
                  <div
                    key={invitation.id}
                    className="rounded-sm border border-border bg-background/60 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{invitation.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{invitation.email}</p>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Ultimo envio: {formatSentAt(invitation.sentAt)} • por {invitation.inviterName}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!canInviteMembers || isBusy}
                        onClick={() => void handleResendInvitation(invitation.id)}
                      >
                        {actingInvitationId === invitation.id && isBusy ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <RefreshCw />
                        )}
                        Reenviar
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="border border-destructive/45 text-destructive hover:border-destructive/65 hover:bg-destructive/10 hover:text-destructive"
                        disabled={!canInviteMembers || isBusy}
                        onClick={() => void handleCancelInvitation(invitation.id)}
                      >
                        {actingInvitationId === invitation.id && isBusy ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <X />
                        )}
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-sm border border-dashed border-border px-4 py-5">
                  <p className="text-sm font-medium">Sem convites pendentes no momento.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Convide novos membros para montar uma colaboracao familiar mais completa.
                  </p>
                </div>
              )}

              {!canInviteMembers ? (
                <p className="text-xs text-muted-foreground">
                  Seu perfil atual pode visualizar convites, mas nao pode criar novos convites.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-card">
            <CardHeader>
              <CardTitle>Politica de acesso</CardTitle>
              <CardDescription>
                Regras atuais para manter seguranca e clareza no trabalho da familia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                <p className="font-medium text-foreground">Owner</p>
                <p className="mt-1">Pode convidar, remover membros e alterar papeis.</p>
              </div>
              <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                <p className="font-medium text-foreground">Admin</p>
                <p className="mt-1">Pode convidar membros e operar o fluxo financeiro.</p>
              </div>
              <div className="rounded-sm border border-border bg-background/50 px-3 py-2">
                <p className="font-medium text-foreground">Viewer</p>
                <p className="mt-1">Acompanha dados, sem alteracoes de membros ou papeis.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
