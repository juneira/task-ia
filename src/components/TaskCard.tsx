'use client';

import { Task, TaskStatus, TaskPriority } from '@/types/task.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isDeleting = false,
}: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-100 text-red-800';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'Alta';
      case TaskPriority.MEDIUM:
        return 'Média';
      case TaskPriority.LOW:
        return 'Baixa';
      case TaskPriority.NOT_DEFINED:
        return 'Não Definida';
      default:
        return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'Concluída';
      case TaskStatus.IN_PROGRESS:
        return 'Em Progresso';
      case TaskStatus.PENDING:
        return 'Pendente';
      default:
        return status;
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== TaskStatus.COMPLETED;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className='flex justify-between items-start'>
        <div className='flex-1'>
          {/* Título e Status */}
          <div className='flex items-center gap-3 mb-2'>
            <h3
              className={`font-semibold text-lg ${
                task.status === TaskStatus.COMPLETED
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
            >
              {getStatusLabel(task.status)}
            </span>
          </div>

          {/* Descrição */}
          {task.description && (
            <p className='text-gray-600 mb-3 text-sm'>{task.description}</p>
          )}

          {/* Metadata */}
          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
            {/* Prioridade */}
            <div className='flex items-center gap-1'>
              <span className='font-medium'>Prioridade:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
              >
                {getPriorityLabel(task.priority)}
              </span>
            </div>

            {/* Data de Vencimento */}
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 font-medium' : ''
                }`}
              >
                <span className='font-medium'>Vence em:</span>
                <span>
                  {format(new Date(task.dueDate), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                  {isOverdue && ' (Vencida)'}
                </span>
              </div>
            )}

            {/* Data de Criação */}
            <div className='flex items-center gap-1'>
              <span className='font-medium'>Criada em:</span>
              <span>
                {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className='flex items-center gap-2 ml-4'>
          <button
            onClick={onEdit}
            className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
            title='Editar tarefa'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
          </button>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title='Excluir tarefa'
          >
            {isDeleting ? (
              <div className='w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600'></div>
            ) : (
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
