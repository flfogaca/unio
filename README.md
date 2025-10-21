# UNIO - Plataforma de Consultas Médicas Online

Sistema completo de telemedicina para clube de benefícios, permitindo consultas online com psicólogos, dentistas e médicos clínicos.

## 🏗️ Arquitetura

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + TypeScript + Prisma + Supabase
- **Banco de Dados**: PostgreSQL (Supabase)
- **Arquitetura**: Hexagonal (Ports & Adapters)
- **Padrões**: SOLID + Clean Code

## 📁 Estrutura do Projeto

```
unio/
├── project/          # Frontend React
├── backend/          # Backend NestJS
├── package.json      # Workspace root
├── .eslintrc.js      # Configuração ESLint
├── .prettierrc       # Configuração Prettier
└── README.md         # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Conta no Supabase

### Instalação

```bash
# Instalar dependências
npm run install:all

# Configurar variáveis de ambiente
cp project/.env.example project/.env
cp backend/.env.example backend/.env

# Preencher as variáveis no .env conforme necessário
```

### Desenvolvimento

```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou executar separadamente
npm run dev:frontend  # Frontend na porta 5173
npm run dev:backend   # Backend na porta 3000
```

### Build

```bash
# Build de todos os projetos
npm run build

# Build específico
npm run build:frontend
npm run build:backend
```

### Testes

```bash
# Executar todos os testes
npm run test

# Testes específicos
npm run test:frontend
npm run test:backend
```

### Linting e Formatação

```bash
# Lint todos os projetos
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código
npm run format

# Verificar formatação
npm run format:check
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

#### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## 📋 Funcionalidades

### Para Pacientes

- ✅ Autenticação via CPF e senha
- ✅ Solicitar atendimento por especialidade
- ✅ Acompanhar posição na fila
- ✅ Consultas por vídeo
- ✅ Histórico de consultas
- ✅ Suporte integrado

### Para Profissionais

- ✅ Visualizar fila de pacientes
- ✅ Assumir consultas
- ✅ Sala de consulta virtual
- ✅ Prontuário eletrônico
- ✅ Emissão de receitas/atestados (Mevo)

### Para Administradores

- ✅ Dashboard com métricas
- ✅ Gerenciamento de usuários
- ✅ Relatórios e analytics
- ✅ Configurações do sistema

## 🎯 Especialidades

1. **Psicólogo** - Com opções de consulta urgente/agendada
2. **Dentista** - Atendimento odontológico completo
3. **Médico Clínico** - Consultas médicas gerais

## 🔒 Segurança

- Autenticação JWT + Refresh tokens
- Criptografia de dados sensíveis
- Row Level Security (RLS) no Supabase
- Auditoria completa de acessos
- Compliance LGPD

## 📱 Tecnologias

### Frontend

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (estado)
- Supabase Client
- Web Push API

### Backend

- NestJS + TypeScript
- Prisma ORM
- Supabase (PostgreSQL)
- Redis (cache)
- JWT Authentication
- WebRTC (vídeo)

### DevOps

- Git hooks (Husky)
- ESLint + Prettier
- Conventional Commits
- Lint-staged

## 🚀 Deploy

- **Frontend**: Vercel
- **Backend**: Railway
- **Banco**: Supabase

## 📝 Convenções

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar autenticação por CPF
fix: corrigir bug na fila de espera
docs: atualizar documentação da API
```

### Código

- ESLint + Prettier configurados
- TypeScript strict mode
- Arquitetura hexagonal
- Princípios SOLID

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte técnico ou dúvidas, entre em contato através dos canais oficiais do projeto.
