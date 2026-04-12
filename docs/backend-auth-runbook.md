# Backend Auth Runbook (FinTrack)

Guia pratico para subir o backend local, aplicar migrations e validar o fluxo real de autenticacao.

## 1) Subir PostgreSQL local (Docker)

No diretorio `backend/`:

```bash
docker compose up -d
docker compose ps
```

Esperado:

- container `fintrack-postgres` com status `healthy`
- porta local `5433` ativa

Arquivo base: `backend/docker-compose.yml`.

## 2) Aplicar migration do auth

No diretorio `backend/`:

```bash
npm run prisma:migrate -- --name init_auth
```

Esperado:

- migration criada em `backend/prisma/migrations/*_init_auth/`
- schema sincronizado no banco local

## 3) Subir API backend

No diretorio `backend/`:

```bash
npm run start
```

Healthcheck:

```bash
curl http://localhost:3000/api/health
```

Retorno esperado:

```json
{
  "status": "ok",
  "service": "fintrack-backend",
  "timestamp": "..."
}
```

## 4) Testar fluxo real de login/refresh (Postman/Insomnia)

Base URL:

`http://localhost:3000/api`

### 4.1 Signup

`POST /auth/signup`

Body:

```json
{
  "name": "Jeferson Teste",
  "email": "jeferson+1@fintrack.app",
  "password": "senha123"
}
```

Esperado: `201` com `user`, `accessToken`, `refreshToken`.

### 4.2 Login

`POST /auth/login`

Body:

```json
{
  "email": "jeferson+1@fintrack.app",
  "password": "senha123"
}
```

Esperado: `200` com `user`, `accessToken`, `refreshToken`.

### 4.3 Me (rota protegida)

`GET /auth/me`

Header:

`Authorization: Bearer <accessToken>`

Esperado: `200` com dados de `user`.

### 4.4 Refresh

`POST /auth/refresh`

Body:

```json
{
  "refreshToken": "<refreshToken>"
}
```

Esperado: `200` com novo `accessToken` e novo `refreshToken`.

### 4.5 Logout

`POST /auth/logout`

Body:

```json
{
  "refreshToken": "<refreshToken_mais_recente>"
}
```

Esperado: `200` com `{ "success": true }`.

### 4.6 Validar token revogado

Chame novamente:

`POST /auth/refresh` com o token revogado.

Esperado: `401` com erro de refresh token invalido/expirado.

## 5) Conectar frontend no backend real

No `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:3000/api
```

No frontend:

```bash
npm run dev
```

Fluxo esperado:

- `Criar cadastro` chama `POST /auth/signup`
- `Entrar` chama `POST /auth/login`
- sessao valida chama `GET /auth/me`
- expiracao de access token usa `POST /auth/refresh` automaticamente
- `Sair` chama `POST /auth/logout`

## 6) Validacoes recomendadas

No backend:

```bash
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

No frontend:

```bash
npm run build
```
