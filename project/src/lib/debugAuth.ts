export const debugAuth = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('❌ Nenhum token encontrado no localStorage');
    return;
  }

  console.log('🔍 === DEBUG AUTENTICAÇÃO ===');
  console.log('Token encontrado:', token.substring(0, 50) + '...');

  try {
    const parts = token.split('.');
    console.log('Partes do token:', parts.length);

    if (parts.length !== 3) {
      console.log('❌ Token inválido: formato incorreto');
      return;
    }

    const payload = JSON.parse(atob(parts[1]));
    console.log('📦 Payload decodificado:', payload);

    const isExternalToken = 'Id' in payload || 'PerfilId' in payload;
    const isLocalToken = 'sub' in payload && 'email' in payload;

    console.log(
      '🔐 Tipo de token:',
      isExternalToken ? 'EXTERNO' : isLocalToken ? 'LOCAL' : 'DESCONHECIDO'
    );

    if (payload.exp) {
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      const expired = exp < now;
      const expiresIn = exp - now;

      console.log('⏰ Expiração:');
      console.log(
        '  - Data de expiração:',
        new Date(exp * 1000).toLocaleString()
      );
      console.log('  - Agora:', new Date(now * 1000).toLocaleString());
      console.log('  - Tempo restante:', Math.floor(expiresIn / 60), 'minutos');
      console.log('  - Status:', expired ? '❌ EXPIRADO' : '✅ VÁLIDO');

      if (expired) {
        console.log('⚠️ Token expirado! Precisa renovar.');
      }
    } else {
      console.log('⚠️ Token sem data de expiração');
    }

    if (isExternalToken) {
      console.log('📋 Dados do token externo:');
      console.log('  - ID:', payload.Id);
      console.log('  - Perfil ID:', payload.PerfilId);
      console.log('  - Empresa:', payload.Empresa);
    }

    if (isLocalToken) {
      console.log('📋 Dados do token local:');
      console.log('  - User ID (sub):', payload.sub);
      console.log('  - Email:', payload.email);
      console.log('  - Role:', payload.role);
    }

    console.log('🔍 === FIM DO DEBUG ===');

    return {
      token,
      payload,
      isExternalToken,
      isLocalToken,
      expired: payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : null,
    };
  } catch (error) {
    console.error('❌ Erro ao decodificar token:', error);
    return null;
  }
};

export const testAuthFlow = async () => {
  console.log('🧪 === TESTE DO FLUXO DE AUTENTICAÇÃO ===');

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Nenhum token encontrado');
    return;
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  console.log('1️⃣ Testando validação do token externo...');
  try {
    const response = await fetch(
      `${API_BASE_URL}/simple-auth/validate-external-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();
    console.log('Resposta:', data);

    if (data.success && data.data?.token) {
      console.log('✅ Token validado com sucesso!');
      console.log(
        'Novo token local:',
        data.data.token.substring(0, 50) + '...'
      );

      console.log('2️⃣ Testando busca de perfil...');
      const profileResponse = await fetch(
        `${API_BASE_URL}/simple-auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${data.data.token}`,
          },
        }
      );

      const profileData = await profileResponse.json();
      console.log('Perfil:', profileData);

      if (profileData.success) {
        console.log('✅ Perfil obtido com sucesso!');
      } else {
        console.log('❌ Erro ao obter perfil:', profileData.message);
      }
    } else {
      console.log('❌ Falha na validação:', data.message);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }

  console.log('🧪 === FIM DO TESTE ===');
};

if (typeof window !== 'undefined') {
  (
    window as { debugAuth?: () => void; testAuthFlow?: () => Promise<void> }
  ).debugAuth = debugAuth;
  (
    window as { debugAuth?: () => void; testAuthFlow?: () => Promise<void> }
  ).testAuthFlow = testAuthFlow;
}
