import { NextRequest } from 'next/server';
import { TaskService } from '@/services/task.service';
import { updateTaskSchema } from '@/types/task.types';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sua-chave-jwt-secreta'
);

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Buscar tarefa por ID
    const result = await TaskService.getTaskById(params.id, userId);

    if (!result.success) {
      const status = result.message === 'Tarefa não encontrada' ? 404 : 500;
      return Response.json(result, { status });
    }

    return Response.json(result, { status: 200 });
  } catch {
    console.error('Erro ao buscar tarefa:', error);
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Validar dados de entrada
    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Atualizar tarefa
    const result = await TaskService.updateTask(
      params.id,
      userId,
      validation.data
    );

    if (!result.success) {
      const status = result.message === 'Tarefa não encontrada' ? 404 : 500;
      return Response.json(result, { status });
    }

    return Response.json(result, { status: 200 });
  } catch {
    console.error('Erro ao atualizar tarefa:', error);
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Excluir tarefa
    const result = await TaskService.deleteTask(params.id, userId);

    if (!result.success) {
      const status = result.message === 'Tarefa não encontrada' ? 404 : 500;
      return Response.json(result, { status });
    }

    return Response.json(result, { status: 200 });
  } catch {
    console.error('Erro ao excluir tarefa:', error);
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
