**Product Requirements Document (PRD)**

**Product Name**: Task IA
**Document Owner**: Marcelo Marcinio Pereira Junior
**Version**: 1.0
**Last Updated**: 22/07/2025

---

### 1. Overview

**1.1 Summary**
Task IA é um sistema inteligente de gerenciamento de tarefas que combina funcionalidades tradicionais de CRUD com sugestões automatizadas de prioridade baseadas em IA. A plataforma oferece um dashboard simples, sistema de notificações e tem como objetivo ajudar indivíduos e equipes a organizarem suas atividades de forma mais eficiente e inteligente.

**1.2 Objectives & Goals**
• Permitir o gerenciamento completo de tarefas (criação, leitura, atualização, exclusão).
• Utilizar IA para sugerir prioridades com base em título, descrição e prazo.
• Oferecer um dashboard intuitivo com visão geral das tarefas.
• Enviar notificações relevantes para manter o usuário informado.
• Reduzir o tempo gasto com organização manual de tarefas.

**1.3 Success Metrics**
• Taxa de uso diário (DAU > 30%)
• Percentual de tarefas com prioridade aceita pela IA (> 60%)
• Tempo médio para conclusão de tarefas reduzido em 20%
• NPS > 8 e CSAT > 85% após 3 meses de uso

---

### 2. User Personas

**2.1 Primary Users**
**1. Product Managers (PMs)**
• **Necessidade**: Priorizar tarefas rapidamente sem esforço manual.
• **Ponto de dor**: Volume alto de tarefas e pouco tempo para organizar ou priorizar atividades com consistência.

---

### 3. Features & Requirements

**1. Gerenciamento de Tarefas (CRUD)**
• **MVP**:
 • Criação, leitura, edição e exclusão de tarefas.
 • Campos: título, descrição, data de entrega, prioridade, status.
• **Melhorias Futuras**:
 • Etiquetas personalizáveis.
 • Anexos e comentários por tarefa.

**2. Sugestão de Prioridade via IA**
• **MVP**:
 • Algoritmo que analisa título, descrição e prazo para sugerir prioridade (Alta, Média, Baixa).
• **Melhorias Futuras**:
 • Aprendizado contínuo com base no histórico do usuário.
 • Reclassificação automática conforme mudanças nas tarefas.

**3. Dashboard Simples**
• **MVP**:
 • Visão geral com contagem de tarefas por status e prioridade.
 • Filtro por data, prioridade e status.
• **Melhorias Futuras**:
 • Gráficos de produtividade e tempo médio por tarefa.

**4. Sistema de Notificações**
• **MVP**:
 • Alertas por e-mail e in-app sobre prazos próximos e mudanças de status.
• **Melhorias Futuras**:
 • Notificações personalizadas com base no comportamento do usuário.

---

### 4. Technical Considerations

**4.1 Tech Stack**
• Frontend: Next.js + TypeScript + Tailwind CSS
• Backend: API Routes do Next.js
• Banco de Dados: SQLite + Prisma ORM
• Modelo de IA: DeepSeek via API
• Deploy: Docker containerizado
• Hospedagem: Local até finalizar o MVP, depois será escolhido um novo ambiente

**4.2 Escalabilidade & Performance**
• Garantir respostas de IA com latência abaixo de 5 segundos.

**4.3 Segurança & Conformidade**
• Criação do usuário (e-mail, nome e senha) no sistema, sem utilizar OAuth.
• Armazenamento seguro de credenciais e tarefas.
• Conformidade com LGPD em futuras fases do projeto.

---

### 5. UX & Design Considerations

• Interface limpa e objetiva com foco na criação e visualização rápida de tarefas.
• Design responsivo para uso em desktop e mobile.
• Modo escuro disponível.
• Feedback visual imediato nas ações (ex: salvar, deletar, priorizar).
• Estados de loading globais.

---

### 6. Dependencies & Risks

**6.1 Dependências**
• API da DeepSeek para geração de prioridade via IA
• Biblioteca Prisma ORM para acesso ao banco
• Infraestrutura local para testes e deploy inicial
• Docker para empacotamento e execução do sistema

**6.2 Risks & Mitigation**

| Risco                                                            | Impacto | Estratégia de Mitigação                                                    |
| ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| Instabilidade ou limitação da API da DeepSeek                    | Alto    | Implementar fallback manual de prioridade e log de erro                    |
| Crescimento do volume de dados pode exceder capacidade do SQLite | Médio   | Planejar migração futura para banco escalável (PostgreSQL ou MySQL)        |
| Baixa adesão dos usuários ao modelo de sugestão de prioridade    | Médio   | Implementar sistema de feedback para melhorar o algoritmo                  |
| Falta de hospedagem escalável após MVP                           | Médio   | Planejar early migration para ambiente em nuvem (ex: Railway, Render, AWS) |

---

### 7. Roadmap & Timeline

| Marco                                                | Previsão de Conclusão |
| ---------------------------------------------------- | --------------------- |
| Definição de requisitos e arquitetura                | Semana 1              |
| Desenvolvimento do CRUD de tarefas                   | Semana 2 a 3          |
| Integração com IA para sugestão de prioridade        | Semana 4              |
| Implementação do dashboard e sistema de notificações | Mês 2 - Semana 1      |
| Validação interna e ajustes                          | Mês 2 - Semana 2 a 3  |
| MVP pronto para testes com usuários reais            | Mês 2 - Semana 4      |

---

### 8. Open Questions

• A IA deve permitir ao usuário editar ou sobrescrever a prioridade sugerida?
• Como deve funcionar a lógica de notificação — push, e-mail ou só in-app?
• Qual será o critério para considerar a prioridade como "aceita" pelo usuário?
• Como lidar com tarefas recorrentes? Será suportado no MVP ou em versão futura?
• Será necessário ter perfis diferentes (ex: administrador x usuário comum)?
