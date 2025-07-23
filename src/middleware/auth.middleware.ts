import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/utils/jwt.utils';
import { AuthService } from '@/services/auth.service';

// Tipo para Request com usuário autenticado
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Middleware de autenticação para APIs
 * Verifica se o usuário está autenticado via JWT
 */
export async function authMiddleware(request: NextRequest): Promise<{
  success: boolean;
  user?: any;
  response?: NextResponse;
}> {
  try {
    // Extrair token do header Authorization
    const authorization = request.headers.get('authorization');
    const token = extractTokenFromHeader(authorization || undefined);

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Token de acesso não fornecido' },
          { status: 401 }
        ),
      };
    }

    // Verificar e decodificar token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Token inválido ou expirado' },
          { status: 401 }
        ),
      };
    }

    // Buscar usuário no banco
    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Usuário não encontrado' },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Erro interno do servidor' },
        { status: 500 }
      ),
    };
  }
}

/**
 * HOF para proteger rotas de API que requerem autenticação
 */
export function withAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    user: any,
    ...args: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return authResult.response!;
    }

    return handler(request, authResult.user, ...args);
  };
}
