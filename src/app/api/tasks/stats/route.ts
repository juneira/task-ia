import { NextRequest } from 'next/server';
import { TaskService } from '@/services/task.service';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sua-chave-jwt-secreta'
);

export async function GET(request: NextRequest) {
  try {
    // Verificar autorização
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return Response.json(
        { success: false, message: 'Token de acesso requerido' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userId = payload.userId as string;
    } catch {
      return Response.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obter estatísticas das tarefas
    const result = await TaskService.getTaskStats(userId);

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
