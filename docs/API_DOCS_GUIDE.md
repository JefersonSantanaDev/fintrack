# FinTrack API Docs Guide

Guia rapido para entender quando usar cada interface de documentacao da API do FinTrack.

## Endpoints

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`
- ReDoc: `http://localhost:3000/api/redoc`
- Scalar: `http://localhost:3000/api/scalar`

## Para Que Serve Cada Um

### 1. Swagger UI (`/api/docs`)

Quando usar:
- Testar endpoints manualmente.
- Validar rapidamente payloads e respostas.
- Fazer debug durante desenvolvimento.

Ponto forte:
- Melhor opcao para executar requests direto da interface.

### 2. OpenAPI JSON (`/api/docs-json`)

Quando usar:
- Integrar com Postman, Insomnia, Bruno e ferramentas de codegen.
- Versionar contrato de API.
- Alimentar outras UIs de documentacao.

Ponto forte:
- Fonte unica de verdade do contrato da API.

### 3. ReDoc (`/api/redoc`)

Quando usar:
- Leitura de documentacao mais limpa e sequencial.
- Compartilhar com time de produto ou stakeholders.

Ponto forte:
- Visual mais focado em leitura, menos em teste interativo.

### 4. Scalar (`/api/scalar`)

Quando usar:
- Navegacao moderna dos endpoints.
- Inspecao de schemas e exemplos com UX mais atual.

Ponto forte:
- Boa experiencia visual e organizacao para explorar APIs maiores.

## Fluxo Recomendado No Dia a Dia

1. Desenvolvedor backend valida endpoint no Swagger.
2. Frontend/QA consome o contrato pelo `/api/docs-json`.
3. Produto/negocio consulta ReDoc ou Scalar para entendimento funcional.
4. Em regressao, comparar comportamento no Swagger com o contrato OpenAPI JSON.

## Padrao de Examples (obrigatorio)

- Nao fixar o mesmo `example` para todos os erros no DTO global.
- Definir examples por endpoint/status (`400`, `401`, `409`, `429`) no controller.
- Manter o schema de erro reutilizavel e os exemplos contextuais por resposta.
- Reutilizar funcoes utilitarias em `src/docs/swagger-error-examples.ts` para padronizacao.

## Como Usar Na Pratica

### Testar login no Swagger

1. Abra `/api/docs`.
2. Va para `POST /api/auth/login`.
3. Clique em `Try it out`.
4. Envie:

```json
{
  "email": "voce@exemplo.com",
  "password": "123456"
}
```

5. Copie `accessToken` da resposta.
6. Confirme no response header que veio `Set-Cookie` com o refresh token (httpOnly).

### Testar endpoint protegido

1. Clique em `Authorize`.
2. Informe:

```text
Bearer SEU_ACCESS_TOKEN
```

3. Execute `GET /api/auth/me`.

### Testar refresh (cookie httpOnly)

1. Depois de login/signup no Swagger, use o mesmo navegador/sessao.
2. Execute `POST /api/auth/refresh` sem body.
3. Valide `200` com novo `accessToken` e novo `Set-Cookie`.

## Docker e Ambiente

Com `docker compose` ativo, as rotas acima ficam no host em `localhost:3000`.

Se quiser desabilitar docs em ambiente sensivel:

```bash
API_DOCS_ENABLED=false
```

## Seguranca dos Endpoints de Auth

As rotas publicas de autenticacao usam duas camadas:

1. Rate limit por rota (throttling HTTP).
2. Bloqueio temporario de login por tentativas invalidas sucessivas.

Variaveis de ambiente:

```bash
AUTH_LOGIN_LOCK_ENABLED=true
AUTH_LOGIN_MAX_FAILED_ATTEMPTS=5
AUTH_LOGIN_ATTEMPT_WINDOW_MS=600000
AUTH_LOGIN_LOCK_DURATION_MS=900000
```

Para testes automatizados com muitos logins seguidos, voce pode desativar o lock temporariamente:

```bash
AUTH_LOGIN_LOCK_ENABLED=false
```

## Problemas Comuns

### ReDoc em tela preta

Causa comum:
- Bloqueio do script CDN por extensao, politica de rede ou cache.

Como validar:
- Verifique se `/api/docs-json` abre normalmente.
- Teste `/api/scalar` e `/api/docs`.
- Tente aba anonima ou hard refresh.

### Erro `Cannot find module '@nestjs/swagger'` no Docker

Causa comum:
- Container com `node_modules` antigo.

Correcao:

```bash
docker compose stop backend
docker compose rm -fsv backend
docker compose up -d --build backend
```

## Resumo Curto

- Quer testar endpoint rapido: use Swagger.
- Quer integrar ferramenta ou gerar cliente: use OpenAPI JSON.
- Quer leitura limpa para documentacao: use ReDoc.
- Quer UX moderna para explorar API: use Scalar.
