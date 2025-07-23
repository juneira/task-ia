import { describe, it, expect, beforeAll } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('User Model Tests', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test.db';
  });

  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const user = await prisma.user.create({
        data: userData,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      // Criar primeiro usuário
      await prisma.user.create({ data: userData });

      // Tentar criar segundo usuário com mesmo email
      await expect(
        prisma.user.create({
          data: {
            ...userData,
            name: 'Maria Silva',
          },
        })
      ).rejects.toThrow();
    });

    it('should require name field', async () => {
      await expect(
        prisma.user.create({
          data: {
            email: 'teste@teste.com',
            passwordHash: await bcrypt.hash('senha123', 12),
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require email field', async () => {
      await expect(
        prisma.user.create({
          data: {
            name: 'João Silva',
            passwordHash: await bcrypt.hash('senha123', 12),
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require passwordHash field', async () => {
      await expect(
        prisma.user.create({
          data: {
            name: 'João Silva',
            email: 'joao@teste.com',
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('User Retrieval', () => {
    it('should find user by email', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const createdUser = await prisma.user.create({ data: userData });

      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should find user by id', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const createdUser = await prisma.user.create({ data: userData });

      const foundUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it('should return null for non-existent user', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'naoexiste@teste.com' },
      });

      expect(user).toBeNull();
    });
  });

  describe('User Update', () => {
    it('should update user name', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const user = await prisma.user.create({ data: userData });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'João Santos' },
      });

      expect(updatedUser.name).toBe('João Santos');
      expect(updatedUser.updatedAt).not.toBe(user.updatedAt);
    });

    it('should update user password', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const user = await prisma.user.create({ data: userData });
      const newPassword = await bcrypt.hash('novasenha123', 12);

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPassword },
      });

      expect(updatedUser.passwordHash).toBe(newPassword);
      expect(updatedUser.passwordHash).not.toBe(user.passwordHash);
    });
  });

  describe('User Deletion', () => {
    it('should delete user', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const user = await prisma.user.create({ data: userData });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    });
  });

  describe('User Relationships', () => {
    it('should create user with preferences', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const user = await prisma.user.create({
        data: {
          ...userData,
          preferences: {
            create: {
              emailNotifications: true,
              inAppNotifications: false,
              notificationAdvance: 3,
            },
          },
        },
        include: {
          preferences: true,
        },
      });

      expect(user.preferences).toBeDefined();
      expect(user.preferences?.emailNotifications).toBe(true);
      expect(user.preferences?.inAppNotifications).toBe(false);
      expect(user.preferences?.notificationAdvance).toBe(3);
    });

    it('should create user with tasks', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@teste.com',
        passwordHash: await bcrypt.hash('senha123', 12),
      };

      const user = await prisma.user.create({
        data: {
          ...userData,
          tasks: {
            create: [
              {
                title: 'Tarefa 1',
                description: 'Descrição da tarefa 1',
                priority: 'ALTA',
                status: 'PENDENTE',
              },
              {
                title: 'Tarefa 2',
                description: 'Descrição da tarefa 2',
                priority: 'MEDIA',
                status: 'EM_PROGRESSO',
              },
            ],
          },
        },
        include: {
          tasks: true,
        },
      });

      expect(user.tasks).toHaveLength(2);
      expect(user.tasks[0].title).toBe('Tarefa 1');
      expect(user.tasks[1].title).toBe('Tarefa 2');
    });
  });
});
