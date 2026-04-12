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
  refreshToken: string
}

interface ApiErrorPayload {
  message?: string | string[]
}

const ACCESS_TOKEN_STORAGE_KEY = 'fintrack-auth-access-token'
const REFRESH_TOKEN_STORAGE_KEY = 'fintrack-auth-refresh-token'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

function isBrowser() {
  return typeof window !== 'undefined'
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function readAccessToken() {
  if (!isBrowser()) {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

function readRefreshToken() {
  if (!isBrowser()) {
    return null
  }

  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

function saveTokens(tokens: { accessToken: string; refreshToken: string }) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken)
}

function clearTokens() {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

async function parseJsonSafe(response: Response) {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  const data = payload as ApiErrorPayload | null

  if (!data?.message) {
    return fallback
  }

  if (Array.isArray(data.message)) {
    return data.message.join(', ')
  }

  return data.message
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const payload = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, 'Nao foi possivel concluir a operacao.'))
  }

  return payload as T
}

async function refreshTokens() {
  const refreshToken = readRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const payload = await requestApi<AuthSuccessPayload>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })

    saveTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    })

    return payload
  } catch {
    clearTokens()
    return null
  }
}

async function meWithAccessToken(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 401) {
    return null
  }

  const payload = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, 'Nao foi possivel validar a sessao.'))
  }

  const data = payload as { user: AuthUser }
  return data.user ?? null
}

export async function getSessionUser() {
  const accessToken = readAccessToken()

  if (!accessToken) {
    return null
  }

  try {
    const currentUser = await meWithAccessToken(accessToken)
    if (currentUser) {
      return currentUser
    }
  } catch {
    clearTokens()
    return null
  }

  const refreshed = await refreshTokens()
  if (!refreshed) {
    return null
  }

  return refreshed.user
}

export async function loginWithEmailAndPassword(input: LoginInput) {
  const email = normalizeEmail(input.email)
  const password = input.password.trim()

  if (!email || !password) {
    throw new Error('Informe email e senha para entrar.')
  }

  const payload = await requestApi<AuthSuccessPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  saveTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  })

  return payload.user
}

export async function signUpWithEmailAndPassword(input: SignUpInput) {
  const name = input.name.trim()
  const email = normalizeEmail(input.email)
  const password = input.password.trim()

  if (name.length < 2) {
    throw new Error('Informe um nome valido.')
  }

  if (!email) {
    throw new Error('Informe um email valido.')
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.')
  }

  const payload = await requestApi<AuthSuccessPayload>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  saveTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  })

  return payload.user
}

export async function logoutSession() {
  const refreshToken = readRefreshToken()

  if (refreshToken) {
    try {
      await requestApi<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    } catch {
      // Logout deve sempre limpar estado local, mesmo em erro de rede.
    }
  }

  clearTokens()
}
