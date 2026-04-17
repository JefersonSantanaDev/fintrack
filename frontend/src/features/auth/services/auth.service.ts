import {
  ApiRequestError,
  apiRequest,
  configureApiAuth,
} from '@/shared/lib/api-client'

export interface AuthUser {
  id: string
  name: string
  email: string
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

interface AuthSuccessPayload {
  user: AuthUser
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
    return refreshed?.user ?? null
  }

  try {
    const payload = await apiRequest<{ user: AuthUser }>('/auth/me', {
      auth: true,
      errorMessage: 'Nao foi possivel validar a sessao.',
    })
    return payload.user ?? null
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

  return payload.user
}

export async function signUpWithEmailAndPassword(input: SignUpInput) {
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

  const payload = await apiRequest<AuthSuccessPayload>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    errorMessage: 'Nao foi possivel criar a conta.',
  })

  saveAccessToken(payload.accessToken)

  return payload.user
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
