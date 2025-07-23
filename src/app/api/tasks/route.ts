import { NextRequest } from 'next/server';
import { TaskService } from '@/services/task.service';
import { createTaskSchema, taskFiltersSchema } from '@/types/task.types';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sua-chave-jwt-secreta'
);

export async function POST(request: NextRequest) {
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
    const validation = createTaskSchema.safeParse(body);

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

    // Criar tarefa
    const result = await TaskService.createTask(userId, validation.data);

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro na criação de tarefa:', error);
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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

    // Extrair parâmetros de query
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const queryFilters = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validar filtros
    const filtersValidation = taskFiltersSchema.safeParse(queryFilters);

    if (!filtersValidation.success) {
      return Response.json(
        {
          success: false,
          message: 'Parâmetros de filtro inválidos',
          errors: filtersValidation.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Listar tarefas
    const result = await TaskService.listTasks(userId, filtersValidation.data);

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error('Erro na listagem de tarefas:', error);
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
