import {
  ApiRequestError,
  apiRequest,
  configureApiAuth,
} from '@/shared/lib/api-client'

export interface AuthUser {
  id: string
  name: string
  email: string
  family: AuthFamily | null
}

export type FamilyRole = 'owner' | 'admin' | 'viewer'

export interface AuthFamilyMember {
  id: string
  name: string
  email: string
  role: FamilyRole
  isCurrentUser: boolean
}

export interface AuthFamily {
  id: string
  name: string
  memberCount: number
  role: FamilyRole
  members: AuthFamilyMember[]
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export interface SignUpVerifyInput {
  email: string
  code: string
}

export interface SignUpChallenge {
  success: boolean
  message: string
  email: string
  expiresInSeconds: number
  resendAvailableInSeconds: number
}

export interface ActionResponse {
  success: boolean
  message: string
}

export interface FamilyOnboardingSummary {
  id: string
  name: string
  memberCount: number
  role: 'owner' | 'admin' | 'viewer'
}

export interface FamilyOnboardingStatus {
  family: FamilyOnboardingSummary | null
  shouldShowOnboarding: boolean
}

export interface FamilyOnboardingInviteMemberInput {
  name: string
  email: string
}

export interface FamilyOnboardingInvitation {
  id: string
  name: string
  email: string
  status: 'pending'
}

export interface FamilyOnboardingInviteMembersResponse {
  success: boolean
  message: string
  sentCount: number
  ignoredCount: number
  invitations: FamilyOnboardingInvitation[]
}

export interface ConfirmPasswordRecoveryInput {
  token: string
  password: string
}

interface ApiAuthUser {
  id: string
  name: string
  email: string
}

interface AuthSuccessPayload {
  user: ApiAuthUser
  family: AuthFamily | null
  accessToken: string
}

const LEGACY_ACCESS_TOKEN_STORAGE_KEY = 'fintrack-auth-access-token'
const LEGACY_REFRESH_TOKEN_STORAGE_KEY = 'fintrack-auth-refresh-token'
let accessTokenInMemory: string | null = null

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function clearLegacyTokenStorage() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY)
}

function readAccessToken() {
  return accessTokenInMemory
}

function saveAccessToken(accessToken: string) {
  accessTokenInMemory = accessToken
}

function clearAccessToken() {
  accessTokenInMemory = null
}

function toAuthUser(user: ApiAuthUser, family?: AuthFamily | null): AuthUser {
  return {
    ...user,
    family: family ?? null,
  }
}

function shouldClearTokensAfterRefreshError(error: unknown) {
  if (!(error instanceof ApiRequestError)) {
    return false
  }

  return error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403
}

async function refreshTokens() {
  try {
    const payload = await apiRequest<AuthSuccessPayload>('/auth/refresh', {
      method: 'POST',
      errorMessage: 'Nao foi possivel renovar a sessao.',
      retryOnUnauthorized: false,
    })

    saveAccessToken(payload.accessToken)

    return payload
  } catch (error) {
    if (shouldClearTokensAfterRefreshError(error)) {
      clearAccessToken()
    }

    return null
  }
}

configureApiAuth({
  getAccessToken: readAccessToken,
  refreshAccessToken: async () => {
    const refreshed = await refreshTokens()
    return refreshed?.accessToken ?? null
  },
})

clearLegacyTokenStorage()

export async function getSessionUser() {
  if (!readAccessToken()) {
    const refreshed = await refreshTokens()
    if (!refreshed) {
      return null
    }

    return toAuthUser(refreshed.user, refreshed.family)
  }

  try {
    const payload = await apiRequest<{ user: ApiAuthUser; family: AuthFamily | null }>('/auth/me', {
      auth: true,
      errorMessage: 'Nao foi possivel validar a sessao.',
    })
    return toAuthUser(payload.user, payload.family)
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return null
      }
    }

    return null
  }
}

export async function loginWithEmailAndPassword(input: LoginInput) {
  const email = normalizeEmail(input.email)
  const password = input.password

  if (!email || !password) {
    throw new Error('Informe email e senha para entrar.')
  }

  const payload = await apiRequest<AuthSuccessPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    errorMessage: 'Nao foi possivel entrar.',
  })

  saveAccessToken(payload.accessToken)

  return toAuthUser(payload.user, payload.family)
}

export async function startSignUpWithEmailAndPassword(input: SignUpInput) {
  const name = input.name.trim()
  const email = normalizeEmail(input.email)
  const password = input.password

  if (name.length < 2) {
    throw new Error('Informe um nome valido.')
  }

  if (!email) {
    throw new Error('Informe um email valido.')
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.')
  }

  return apiRequest<SignUpChallenge>('/auth/signup/start', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    errorMessage: 'Nao foi possivel iniciar o cadastro.',
  })
}

export async function verifySignUpWithCode(input: SignUpVerifyInput) {
  const email = normalizeEmail(input.email)
  const code = input.code.trim()

  if (!email) {
    throw new Error('Informe um email valido.')
  }

  if (!/^\d{6}$/.test(code)) {
    throw new Error('Informe o codigo de 6 digitos.')
  }

  const payload = await apiRequest<AuthSuccessPayload>('/auth/signup/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    errorMessage: 'Nao foi possivel verificar o codigo.',
  })

  saveAccessToken(payload.accessToken)
  return toAuthUser(payload.user, payload.family)
}

export async function resendSignUpCode(email: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error('Informe um email valido.')
  }

  return apiRequest<SignUpChallenge>('/auth/signup/resend', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
    errorMessage: 'Nao foi possivel reenviar o codigo.',
  })
}

export async function requestPasswordRecovery(email: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error('Informe um email valido.')
  }

  return apiRequest<ActionResponse>('/auth/forgot-password/request', {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail }),
    errorMessage: 'Nao foi possivel solicitar recuperacao de senha.',
  })
}

export async function confirmPasswordRecovery(input: ConfirmPasswordRecoveryInput) {
  const token = input.token.trim()
  const password = input.password

  if (!token) {
    throw new Error('Link de recuperacao invalido.')
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.')
  }

  return apiRequest<ActionResponse>('/auth/forgot-password/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
    errorMessage: 'Nao foi possivel redefinir a senha.',
  })
}

export async function getFamilyOnboardingStatus() {
  return apiRequest<FamilyOnboardingStatus>('/auth/onboarding/family', {
    auth: true,
    errorMessage: 'Nao foi possivel carregar o onboarding familiar.',
  })
}

export async function dismissFamilyOnboarding() {
  return apiRequest<ActionResponse>('/auth/onboarding/family/dismiss', {
    method: 'POST',
    auth: true,
    errorMessage: 'Nao foi possivel ocultar o onboarding familiar.',
  })
}

export async function inviteFamilyOnboardingMembers(
  members: FamilyOnboardingInviteMemberInput[],
) {
  const normalizedMembers = members
    .map(member => ({
      name: member.name.trim(),
      email: normalizeEmail(member.email),
    }))
    .filter(member => member.name.length > 0 && member.email.length > 0)

  if (!normalizedMembers.length) {
    throw new Error('Adicione pelo menos um membro para convidar.')
  }

  return apiRequest<FamilyOnboardingInviteMembersResponse>('/auth/onboarding/family/invitations', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ members: normalizedMembers }),
    errorMessage: 'Nao foi possivel preparar os convites agora.',
  })
}

export async function logoutSession() {
  try {
    await apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      errorMessage: 'Nao foi possivel encerrar a sessao.',
    })
  } catch {
    // Logout deve sempre limpar estado local, mesmo em erro de rede.
  }

  clearAccessToken()
}
