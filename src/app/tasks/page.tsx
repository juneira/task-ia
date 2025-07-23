'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskList from '@/components/TaskList';
import { useTaskStats } from '@/hooks/useTasks';

export default function TasksPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { stats, loading: statsLoading } = useTaskStats();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-xl font-semibold text-gray-900'>TaskAI</h1>
              <nav className='flex space-x-8'>
                <a
                  href='/tasks'
                  className='text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Tarefas
                </a>
              </nav>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  router.push('/auth/login');
                }}
                className='text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium'
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Estatísticas */}
        {!statsLoading && stats && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Total por Status */}
            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Pendentes
              </h3>
              <p className='text-2xl font-bold text-yellow-600'>
                {stats.byStatus?.PENDING || 0}
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Em Progresso
              </h3>
              <p className='text-2xl font-bold text-blue-600'>
                {stats.byStatus?.IN_PROGRESS || 0}
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Concluídas
              </h3>
              <p className='text-2xl font-bold text-green-600'>
                {stats.byStatus?.COMPLETED || 0}
              </p>
            </div>

            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Vencidas
              </h3>
              <p className='text-2xl font-bold text-red-600'>
                {stats.overdue || 0}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Tarefas */}
        <TaskList />
      </main>
    </div>
  );
}
