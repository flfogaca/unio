# Status do Deploy - UNIO

## ✅ Deploy Concluído

### Backend - Railway

- **Status**: ✅ Configurado e pronto
- **URL**: https://ravishing-eagerness-production.up.railway.app
- **Health Check**: https://ravishing-eagerness-production.up.railway.app/api/v1/health
- **Swagger Docs**: https://ravishing-eagerness-production.up.railway.app/api/docs

**Variáveis de Ambiente Configuradas:**

- ✅ DATABASE_URL (PostgreSQL)
- ✅ JWT_SECRET
- ✅ JWT_EXPIRES_IN (15m)
- ✅ JWT_REFRESH_SECRET
- ✅ JWT_REFRESH_EXPIRES_IN (7d)
- ✅ NODE_ENV (production)
- ✅ PORT (3000)
- ✅ API_PREFIX (api/v1)
- ✅ CORS_ORIGIN (atualizado para URL do Vercel)

**Migrações:**

- ✅ Todas as migrações aplicadas

### Frontend - Vercel

- **Status**: ✅ Deploy concluído
- **URL de Produção**: https://unio-jlv97fvcy-projetos-flamarion.vercel.app
- **Domínios**: unio-online.com.br e www.unio-online.com.br (SSL sendo configurado)

**Variáveis de Ambiente:**

- ✅ VITE_API_URL (configurado)

## 🔧 Verificações Necessárias

1. **Verificar VITE_API_URL no Vercel**
   - Acesse: https://vercel.com/projetos-flamarion/unio/settings/environment-variables
   - Confirme que `VITE_API_URL` está configurado como: `https://ravishing-eagerness-production.up.railway.app/api/v1`
   - Se não estiver, atualize via dashboard ou CLI:
     ```bash
     cd project
     npx vercel env add VITE_API_URL production
     # Digite: https://ravishing-eagerness-production.up.railway.app/api/v1
     ```

2. **Testar Aplicação**
   - Acesse: https://unio-jlv97fvcy-projetos-flamarion.vercel.app
   - Teste o login
   - Verifique se as requisições à API estão funcionando

3. **Verificar Logs (se necessário)**
   - Railway: `cd backend && railway logs`
   - Vercel: `cd project && npx vercel logs`

## 📝 Próximos Passos

1. ✅ Deploy do backend no Railway - **CONCLUÍDO**
2. ✅ Deploy do frontend no Vercel - **CONCLUÍDO**
3. ⚠️ Verificar e atualizar VITE_API_URL no Vercel (se necessário)
4. ⚠️ Testar aplicação completa
5. ⚠️ Configurar domínio customizado (se necessário)

## 🔗 Links Úteis

- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/projetos-flamarion/unio
- **Backend API**: https://ravishing-eagerness-production.up.railway.app/api/v1
- **Frontend**: https://unio-jlv97fvcy-projetos-flamarion.vercel.app
