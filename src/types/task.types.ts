import { z } from 'zod';

// Enums para Status e Prioridade
export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const TaskPriority = {
  NOT_DEFINED: 'NOT_DEFINED',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

// Tipo da tarefa (baseado no schema Prisma)
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusType;
  priority: TaskPriorityType;
  dueDate: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Schemas de validação para tarefas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .datetime('Data de vencimento deve estar no formato ISO')
    .refine(date => new Date(date) > new Date(), {
      message: 'Data de vencimento não pode ser no passado',
    })
    .optional(),
  priority: z
    .enum([
      TaskPriority.NOT_DEFINED,
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ])
    .default(TaskPriority.NOT_DEFINED),
  status: z
    .enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED])
    .default(TaskStatus.PENDING),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .datetime('Data de vencimento deve estar no formato ISO')
    .refine(date => new Date(date) > new Date(), {
      message: 'Data de vencimento não pode ser no passado',
    })
    .optional()
    .nullable(),
  priority: z
    .enum([
      TaskPriority.NOT_DEFINED,
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ])
    .optional(),
  status: z
    .enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED])
    .optional(),
});

// Schema para filtros de listagem
export const taskFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z
    .enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED])
    .optional(),
  priority: z
    .enum([
      TaskPriority.NOT_DEFINED,
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ])
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['createdAt', 'dueDate', 'priority', 'title'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types para resposta da API
export interface TaskResponse {
  success: boolean;
  message: string;
  task?: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatusType;
    priority: TaskPriorityType;
    dueDate: Date | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  };
}

export interface TaskListResponse {
  success: boolean;
  message: string;
  data?: {
    tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      status: TaskStatusType;
      priority: TaskPriorityType;
      dueDate: Date | null;
      isDeleted: boolean;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TaskError {
  success: false;
  message: string;
  field?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Types para criação e atualização
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
