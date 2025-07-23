import { prisma } from '@/lib/prisma';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskResponse,
  TaskListResponse,
  TaskError,
  TaskStatus,
  TaskPriority,
} from '@/types/task.types';

type TaskStatusType = keyof typeof TaskStatus;
type TaskPriorityType = keyof typeof TaskPriority;

export class TaskService {
  // Criar nova tarefa
  static async createTask(
    userId: string,
    taskData: CreateTaskInput
  ): Promise<TaskResponse | TaskError> {
    try {
      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status || TaskStatus.PENDING,
          priority: taskData.priority || TaskPriority.NOT_DEFINED,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          userId,
        },
      });

      return {
        success: true,
        message: 'Tarefa criada com sucesso',
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as any,
          priority: task.priority as any,
          dueDate: task.dueDate,
          isDeleted: task.isDeleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          userId: task.userId,
        },
      };
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  // Listar tarefas com filtros e paginação
  static async listTasks(
    userId: string,
    filters: TaskFilters
  ): Promise<TaskListResponse | TaskError> {
    try {
      const { page, limit, status, priority, search, sortBy, sortOrder } =
        filters;
      const skip = (page - 1) * limit;

      // Construir where clause
      const where: any = {
        userId,
        isDeleted: false,
      };

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (search) {
        where.OR = [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      // Construir orderBy
      const orderBy: any = {};
      if (sortBy === 'priority') {
        // Ordenação customizada para prioridade
        orderBy.priority = sortOrder;
      } else {
        orderBy[sortBy] = sortOrder;
      }

      // Buscar tarefas e contar total
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        }),
        prisma.task.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Tarefas listadas com sucesso',
        data: {
          tasks: tasks.map((task: any) => ({
            ...task,
            status: task.status as TaskStatusType,
            priority: task.priority as TaskPriorityType,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  // Buscar tarefa por ID
  static async getTaskById(
    taskId: string,
    userId: string
  ): Promise<TaskResponse | TaskError> {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId,
          isDeleted: false,
        },
      });

      if (!task) {
        return {
          success: false,
          message: 'Tarefa não encontrada',
        };
      }

      return {
        success: true,
        message: 'Tarefa encontrada',
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as any,
          priority: task.priority as any,
          dueDate: task.dueDate,
          isDeleted: task.isDeleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          userId: task.userId,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  // Atualizar tarefa
  static async updateTask(
    taskId: string,
    userId: string,
    updateData: UpdateTaskInput
  ): Promise<TaskResponse | TaskError> {
    try {
      // Verificar se a tarefa existe e pertence ao usuário
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId,
          isDeleted: false,
        },
      });

      if (!existingTask) {
        return {
          success: false,
          message: 'Tarefa não encontrada',
        };
      }

      // Preparar dados para atualização
      const updatePayload: any = {};

      if (updateData.title !== undefined) {
        updatePayload.title = updateData.title;
      }

      if (updateData.description !== undefined) {
        updatePayload.description = updateData.description;
      }

      if (updateData.status !== undefined) {
        updatePayload.status = updateData.status;
      }

      if (updateData.priority !== undefined) {
        updatePayload.priority = updateData.priority;
      }

      if (updateData.dueDate !== undefined) {
        updatePayload.dueDate = updateData.dueDate
          ? new Date(updateData.dueDate)
          : null;
      }

      // Atualizar tarefa
      const updatedTask = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: updatePayload,
      });

      return {
        success: true,
        message: 'Tarefa atualizada com sucesso',
        task: {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status as any,
          priority: updatedTask.priority as any,
          dueDate: updatedTask.dueDate,
          isDeleted: updatedTask.isDeleted,
          createdAt: updatedTask.createdAt,
          updatedAt: updatedTask.updatedAt,
          userId: updatedTask.userId,
        },
      };
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  // Excluir tarefa (soft delete)
  static async deleteTask(
    taskId: string,
    userId: string
  ): Promise<TaskResponse | TaskError> {
    try {
      // Verificar se a tarefa existe e pertence ao usuário
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId,
          isDeleted: false,
        },
      });

      if (!existingTask) {
        return {
          success: false,
          message: 'Tarefa não encontrada',
        };
      }

      // Soft delete
      await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          isDeleted: true,
        },
      });

      return {
        success: true,
        message: 'Tarefa excluída com sucesso',
      };
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  // Obter estatísticas das tarefas do usuário
  static async getTaskStats(userId: string) {
    try {
      const stats = await prisma.task.groupBy({
        by: ['status'],
        where: {
          userId,
          isDeleted: false,
        },
        _count: {
          status: true,
        },
      });

      const priorities = await prisma.task.groupBy({
        by: ['priority'],
        where: {
          userId,
          isDeleted: false,
        },
        _count: {
          priority: true,
        },
      });

      // Tarefas próximas ao vencimento (próximos 7 dias)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dueSoon = await prisma.task.count({
        where: {
          userId,
          isDeleted: false,
          dueDate: {
            lte: nextWeek,
            gte: new Date(),
          },
        },
      });

      // Tarefas vencidas
      const overdue = await prisma.task.count({
        where: {
          userId,
          isDeleted: false,
          dueDate: {
            lt: new Date(),
          },
        },
      });

      return {
        success: true,
        stats: {
          byStatus: stats.reduce(
            (acc: Record<string, number>, item: any) => {
              acc[item.status] = item._count.status;
              return acc;
            },
            {} as Record<string, number>
          ),
          byPriority: priorities.reduce(
            (acc: Record<string, number>, item: any) => {
              acc[item.priority] = item._count.priority;
              return acc;
            },
            {} as Record<string, number>
          ),
          dueSoon,
          overdue,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }
}
