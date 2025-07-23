import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User, Task } from '@/types/database.types';

describe('Notification Model Tests', () => {
  let testUser: User;
  let testTask: Task;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test.db';
  });

  beforeEach(async () => {
    // Criar usuário de teste único para cada teste
    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: `test-${Date.now()}@teste.com`,
        passwordHash: await bcrypt.hash('senha123', 12),
      },
    });

    // Criar tarefa de teste
    testTask = await prisma.task.create({
      data: {
        title: 'Tarefa de Teste',
        description: 'Descrição de teste',
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany();
    await prisma.aiSuggestion.deleteMany();
    await prisma.task.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Notification Creation', () => {
    it('should create notification with required fields', async () => {
      const notificationData = {
        userId: testUser.id,
        type: 'TASK_DUE_SOON' as const,
        title: 'Tarefa vencendo',
        message: 'Sua tarefa vence em 2 dias',
      };

      const notification = await prisma.notification.create({
        data: notificationData,
      });

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(testUser.id);
      expect(notification.type).toBe(notificationData.type);
      expect(notification.title).toBe(notificationData.title);
      expect(notification.message).toBe(notificationData.message);
      expect(notification.isRead).toBe(false); // Default value
      expect(notification.taskId).toBeNull();
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it('should create notification with task reference', async () => {
      const notificationData = {
        userId: testUser.id,
        taskId: testTask.id,
        type: 'TASK_COMPLETED' as const,
        title: 'Tarefa concluída',
        message: 'Parabéns! Você concluiu uma tarefa',
      };

      const notification = await prisma.notification.create({
        data: notificationData,
      });

      expect(notification.taskId).toBe(testTask.id);
      expect(notification.type).toBe(notificationData.type);
    });

    it('should require userId field', async () => {
      await expect(
        prisma.notification.create({
          data: {
            type: 'TASK_DUE_SOON',
            title: 'Título',
            message: 'Mensagem',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require type field', async () => {
      await expect(
        prisma.notification.create({
          data: {
            userId: testUser.id,
            title: 'Título',
            message: 'Mensagem',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require title field', async () => {
      await expect(
        prisma.notification.create({
          data: {
            userId: testUser.id,
            type: 'TASK_DUE_SOON',
            message: 'Mensagem',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require message field', async () => {
      await expect(
        prisma.notification.create({
          data: {
            userId: testUser.id,
            type: 'TASK_DUE_SOON',
            title: 'Título',
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Notification Type Enum', () => {
    it('should accept valid notification types', async () => {
      const types = [
        'TASK_DUE_SOON',
        'TASK_OVERDUE',
        'TASK_COMPLETED',
        'PRIORITY_SUGGESTED',
      ] as const;

      for (const type of types) {
        const notification = await prisma.notification.create({
          data: {
            userId: testUser.id,
            type,
            title: `Notificação ${type}`,
            message: `Mensagem para ${type}`,
          },
        });

        expect(notification.type).toBe(type);
      }
    });

    it('should reject invalid notification types', async () => {
      await expect(
        prisma.notification.create({
          data: {
            userId: testUser.id,
            type: 'INVALID_TYPE' as any,
            title: 'Título',
            message: 'Mensagem',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Notification Read Status', () => {
    it('should create notification as unread by default', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'TASK_DUE_SOON',
          title: 'Nova notificação',
          message: 'Mensagem de teste',
        },
      });

      expect(notification.isRead).toBe(false);
    });

    it('should allow creating read notification', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'TASK_DUE_SOON',
          title: 'Notificação lida',
          message: 'Mensagem de teste',
          isRead: true,
        },
      });

      expect(notification.isRead).toBe(true);
    });

    it('should update read status', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'TASK_DUE_SOON',
          title: 'Para marcar como lida',
          message: 'Mensagem de teste',
        },
      });

      const updatedNotification = await prisma.notification.update({
        where: { id: notification.id },
        data: { isRead: true },
      });

      expect(updatedNotification.isRead).toBe(true);
    });
  });

  describe('Notification Queries', () => {
    beforeEach(async () => {
      // Criar várias notificações para teste
      await prisma.notification.createMany({
        data: [
          {
            userId: testUser.id,
            type: 'TASK_DUE_SOON',
            title: 'Tarefa vencendo 1',
            message: 'Mensagem 1',
            isRead: false,
          },
          {
            userId: testUser.id,
            type: 'TASK_OVERDUE',
            title: 'Tarefa vencida',
            message: 'Mensagem 2',
            isRead: true,
          },
          {
            userId: testUser.id,
            type: 'TASK_COMPLETED',
            title: 'Tarefa concluída',
            message: 'Mensagem 3',
            isRead: false,
          },
          {
            userId: testUser.id,
            type: 'PRIORITY_SUGGESTED',
            title: 'Prioridade sugerida',
            message: 'Mensagem 4',
            isRead: false,
          },
        ],
      });
    });

    it('should filter unread notifications', async () => {
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          userId: testUser.id,
          isRead: false,
        },
      });

      expect(unreadNotifications).toHaveLength(3);
    });

    it('should filter by notification type', async () => {
      const dueSoonNotifications = await prisma.notification.findMany({
        where: {
          userId: testUser.id,
          type: 'TASK_DUE_SOON',
        },
      });

      expect(dueSoonNotifications).toHaveLength(1);
      expect(dueSoonNotifications[0].title).toBe('Tarefa vencendo 1');
    });

    it('should order by creation date descending', async () => {
      const notifications = await prisma.notification.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(notifications).toHaveLength(4);
      // A última criada deve vir primeiro
      expect(notifications[0].title).toBe('Prioridade sugerida');
    });

    it('should count unread notifications', async () => {
      const unreadCount = await prisma.notification.count({
        where: {
          userId: testUser.id,
          isRead: false,
        },
      });

      expect(unreadCount).toBe(3);
    });
  });

  describe('Notification Bulk Operations', () => {
    beforeEach(async () => {
      await prisma.notification.createMany({
        data: [
          {
            userId: testUser.id,
            type: 'TASK_DUE_SOON',
            title: 'Notificação 1',
            message: 'Mensagem 1',
            isRead: false,
          },
          {
            userId: testUser.id,
            type: 'TASK_DUE_SOON',
            title: 'Notificação 2',
            message: 'Mensagem 2',
            isRead: false,
          },
          {
            userId: testUser.id,
            type: 'TASK_OVERDUE',
            title: 'Notificação 3',
            message: 'Mensagem 3',
            isRead: false,
          },
        ],
      });
    });

    it('should mark all notifications as read', async () => {
      const updatedCount = await prisma.notification.updateMany({
        where: {
          userId: testUser.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      expect(updatedCount.count).toBe(3);

      const unreadCount = await prisma.notification.count({
        where: {
          userId: testUser.id,
          isRead: false,
        },
      });

      expect(unreadCount).toBe(0);
    });

    it('should delete old read notifications', async () => {
      // Marcar todas como lidas primeiro
      await prisma.notification.updateMany({
        where: { userId: testUser.id },
        data: { isRead: true },
      });

      // Deletar notificações lidas
      const deletedCount = await prisma.notification.deleteMany({
        where: {
          userId: testUser.id,
          isRead: true,
        },
      });

      expect(deletedCount.count).toBe(3);

      const remainingCount = await prisma.notification.count({
        where: { userId: testUser.id },
      });

      expect(remainingCount).toBe(0);
    });
  });

  describe('Notification Relationships', () => {
    it('should load notification with user', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'TASK_DUE_SOON',
          title: 'Notificação com usuário',
          message: 'Mensagem de teste',
        },
      });

      const notificationWithUser = await prisma.notification.findUnique({
        where: { id: notification.id },
        include: { user: true },
      });

      expect(notificationWithUser?.user).toBeDefined();
      expect(notificationWithUser?.user.id).toBe(testUser.id);
      expect(notificationWithUser?.user.email).toBe(testUser.email);
    });

    it('should load notification with task', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          taskId: testTask.id,
          type: 'TASK_COMPLETED',
          title: 'Notificação com tarefa',
          message: 'Mensagem de teste',
        },
      });

      const notificationWithTask = await prisma.notification.findUnique({
        where: { id: notification.id },
        include: { task: true },
      });

      expect(notificationWithTask?.task).toBeDefined();
      expect(notificationWithTask?.task?.id).toBe(testTask.id);
      expect(notificationWithTask?.task?.title).toBe(testTask.title);
    });

    it('should handle notification without task', async () => {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          type: 'PRIORITY_SUGGESTED',
          title: 'Notificação sem tarefa',
          message: 'Mensagem de teste',
        },
      });

      const notificationWithTask = await prisma.notification.findUnique({
        where: { id: notification.id },
        include: { task: true },
      });

      expect(notificationWithTask?.task).toBeNull();
    });
  });

  describe('Notification Business Logic', () => {
    it('should create due soon notification for task', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2); // 2 dias no futuro

      const taskWithDueDate = await prisma.task.create({
        data: {
          title: 'Tarefa com prazo',
          description: 'Vence em 2 dias',
          dueDate,
          userId: testUser.id,
        },
      });

      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          taskId: taskWithDueDate.id,
          type: 'TASK_DUE_SOON',
          title: 'Tarefa vencendo em breve',
          message: `A tarefa "${taskWithDueDate.title}" vence em 2 dias`,
        },
      });

      expect(notification.type).toBe('TASK_DUE_SOON');
      expect(notification.taskId).toBe(taskWithDueDate.id);
      expect(notification.message).toContain(taskWithDueDate.title);
    });

    it('should create overdue notification for task', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // 1 dia no passado

      const overdueTask = await prisma.task.create({
        data: {
          title: 'Tarefa vencida',
          description: 'Venceu ontem',
          dueDate: pastDate,
          userId: testUser.id,
        },
      });

      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          taskId: overdueTask.id,
          type: 'TASK_OVERDUE',
          title: 'Tarefa vencida',
          message: `A tarefa "${overdueTask.title}" está vencida`,
        },
      });

      expect(notification.type).toBe('TASK_OVERDUE');
      expect(notification.taskId).toBe(overdueTask.id);
    });
  });
});
