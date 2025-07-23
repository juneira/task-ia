# Task IA - Sistema Inteligente de Gerenciamento de Tarefas

Um sistema de gerenciamento de tarefas que utiliza IA para sugerir prioridades automaticamente, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- ✅ **CRUD completo de tarefas** - Criar, listar, editar e excluir tarefas
- 🤖 **Sugestão de prioridade via IA** - DeepSeek analisa título, descrição e prazo
- 📊 **Dashboard intuitivo** - Visão geral com métricas e filtros
- 🔔 **Sistema de notificações** - Alertas in-app e por e-mail
- 🔐 **Autenticação segura** - Sistema de login e cadastro
- 📱 **Design responsivo** - Funciona em desktop e mobile

## 🛠️ Tecnologias

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: API Routes do Next.js
- **Banco de dados**: SQLite + Prisma ORM
- **IA**: DeepSeek API
- **Qualidade**: ESLint + Prettier + Husky

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/juneira/task-ia.git
cd task-ia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

### 4. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes completos da arquitetura.

## 🗺️ Roadmap

Veja o [CHANGELOG.md](./CHANGELOG.md) para acompanhar o progresso do desenvolvimento.

---

Desenvolvido com ❤️ por [Marcelo Marcinio Pereira Junior](https://github.com/juneira)
