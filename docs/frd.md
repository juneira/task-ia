# Functional Requirements Document (FRD)

**Product Name**: Task IA
**Document Type**: Functional Requirements Document
**Document Owner**: Marcelo Marcinio Pereira Junior
**Version**: 1.0
**Last Updated**: 22/07/2025
**Based on PRD**: Task IA v1.0

---

## 1. Introdução

### 1.1 Propósito

Este documento define os requisitos funcionais detalhados para o sistema Task IA, especificando comportamentos, funcionalidades e regras de negócio necessárias para implementação.

### 1.2 Escopo

O FRD abrange todas as funcionalidades do MVP conforme definido no PRD, incluindo CRUD de tarefas, sugestão de prioridade via IA, dashboard e sistema de notificações.

---

## 2. Requisitos Funcionais

### 2.1 Autenticação e Gerenciamento de Usuários

#### RF001 - Cadastro de Usuário

**Descrição**: O sistema deve permitir que novos usuários se cadastrem na plataforma.

**Critérios de Aceitação**:

- O usuário deve fornecer nome, e-mail e senha
- E-mail deve ser único no sistema
- Senha deve ter no mínimo 8 caracteres
- Sistema deve validar formato do e-mail
- Após cadastro bem-sucedido, usuário deve ser redirecionado para dashboard
- Mensagem de confirmação deve ser exibida

**Regras de Negócio**:

- RN001: E-mail duplicado deve retornar erro específico
- RN002: Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número
- RN003: Sistema deve criptografar senha antes de armazenar

#### RF002 - Login de Usuário

**Descrição**: O sistema deve autenticar usuários existentes.

**Critérios de Aceitação**:

- Usuário deve fornecer e-mail e senha
- Sistema deve validar credenciais
- Login bem-sucedido deve criar sessão e redirecionar para dashboard
- Login falha deve exibir mensagem de erro apropriada
- Sistema deve implementar proteção contra força bruta

**Regras de Negócio**:

- RN004: Após 5 tentativas falhadas, conta deve ser temporariamente bloqueada (15 minutos)
- RN005: Sessão deve expirar após 24 horas de inatividade

#### RF003 - Logout de Usuário

**Descrição**: O sistema deve permitir que usuários façam logout.

**Critérios de Aceitação**:

- Botão de logout deve estar sempre visível quando logado
- Logout deve destruir sessão atual
- Usuário deve ser redirecionado para página de login
- Mensagem de confirmação deve ser exibida

### 2.2 Gerenciamento de Tarefas (CRUD)

#### RF004 - Criar Tarefa

**Descrição**: O sistema deve permitir a criação de novas tarefas através do endpoint POST /api/tasks.

**Critérios de Aceitação**:

- Endpoint: POST /api/tasks
- Usuário deve fornecer título (obrigatório) e descrição (opcional)
- Data de entrega deve ser selecionável via datepicker
- Status inicial deve ser "Pendente"
- Prioridade inicial deve ser "Não definida"
- Sistema deve salvar tarefa no banco de dados
- Feedback visual deve confirmar criação
- Resposta deve retornar dados da tarefa criada com ID

**Regras de Negócio**:

- RN006: Título deve ter entre 3 e 100 caracteres
- RN007: Descrição pode ter até 500 caracteres
- RN008: Data de entrega não pode ser anterior à data atual
- RN009: Se data não fornecida, sistema assume 7 dias a partir da criação

#### RF005 - Listar Tarefas

**Descrição**: O sistema deve exibir lista de tarefas do usuário através do endpoint GET /api/tasks.

**Critérios de Aceitação**:

- Endpoint: GET /api/tasks
- Sistema deve retornar todas as tarefas do usuário atual em formato JSON
- Lista deve incluir: id, título, descrição, prioridade, status, data de entrega, datas de criação/atualização
- Tarefas devem ser ordenadas por prioridade (Alta → Média → Baixa) e depois por data de entrega
- Sistema deve implementar paginação via query params (limite padrão: 20 itens)
- Deve suportar filtros via query params (status, prioridade, data)

**Regras de Negócio**:

- RN010: Apenas tarefas do usuário logado devem ser retornadas
- RN011: Endpoint deve incluir metadados de paginação na resposta

#### RF006 - Editar Tarefa

**Descrição**: O sistema deve permitir edição de tarefas existentes através do endpoint PUT /api/tasks/[id].

**Critérios de Aceitação**:

- Endpoint: PUT /api/tasks/[id]
- Usuário deve poder editar título, descrição, data de entrega, status e prioridade
- Sistema deve validar se usuário é owner da tarefa
- Alterações devem ser salvas no banco de dados
- Resposta deve retornar dados atualizados da tarefa
- Campo updated_at deve ser atualizado automaticamente

**Regras de Negócio**:

- RN012: Apenas owner da tarefa pode editá-la
- RN013: Todas as validações de criação se aplicam à edição
- RN014: Status pode ser alterado para: Pendente, Em Progresso, Concluída, Cancelada

#### RF007 - Excluir Tarefa

**Descrição**: O sistema deve permitir exclusão de tarefas através do endpoint DELETE /api/tasks/[id].

**Critérios de Aceitação**:

- Endpoint: DELETE /api/tasks/[id]
- Sistema deve validar se usuário é owner da tarefa
- Tarefa deve ser marcada como deletada (soft delete) no banco
- Resposta deve confirmar exclusão com status 200
- Interface deve solicitar confirmação antes de chamar endpoint

**Regras de Negócio**:

- RN015: Apenas owner da tarefa pode excluí-la
- RN016: Exclusão deve ser soft delete (marcar como deletada) para auditoria

### 2.3 Sugestão de Prioridade via IA

#### RF008 - Solicitar Sugestão de Prioridade

**Descrição**: O sistema deve usar IA para sugerir prioridade de tarefas através do endpoint POST /api/tasks/prioritize.

**Critérios de Aceitação**:

- Endpoint: POST /api/tasks/prioritize
- Request deve incluir título, descrição e data de entrega da tarefa
- Sistema deve enviar dados para API da DeepSeek
- IA deve retornar prioridade: Alta, Média ou Baixa
- Resposta deve ser recebida em até 5 segundos
- Endpoint deve retornar sugestão sem alterar a tarefa no banco
- Sistema deve funcionar mesmo se IA estiver indisponível

**Regras de Negócio**:

- RN017: Se API falhar, endpoint deve retornar erro específico com fallback
- RN018: Timeout de 5 segundos para chamada da API
- RN019: Sistema deve log todas as interações com IA para análise

#### RF009 - Aplicar Sugestão de Prioridade

**Descrição**: Usuário deve poder aplicar sugestão de prioridade manualmente através da interface.

**Critérios de Aceitação**:

- Interface deve exibir botão "Sugerir Prioridade" nas telas de criação/edição
- Ao clicar, sistema deve chamar POST /api/tasks/prioritize
- Sugestão da IA deve ser apresentada ao usuário claramente
- Usuário deve poder aceitar (aplicar) ou ignorar a sugestão
- Se aceitar, prioridade deve ser definida através de PUT /api/tasks/[id]
- Sistema deve registrar se sugestão foi aceita ou ignorada para métricas

**Regras de Negócio**:

- RN020: Decisão do usuário deve ser armazenada para análise de performance da IA
- RN021: Usuário sempre pode alterar prioridade posteriormente via edição normal

### 2.4 Dashboard e Visualizações

#### RF010 - Dashboard Principal

**Descrição**: Sistema deve exibir visão geral das tarefas do usuário.

**Critérios de Aceitação**:

- Deve mostrar contadores: Total de tarefas, Por status (Pendente, Em Progresso, Concluída), Por prioridade (Alta, Média, Baixa)
- Deve listar próximas tarefas a vencer (próximos 7 dias)
- Deve mostrar tarefas em progresso
- Interface deve ser responsiva (desktop e mobile)
- Dados devem ser atualizados em tempo real

**Regras de Negócio**:

- RN022: Dashboard deve carregar em até 2 segundos
- RN023: Apenas dados do usuário logado devem ser exibidos

#### RF011 - Filtros e Buscas

**Descrição**: Sistema deve permitir filtrar e buscar tarefas.

**Critérios de Aceitação**:

- Filtros disponíveis: Status, Prioridade, Data de criação, Data de entrega
- Busca deve funcionar por título e descrição
- Filtros devem poder ser combinados
- Resultados devem ser atualizados dinamicamente
- URL deve refletir filtros aplicados para compartilhamento

**Regras de Negócio**:

- RN024: Busca deve ser case-insensitive
- RN025: Filtros devem persistir durante a sessão do usuário

### 2.5 Sistema de Notificações

#### RF012 - Notificações In-App

**Descrição**: Sistema deve exibir notificações dentro da aplicação.

**Critérios de Aceitação**:

- Notificações devem aparecer em área dedicada da interface
- Deve notificar sobre: Tarefas próximas do vencimento (2 dias), Tarefas vencidas, Mudanças de status importantes
- Usuário deve poder marcar notificações como lidas
- Contador de notificações não lidas deve ser visível
- Notificações antigas devem ser removidas automaticamente (30 dias)

**Regras de Negócio**:

- RN026: Sistema deve verificar condições de notificação a cada login
- RN027: Máximo de 50 notificações por usuário mantidas no sistema

#### RF013 - Notificações por E-mail

**Descrição**: Sistema deve enviar notificações por e-mail.

**Critérios de Aceitação**:

- E-mails devem ser enviados para: Tarefas vencendo em 24 horas, Tarefas vencidas há 1 dia
- Template de e-mail deve ser profissional e responsivo
- Usuário deve poder desabilitar notificações por e-mail
- Sistema deve incluir link direto para a tarefa
- E-mails devem ser enviados uma vez por condição

**Regras de Negócio**:

- RN028: E-mails devem ser enviados diariamente às 9h (horário local do servidor)
- RN029: Sistema deve implementar rate limiting para evitar spam

### 2.6 Configurações de Usuário

#### RF014 - Perfil do Usuário

**Descrição**: Usuário deve poder visualizar e editar seu perfil.

**Critérios de Aceitação**:

- Usuário deve poder alterar nome e e-mail
- Alteração de e-mail deve requerer confirmação
- Usuário deve poder alterar senha fornecendo senha atual
- Deve haver opção para excluir conta permanentemente
- Alterações devem ser salvas com feedback visual

**Regras de Negócio**:

- RN030: Alteração de e-mail requer revalidação se já existir no sistema
- RN031: Exclusão de conta deve remover todos os dados associados (LGPD compliance)

#### RF015 - Preferências de Notificação

**Descrição**: Usuário deve poder configurar preferências de notificação.

**Critérios de Aceitação**:

- Opções: Habilitar/desabilitar notificações in-app, Habilitar/desabilitar notificações por e-mail, Configurar antecedência para alertas (1, 2 ou 3 dias)
- Configurações devem ser aplicadas imediatamente
- Deve haver preview das configurações

**Regras de Negócio**:

- RN032: Configurações padrão: in-app habilitado, e-mail habilitado, 2 dias de antecedência

## 3. Especificação dos Endpoints da API

### 3.1 Endpoints de Tarefas

#### GET /api/tasks

**Descrição**: Lista todas as tarefas do usuário autenticado
**Método**: GET
**Autenticação**: Requerida

**Query Parameters**:

- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Items por página (default: 20, máximo: 100)
- `status` (opcional): Filtro por status (Pendente, Em Progresso, Concluída, Cancelada)
- `priority` (opcional): Filtro por prioridade (Alta, Média, Baixa, Não definida)
- `search` (opcional): Busca por título ou descrição

**Response (200)**:

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "priority": "Alta|Média|Baixa|Não definida",
      "status": "Pendente|Em Progresso|Concluída|Cancelada",
      "dueDate": "ISO 8601 date",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /api/tasks

**Descrição**: Cria nova tarefa
**Método**: POST
**Autenticação**: Requerida

**Request Body**:

```json
{
  "title": "string (required, 3-100 chars)",
  "description": "string (optional, max 500 chars)",
  "dueDate": "ISO 8601 date (optional)",
  "priority": "Alta|Média|Baixa|Não definida (optional, default: Não definida)"
}
```

**Response (201)**:

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "Não definida",
  "status": "Pendente",
  "dueDate": "ISO 8601 date",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

#### PUT /api/tasks/[id]

**Descrição**: Atualiza tarefa existente
**Método**: PUT
**Autenticação**: Requerida

**Path Parameters**:

- `id`: UUID da tarefa

**Request Body**:

```json
{
  "title": "string (optional, 3-100 chars)",
  "description": "string (optional, max 500 chars)",
  "dueDate": "ISO 8601 date (optional)",
  "priority": "Alta|Média|Baixa|Não definida (optional)",
  "status": "Pendente|Em Progresso|Concluída|Cancelada (optional)"
}
```

**Response (200)**:

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "string",
  "status": "string",
  "dueDate": "ISO 8601 date",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

#### DELETE /api/tasks/[id]

**Descrição**: Deleta tarefa (soft delete)
**Método**: DELETE
**Autenticação**: Requerida

**Path Parameters**:

- `id`: UUID da tarefa

**Response (200)**:

```json
{
  "message": "Tarefa deletada com sucesso",
  "id": "uuid"
}
```

#### POST /api/tasks/prioritize

**Descrição**: Solicita sugestão de prioridade via IA
**Método**: POST
**Autenticação**: Requerida

**Request Body**:

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "dueDate": "ISO 8601 date (optional)"
}
```

**Response (200)**:

```json
{
  "suggestedPriority": "Alta|Média|Baixa",
  "confidence": 0.85,
  "reasoning": "string explicando o motivo da sugestão"
}
```

**Response (503 - IA indisponível)**:

```json
{
  "error": "IA temporariamente indisponível",
  "fallback": "Não definida"
}
```

### 3.2 Códigos de Erro Padrão

- **400 Bad Request**: Dados de entrada inválidos
- **401 Unauthorized**: Usuário não autenticado
- **403 Forbidden**: Usuário não autorizado para esta operação
- **404 Not Found**: Recurso não encontrado
- **429 Too Many Requests**: Rate limit excedido
- **500 Internal Server Error**: Erro interno do servidor
- **503 Service Unavailable**: Serviço temporariamente indisponível (IA)

---

## 4. Requisitos de Interface

### 3.1 Responsividade

- Interface deve funcionar em dispositivos desktop (1024px+)
- Interface deve funcionar em tablets (768px-1023px)
- Interface deve funcionar em smartphones (320px-767px)

### 3.2 Acessibilidade

- Contraste mínimo de 4.5:1 para textos
- Navegação completa via teclado
- Textos alternativos para elementos visuais
- Suporte a leitores de tela

### 3.3 Performance

- Tempo de carregamento inicial < 3 segundos
- Transições e animações fluidas (60fps)
- Estados de loading para operações > 1 segundo
- Implementação de lazy loading quando apropriado

---

## 4. Regras de Negócio Consolidadas

| ID    | Regra                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| RN001 | E-mail duplicado deve retornar erro específico                                    |
| RN002 | Senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número            |
| RN003 | Sistema deve criptografar senha antes de armazenar                                |
| RN004 | Após 5 tentativas falhadas, conta deve ser temporariamente bloqueada (15 minutos) |
| RN005 | Sessão deve expirar após 24 horas de inatividade                                  |
| RN006 | Título deve ter entre 3 e 100 caracteres                                          |
| RN007 | Descrição pode ter até 500 caracteres                                             |
| RN008 | Data de entrega não pode ser anterior à data atual                                |
| RN009 | Se data não fornecida, sistema assume 7 dias a partir da criação                  |
| RN010 | Apenas tarefas do usuário logado devem ser exibidas                               |
| RN011 | Endpoint deve incluir metadados de paginação na resposta                          |
| RN012 | Apenas owner da tarefa pode editá-la                                              |
| RN013 | Todas as validações de criação se aplicam à edição                                |
| RN014 | Status permitidos: Pendente, Em Progresso, Concluída, Cancelada                   |
| RN015 | Apenas owner da tarefa pode excluí-la                                             |
| RN016 | Exclusão deve ser soft delete para auditoria                                      |
| RN017 | Se API falhar, endpoint deve retornar erro específico com fallback                |
| RN018 | Timeout de 5 segundos para chamada da API                                         |
| RN019 | Sistema deve log todas as interações com IA                                       |
| RN020 | Decisão do usuário sobre IA deve ser armazenada para métricas                     |
| RN021 | Usuário sempre pode alterar prioridade posteriormente via edição normal           |
| RN022 | Dashboard deve carregar em até 2 segundos                                         |
| RN023 | Apenas dados do usuário logado devem ser exibidos                                 |
| RN024 | Busca deve ser case-insensitive                                                   |
| RN025 | Filtros devem persistir durante a sessão                                          |
| RN026 | Sistema deve verificar notificações a cada login                                  |
| RN027 | Máximo de 50 notificações por usuário mantidas                                    |
| RN028 | E-mails enviados diariamente às 9h                                                |
| RN029 | Rate limiting para evitar spam                                                    |

---

## 5. Casos de Uso Principais

### 5.1 Fluxo de Criação de Tarefa com Sugestão de IA (Manual)

1. Usuário preenche formulário de nova tarefa
2. Sistema valida dados de entrada
3. Usuário clica em "Criar Tarefa"
4. Sistema chama POST /api/tasks
5. Tarefa é salva com prioridade "Não definida"
6. Interface exibe tarefa criada
7. **Opcionalmente**, usuário clica em "Sugerir Prioridade"
8. Sistema chama POST /api/tasks/prioritize
9. IA retorna sugestão de prioridade
10. Sistema apresenta sugestão ao usuário
11. Se usuário aceitar, sistema chama PUT /api/tasks/[id] para atualizar prioridade
12. Prioridade final é salva e interface atualizada

### 5.2 Fluxo de Edição com Sugestão de Prioridade

1. Usuário acessa formulário de edição da tarefa
2. Sistema carrega dados atuais via GET /api/tasks (filtrado por ID)
3. Usuário modifica campos desejados
4. **Opcionalmente**, usuário clica em "Sugerir Nova Prioridade"
5. Sistema chama POST /api/tasks/prioritize com dados atuais
6. IA retorna nova sugestão
7. Usuario decide aceitar ou não a sugestão
8. Usuário salva alterações
9. Sistema chama PUT /api/tasks/[id]
10. Tarefa é atualizada e interface reflete mudanças

### 5.3 Fluxo de Edição de Tarefa (Geral)

1. Usuário acessa lista de tarefas no dashboard
2. Usuário clica em tarefa específica para editar
3. Sistema chama GET /api/tasks (filtrado) para carregar dados atuais
4. Interface carrega formulário de edição com dados preenchidos
5. Usuário modifica campos desejados (título, descrição, data, status, prioridade)
6. **Opcionalmente**, usuário clica em "Sugerir Nova Prioridade"
7. Se solicitado, sistema chama POST /api/tasks/prioritize
8. IA retorna sugestão e usuário decide aceitar ou não
9. Usuário clica em "Salvar Alterações"
10. Sistema valida dados modificados
11. Sistema chama PUT /api/tasks/[id] com todos os campos atualizados
12. Tarefa é atualizada no banco de dados
13. Interface retorna para dashboard com feedback de sucesso
14. Lista de tarefas é atualizada refletindo as mudanças

### 5.4 Fluxo de Dashboard

1. Usuário faz login
2. Sistema chama GET /api/tasks para carregar dados
3. Dashboard é renderizado com métricas calculadas no frontend
4. Sistema verifica condições de notificação
5. Notificações são exibidas se necessário
6. Usuário interage com filtros/buscas
7. Sistema faz novas chamadas GET /api/tasks com parâmetros
8. Resultados são atualizados dinamicamente

---

## 6. Considerações Técnicas

### 6.1 Validação de Dados

- Validação client-side para UX
- Validação server-side para segurança
- Sanitização de inputs para prevenir XSS
- Validação de tipos com TypeScript

### 6.2 Tratamento de Erros

- Mensagens de erro user-friendly
- Logs detalhados para debugging
- Fallbacks para funcionalidades críticas
- Retry automático para falhas temporárias

### 6.3 Testes

- Cobertura mínima de 80% para lógica de negócio
- Testes de integração para fluxos principais
- Testes e2e para cenários críticos
- Testes de performance para operações custosas

---

## 7. Critérios de Aceitação Gerais

- Todos os requisitos funcionais devem ser implementados
- Interface deve ser responsiva em todos os breakpoints
- Performance deve atender aos critérios definidos
- Sistema deve ser resiliente a falhas da API de IA
- Dados do usuário devem estar sempre seguros
- Funcionalidades devem estar cobertas por testes
