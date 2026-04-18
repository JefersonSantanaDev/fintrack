# Docker Full Stack (FinTrack)

Guia para rodar `frontend + backend + postgres` 100% em Docker, no mesmo estilo do projeto Cotia.

## Subir tudo

Na raiz do projeto (`fintrack/`):

```bash
docker compose up -d --build
```

Servicos:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`
- health backend: `http://localhost:3000/api/health`
- postgres: `localhost:5433`
- mailpit smtp: `localhost:1025`
- mailpit inbox (UI): `http://localhost:8025`

## Ver status

```bash
docker compose ps
```

## Ver logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f mailpit
```

## Parar tudo

```bash
docker compose down
```

Para parar e remover volume do banco:

```bash
docker compose down -v
```

## Observacoes

- O backend executa automaticamente:
  - `prisma generate`
  - `prisma migrate deploy`
  - `npm run start:dev`
- O frontend roda em modo dev com hot reload no container.
- O backend envia email de cadastro para o Mailpit (caixa fake local) e tambem registra o codigo no log quando `AUTH_SIGNUP_LOG_CODE=true`.
- Se houver processo local usando `3000` ou `5173`, pare antes para evitar conflito de porta.
