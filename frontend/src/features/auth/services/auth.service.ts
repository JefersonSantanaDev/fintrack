export interface AuthUser {
  id: string
  name: string
  email: string
}

interface StoredUser extends AuthUser {
  password: string
  createdAt: string
}

interface SessionPayload {
  userId: string
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

const USERS_STORAGE_KEY = 'fintrack-auth-users'
const SESSION_STORAGE_KEY = 'fintrack-auth-session'

const seededUser: StoredUser = {
  id: 'seed-user-1',
  name: 'Jeferson',
  email: 'jeferson@fintrack.app',
  password: 'senha123',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) {
    return [seededUser]
  }

  const raw = window.localStorage.getItem(USERS_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function readSession(): SessionPayload | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as SessionPayload
    if (!parsed?.userId) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function saveSession(payload: SessionPayload | null) {
  if (!isBrowser()) {
    return
  }

  if (!payload) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload))
}

function ensureSeededUsers() {
  const existingUsers = readUsers()
  if (existingUsers.length > 0) {
    return existingUsers
  }

  saveUsers([seededUser])
  return [seededUser]
}

function generateUserId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `user-${Date.now()}`
}

export async function getSessionUser() {
  await sleep(200)

  const users = ensureSeededUsers()
  const session = readSession()

  if (!session) {
    return null
  }

  const activeUser = users.find(user => user.id === session.userId)
  if (!activeUser) {
    saveSession(null)
    return null
  }

  return toAuthUser(activeUser)
}

export async function loginWithEmailAndPassword(input: LoginInput) {
  await sleep(250)

  const email = normalizeEmail(input.email)
  const password = input.password

  if (!email || !password) {
    throw new Error('Informe email e senha para entrar.')
  }

  const users = ensureSeededUsers()
  const foundUser = users.find(user => user.email === email)

  if (!foundUser || foundUser.password !== password) {
    throw new Error('Email ou senha invalidos.')
  }

  saveSession({ userId: foundUser.id })
  return toAuthUser(foundUser)
}

export async function signUpWithEmailAndPassword(input: SignUpInput) {
  await sleep(300)

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

  const users = ensureSeededUsers()
  const emailAlreadyInUse = users.some(user => user.email === email)

  if (emailAlreadyInUse) {
    throw new Error('Este email ja esta cadastrado.')
  }

  const newUser: StoredUser = {
    id: generateUserId(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  const nextUsers = [...users, newUser]
  saveUsers(nextUsers)
  saveSession({ userId: newUser.id })

  return toAuthUser(newUser)
}

export async function logoutSession() {
  await sleep(120)
  saveSession(null)
}
