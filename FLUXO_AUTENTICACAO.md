# Fluxo de Autenticação - Análise Completa

## 📋 Resumo do Fluxo

### 1. **Login Inicial (LoginTrabalho.tsx)**

**Rota:** `/login/trabalho`

**Processo:**

1. Usuário faz login na aplicação externa (`https://homolog.uniogroup.app/api/Usuario/login`)
2. Recebe um token JWT externo
3. Token é salvo no `localStorage` via `apiClient.setToken(data.token)`
4. Chama `checkAuth()` para validar
5. Redireciona para `/`

**Código:**

```typescript
// LoginTrabalho.tsx linha 39-42
if (response.ok && data.token) {
  apiClient.setToken(data.token); // Salva token externo
  await checkAuth(); // Valida token
  window.location.href = '/';
}
```

---

### 2. **Validação do Token (checkAuth em auth.ts)**

**Processo:**

1. Busca token do `localStorage`
2. Chama `apiClient.validateExternalToken(token)`
3. Se válido, busca perfil do usuário
4. Atualiza estado de autenticação

**Fluxo detalhado:**

```typescript
// auth.ts linha 42-91
checkAuth: async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    set({ isAuthenticated: false, user: null, isLoading: false });
    return;
  }

  // Valida token externo
  const isValid = await apiClient.validateExternalToken(token);

  if (isValid) {
    // Busca perfil do usuário
    const profileResponse = await apiClient.getProfile();
    // Atualiza estado...
  } else {
    // Limpa token e desautentica
    apiClient.clearToken();
    set({ isAuthenticated: false, user: null, isLoading: false });
  }
};
```

---

### 3. **Validação do Token Externo (api.ts)**

**Endpoint:** `/simple-auth/validate-external-token`

**Processo:**

1. Verifica formato do token (3 partes separadas por `.`)
2. Verifica expiração (`exp`)
3. Envia token para backend
4. Backend valida e retorna token local
5. Substitui token externo por token local

**Código:**

```typescript
// api.ts linha 70-107
async validateExternalToken(token: string): Promise<boolean> {
  // 1. Valida formato
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // 2. Valida expiração
  const payload = JSON.parse(atob(parts[1])) as { exp?: number };
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return false;
  }

  // 3. Envia para backend
  const response = await fetch(`${this.baseURL}/simple-auth/validate-external-token`, {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  // 4. Se sucesso, substitui token
  if (response.ok && data.success && data.data?.token) {
    this.setToken(data.data.token);  // Substitui token externo por local
    return true;
  }

  return false;
}
```

---

### 4. **Backend - Validação do Token Externo (simple-auth.controller.ts)**

**Endpoint:** `POST /simple-auth/validate-external-token`

**Processo:**

1. Recebe token externo
2. Decodifica payload (sem verificar assinatura - token externo)
3. Extrai `Id` e `PerfilId` do payload
4. Busca ou cria usuário no banco
5. Gera token JWT local
6. Retorna token local

**Código:**

```typescript
// simple-auth.controller.ts linha 58-143
@Post('validate-external-token')
async validateExternalToken(@Body() body: { token: string }) {
  // 1. Decodifica token (sem verificar assinatura)
  const payload = JSON.parse(
    Buffer.from(parts[1], 'base64').toString('utf-8')
  );

  // 2. Extrai dados
  const externalUserId = payload.Id;
  const perfilId = payload.PerfilId || '2';

  // 3. Busca ou cria usuário
  let user = await this.prismaService.user.findFirst({
    where: { OR: [{ id: externalUserId }, { cpf: externalUserId }] },
  });

  if (!user) {
    // Cria usuário se não existir
    user = await this.prismaService.user.create({...});
  }

  // 4. Gera token local
  const localToken = this.jwtService.sign({
    email: user.email,
    sub: user.id,
    role: user.role,
  });

  // 5. Retorna token local
  return { success: true, data: { token: localToken, user: {...} } };
}
```

---

### 5. **Busca de Perfil (getProfile)**

**Endpoint:** `GET /simple-auth/profile`

**Guarda:** `JwtAuthGuard` (requer token local válido)

**Processo:**

1. Extrai `userId` do token JWT local
2. Busca usuário no banco
3. Retorna dados do perfil

**Código:**

```typescript
// simple-auth.controller.ts linha 145-185
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: JwtPayload) {
  const userId = user.sub;
  const userProfile = await this.prismaService.user.findUnique({
    where: { id: userId },
  });
  return { success: true, data: userProfile };
}
```

---

### 6. **Validação JWT (JwtStrategy)**

**Processo:**

1. Extrai token do header `Authorization: Bearer <token>`
2. Verifica assinatura com `JWT_SECRET`
3. Valida expiração
4. Retorna payload decodificado

**Código:**

```typescript
// jwt.strategy.ts
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

---

## 🔍 Pontos de Falha Identificados

### 1. **Token Externo Expirado**

- **Onde:** `api.ts` linha 83
- **Problema:** Se token externo expirou, `validateExternalToken` retorna `false`
- **Resultado:** Usuário vê "Falha na Autenticação"

### 2. **Backend não consegue decodificar token externo**

- **Onde:** `simple-auth.controller.ts` linha 70-72
- **Problema:** Se formato do token estiver incorreto, falha silenciosamente
- **Resultado:** Retorna `{ success: false }`

### 3. **Token local não é gerado corretamente**

- **Onde:** `simple-auth.controller.ts` linha 125
- **Problema:** Se `JWT_SECRET` não estiver configurado, usa 'default-secret'
- **Resultado:** Token pode ser inválido

### 4. **getProfile falha após validação**

- **Onde:** `auth.ts` linha 56
- **Problema:** Se `getProfile` falhar após `validateExternalToken` retornar true
- **Resultado:** Usuário fica autenticado mas sem dados do usuário

### 5. **Token local expira (15 minutos)**

- **Onde:** `auth.module.ts` linha 18
- **Problema:** Token local expira em 15 minutos
- **Resultado:** Após 15 minutos, `getProfile` falha

---

## 🐛 Possíveis Causas do Erro Atual

### Cenário 1: Token Externo Expirado

```
1. Usuário faz login → recebe token externo
2. Token externo expira
3. checkAuth() chama validateExternalToken()
4. validateExternalToken() retorna false (token expirado)
5. checkAuth() limpa token e mostra AuthError
```

### Cenário 2: Backend não consegue processar token

```
1. Token externo enviado para backend
2. Backend falha ao decodificar (formato incorreto)
3. Retorna { success: false }
4. validateExternalToken() retorna false
5. Usuário vê erro
```

### Cenário 3: Token local expirado

```
1. Token local foi gerado há mais de 15 minutos
2. getProfile() é chamado
3. JwtAuthGuard rejeita token expirado
4. getProfile() falha
5. Usuário vê erro
```

### Cenário 4: JWT_SECRET diferente

```
1. Backend gera token com um JWT_SECRET
2. Backend reinicia com JWT_SECRET diferente
3. Token não pode ser validado
4. getProfile() falha
```

---

## 🔧 Como Debugar

### 1. Verificar token no localStorage

```javascript
// No console do navegador
localStorage.getItem('token');
```

### 2. Verificar se token é externo ou local

```javascript
// Token externo tem payload com "Id" e "PerfilId"
// Token local tem payload com "sub", "email", "role"
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

### 3. Verificar expiração

```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = payload.exp;
const now = Math.floor(Date.now() / 1000);
console.log('Expira em:', new Date(exp * 1000));
console.log('Agora:', new Date(now * 1000));
console.log('Expirado?', exp < now);
```

### 4. Testar validação manualmente

```javascript
// No console
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/v1/simple-auth/validate-external-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
})
  .then(r => r.json())
  .then(console.log);
```

### 5. Verificar JWT_SECRET no backend

```bash
# No terminal do backend
echo $JWT_SECRET
```

---

## ✅ Soluções Recomendadas

### 1. Adicionar logs detalhados

- Logar cada etapa do processo
- Logar erros específicos
- Logar payloads dos tokens

### 2. Melhorar tratamento de erros

- Retornar mensagens de erro específicas
- Diferenciar entre token expirado, inválido, etc.

### 3. Implementar refresh token

- Evitar expiração de 15 minutos
- Renovar token automaticamente

### 4. Validar token antes de salvar

- Verificar formato e expiração antes de salvar no localStorage

### 5. Adicionar retry logic

- Tentar novamente em caso de falha temporária
