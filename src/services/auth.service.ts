import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/utils/password.utils';
import { generateToken } from '@/utils/jwt.utils';
import {
  RegisterData,
  LoginData,
  AuthResponse,
  AuthError,
} from '@/types/auth.types';

/**
 * Serviço de autenticação
 */
export class AuthService {
  /**
   * Registra um novo usuário
   */
  static async register(data: RegisterData): Promise<AuthResponse | AuthError> {
    try {
      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Email já está em uso',
          field: 'email',
        };
      }

      // Hash da senha
      const passwordHash = await hashPassword(data.password);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      // Gerar token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Faz login do usuário
   */
  static async login(data: LoginData): Promise<AuthResponse | AuthError> {
    try {
      // Buscar usuário por email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      }

      // Verificar senha
      const isPasswordValid = await verifyPassword(
        data.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      }

      // Gerar token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Busca usuário por ID (para middleware de autenticação)
   */
  static async getUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Verifica se o email existe (para validação)
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }
}
