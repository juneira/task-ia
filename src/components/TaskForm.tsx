'use client';

import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask, useTask } from '@/hooks/useTasks';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
} from '@/types/task.types';

interface TaskFormProps {
  taskId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TaskForm({
  taskId,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const isEditing = Boolean(taskId);
  const { createTask, loading: creating, error: createError } = useCreateTask();
  const { updateTask, loading: updating, error: updateError } = useUpdateTask();
  const { task, loading: loadingTask } = useTask(taskId || null);

  const [formData, setFormData] = useState<CreateTaskInput | UpdateTaskInput>({
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NOT_DEFINED,
    dueDate: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da tarefa quando estiver editando
  useEffect(() => {
    if (isEditing && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 16)
          : undefined,
      });
    }
  }, [isEditing, task]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.dueDate = 'Data de vencimento deve ser no futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      title: (formData.title || '').trim(),
      description: formData.description?.trim() || undefined,
    };

    let success = false;

    if (isEditing && taskId) {
      const result = await updateTask(taskId, taskData);
      success = Boolean(result);
    } else {
      const result = await createTask(taskData as CreateTaskInput);
      success = Boolean(result);
    }

    if (success) {
      onSuccess();
    }
  };

  const currentError = createError || updateError;

  if (loadingTask) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-6'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Carregando tarefa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {/* Erro geral */}
          {currentError && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm'>
              {currentError}
            </div>
          )}

          {/* Título */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Título *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Digite o título da tarefa'
              maxLength={100}
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-600'>{errors.title}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Descrição
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Descrição opcional da tarefa'
              maxLength={500}
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              {(formData.description || '').length}/500 caracteres
            </p>
          </div>

          {/* Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <select
              value={formData.status}
              onChange={e => handleInputChange('status', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value={TaskStatus.PENDING}>Pendente</option>
              <option value={TaskStatus.IN_PROGRESS}>Em Progresso</option>
              <option value={TaskStatus.COMPLETED}>Concluída</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={e => handleInputChange('priority', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value={TaskPriority.NOT_DEFINED}>Não Definida</option>
              <option value={TaskPriority.LOW}>Baixa</option>
              <option value={TaskPriority.MEDIUM}>Média</option>
              <option value={TaskPriority.HIGH}>Alta</option>
            </select>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Data de Vencimento
            </label>
            <input
              type='datetime-local'
              value={formData.dueDate || ''}
              onChange={e =>
                handleInputChange('dueDate', e.target.value || undefined)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.dueDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && (
              <p className='mt-1 text-sm text-red-600'>{errors.dueDate}</p>
            )}
          </div>

          {/* Botões */}
          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onCancel}
              className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={creating || updating}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {creating || updating ? (
                <div className='flex items-center space-x-2'>
                  <div className='w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                  <span>{isEditing ? 'Salvando...' : 'Criando...'}</span>
                </div>
              ) : isEditing ? (
                'Salvar'
              ) : (
                'Criar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
