# Modelo de Dados - Task IA

**Documento**: Especificação do Modelo de Dados
**Produto**: Task IA
**Versão**: 1.0
**Data**: 22/07/2025
**Baseado em**: FRD Task IA v1.0

---

## 1. Visão Geral

O modelo de dados do Task IA foi projetado para suportar:

- Gerenciamento de usuários e autenticação
- CRUD completo de tarefas
- Sistema de sugestões de IA com métricas
- Sistema de notificações in-app e por e-mail
- Auditoria e soft delete para compliance

**Tecnologias**:

- **Banco de Dados**: SQLite (MVP) → PostgreSQL (produção)
- **ORM**: Prisma
- **Identificadores**: UUID v4 para todas as entidades

---

## 2. Entidades e Relacionamentos

### 2.1 USERS

**Descrição**: Armazena informações dos usuários do sistema.

| Campo         | Tipo         | Constraints      | Descrição                            |
| ------------- | ------------ | ---------------- | ------------------------------------ |
| id            | UUID         | PRIMARY KEY      | Identificador único do usuário       |
| name          | VARCHAR(100) | NOT NULL         | Nome completo do usuário             |
| email         | VARCHAR(255) | UNIQUE, NOT NULL | E-mail para login (único no sistema) |
| password_hash | VARCHAR(255) | NOT NULL         | Hash da senha (bcrypt)               |
| created_at    | TIMESTAMP    | DEFAULT NOW()    | Data de criação da conta             |
| updated_at    | TIMESTAMP    | DEFAULT NOW()    | Data da última atualização           |

**Índices**:

- PRIMARY KEY (id)
- UNIQUE INDEX (email)

**Validações**:

- Email deve seguir formato RFC 5322
- Password_hash deve ter pelo menos 60 caracteres (bcrypt)
- Name deve ter entre 2 e 100 caracteres

### 2.2 TASKS

**Descrição**: Armazena as tarefas criadas pelos usuários.

| Campo       | Tipo         | Constraints            | Descrição                                    |
| ----------- | ------------ | ---------------------- | -------------------------------------------- |
| id          | UUID         | PRIMARY KEY            | Identificador único da tarefa                |
| user_id     | UUID         | FOREIGN KEY, NOT NULL  | Referência ao usuário proprietário           |
| title       | VARCHAR(100) | NOT NULL               | Título da tarefa (3-100 caracteres)          |
| description | TEXT         | NULL                   | Descrição detalhada (máx 500 chars)          |
| priority    | ENUM         | DEFAULT 'Não definida' | Alta, Média, Baixa, Não definida             |
| status      | ENUM         | DEFAULT 'Pendente'     | Pendente, Em Progresso, Concluída, Cancelada |
| due_date    | DATE         | NULL                   | Data de vencimento da tarefa                 |
| is_deleted  | BOOLEAN      | DEFAULT FALSE          | Soft delete flag                             |
| created_at  | TIMESTAMP    | DEFAULT NOW()          | Data de criação                              |
| updated_at  | TIMESTAMP    | DEFAULT NOW()          | Data da última atualização                   |

**Relacionamentos**:

- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

**Índices**:

- PRIMARY KEY (id)
- INDEX (user_id, is_deleted)
- INDEX (user_id, status, is_deleted)
- INDEX (user_id, priority, is_deleted)
- INDEX (due_date) WHERE is_deleted = FALSE

**Validações**:

- Title deve ter entre 3 e 100 caracteres
- Description máximo 500 caracteres
- Due_date não pode ser anterior à data atual (na criação)

### 2.3 AI_SUGGESTIONS

**Descrição**: Registra todas as interações com IA para análise e métricas.

| Campo              | Tipo         | Constraints           | Descrição                                         |
| ------------------ | ------------ | --------------------- | ------------------------------------------------- |
| id                 | UUID         | PRIMARY KEY           | Identificador único da sugestão                   |
| task_id            | UUID         | FOREIGN KEY, NULL     | Referência à tarefa (NULL se tarefa for deletada) |
| user_id            | UUID         | FOREIGN KEY, NOT NULL | Usuário que solicitou a sugestão                  |
| task_title         | VARCHAR(100) | NOT NULL              | Título da tarefa analisada                        |
| task_description   | TEXT         | NULL                  | Descrição da tarefa analisada                     |
| task_due_date      | DATE         | NULL                  | Data de vencimento analisada                      |
| suggested_priority | ENUM         | NOT NULL              | Alta, Média, Baixa                                |
| confidence         | DECIMAL(3,2) | NULL                  | Nível de confiança da IA (0.00-1.00)              |
| reasoning          | TEXT         | NULL                  | Explicação da IA para a sugestão                  |
| was_accepted       | BOOLEAN      | NULL                  | TRUE=aceita, FALSE=rejeitada, NULL=pendente       |
| created_at         | TIMESTAMP    | DEFAULT NOW()         | Data da sugestão                                  |

**Relacionamentos**:

- FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

**Índices**:

- PRIMARY KEY (id)
- INDEX (user_id, created_at)
- INDEX (task_id)
- INDEX (was_accepted) WHERE was_accepted IS NOT NULL

**Validações**:

- Confidence deve estar entre 0.00 e 1.00
- Suggested_priority deve ser um dos valores do enum

### 2.4 NOTIFICATIONS

**Descrição**: Sistema de notificações in-app e por e-mail.

| Campo           | Tipo         | Constraints           | Descrição                                       |
| --------------- | ------------ | --------------------- | ----------------------------------------------- |
| id              | UUID         | PRIMARY KEY           | Identificador único da notificação              |
| user_id         | UUID         | FOREIGN KEY, NOT NULL | Usuário destinatário                            |
| task_id         | UUID         | FOREIGN KEY, NULL     | Tarefa relacionada (NULL se tarefa deletada)    |
| type            | ENUM         | NOT NULL              | task_due_soon, task_overdue, task_status_change |
| title           | VARCHAR(100) | NOT NULL              | Título da notificação                           |
| message         | TEXT         | NOT NULL              | Conteúdo da notificação                         |
| is_read         | BOOLEAN      | DEFAULT FALSE         | Status de leitura (apenas in-app)               |
| delivery_method | ENUM         | NOT NULL              | in_app, email                                   |
| sent_at         | TIMESTAMP    | NULL                  | Data de envio (NULL = não enviada)              |
| created_at      | TIMESTAMP    | DEFAULT NOW()         | Data de criação                                 |

**Relacionamentos**:

- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL

**Índices**:

- PRIMARY KEY (id)
- INDEX (user_id, is_read) WHERE delivery_method = 'in_app'
- INDEX (user_id, created_at)
- INDEX (sent_at) WHERE delivery_method = 'email'

**Validações**:

- Title deve ter entre 1 e 100 caracteres
- Message deve ter pelo menos 1 caractere

### 2.5 USER_SESSIONS

**Descrição**: Gerencia sessões ativas dos usuários para autenticação.

| Campo         | Tipo         | Constraints           | Descrição                      |
| ------------- | ------------ | --------------------- | ------------------------------ |
| id            | UUID         | PRIMARY KEY           | Identificador único da sessão  |
| user_id       | UUID         | FOREIGN KEY, NOT NULL | Usuário proprietário da sessão |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL      | Token único da sessão          |
| expires_at    | TIMESTAMP    | NOT NULL              | Data de expiração da sessão    |
| created_at    | TIMESTAMP    | DEFAULT NOW()         | Data de criação da sessão      |

**Relacionamentos**:

- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

**Índices**:

- PRIMARY KEY (id)
- UNIQUE INDEX (session_token)
- INDEX (user_id)
- INDEX (expires_at)

**Validações**:

- Session_token deve ser único no sistema
- Expires_at deve ser futuro na criação

---

## 3. Relacionamentos Detalhados

### 3.1 User → Tasks (1:N)

- Um usuário pode ter múltiplas tarefas
- Cada tarefa pertence a exatamente um usuário
- Cascade delete: deletar usuário remove todas suas tarefas

### 3.2 User → AI_Suggestions (1:N)

- Um usuário pode ter múltiplas sugestões de IA
- Cada sugestão pertence a exatamente um usuário
- Cascade delete: deletar usuário remove todas suas sugestões

### 3.3 Task → AI_Suggestions (1:N)

- Uma tarefa pode ter múltiplas sugestões (histórico)
- Cada sugestão pode referenciar uma tarefa
- Set NULL: deletar tarefa mantém sugestão para métricas

### 3.4 User → Notifications (1:N)

- Um usuário pode ter múltiplas notificações
- Cada notificação pertence a exatamente um usuário
- Cascade delete: deletar usuário remove suas notificações

### 3.5 Task → Notifications (1:N)

- Uma tarefa pode gerar múltiplas notificações
- Cada notificação pode referenciar uma tarefa
- Set NULL: deletar tarefa mantém notificação

### 3.6 User → User_Sessions (1:N)

- Um usuário pode ter múltiplas sessões ativas
- Cada sessão pertence a exatamente um usuário
- Cascade delete: deletar usuário remove suas sessões

---

## 4. Regras de Negócio no Modelo

### 4.1 Soft Delete

- Tarefas usam soft delete (is_deleted = TRUE)
- Permite manter histórico para auditoria
- Queries devem sempre filtrar is_deleted = FALSE

### 4.2 Auditoria

- Todas as tabelas têm created_at e updated_at
- AI_Suggestions preserva snapshot dos dados da tarefa
- Histórico completo de interações com IA

### 4.3 Cleanup Automático

- Sessões expiradas devem ser removidas periodicamente
- Notificações antigas (>30 dias) devem ser removidas
- Implementar via cron jobs ou triggers

### 4.4 Integridade Referencial

- Foreign keys com ações apropriadas (CASCADE/SET NULL)
- Constraints para validar enums
- Índices para performance de queries comuns

---

## 5. Scripts de Criação (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // ou "postgresql" para produção
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  name         String   @db.VarChar(100)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relacionamentos
  tasks         Task[]
  aiSuggestions AiSuggestion[]
  notifications Notification[]
  sessions      UserSession[]

  @@map("users")
}

model Task {
  id          String       @id @default(uuid())
  userId      String       @map("user_id")
  title       String       @db.VarChar(100)
  description String?      @db.Text
  priority    TaskPriority @default(NOT_DEFINED)
  status      TaskStatus   @default(PENDING)
  dueDate     DateTime?    @map("due_date") @db.Date
  isDeleted   Boolean      @default(false) @map("is_deleted")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  // Relacionamentos
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  aiSuggestions AiSuggestion[]
  notifications Notification[]

  @@index([userId, isDeleted])
  @@index([userId, status, isDeleted])
  @@index([userId, priority, isDeleted])
  @@index([dueDate])
  @@map("tasks")
}

model AiSuggestion {
  id                 String       @id @default(uuid())
  taskId             String?      @map("task_id")
  userId             String       @map("user_id")
  taskTitle          String       @map("task_title") @db.VarChar(100)
  taskDescription    String?      @map("task_description") @db.Text
  taskDueDate        DateTime?    @map("task_due_date") @db.Date
  suggestedPriority  TaskPriority @map("suggested_priority")
  confidence         Decimal?     @db.Decimal(3, 2)
  reasoning          String?      @db.Text
  wasAccepted        Boolean?     @map("was_accepted")
  createdAt          DateTime     @default(now()) @map("created_at")

  // Relacionamentos
  task Task? @relation(fields: [taskId], references: [id], onDelete: SetNull)
  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([taskId])
  @@index([wasAccepted])
  @@map("ai_suggestions")
}

model Notification {
  id             String             @id @default(uuid())
  userId         String             @map("user_id")
  taskId         String?            @map("task_id")
  type           NotificationType
  title          String             @db.VarChar(100)
  message        String             @db.Text
  isRead         Boolean            @default(false) @map("is_read")
  deliveryMethod DeliveryMethod     @map("delivery_method")
  sentAt         DateTime?          @map("sent_at")
  createdAt      DateTime           @default(now()) @map("created_at")

  // Relacionamentos
  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task? @relation(fields: [taskId], references: [id], onDelete: SetNull)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@index([sentAt])
  @@map("notifications")
}

model UserSession {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  sessionToken String   @unique @map("session_token") @db.VarChar(255)
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("user_sessions")
}

// Enums
enum TaskPriority {
  HIGH        @map("Alta")
  MEDIUM      @map("Média")
  LOW         @map("Baixa")
  NOT_DEFINED @map("Não definida")
}

enum TaskStatus {
  PENDING     @map("Pendente")
  IN_PROGRESS @map("Em Progresso")
  COMPLETED   @map("Concluída")
  CANCELLED   @map("Cancelada")
}

enum NotificationType {
  TASK_DUE_SOON     @map("task_due_soon")
  TASK_OVERDUE      @map("task_overdue")
  TASK_STATUS_CHANGE @map("task_status_change")
}

enum DeliveryMethod {
  IN_APP @map("in_app")
  EMAIL  @map("email")
}
```

---

## 6. Considerações de Performance

### 6.1 Índices Estratégicos

- Queries por usuário sempre incluem user_id
- Filtros por status e prioridade são frequentes
- Busca por data de vencimento para notificações

### 6.2 Particionamento Futuro

- Considerar particionamento de notifications por data
- AI_suggestions pode crescer rapidamente
- Implementar archiving para dados antigos

### 6.3 Otimizações

- Usar prepared statements via Prisma
- Implementar cache para dashboard queries
- Considerar índices compostos para queries complexas

---

## 7. Segurança e Compliance

### 7.1 Proteção de Dados

- Passwords sempre hasheados (bcrypt)
- Soft delete para preservar integridade referencial
- UUIDs previnem enumeration attacks

### 7.2 LGPD Compliance

- Soft delete permite "esquecimento" de dados
- AI_suggestions preserva dados mínimos necessários
- User cascade delete remove todos os dados relacionados

### 7.3 Auditoria

- Timestamps em todas as operações
- Histórico completo de sugestões de IA
- Logs de acesso via sessions table
