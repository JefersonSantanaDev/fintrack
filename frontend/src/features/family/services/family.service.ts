import { apiRequest } from '@/shared/lib/api-client'

export type FamilyRole = 'owner' | 'admin' | 'viewer'

export interface FamilyMember {
  id: string
  name: string
  email: string
  role: FamilyRole
  isCurrentUser: boolean
}

export interface FamilyInvitation {
  id: string
  name: string
  email: string
  status: 'pending'
  sentAt: string
  inviterName: string
}

export interface FamilyPermissions {
  canInviteMembers: boolean
  canManageMembers: boolean
  canManageRoles: boolean
}

export interface FamilyWorkspace {
  id: string
  name: string
  currentUserRole: FamilyRole
  memberCount: number
  members: FamilyMember[]
  invitations: FamilyInvitation[]
  permissions: FamilyPermissions
}

export interface FamilyInviteMemberInput {
  name: string
  email: string
}

export interface FamilyInviteMembersResponse {
  success: boolean
  message: string
  sentCount: number
  ignoredCount: number
  invitations: FamilyInvitation[]
}

export interface FamilyActionResponse {
  success: boolean
  message: string
}

export interface UpdateFamilyMemberRoleResponse {
  success: boolean
  message: string
  member: FamilyMember
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function getFamilyWorkspace() {
  return apiRequest<FamilyWorkspace>('/family', {
    auth: true,
    errorMessage: 'Nao foi possivel carregar os dados da familia.',
  })
}

export async function inviteFamilyMembers(members: FamilyInviteMemberInput[]) {
  const normalizedMembers = members
    .map(member => ({
      name: member.name.trim(),
      email: normalizeEmail(member.email),
    }))
    .filter(member => member.name.length > 0 && member.email.length > 0)

  if (!normalizedMembers.length) {
    throw new Error('Adicione pelo menos um membro para convidar.')
  }

  return apiRequest<FamilyInviteMembersResponse>('/family/invitations', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ members: normalizedMembers }),
    errorMessage: 'Nao foi possivel convidar membros agora.',
  })
}

export async function resendFamilyInvitation(invitationId: string) {
  return apiRequest<FamilyActionResponse>(`/family/invitations/${invitationId}/resend`, {
    method: 'POST',
    auth: true,
    errorMessage: 'Nao foi possivel reenviar o convite agora.',
  })
}

export async function cancelFamilyInvitation(invitationId: string) {
  return apiRequest<FamilyActionResponse>(`/family/invitations/${invitationId}/cancel`, {
    method: 'POST',
    auth: true,
    errorMessage: 'Nao foi possivel cancelar o convite agora.',
  })
}

export async function updateFamilyMemberRole(memberUserId: string, role: 'admin' | 'viewer') {
  return apiRequest<UpdateFamilyMemberRoleResponse>(`/family/members/${memberUserId}/role`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ role }),
    errorMessage: 'Nao foi possivel atualizar o papel do membro.',
  })
}

export async function removeFamilyMember(memberUserId: string) {
  return apiRequest<FamilyActionResponse>(`/family/members/${memberUserId}`, {
    method: 'DELETE',
    auth: true,
    errorMessage: 'Nao foi possivel remover o membro da familia.',
  })
}
