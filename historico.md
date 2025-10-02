# Histórico do Projeto UNIO

## Estrutura do Projeto
- **Frontend**: `project/` - React/TypeScript com Vite
- **Backend**: `backend/` - A ser criado
- **Padrões**: SOLID e Clean Code obrigatórios
- **Formato de Resposta**: JSON com 3 opções para debate

## Contexto Atual
- Projeto é uma plataforma de consultas médicas online para clube de benefícios
- Especialidades: Psicólogo, Dentista, Médico Clínico
- Funcionalidades: Autenticação via CPF, streaming de vídeo, integração Mevo, prontuário eletrônico
- Sistema 24h com atendimento imediato

## Tecnologias Frontend Atual
- React 18 + TypeScript
- Zustand (estado)
- Tailwind CSS
- Chart.js
- Lucide React
- Vite

## Lacunas Identificadas
1. Sistema de autenticação real
2. Módulos específicos por especialidade
3. Sistema de vídeo/streaming
4. Prontuário eletrônico
5. Integração com Mevo
6. Isolamento por especialidade
7. Funcionamento 24h

## Decisões Tomadas
- **Opção Escolhida**: A - Estrutura Híbrida com Monorepo
- **Backend**: TypeScript obrigatório
- **Frontend**: React/TypeScript (atual)
- **Banco de Dados**: PostgreSQL do Supabase
- **Arquitetura**: Opção A - Arquitetura Hexagonal (Ports & Adapters)
- **Identificadores**: UUID obrigatório para todas as tabelas
- **Estratégia de Desenvolvimento**: 
  - Segurança: B - Segurança First com Compliance Completo
  - Performance: B - Performance Robusta com Monitoring Completo  
  - UX/UI: B - UX Completa com Acessibilidade Total
- **Ambiente**: Local (desenvolvimento)
- **Email**: Resend (com fallback para console durante desenvolvimento)
- **Storage**: Supabase Storage (centralizado)
- **CI/CD**: Git-based
- **Package Manager**: npm
- **SMS/Push**: B - Supabase Edge Functions + Web Push (centralizado)
- **Deploy**: Frontend Vercel + Backend Railway
- **Commits**: Automáticos a cada atualização importante
- **Ambiente**: Local com variáveis de ambiente configuradas

## Última Atividade
- Análise completa do projeto atual
- Identificação de funcionalidades faltantes
- Definição de estrutura frontend/backend
- Estabelecimento de padrões de desenvolvimento
- Escolha da arquitetura: Monorepo com TypeScript
- Definição da ordem de implementação: B (Monorepo) → A (Backend Completo) → C (Schema DB)

## Plano de Implementação
1. **B - Setup do Monorepo Completo** (estrutura total)
2. **A - Setup Inicial do Backend** (NestJS completo)
3. **C - Schema do Banco de Dados** (estrutura completa)
