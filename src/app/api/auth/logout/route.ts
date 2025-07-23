import { NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/auth.config';

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      { status: 200 }
    );

    // Remover o cookie de autenticação
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira imediatamente
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro na API de logout:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
