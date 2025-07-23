import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';
import { AUTH_CONFIG } from '@/config/auth.config';

export async function POST(request: NextRequest) {
  try {
    // Parse e validação dos dados
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'Dados inválidos',
          errors,
        },
        { status: 400 }
      );
    }

    // Fazer login
    const result = await AuthService.login(validationResult.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Configurar cookie com token
    const response = NextResponse.json(result, { status: 200 });

    if (result.token) {
      response.cookies.set({
        name: AUTH_CONFIG.COOKIE_NAME,
        value: result.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: AUTH_CONFIG.COOKIE_MAX_AGE,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Erro na API de login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
