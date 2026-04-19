import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApiRequestError } from '@/shared/lib/api-client'
import {
  cancelFamilyInvitation,
  getFamilyWorkspace,
  inviteFamilyMembers,
  removeFamilyMember,
  resendFamilyInvitation,
  updateFamilyMemberRole,
  type FamilyInviteMemberInput,
  type FamilyInviteMembersResponse,
  type FamilyWorkspace,
} from '@/features/family/services/family.service'

interface UseFamilyWorkspaceResult {
  workspace: FamilyWorkspace | null
  isLoading: boolean
  isBusy: boolean
  actingMemberId: string | null
  actingInvitationId: string | null
  errorMessage: string | null
  reload: () => Promise<void>
  inviteMembers: (members: FamilyInviteMemberInput[]) => Promise<FamilyInviteMembersResponse | null>
  changeRole: (memberUserId: string, role: 'admin' | 'viewer') => Promise<boolean>
  removeMember: (memberUserId: string) => Promise<boolean>
  resendInvitation: (invitationId: string) => Promise<boolean>
  cancelInvitation: (invitationId: string) => Promise<boolean>
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function useFamilyWorkspace(): UseFamilyWorkspaceResult {
  const [workspace, setWorkspace] = useState<FamilyWorkspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [actingMemberId, setActingMemberId] = useState<string | null>(null)
  const [actingInvitationId, setActingInvitationId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true)

    try {
      setErrorMessage(null)
      const payload = await getFamilyWorkspace()
      setWorkspace(payload)
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel carregar os dados da familia.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadWorkspace()
  }, [loadWorkspace])

  const inviteMembersAction = useCallback(async (members: FamilyInviteMemberInput[]) => {
    setIsBusy(true)

    try {
      setErrorMessage(null)
      const response = await inviteFamilyMembers(members)
      await loadWorkspace()
      return response
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel convidar membros agora.'))
      return null
    } finally {
      setIsBusy(false)
    }
  }, [loadWorkspace])

  const changeRole = useCallback(async (memberUserId: string, role: 'admin' | 'viewer') => {
    setIsBusy(true)
    setActingMemberId(memberUserId)

    try {
      setErrorMessage(null)
      await updateFamilyMemberRole(memberUserId, role)
      await loadWorkspace()
      return true
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel atualizar o papel do membro.'))
      return false
    } finally {
      setIsBusy(false)
      setActingMemberId(null)
    }
  }, [loadWorkspace])

  const removeMember = useCallback(async (memberUserId: string) => {
    setIsBusy(true)
    setActingMemberId(memberUserId)

    try {
      setErrorMessage(null)
      await removeFamilyMember(memberUserId)
      await loadWorkspace()
      return true
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel remover o membro da familia.'))
      return false
    } finally {
      setIsBusy(false)
      setActingMemberId(null)
    }
  }, [loadWorkspace])

  const resendInvitation = useCallback(async (invitationId: string) => {
    setIsBusy(true)
    setActingInvitationId(invitationId)

    try {
      setErrorMessage(null)
      await resendFamilyInvitation(invitationId)
      await loadWorkspace()
      return true
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel reenviar o convite agora.'))
      return false
    } finally {
      setIsBusy(false)
      setActingInvitationId(null)
    }
  }, [loadWorkspace])

  const cancelInvitation = useCallback(async (invitationId: string) => {
    setIsBusy(true)
    setActingInvitationId(invitationId)

    try {
      setErrorMessage(null)
      await cancelFamilyInvitation(invitationId)
      await loadWorkspace()
      return true
    } catch (error) {
      setErrorMessage(resolveErrorMessage(error, 'Nao foi possivel cancelar o convite agora.'))
      return false
    } finally {
      setIsBusy(false)
      setActingInvitationId(null)
    }
  }, [loadWorkspace])

  return useMemo(() => ({
    workspace,
    isLoading,
    isBusy,
    actingMemberId,
    actingInvitationId,
    errorMessage,
    reload: loadWorkspace,
    inviteMembers: inviteMembersAction,
    changeRole,
    removeMember,
    resendInvitation,
    cancelInvitation,
  }), [
    workspace,
    isLoading,
    isBusy,
    actingMemberId,
    actingInvitationId,
    errorMessage,
    loadWorkspace,
    inviteMembersAction,
    changeRole,
    removeMember,
    resendInvitation,
    cancelInvitation,
  ])
}
