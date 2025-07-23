import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: 'Token inválido ou expirado',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: authResult.user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro na API de verificação de autenticação:', error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
