# Backend Overview - FinTrack

Ultima atualizacao: 2026-04-17

## 1) Objetivo deste documento

Este documento explica como o backend do FinTrack esta montado hoje, de forma pratica e didatica, especialmente para quem tem base principal em frontend.

## 2) Stack atual

- Framework: NestJS 11
- HTTP adapter: Fastify
- ORM: Prisma
- Banco: PostgreSQL
- Autenticacao: JWT (access token no header + refresh token em cookie httpOnly com rotacao)
- Validacao: class-validator + ValidationPipe global
- Infra local: Docker Compose (frontend + backend + db)

## 3) Arquitetura atual (MVP)

Backend organizado por modulos:

- `AppModule`: modulo raiz da aplicacao.
- `PrismaModule`: conexao e acesso ao banco.
- `AuthModule`: cadastro, login, refresh, logout e rota protegida.

Arquivos principais:

- `src/main.ts`
- `src/app.module.ts`
- `src/prisma/prisma.module.ts`
- `src/prisma/prisma.service.ts`
- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`

## 4) Bootstrap da aplicacao

No `src/main.ts`, a aplicacao:

1. sobe com adapter Fastify;
2. define prefixo global `/api`;
3. ativa `ValidationPipe` global com:
   - `transform: true`
   - `whitelist: true`
   - `forbidNonWhitelisted: true`
4. configura CORS usando `FRONTEND_URL`;
5. inicia na porta `PORT` (padrao 3000).

## 5) Rotas existentes

Base URL: `http://localhost:3000/api`

Health:

- `GET /health`

Auth:

- `POST /auth/signup/start`
- `POST /auth/signup/verify`
- `POST /auth/signup/resend`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me` (protegida por JWT guard)

## 6) Fluxo de autenticacao

### Signup em 2 etapas

1. `POST /auth/signup/start` valida entrada (`SignUpDto`);
2. normaliza email;
3. verifica se ja existe usuario;
4. gera codigo numerico e salva hash do codigo + hash da senha em `signup_verifications`;
5. envia codigo de verificacao por email;
6. `POST /auth/signup/verify` valida codigo;
7. cria usuario e inicia sessao (access token + refresh token em cookie).

### Login

1. valida entrada (`LoginDto`);
2. busca usuario por email;
3. compara senha com bcrypt;
4. gera novo par de tokens;
5. persiste hash do refresh token.

### Refresh (rotacao)

1. le refresh token do cookie httpOnly;
2. valida assinatura do refresh token;
3. busca `jti` no banco;
4. valida hash do token recebido;
5. revoga token antigo (`revokedAt`);
6. emite novo par de tokens;
7. devolve access token no JSON e novo refresh token no cookie.

### Logout

1. le refresh token do cookie httpOnly (se existir);
2. tenta validar refresh token;
3. revoga token ativo no banco;
4. limpa cookie no response;
5. retorna sucesso mesmo se token estiver invalido (logout idempotente).

### Me (sessao atual)

1. `JwtAuthGuard` valida access token no header `Authorization`;
2. `JwtStrategy` extrai payload;
3. decorator `@CurrentUser()` injeta usuario no controller;
4. retorna perfil publico.

## 7) Validacoes (DTOs)

DTOs atuais:

- `SignUpDto`
- `LoginDto`

Todos passam pela validacao global. Isso reduz erro de contrato e protege a API contra payload inesperado.

## 8) Banco de dados (Prisma)

Schema atual em `prisma/schema.prisma`.

Tabelas do MVP:

- `users`
- `refresh_tokens`
- `signup_verifications`

Pontos importantes:

- senha salva como hash (`password_hash`);
- refresh token salvo como hash (`token_hash`);
- `jti` unico por token;
- indices em `user_id` e `expires_at`;
- relacao `refresh_tokens -> users` com `onDelete: Cascade`.

Migration inicial:

- `prisma/migrations/20260412163542_init_auth/migration.sql`

## 9) Variaveis de ambiente

Arquivo base: `.env.example`

Variaveis principais:

- `PORT`
- `FRONTEND_URL`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `AUTH_SIGNUP_CODE_TTL_MS`
- `AUTH_SIGNUP_CODE_RESEND_COOLDOWN_MS`
- `AUTH_SIGNUP_CODE_MAX_ATTEMPTS`
- `AUTH_SIGNUP_CODE_LOCK_DURATION_MS`
- `AUTH_SIGNUP_CODE_LENGTH`
- `AUTH_SIGNUP_LOG_CODE`
- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_MAX_AGE_MS`
- `AUTH_REFRESH_COOKIE_SECURE`
- `AUTH_REFRESH_COOKIE_SAME_SITE`
- `AUTH_REFRESH_COOKIE_PATH`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## 10) Como rodar

### Opcao recomendada (stack completa em Docker)

Na raiz do projeto (`fintrack/`):

```bash
docker compose up -d --build
docker compose ps
```

Portas:

- backend: `3000`
- frontend: `5173`
- postgres: `5433`

Healthcheck:

```bash
curl http://localhost:3000/api/health
```

### Opcao local (apenas backend)

No diretorio `backend/`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init_auth
npm run start:dev
```

## 11) Scripts importantes

No `backend/package.json`:

- `npm run start`
- `npm run start:dev`
- `npm run build`
- `npm run test`
- `npm run test:e2e`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`

## 12) Testes atuais

- Unitario basico de health (`src/app.controller.spec.ts`)
- E2E basico de health (`test/app.e2e-spec.ts`)

Ainda faltam testes especificos de auth e cenarios de erro/seguranca em profundidade.

## 13) Estado atual e proximos passos

Ja implementado:

- base NestJS + Fastify
- integracao Prisma + Postgres
- autenticacao completa com refresh token e revogacao
- refresh token em cookie httpOnly
- rota protegida (`/auth/me`)
- execucao dockerizada da stack completa

Proximos modulos recomendados (ordem):

1. `families` (estrutura da familia e membros)
2. `accounts` (contas e saldos)
3. `transactions` (lancamentos e fluxo de caixa)
4. `budgets` (orcamento)
5. `goals` (metas)

## 14) Documentos relacionados

- `docs/fintrack-plan.md`
- `docs/backend-auth-runbook.md`
- `docs/docker-fullstack.md`
