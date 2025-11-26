# Integração do Botão da Aplicação Externa

## Requisitos para o Botão

O botão na aplicação externa precisa fazer o seguinte:

### 1. Fazer Login na API Externa

**Endpoint:** `POST https://homolog.uniogroup.app/api/Usuario/login`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "login": "CPF_DO_USUARIO",
  "senha": "SENHA_DO_USUARIO",
  "tokenApp": "M3vVn10"
}
```

**Resposta esperada:**

```json
{
  "token": "JWT_TOKEN_AQUI"
}
```

### 2. Salvar o Token no localStorage

Após receber o token da API, salve no localStorage com a chave `token`:

```javascript
localStorage.setItem('token', tokenRecebido);
```

### 3. Redirecionar para a Aplicação

Redirecione para a aplicação Unio passando o token como parâmetro ou hash:

**Opção 1: Via URL com hash (recomendado)**

```
https://sua-aplicacao-unio.com/#/?token=JWT_TOKEN_AQUI
```

**Opção 2: Via localStorage (mais seguro)**
Se a aplicação estiver no mesmo domínio ou subdomínio, apenas salve o token no localStorage e redirecione:

```
https://sua-aplicacao-unio.com/
```

A aplicação Unio irá:

1. Verificar se há token no localStorage
2. Extrair o ID do usuário do token
3. Validar o token fazendo GET para `https://homolog.uniogroup.app/api/Usuario/{id}` com o token no header Authorization
4. Carregar os dados do usuário
5. Autenticar o usuário automaticamente

## Exemplo Completo de Código do Botão

```javascript
async function handleRedirectToUnio() {
  try {
    // 1. Fazer login na API externa
    const loginResponse = await fetch(
      'https://homolog.uniogroup.app/api/Usuario/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: '987.654.321-00', // CPF do usuário
          senha: 'senha_do_usuario',
          tokenApp: 'M3vVn10',
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginData.token) {
      throw new Error('Token não recebido da API');
    }

    // 2. Salvar token no localStorage
    localStorage.setItem('token', loginData.token);

    // 3. Redirecionar para a aplicação Unio
    window.location.href = 'https://sua-aplicacao-unio.com/';
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    alert('Erro ao fazer login. Por favor, tente novamente.');
  }
}
```

## Exemplo com HTML/React

```jsx
<button onClick={handleRedirectToUnio}>Acessar Unio</button>
```

## Validação do Token

A aplicação Unio irá validar o token automaticamente fazendo:

**GET** `https://homolog.uniogroup.app/api/Usuario/{id}`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

Onde `{id}` é o ID do usuário extraído do token (campo `Id` no payload do JWT).

Se a requisição retornar status 200, o token é válido e o usuário será autenticado.

## Campos do Token JWT

O token JWT contém no payload:

- `Id`: ID do usuário (usado para buscar os dados)
- `PerfilId`: ID do perfil (1=Paciente, 2=Dentista, 3=Psicólogo, 4=Médico, 5=Admin)
- `exp`: Data de expiração do token

## Notas Importantes

1. O token deve ser salvo no localStorage com a chave exata `token`
2. A aplicação Unio valida o token automaticamente ao carregar
3. Se o token estiver expirado ou inválido, o usuário verá uma tela de erro
4. O token persiste entre recarregamentos da página
5. O token é validado a cada vez que a aplicação é carregada
