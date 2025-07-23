import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from '@/services/auth.service';
import { AuthResponse } from '@/types/auth.types';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/utils/password.utils';

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Mock dos utilitários
jest.mock('@/utils/password.utils');
jest.mock('@/utils/jwt.utils');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<
  typeof hashPassword
>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '1',
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await AuthService.register(userData);

      expect(result.success).toBe(true);
      const successResult = result as AuthResponse;
      expect(successResult.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        })
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
      });
    });

    it('deve falhar se o email já estiver em uso', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      const existingUser = {
        id: '1',
        name: 'Usuário Existente',
        email: userData.email,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await AuthService.register(userData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Email já está em uso');
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('deve tratar erros do banco de dados', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await AuthService.register(userData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Erro interno do servidor');
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      const mockUser = {
        id: '1',
        name: 'João Silva',
        email: loginData.email,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock do validatePassword
      jest.doMock('@/utils/password.utils', () => ({
        validatePassword: jest.fn().mockResolvedValue(true),
      }));

      // Mock do generateToken
      jest.doMock('@/utils/jwt.utils', () => ({
        generateToken: jest.fn().mockReturnValue('mock_token'),
      }));

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.login(loginData);

      expect(result.success).toBe(true);
      const successResult = result as AuthResponse;
      expect(successResult.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        })
      );
      expect(successResult.token).toBe('mock_token');
    });

    it('deve falhar com credenciais inválidas', async () => {
      const loginData = {
        email: 'joao@exemplo.com',
        password: 'senha_errada',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await AuthService.login(loginData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Credenciais inválidas');
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário por ID', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await AuthService.getUserById(userId);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        })
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('deve retornar null para usuário inexistente', async () => {
      const userId = 'inexistente';

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await AuthService.getUserById(userId);

      expect(result).toBeNull();
    });
  });
});
