// Enums do Prisma
export enum Priority {
  ALTA = 'Alta',
  MEDIA = 'Média',
  BAIXA = 'Baixa',
  NAO_DEFINIDA = 'Não definida',
}

export enum TaskStatus {
  PENDENTE = 'Pendente',
  EM_PROGRESSO = 'Em Progresso',
  CONCLUIDA = 'Concluída',
  CANCELADA = 'Cancelada',
}

export enum NotificationType {
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  TASK_COMPLETED = 'task_completed',
  PRIORITY_SUGGESTED = 'priority_suggested',
}

// Tipos base das entidades
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiSuggestion {
  id: string;
  taskId: string | null;
  userId: string;
  taskTitle: string;
  taskDescription: string | null;
  taskDueDate: Date | null;
  suggestedPriority: Priority;
  confidence: number | null;
  reasoning: string | null;
  wasAccepted: boolean | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  taskId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  notificationAdvance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para criação (sem campos auto-gerados)
export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface CreateTaskData {
  userId: string;
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
}

export interface CreateAiSuggestionData {
  taskId?: string;
  userId: string;
  taskTitle: string;
  taskDescription?: string;
  taskDueDate?: Date;
  suggestedPriority: Priority;
  confidence?: number;
  reasoning?: string;
  wasAccepted?: boolean;
}

export interface CreateNotificationData {
  userId: string;
  taskId?: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface CreateUserPreferencesData {
  userId: string;
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  notificationAdvance?: number;
}

// Tipos para atualização
export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  isDeleted?: boolean;
}

export interface UpdateAiSuggestionData {
  wasAccepted?: boolean;
}

export interface UpdateNotificationData {
  isRead?: boolean;
}

export interface UpdateUserPreferencesData {
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  notificationAdvance?: number;
}

// Tipos para queries com relacionamentos
export interface UserWithTasks extends User {
  tasks: Task[];
}

export interface UserWithPreferences extends User {
  preferences: UserPreferences | null;
}

export interface TaskWithUser extends Task {
  user: User;
}

export interface TaskWithAiSuggestions extends Task {
  aiSuggestions: AiSuggestion[];
}

export interface AiSuggestionWithTask extends AiSuggestion {
  task: Task | null;
  user: User;
}

export interface NotificationWithTask extends Notification {
  task: Task | null;
  user: User;
}

// Tipos para filtros e paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos específicos para autenticação
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Tipos para IA
export interface AiPriorityRequest {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface AiPriorityResponse {
  suggestedPriority: Priority;
  confidence: number;
  reasoning: string;
}

// Tipos para filtros e paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos específicos para autenticação
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Tipos para IA
export interface AiPriorityRequest {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface AiPriorityResponse {
  suggestedPriority: Priority;
  confidence: number;
  reasoning: string;
}
