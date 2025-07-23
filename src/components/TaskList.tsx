'use client';

import { useState } from 'react';
import { useTasks, useDeleteTask } from '@/hooks/useTasks';
import { TaskStatus, TaskPriority, TaskFilters } from '@/types/task.types';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';

interface TaskListProps {
  className?: string;
}

export default function TaskList({ className = '' }: TaskListProps) {
  const [filters, setFilters] = useState<Partial<TaskFilters>>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const { tasks, pagination, loading, error, fetchTasks } = useTasks(filters);
  const { deleteTask, loading: deleting } = useDeleteTask();

  // Filtros para status
  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: TaskStatus.PENDING, label: 'Pendente' },
    { value: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
    { value: TaskStatus.COMPLETED, label: 'Concluída' },
  ];

  // Filtros para prioridade
  const priorityOptions = [
    { value: '', label: 'Todas as Prioridades' },
    { value: TaskPriority.NOT_DEFINED, label: 'Não Definida' },
    { value: TaskPriority.LOW, label: 'Baixa' },
    { value: TaskPriority.MEDIUM, label: 'Média' },
    { value: TaskPriority.HIGH, label: 'Alta' },
  ];

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset para página 1 quando mudamos outros filtros
    };
    setFilters(newFilters);
    fetchTasks(newFilters);
  };

  const handleSearch = (search: string) => {
    handleFilterChange('search', search);
  };

  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  const handleTaskCreated = () => {
    setShowForm(false);
    fetchTasks(filters); // Refresh da lista
  };

  const handleTaskUpdated = () => {
    setEditingTask(null);
    fetchTasks(filters); // Refresh da lista
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const success = await deleteTask(taskId);
      if (success) {
        fetchTasks(filters); // Refresh da lista
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Minhas Tarefas</h1>
        <button
          onClick={() => setShowForm(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Nova Tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className='bg-white p-4 rounded-lg shadow space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Busca */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Buscar
            </label>
            <input
              type='text'
              placeholder='Título ou descrição...'
              value={filters.search || ''}
              onChange={e => handleSearch(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          {/* Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={e =>
                handleFilterChange('status', e.target.value || undefined)
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Prioridade
            </label>
            <select
              value={filters.priority || ''}
              onChange={e =>
                handleFilterChange('priority', e.target.value || undefined)
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Ordenar por
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({
                  ...prev,
                  sortBy: sortBy as any,
                  sortOrder: sortOrder as any,
                }));
                fetchTasks({
                  ...filters,
                  sortBy: sortBy as any,
                  sortOrder: sortOrder as any,
                });
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='createdAt-desc'>Mais Recentes</option>
              <option value='createdAt-asc'>Mais Antigas</option>
              <option value='dueDate-asc'>Vencimento (Próximo)</option>
              <option value='dueDate-desc'>Vencimento (Distante)</option>
              <option value='priority-desc'>Prioridade (Alta → Baixa)</option>
              <option value='title-asc'>Título (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tarefas */}
      {loading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      ) : error ? (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>Nenhuma tarefa encontrada</p>
          <button
            onClick={() => setShowForm(true)}
            className='mt-2 text-blue-600 hover:text-blue-700'
          >
            Criar sua primeira tarefa
          </button>
        </div>
      ) : (
        <div className='space-y-4'>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task.id)}
              onDelete={() => handleDeleteTask(task.id)}
              isDeleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className='flex justify-center items-center space-x-2'>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className='px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
          >
            Anterior
          </button>

          <span className='px-4 py-2 text-sm text-gray-700'>
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className='px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modais */}
      {showForm && (
        <TaskForm
          onSuccess={handleTaskCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          taskId={editingTask}
          onSuccess={handleTaskUpdated}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
