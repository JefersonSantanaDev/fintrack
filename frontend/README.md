# FinTrack Frontend

Frontend web do `FinTrack`, um projeto pessoal para controle de financas da familia.

## Stack

- `React`
- `Vite`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI`

## Objetivo desta base

Esta base foca em:

- layout principal do produto
- componentes visuais reutilizaveis
- paginas iniciais do dominio financeiro
- navegacao do MVP

## Estrutura atual

```text
src/
  components/
    ui/
  data/
  lib/
  pages/
  styles/
  types/
  App.tsx
  main.tsx
```

## Rodando localmente

```bash
npm install
npm run dev
```

## Variaveis de ambiente

Crie um arquivo `.env` com:

```bash
VITE_API_URL=http://localhost:3000/api
```

## Build

```bash
npm run build
```
