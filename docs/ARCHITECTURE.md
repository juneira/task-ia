# Estrutura do Projeto - Task IA

Este projeto segue os princípios de Clean Architecture para manter o código organizando, testável e escalável.

## 📁 Estrutura de Pastas

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── dashboard/         # Páginas do dashboard
│   └── globals.css        # Estilos globais
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes de UI base
│   ├── forms/            # Componentes de formulários
│   └── layout/           # Componentes de layout
├── hooks/                # Custom hooks React
├── lib/                  # Configurações e utilitários
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Configuração de autenticação
│   └── validations.ts    # Esquemas de validação
├── services/             # Lógica de negócio e serviços
│   ├── auth.service.ts   # Serviços de autenticação
│   ├── task.service.ts   # Serviços de tarefas
│   └── ai.service.ts     # Serviços de IA
├── types/                # Definições de tipos TypeScript
├── utils/                # Funções utilitárias
├── validations/          # Esquemas de validação Zod
├── middleware/           # Middlewares customizados
└── constants/            # Constantes da aplicação

prisma/                   # Schema e configurações do Prisma
├── schema.prisma         # Definição do schema
├── seed.ts              # Dados de seed
└── migrations/          # Migrações do banco

tests/                   # Testes automatizados
├── unit/                # Testes unitários
├── integration/         # Testes de integração
└── e2e/                # Testes end-to-end

docs/                    # Documentação do projeto
├── prd.md              # Product Requirements Document
├── frd.md              # Functional Requirements Document
└── data-model.md       # Modelo de dados

.github/                 # Configurações do GitHub
└── workflows/          # GitHub Actions (CI/CD)
```

## 🏗️ Princípios de Arquitetura

### 1. Separação de Responsabilidades

- **Componentes**: Apenas lógica de apresentação
- **Serviços**: Lógica de negócio e integração com APIs
- **Hooks**: Lógica de estado e efeitos colaterais
- **Utils**: Funções puras e utilitárias

### 2. Dependency Inversion

- Serviços dependem de abstrações, não de implementações
- Fácil para testar e trocar implementações

### 3. Single Responsibility

- Cada arquivo/classe tem uma única responsabilidade
- Facilita manutenção e testes

### 4. DRY (Don't Repeat Yourself)

- Componentes e funções reutilizáveis
- Constantes centralizadas
- Tipos compartilhados

## 📝 Convenções de Nomenclatura

### Arquivos e Pastas

- **Componentes**: PascalCase (ex: `TaskCard.tsx`)
- **Hooks**: camelCase iniciando com "use" (ex: `useAuth.ts`)
- **Serviços**: camelCase com ".service" (ex: `task.service.ts`)
- **Tipos**: PascalCase com ".types" (ex: `Task.types.ts`)
- **Utils**: camelCase (ex: `formatDate.ts`)

### Variáveis e Funções

- **Variáveis**: camelCase (ex: `taskList`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Funções**: camelCase (ex: `createTask`)
- **Componentes**: PascalCase (ex: `TaskCard`)

## 🧪 Estratégia de Testes

### Testes Unitários (`tests/unit/`)

- Funções utilitárias
- Serviços isolados
- Componentes individuais
- Hooks customizados

### Testes de Integração (`tests/integration/`)

- APIs e banco de dados
- Fluxos de autenticação
- Integração entre serviços

### Testes E2E (`tests/e2e/`)

- Fluxos completos do usuário
- Testes de regressão
- Validação de funcionalidades críticas

## 🚀 Próximos Passos

1. ✅ Estrutura base criada
2. ⏳ Configurar Prisma e banco de dados
3. ⏳ Implementar autenticação
4. ⏳ Criar APIs de tarefas
5. ⏳ Integrar com IA
6. ⏳ Desenvolver frontend
7. ⏳ Implementar testes
8. ⏳ Configurar CI/CD
