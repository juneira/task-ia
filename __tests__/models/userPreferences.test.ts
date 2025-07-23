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
import type { User } from '@/types/database.types';

describe('UserPreferences Model Tests', () => {
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

  afterAll(async () => {
    await prisma.notification.deleteMany();
    await prisma.aiSuggestion.deleteMany();
    await prisma.task.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('UserPreferences Creation', () => {
    it('should create user preferences with default values', async () => {
      const preferences = await prisma.userPreferences.create({
        data: {
          userId: testUser.id,
        },
      });

      expect(preferences).toBeDefined();
      expect(preferences.id).toBeDefined();
      expect(preferences.userId).toBe(testUser.id);
      expect(preferences.emailNotifications).toBe(true); // Default value
      expect(preferences.inAppNotifications).toBe(true); // Default value
      expect(preferences.notificationAdvance).toBe(2); // Default value
      expect(preferences.createdAt).toBeInstanceOf(Date);
      expect(preferences.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user preferences with custom values', async () => {
      const preferencesData = {
        userId: testUser.id,
        emailNotifications: false,
        inAppNotifications: true,
        notificationAdvance: 5,
      };

      const preferences = await prisma.userPreferences.create({
        data: preferencesData,
      });

      expect(preferences.emailNotifications).toBe(false);
      expect(preferences.inAppNotifications).toBe(true);
      expect(preferences.notificationAdvance).toBe(5);
    });

    it('should require userId field', async () => {
      await expect(
        prisma.userPreferences.create({
          data: {} as any,
        })
      ).rejects.toThrow();
    });

    it('should enforce unique userId constraint', async () => {
      // Criar primeira preferência
      await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      // Tentar criar segunda preferência para o mesmo usuário
      await expect(
        prisma.userPreferences.create({
          data: { userId: testUser.id },
        })
      ).rejects.toThrow();
    });
  });

  describe('UserPreferences Validation', () => {
    it('should validate boolean fields', async () => {
      const preferences = await prisma.userPreferences.create({
        data: {
          userId: testUser.id,
          emailNotifications: true,
          inAppNotifications: false,
        },
      });

      expect(typeof preferences.emailNotifications).toBe('boolean');
      expect(typeof preferences.inAppNotifications).toBe('boolean');
      expect(preferences.emailNotifications).toBe(true);
      expect(preferences.inAppNotifications).toBe(false);
    });

    it('should validate notification advance as integer', async () => {
      const validAdvanceValues = [1, 2, 3, 5, 7, 14];

      for (const advance of validAdvanceValues) {
        // Criar usuário primeiro
        const user = await prisma.user.create({
          data: {
            name: `Usuário ${advance}`,
            email: `user${advance}@teste.com`,
            passwordHash: await bcrypt.hash('senha123', 12),
          },
        });

        const preferences = await prisma.userPreferences.create({
          data: {
            userId: user.id,
            notificationAdvance: advance,
          },
        });

        expect(preferences.notificationAdvance).toBe(advance);
        expect(Number.isInteger(preferences.notificationAdvance)).toBe(true);

        // Limpar para próxima iteração
        await prisma.userPreferences.delete({
          where: { id: preferences.id },
        });
        await prisma.user.delete({
          where: { id: user.id },
        });
      }
    });
  });

  describe('UserPreferences Updates', () => {
    it('should update email notification preference', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      const updatedPreferences = await prisma.userPreferences.update({
        where: { id: preferences.id },
        data: { emailNotifications: false },
      });

      expect(updatedPreferences.emailNotifications).toBe(false);
      expect(updatedPreferences.updatedAt).not.toEqual(preferences.updatedAt);
    });

    it('should update in-app notification preference', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      const updatedPreferences = await prisma.userPreferences.update({
        where: { id: preferences.id },
        data: { inAppNotifications: false },
      });

      expect(updatedPreferences.inAppNotifications).toBe(false);
    });

    it('should update notification advance days', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      const updatedPreferences = await prisma.userPreferences.update({
        where: { id: preferences.id },
        data: { notificationAdvance: 7 },
      });

      expect(updatedPreferences.notificationAdvance).toBe(7);
    });

    it('should update multiple preferences at once', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      const updatedPreferences = await prisma.userPreferences.update({
        where: { id: preferences.id },
        data: {
          emailNotifications: false,
          inAppNotifications: false,
          notificationAdvance: 3,
        },
      });

      expect(updatedPreferences.emailNotifications).toBe(false);
      expect(updatedPreferences.inAppNotifications).toBe(false);
      expect(updatedPreferences.notificationAdvance).toBe(3);
    });
  });

  describe('UserPreferences Queries', () => {
    let user2: User, user3: User;

    beforeEach(async () => {
      // Recriar testUser
      testUser = await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: `test-${Date.now()}-main@teste.com`,
          passwordHash: await bcrypt.hash('senha123', 12),
        },
      });

      // Criar usuários adicionais para teste
      user2 = await prisma.user.create({
        data: {
          name: 'Usuário 2',
          email: 'usuario2@teste.com',
          passwordHash: await bcrypt.hash('senha123', 12),
        },
      });

      user3 = await prisma.user.create({
        data: {
          name: 'Usuário 3',
          email: 'usuario3@teste.com',
          passwordHash: await bcrypt.hash('senha123', 12),
        },
      });

      // Criar preferências variadas
      await prisma.userPreferences.createMany({
        data: [
          {
            userId: testUser.id,
            emailNotifications: true,
            inAppNotifications: true,
            notificationAdvance: 2,
          },
          {
            userId: user2.id,
            emailNotifications: false,
            inAppNotifications: true,
            notificationAdvance: 5,
          },
          {
            userId: user3.id,
            emailNotifications: true,
            inAppNotifications: false,
            notificationAdvance: 1,
          },
        ],
      });
    });

    it('should find preferences by userId', async () => {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: testUser.id },
      });

      expect(preferences).toBeDefined();
      expect(preferences?.userId).toBe(testUser.id);
      expect(preferences?.emailNotifications).toBe(true);
    });

    it('should filter users with email notifications enabled', async () => {
      const usersWithEmail = await prisma.userPreferences.findMany({
        where: { emailNotifications: true },
      });

      expect(usersWithEmail).toHaveLength(2);
    });

    it('should filter users with in-app notifications enabled', async () => {
      const usersWithInApp = await prisma.userPreferences.findMany({
        where: { inAppNotifications: true },
      });

      expect(usersWithInApp).toHaveLength(2);
    });

    it('should filter by notification advance days', async () => {
      const usersWithAdvance2 = await prisma.userPreferences.findMany({
        where: { notificationAdvance: 2 },
      });

      expect(usersWithAdvance2).toHaveLength(1);
      expect(usersWithAdvance2[0].userId).toBe(testUser.id);
    });
  });

  describe('UserPreferences Relationships', () => {
    it('should load preferences with user', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      const preferencesWithUser = await prisma.userPreferences.findUnique({
        where: { id: preferences.id },
        include: { user: true },
      });

      expect(preferencesWithUser?.user).toBeDefined();
      expect(preferencesWithUser?.user.id).toBe(testUser.id);
      expect(preferencesWithUser?.user.email).toBe(testUser.email);
    });

    it('should load user with preferences', async () => {
      await prisma.userPreferences.create({
        data: {
          userId: testUser.id,
          emailNotifications: false,
          notificationAdvance: 5,
        },
      });

      const userWithPreferences = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: { preferences: true },
      });

      expect(userWithPreferences?.preferences).toBeDefined();
      expect(userWithPreferences?.preferences?.emailNotifications).toBe(false);
      expect(userWithPreferences?.preferences?.notificationAdvance).toBe(5);
    });
  });

  describe('UserPreferences Deletion', () => {
    it('should delete user preferences', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      await prisma.userPreferences.delete({
        where: { id: preferences.id },
      });

      const deletedPreferences = await prisma.userPreferences.findUnique({
        where: { id: preferences.id },
      });

      expect(deletedPreferences).toBeNull();
    });

    it('should cascade delete when user is deleted', async () => {
      const preferences = await prisma.userPreferences.create({
        data: { userId: testUser.id },
      });

      // Deletar usuário (deve deletar preferências em cascata)
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      const orphanedPreferences = await prisma.userPreferences.findUnique({
        where: { id: preferences.id },
      });

      expect(orphanedPreferences).toBeNull();
    });
  });

  describe('UserPreferences Business Logic', () => {
    it('should determine if user should receive email notifications', async () => {
      const preferences = await prisma.userPreferences.create({
        data: {
          userId: testUser.id,
          emailNotifications: true,
        },
      });

      expect(preferences.emailNotifications).toBe(true);
    });

    it('should determine if user should receive in-app notifications', async () => {
      const preferences = await prisma.userPreferences.create({
        data: {
          userId: testUser.id,
          inAppNotifications: true,
        },
      });

      expect(preferences.inAppNotifications).toBe(true);
    });

    test('should calculate notification trigger date', async () => {
      const testUser = await prisma.user.create({
        data: {
          name: 'Usuário Data',
          email: `test-${Date.now()}-data@teste.com`,
          passwordHash: await bcrypt.hash('senha123', 10),
        },
      });

      const preferences = await prisma.userPreferences.create({
        data: {
          userId: testUser.id,
          emailNotifications: true,
          inAppNotifications: true,
          notificationAdvance: 3,
        },
      });

      // Simular data de tarefa
      const taskDate = new Date('2024-08-01'); // 1 de agosto
      const notificationDate = new Date(taskDate);
      notificationDate.setDate(
        notificationDate.getDate() - preferences.notificationAdvance
      );

      // Data esperada: 1 de agosto - 3 dias = 29 de julho
      expect(notificationDate.getFullYear()).toBe(2024);
      expect(notificationDate.getMonth()).toBe(6); // Julho (0-indexed)
      expect(notificationDate.getDate()).toBe(29);
    });

    it('should handle different notification advance scenarios', async () => {
      const testCases = [
        { advance: 1, expected: 'Notificar 1 dia antes' },
        { advance: 2, expected: 'Notificar 2 dias antes' },
        { advance: 7, expected: 'Notificar 1 semana antes' },
      ];

      for (const testCase of testCases) {
        // Criar usuário primeiro
        const user = await prisma.user.create({
          data: {
            name: `Usuário ${testCase.advance}`,
            email: `user_advance_${testCase.advance}@teste.com`,
            passwordHash: await bcrypt.hash('senha123', 12),
          },
        });

        const preferences = await prisma.userPreferences.create({
          data: {
            userId: user.id,
            notificationAdvance: testCase.advance,
          },
        });

        expect(preferences.notificationAdvance).toBe(testCase.advance);

        // Limpar para próxima iteração
        await prisma.userPreferences.delete({
          where: { id: preferences.id },
        });
        await prisma.user.delete({
          where: { id: user.id },
        });
      }
    });
  });
});
