interface ApiErrorPayload {
  message?: string | string[]
}

interface ApiAuthConfig {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string | null>
}

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit
  auth?: boolean
  errorMessage?: string
  retryOnUnauthorized?: boolean
}

export class ApiRequestError extends Error {
  readonly statusCode?: number
  readonly payload?: unknown

  constructor(message: string, statusCode?: number, payload?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.payload = payload
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

let apiAuthConfig: ApiAuthConfig | null = null
let refreshInFlight: Promise<string | null> | null = null

export function configureApiAuth(config: ApiAuthConfig) {
  apiAuthConfig = config
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

async function refreshAccessTokenWithLock() {
  if (!apiAuthConfig) {
    return null
  }

  if (!refreshInFlight) {
    refreshInFlight = apiAuthConfig
      .refreshAccessToken()
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

function buildHeaders(
  headers: HeadersInit | undefined,
  body: RequestInit['body'],
  accessToken: string | null,
) {
  const mergedHeaders = new Headers(headers)

  if (accessToken) {
    mergedHeaders.set('authorization', `Bearer ${accessToken}`)
  }

  const hasBody = body !== undefined && body !== null
  const shouldSetJsonContentType =
    hasBody && !(body instanceof FormData) && !mergedHeaders.has('content-type')

  if (shouldSetJsonContentType) {
    mergedHeaders.set('content-type', 'application/json')
  }

  return mergedHeaders
}

async function executeRequest(
  path: string,
  options: ApiRequestOptions,
  accessToken: string | null,
) {
  const headers = buildHeaders(options.headers, options.body, accessToken)
  const credentials = options.credentials ?? 'include'

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials,
    headers,
  })
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    auth = false,
    errorMessage = 'Nao foi possivel concluir a operacao.',
    retryOnUnauthorized = true,
    ...requestInit
  } = options

  const initialAccessToken = auth ? apiAuthConfig?.getAccessToken() ?? null : null

  let response = await executeRequest(path, requestInit, initialAccessToken)

  if (auth && retryOnUnauthorized && response.status === 401) {
    const refreshedAccessToken = await refreshAccessTokenWithLock()

    if (refreshedAccessToken) {
      response = await executeRequest(path, requestInit, refreshedAccessToken)
    }
  }

  const payload = await parseJsonSafe(response)

  if (!response.ok) {
    throw new ApiRequestError(
      resolveErrorMessage(payload, errorMessage),
      response.status,
      payload,
    )
  }

  return payload as T
}
