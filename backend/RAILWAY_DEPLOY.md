# Deploy no Railway

Este guia explica como fazer o deploy do backend UNIO no Railway.

## Pré-requisitos

1. Conta no Railway (https://railway.app)
2. Projeto conectado ao GitHub
3. Banco de dados PostgreSQL

## Configuração das Variáveis de Ambiente

Configure as seguintes variáveis no Railway:

### Obrigatórias

- `DATABASE_URL`: URL do banco PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (use uma string forte)
- `NODE_ENV`: `production`

### Opcionais

- `PORT`: Porta do servidor (padrão: 3000)
- `API_PREFIX`: Prefixo da API (padrão: api/v1)
- `CORS_ORIGIN`: URL do frontend para CORS
- `REDIS_URL`: URL do Redis (se usando)
- `SMTP_*`: Configurações de email
- `TWILIO_*`: Configurações do Twilio

## Passos para Deploy

1. **Conectar ao Railway**
   - Acesse https://railway.app
   - Faça login com GitHub
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório UNIO

2. **Configurar o Serviço**
   - Railway detectará automaticamente o Dockerfile
   - Configure as variáveis de ambiente
   - Adicione um banco PostgreSQL

3. **Configurar Banco de Dados**
   - Adicione um serviço PostgreSQL
   - Railway gerará automaticamente a `DATABASE_URL`
   - Execute as migrações: `npx prisma migrate deploy`

4. **Deploy**
   - Railway fará o build e deploy automaticamente
   - Monitore os logs para verificar se tudo está funcionando

## Comandos Úteis

```bash
# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Executar seed (se necessário)
npx prisma db seed
```

## Verificação

Após o deploy, verifique:

- Health check: `https://seu-app.railway.app/api/v1/health`
- Swagger docs: `https://seu-app.railway.app/api/docs`

## Troubleshooting

- Verifique os logs no Railway Dashboard
- Confirme se todas as variáveis estão configuradas
- Teste a conexão com o banco de dados
