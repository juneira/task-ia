import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const hashedPassword = await hash('123456', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'teste@taskai.dev' },
    update: {},
    create: {
      name: 'Usuário de Teste',
      email: 'teste@taskai.dev',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Usuário de teste criado:', testUser.email);

  // Criar preferências do usuário
  await prisma.userPreferences.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      emailNotifications: true,
      inAppNotifications: true,
      notificationAdvance: 2,
    },
  });

  console.log('✅ Preferências do usuário criadas');

  // Criar tarefas de exemplo
  const tasks = [
    {
      title: 'Implementar autenticação',
      description: 'Criar sistema de login e cadastro de usuários',
      priority: 'ALTA' as const,
      status: 'EM_PROGRESSO' as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
    {
      title: 'Configurar banco de dados',
      description: 'Setup do Prisma e criação das tabelas',
      priority: 'ALTA' as const,
      status: 'CONCLUIDA' as const,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // ontem
    },
    {
      title: 'Criar testes unitários',
      description: 'Implementar testes para todas as funcionalidades',
      priority: 'MEDIA' as const,
      status: 'PENDENTE' as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    },
    {
      title: 'Design da interface',
      description: 'Criar mockups e protótipos da interface',
      priority: 'BAIXA' as const,
      status: 'PENDENTE' as const,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 dias
    },
    {
      title: 'Integração com IA',
      description: 'Implementar sugestões de prioridade via DeepSeek',
      priority: 'NAO_DEFINIDA' as const,
      status: 'PENDENTE' as const,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    },
  ];

  const createdTasks = [];
  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId: testUser.id,
      },
    });
    createdTasks.push(task);
  }

  console.log(`✅ ${createdTasks.length} tarefas criadas`);

  // Criar sugestões de IA de exemplo
  const aiSuggestions = [
    {
      taskId: createdTasks[4].id, // Tarefa "Integração com IA"
      userId: testUser.id,
      taskTitle: 'Integração com IA',
      taskDescription: 'Implementar sugestões de prioridade via DeepSeek',
      taskDueDate: createdTasks[4].dueDate,
      suggestedPriority: 'ALTA' as const,
      confidence: 0.85,
      reasoning: 'Tarefa crítica para funcionalidade principal do sistema',
      wasAccepted: null,
    },
    {
      taskId: createdTasks[2].id, // Tarefa "Criar testes unitários"
      userId: testUser.id,
      taskTitle: 'Criar testes unitários',
      taskDescription: 'Implementar testes para todas as funcionalidades',
      taskDueDate: createdTasks[2].dueDate,
      suggestedPriority: 'ALTA' as const,
      confidence: 0.92,
      reasoning: 'Testes são fundamentais para qualidade do código',
      wasAccepted: false,
    },
  ];

  for (const suggestionData of aiSuggestions) {
    await prisma.aiSuggestion.create({
      data: suggestionData,
    });
  }

  console.log(`✅ ${aiSuggestions.length} sugestões de IA criadas`);

  // Criar notificações de exemplo
  const notifications = [
    {
      userId: testUser.id,
      taskId: createdTasks[0].id,
      type: 'TASK_DUE_SOON' as const,
      title: 'Tarefa vencendo em breve',
      message: 'A tarefa "Implementar autenticação" vence em 7 dias',
      isRead: false,
    },
    {
      userId: testUser.id,
      taskId: createdTasks[4].id,
      type: 'PRIORITY_SUGGESTED' as const,
      title: 'Prioridade sugerida pela IA',
      message: 'A IA sugeriu prioridade ALTA para "Integração com IA"',
      isRead: false,
    },
  ];

  for (const notificationData of notifications) {
    await prisma.notification.create({
      data: notificationData,
    });
  }

  console.log(`✅ ${notifications.length} notificações criadas`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
