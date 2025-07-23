import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/database.types';

describe('Task Model Tests', () => {
  let testUser: User;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test.db';
  });

  beforeEach(async () => {
    // Criar usuário de teste único para cada teste
    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: `test-${Date.now()}@teste.com`, // Email único por teste
        passwordHash: await bcrypt.hash('senha123', 12),
      },
    });
  });

  describe('Task Creation', () => {
    it('should create a new task with required fields', async () => {
      const taskData = {
        title: 'Minha nova tarefa',
        description: 'Descrição detalhada da tarefa',
        userId: testUser.id,
      };

      const task = await prisma.task.create({
        data: taskData,
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.userId).toBe(testUser.id);
      expect(task.priority).toBe('NAO_DEFINIDA'); // Default value
      expect(task.status).toBe('PENDENTE'); // Default value
      expect(task.isDeleted).toBe(false); // Default value
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should create task with all fields', async () => {
      const dueDate = new Date('2025-12-31');
      const taskData = {
        title: 'Tarefa completa',
        description: 'Descrição completa',
        priority: 'ALTA' as const,
        status: 'EM_PROGRESSO' as const,
        dueDate,
        userId: testUser.id,
      };

      const task = await prisma.task.create({
        data: taskData,
      });

      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.priority).toBe(taskData.priority);
      expect(task.status).toBe(taskData.status);
      expect(task.dueDate).toEqual(dueDate);
      expect(task.userId).toBe(testUser.id);
    });

    it('should require title field', async () => {
      await expect(
        prisma.task.create({
          data: {
            description: 'Descrição sem título',
            userId: testUser.id,
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require userId field', async () => {
      await expect(
        prisma.task.create({
          data: {
            title: 'Tarefa sem usuário',
            description: 'Descrição',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should allow null description', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tarefa sem descrição',
          userId: testUser.id,
        },
      });

      expect(task.description).toBeNull();
    });
  });

  describe('Task Priority Enum', () => {
    it('should accept valid priority values', async () => {
      const priorities = ['ALTA', 'MEDIA', 'BAIXA', 'NAO_DEFINIDA'] as const;

      for (const priority of priorities) {
        const task = await prisma.task.create({
          data: {
            title: `Tarefa ${priority}`,
            priority,
            userId: testUser.id,
          },
        });

        expect(task.priority).toBe(priority);
      }
    });

    it('should reject invalid priority values', async () => {
      await expect(
        prisma.task.create({
          data: {
            title: 'Tarefa inválida',
            priority: 'INVALIDA' as any,
            userId: testUser.id,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Task Status Enum', () => {
    it('should accept valid status values', async () => {
      const statuses = [
        'PENDENTE',
        'EM_PROGRESSO',
        'CONCLUIDA',
        'CANCELADA',
      ] as const;

      for (const status of statuses) {
        const task = await prisma.task.create({
          data: {
            title: `Tarefa ${status}`,
            status,
            userId: testUser.id,
          },
        });

        expect(task.status).toBe(status);
      }
    });

    it('should reject invalid status values', async () => {
      await expect(
        prisma.task.create({
          data: {
            title: 'Tarefa inválida',
            status: 'INVALIDO' as any,
            userId: testUser.id,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Task Queries', () => {
    beforeEach(async () => {
      // Criar várias tarefas para teste
      await prisma.task.createMany({
        data: [
          {
            title: 'Tarefa 1',
            priority: 'ALTA',
            status: 'PENDENTE',
            userId: testUser.id,
          },
          {
            title: 'Tarefa 2',
            priority: 'MEDIA',
            status: 'EM_PROGRESSO',
            userId: testUser.id,
          },
          {
            title: 'Tarefa 3',
            priority: 'BAIXA',
            status: 'CONCLUIDA',
            userId: testUser.id,
          },
          {
            title: 'Tarefa Deletada',
            priority: 'ALTA',
            status: 'CANCELADA',
            isDeleted: true,
            userId: testUser.id,
          },
        ],
      });
    });

    it('should filter tasks by status', async () => {
      const pendingTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          status: 'PENDENTE',
          isDeleted: false,
        },
      });

      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].title).toBe('Tarefa 1');
    });

    it('should filter tasks by priority', async () => {
      const highPriorityTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          priority: 'ALTA',
          isDeleted: false,
        },
      });

      expect(highPriorityTasks).toHaveLength(1);
      expect(highPriorityTasks[0].title).toBe('Tarefa 1');
    });

    it('should exclude deleted tasks', async () => {
      const activeTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          isDeleted: false,
        },
      });

      expect(activeTasks).toHaveLength(3);
      expect(
        activeTasks.find((t: any) => t.title === 'Tarefa Deletada')
      ).toBeUndefined();
    });

    it('should include deleted tasks when explicitly queried', async () => {
      const deletedTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          isDeleted: true,
        },
      });

      expect(deletedTasks).toHaveLength(1);
      expect(deletedTasks[0].title).toBe('Tarefa Deletada');
    });
  });

  describe('Task Updates', () => {
    it('should update task status', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tarefa para atualizar',
          userId: testUser.id,
        },
      });

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { status: 'CONCLUIDA' },
      });

      expect(updatedTask.status).toBe('CONCLUIDA');
      expect(updatedTask.updatedAt).not.toEqual(task.updatedAt);
    });

    it('should update task priority', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tarefa para atualizar',
          userId: testUser.id,
        },
      });

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { priority: 'ALTA' },
      });

      expect(updatedTask.priority).toBe('ALTA');
    });

    it('should soft delete task', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tarefa para deletar',
          userId: testUser.id,
        },
      });

      const deletedTask = await prisma.task.update({
        where: { id: task.id },
        data: { isDeleted: true },
      });

      expect(deletedTask.isDeleted).toBe(true);

      // Verificar que não aparece em queries normais
      const activeTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          isDeleted: false,
        },
      });

      expect(activeTasks.find((t: any) => t.id === task.id)).toBeUndefined();
    });
  });

  describe('Task Relationships', () => {
    it('should load task with user', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tarefa com usuário',
          userId: testUser.id,
        },
      });

      const taskWithUser = await prisma.task.findUnique({
        where: { id: task.id },
        include: { user: true },
      });

      expect(taskWithUser?.user).toBeDefined();
      expect(taskWithUser?.user.id).toBe(testUser.id);
      expect(taskWithUser?.user.email).toBe(testUser.email);
    });

    it('should load task with AI suggestions', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tarefa com IA',
          userId: testUser.id,
        },
      });

      await prisma.aiSuggestion.create({
        data: {
          taskId: task.id,
          userId: testUser.id,
          taskTitle: task.title,
          suggestedPriority: 'ALTA',
          confidence: 0.9,
        },
      });

      const taskWithSuggestions = await prisma.task.findUnique({
        where: { id: task.id },
        include: { aiSuggestions: true },
      });

      expect(taskWithSuggestions?.aiSuggestions).toHaveLength(1);
      expect(taskWithSuggestions?.aiSuggestions[0].suggestedPriority).toBe(
        'ALTA'
      );
    });
  });
});
