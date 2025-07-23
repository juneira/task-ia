'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <nav className='bg-white shadow'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16'>
              <div className='flex items-center'>
                <h1 className='text-xl font-semibold'>TaskAI Dashboard</h1>
              </div>
              <div className='flex items-center space-x-4'>
                <span className='text-gray-700'>Olá, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium'
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            <div className='border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center'>
              <div className='text-center'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                  Bem-vindo ao TaskAI!
                </h2>
                <p className='text-gray-600'>
                  Sistema de gerenciamento de tarefas com IA em desenvolvimento.
                </p>
                <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h3 className='text-lg font-medium text-blue-800'>
                    Informações do usuário:
                  </h3>
                  <ul className='mt-2 text-blue-700'>
                    <li>
                      <strong>Nome:</strong> {user?.name}
                    </li>
                    <li>
                      <strong>Email:</strong> {user?.email}
                    </li>
                    <li>
                      <strong>ID:</strong> {user?.id}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
