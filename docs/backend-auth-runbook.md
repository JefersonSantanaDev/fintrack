# Backend Auth Runbook (FinTrack)

Guia pratico para subir o backend local, aplicar migrations e validar o fluxo real de autenticacao.

Para rodar stack completa em Docker (`frontend + backend + db`), use:

- `docs/docker-fullstack.md`

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

### Email de verificacao local (sem custo)

Voce pode usar dois modos:

1. Mailpit (caixa fake local)
2. Log do codigo no terminal

#### Modo Mailpit (recomendado)

Na raiz do projeto:

```bash
docker compose up -d mailpit
```

Abra:

- Inbox: `http://localhost:8025`
- SMTP: `localhost:1025`

Para backend rodando fora do Docker (`backend/.env`):

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
AUTH_SIGNUP_LOG_CODE=true
```

#### Modo apenas terminal (sem SMTP)

No `backend/.env`, deixe:

```bash
SMTP_HOST=
AUTH_SIGNUP_LOG_CODE=true
```

Assim, ao chamar `POST /auth/signup/start`, o codigo aparece no log do backend.

## 4) Testar fluxo real de login/refresh (Postman/Insomnia)

Base URL:

`http://localhost:3000/api`

Observacao importante:
- O refresh token fica em cookie `httpOnly` (nao vem mais no JSON).
- Em `curl`, use `-c` e `-b` para persistir e reenviar cookie.

### 4.1 Iniciar signup

`POST /auth/signup/start`

Body:

```json
{
  "name": "Jeferson Teste",
  "email": "jeferson+1@fintrack.app",
  "password": "senha123"
}
```

Esperado: `201` com confirmacao do envio do codigo de verificacao por email.

### 4.2 Verificar signup

`POST /auth/signup/verify`

Body:

```json
{
  "email": "jeferson+1@fintrack.app",
  "code": "123456"
}
```

Esperado: `200` com `user` e `accessToken`, mais `Set-Cookie` do refresh token.

### 4.3 Reenviar codigo (opcional)

`POST /auth/signup/resend`

Body:

```json
{
  "email": "jeferson+1@fintrack.app"
}
```

Esperado: `200` com confirmacao de novo codigo (sujeito a cooldown/rate limit).

### 4.4 Login

`POST /auth/login`

Body:

```json
{
  "email": "jeferson+1@fintrack.app",
  "password": "senha123"
}
```

Esperado: `200` com `user` e `accessToken`, mais `Set-Cookie` do refresh token.

### 4.5 Recuperacao de senha (solicitacao)

`POST /auth/forgot-password/request`

Body:

```json
{
  "email": "jeferson+1@fintrack.app"
}
```

Esperado: `200` com mensagem generica de sucesso (mesmo se email nao existir).

### 4.6 Me (rota protegida)

`GET /auth/me`

Header:

`Authorization: Bearer <accessToken>`

Esperado: `200` com dados de `user`.

### 4.7 Refresh

`POST /auth/refresh`

Sem body.

Esperado: `200` com novo `accessToken` e novo `Set-Cookie` de refresh token.

### 4.8 Logout

`POST /auth/logout`

Sem body.

Esperado: `200` com `{ "success": true }` e cookie expirado (`Max-Age=0`).

### 4.9 Validar token revogado

Chame novamente:

`POST /auth/refresh` com o cookie revogado.

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

- `Criar cadastro` chama `POST /auth/signup/start`
- `Confirmar codigo` chama `POST /auth/signup/verify`
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
