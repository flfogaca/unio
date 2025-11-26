# Guia de Deploy - UNIO

## Deploy no Railway (Backend)

### Pré-requisitos

- Conta no Railway conectada ao GitHub
- Projeto já conectado no Railway

### Passos

1. **Conectar ao Railway via CLI (se ainda não fez)**

```bash
npm install -g @railway/cli
railway login
railway link
```

2. **Configurar Variáveis de Ambiente no Railway Dashboard**

Acesse o projeto no Railway e configure:

**Obrigatórias:**

- `DATABASE_URL` - URL do PostgreSQL (Railway gera automaticamente se adicionar um serviço PostgreSQL)
- `JWT_SECRET` - Chave secreta para JWT (ex: `openssl rand -base64 32`)
- `NODE_ENV` - `production`
- `PORT` - `3000` (ou deixe Railway definir)

**Importantes:**

- `CORS_ORIGIN` - URL do frontend no Vercel (será configurado após deploy do frontend)
- `API_PREFIX` - `api/v1`

**Opcionais:**

- `REDIS_URL` - Se usar Redis
- `JWT_EXPIRES_IN` - `24h`

3. **Adicionar Banco PostgreSQL**

- No Railway Dashboard, adicione um serviço PostgreSQL
- Railway gerará automaticamente a `DATABASE_URL`

4. **Executar Migrações**

```bash
cd backend
railway run npx prisma migrate deploy
railway run npx prisma generate
```

5. **Deploy**
   O Railway fará deploy automático ao fazer push para o repositório conectado, ou:

```bash
railway up
```

## Deploy no Vercel (Frontend)

### Pré-requisitos

- Conta no Vercel conectada ao GitHub
- Projeto já conectado no Vercel

### Passos

1. **Instalar Vercel CLI (se ainda não fez)**

```bash
npm install -g vercel
vercel login
```

2. **Configurar Variáveis de Ambiente no Vercel Dashboard**

Acesse o projeto no Vercel e configure:

- `VITE_API_URL` - URL da API no Railway (ex: `https://seu-app.railway.app/api/v1`)

3. **Deploy**

```bash
cd project
vercel --prod
```

Ou o Vercel fará deploy automático ao fazer push para o repositório conectado.

4. **Atualizar CORS no Railway**
   Após obter a URL do Vercel, atualize a variável `CORS_ORIGIN` no Railway com a URL do frontend.

## Ordem Recomendada

1. Deploy do Backend no Railway primeiro
2. Obter a URL da API do Railway
3. Deploy do Frontend no Vercel
4. Atualizar `CORS_ORIGIN` no Railway com a URL do Vercel
5. Atualizar `VITE_API_URL` no Vercel com a URL do Railway (se necessário)

## Verificação

### Backend (Railway)

- Health check: `https://seu-app.railway.app/api/v1/health`
- Swagger: `https://seu-app.railway.app/api/docs`

### Frontend (Vercel)

- Acesse a URL fornecida pelo Vercel
- Teste o login e funcionalidades
