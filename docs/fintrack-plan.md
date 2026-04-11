# FinTrack Plan

## Objetivo

Criar um sistema web de controle de financas pessoais e familiares, com frontend focado em dashboard e colaboracao familiar, e um backend novo focado em regras de negocio financeiras.

## Visao do produto

O `fintrack` deve permitir:

- acompanhar receitas e despesas
- organizar contas e carteiras
- separar gastos por categoria
- controlar orcamento mensal
- definir metas financeiras
- compartilhar a gestao com membros da familia

## Decisao de stack

### Frontend

- Stack: `React + Vite + TypeScript + Tailwind CSS + Radix UI`
- Motivo: stack enxuta, rapida para iterar e com boa base para um design system proprio

### Backend

- Framework: `NestJS`
- HTTP adapter: `Fastify`
- ORM: `Prisma`
- Banco: `PostgreSQL`
- Auth: `JWT` com refresh token

### Por que essa stack

- `NestJS` ajuda a organizar o backend por modulos
- `Fastify` entrega performance e boa integracao com schema validation
- `Prisma` melhora produtividade com tipagem e migrations
- `PostgreSQL` e ideal para regras relacionais, relatorios e consistencia financeira

## Estrutura sugerida do repositorio

```text
fintrack/
  frontend/
  backend/
  docs/
```

## Estrutura do frontend

### O que manter no frontend

- configuracao do `Vite`
- configuracao `TypeScript`
- estilos globais
- tema e design tokens
- componentes genericos de UI
- utilitarios em `lib`
- organizacao simples por paginas e componentes

### O que evitar

- dependencias do frontend em regras antigas de dominio
- excesso de mocks acoplados ao layout
- fluxo de tela sem roteamento real

### O que criar no frontend do FinTrack

- `react-router-dom`
- layout autenticado com sidebar e header
- paginas:
  - `Dashboard`
  - `Transacoes`
  - `Contas`
  - `Categorias`
  - `Orcamentos`
  - `Metas`
  - `Familia`
  - `Configuracoes`

### Estrutura sugerida

```text
frontend/src/
  components/
  data/
  lib/
  pages/
  styles/
  types/
```

## Estrutura do backend

### Modulos iniciais

- `auth`
- `users`
- `families`
- `family-members`
- `accounts`
- `categories`
- `transactions`
- `budgets`
- `goals`
- `reports`

### Responsabilidades

- `auth`: login, refresh token, sessao
- `users`: perfil do usuario
- `families`: grupo familiar
- `family-members`: vinculo usuario x familia x papel
- `accounts`: contas bancarias, dinheiro, carteira
- `categories`: categorias de receita e despesa
- `transactions`: lancamentos financeiros
- `budgets`: limite por categoria ou mes
- `goals`: objetivos financeiros
- `reports`: resumo mensal, comparativos e indicadores

## Modelagem inicial do banco

### Tabelas principais

- `users`
- `families`
- `family_members`
- `accounts`
- `categories`
- `transactions`
- `budgets`
- `goals`

### Relacoes principais

- um `user` pode participar de uma ou mais `families`
- uma `family` possui varios `accounts`
- uma `family` possui varias `categories`
- uma `family` possui varias `transactions`
- uma `transaction` pertence a uma `account`
- uma `transaction` pode pertencer a uma `category`

### Campos importantes

#### users

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`
- `updated_at`

#### families

- `id`
- `name`
- `owner_user_id`
- `created_at`
- `updated_at`

#### family_members

- `id`
- `family_id`
- `user_id`
- `role` (`owner`, `admin`, `member`, `viewer`)
- `created_at`

#### accounts

- `id`
- `family_id`
- `name`
- `type` (`checking`, `savings`, `cash`, `credit_card`, `investment`)
- `balance`
- `is_active`
- `created_at`

#### categories

- `id`
- `family_id`
- `name`
- `type` (`income`, `expense`)
- `color`
- `icon`
- `created_at`

#### transactions

- `id`
- `family_id`
- `account_id`
- `category_id`
- `created_by_user_id`
- `type` (`income`, `expense`, `transfer`)
- `description`
- `amount`
- `transaction_date`
- `status`
- `notes`
- `created_at`

#### budgets

- `id`
- `family_id`
- `category_id`
- `month`
- `year`
- `limit_amount`
- `created_at`

#### goals

- `id`
- `family_id`
- `name`
- `target_amount`
- `current_amount`
- `target_date`
- `created_at`

## Backlog do MVP

### Fase 1 - Fundacao do projeto

- criar estrutura `frontend/` e `backend/`
- estruturar `frontend/`
- consolidar layout e rotas do produto
- configurar roteamento
- criar `README` tecnico do projeto
- iniciar backend com `NestJS`
- configurar `Prisma`
- configurar `PostgreSQL`

### Fase 2 - Autenticacao e usuarios

- cadastro de usuario
- login
- refresh token
- rota protegida no frontend
- contexto ou store de autenticacao real
- tela de perfil

### Fase 3 - Nucleo familiar

- criar familia
- convidar membros
- listar membros
- definir papeis
- garantir isolamento por `family_id`

### Fase 4 - Financeiro basico

- CRUD de contas
- CRUD de categorias
- CRUD de transacoes
- filtro por periodo
- resumo de entradas e saidas

### Fase 5 - Dashboard

- saldo total
- receitas do mes
- despesas do mes
- gasto por categoria
- comparativo mensal
- ultimas transacoes

### Fase 6 - Orcamentos e metas

- criar orcamento por categoria
- acompanhar gasto x limite
- criar metas financeiras
- acompanhar progresso da meta

## Ordem pratica de migracao do frontend

1. consolidar a identidade visual do `fintrack`
2. manter componentes UI reutilizaveis
3. criar shell autenticado com sidebar
4. criar rotas
5. criar tipos de dominio financeiro
6. conectar com a API real

## Entregaveis da primeira versao

- login funcionando
- familia criada
- contas cadastradas
- categorias cadastradas
- receitas e despesas cadastradas
- dashboard mensal

## Riscos e cuidados

- nao depender de mocks por tempo demais
- definir cedo se uma transacao e pessoal ou compartilhada
- cuidar bem de arredondamento e formato de moeda
- manter historico consistente para relatorios futuros

## Decisoes que podem vir depois

- suporte a parcelamento
- lancamentos recorrentes
- importacao CSV ou OFX
- anexos de comprovantes
- notificacoes
- app mobile

## Proximo passo recomendado

1. consolidar a base do `frontend`
2. subir o `backend` com `NestJS + Prisma`
3. implementar `auth`, `families` e `transactions` primeiro
