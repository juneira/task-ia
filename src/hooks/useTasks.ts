import { useState, useEffect, useCallback } from 'react';
import {
  TaskListResponse,
  TaskResponse,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  Task,
} from '@/types/task.types';

const API_BASE = '/api/tasks';

// Hook para gerenciar o estado de autenticação
function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      setToken(stored);
    }
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  });

  return { token, getAuthHeaders };
}

// Hook para listar tarefas
export function useTasks(filters: Partial<TaskFilters> = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthHeaders } = useAuth();

  const fetchTasks = useCallback(
    async (newFilters: Partial<TaskFilters> = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        // Combinar filtros padrão com novos filtros
        const finalFilters = { ...filters, ...newFilters };

        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        const response = await fetch(`${API_BASE}?${queryParams}`, {
          headers: getAuthHeaders(),
        });

        const data: TaskListResponse = await response.json();

        if (data.success && data.data) {
          setTasks(data.data.tasks);
          setPagination(data.data.pagination);
        } else {
          setError(data.message || 'Erro ao carregar tarefas');
        }
      } catch (err) {
        setError('Erro de conexão');
        console.error('Erro ao buscar tarefas:', err);
      } finally {
        setLoading(false);
      }
    },
    [filters, getAuthHeaders]
  );

  const refresh = () => fetchTasks();

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    pagination,
    loading,
    error,
    fetchTasks,
    refresh,
  };
}

// Hook para criar tarefa
export function useCreateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthHeaders } = useAuth();

  const createTask = async (
    taskData: CreateTaskInput
  ): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      const data: TaskResponse = await response.json();

      if (data.success && data.task) {
        return data.task;
      } else {
        setError(data.message || 'Erro ao criar tarefa');
        return null;
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao criar tarefa:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error };
}

// Hook para atualizar tarefa
export function useUpdateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthHeaders } = useAuth();

  const updateTask = async (
    taskId: string,
    updateData: UpdateTaskInput
  ): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const data: TaskResponse = await response.json();

      if (data.success && data.task) {
        return data.task;
      } else {
        setError(data.message || 'Erro ao atualizar tarefa');
        return null;
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao atualizar tarefa:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateTask, loading, error };
}

// Hook para excluir tarefa
export function useDeleteTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthHeaders } = useAuth();

  const deleteTask = async (taskId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data: TaskResponse = await response.json();

      if (data.success) {
        return true;
      } else {
        setError(data.message || 'Erro ao excluir tarefa');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao excluir tarefa:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
}

// Hook para obter uma tarefa específica
export function useTask(taskId: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthHeaders } = useAuth();

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${taskId}`, {
        headers: getAuthHeaders(),
      });

      const data: TaskResponse = await response.json();

      if (data.success && data.task) {
        setTask(data.task);
      } else {
        setError(data.message || 'Erro ao carregar tarefa');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao buscar tarefa:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId, getAuthHeaders]);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  return { task, loading, error, refresh: fetchTask };
}

// Hook para estatísticas das tarefas
export function useTaskStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAuthHeaders } = useAuth();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/stats`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refresh: fetchStats };
}
