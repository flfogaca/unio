# Instruções para o Botão da Aplicação Externa

## O que o botão precisa fazer:

### 1. Fazer POST para obter o token

**URL:** `https://homolog.uniogroup.app/api/Usuario/login`

**Método:** POST

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "login": "CPF_DO_USUARIO",
  "senha": "SENHA_DO_USUARIO",
  "tokenApp": "M3vVn10"
}
```

**Resposta:**

```json
{
  "token": "JWT_TOKEN_AQUI"
}
```

### 2. Salvar o token no localStorage

```javascript
localStorage.setItem('token', tokenRecebido);
```

### 3. Redirecionar para a aplicação Unio

```javascript
window.location.href = 'URL_DA_APLICACAO_UNIO';
```

## Código Completo do Botão

```javascript
async function handleRedirectToUnio() {
  try {
    // 1. Fazer login
    const response = await fetch(
      'https://homolog.uniogroup.app/api/Usuario/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: 'CPF_DO_USUARIO',
          senha: 'SENHA_DO_USUARIO',
          tokenApp: 'M3vVn10',
        }),
      }
    );

    const data = await response.json();

    if (!data.token) {
      throw new Error('Token não recebido');
    }

    // 2. Salvar token
    localStorage.setItem('token', data.token);

    // 3. Redirecionar
    window.location.href = 'URL_DA_APLICACAO_UNIO';
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao fazer login');
  }
}
```

## Exemplo HTML

```html
<button onclick="handleRedirectToUnio()">Acessar Unio</button>
```

## Exemplo React

```jsx
<button onClick={handleRedirectToUnio}>Acessar Unio</button>
```

## Importante

- O token DEVE ser salvo com a chave exata: `token`
- A aplicação Unio valida o token automaticamente ao carregar
- Não precisa passar o token na URL, apenas salvar no localStorage
