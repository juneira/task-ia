'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-gray-900 mb-6'>TaskAI</h1>
          <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            Sistema inteligente de gerenciamento de tarefas com IA. Organize
            suas tarefas, acompanhe projetos e aumente sua produtividade.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link
              href='/auth'
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors'
            >
              Começar agora
            </Link>
            <Link
              href='/auth'
              className='border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors'
            >
              Fazer login
            </Link>
          </div>
        </div>

        <div className='mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='text-blue-600 text-3xl mb-4'>🤖</div>
            <h3 className='text-xl font-semibold mb-2'>IA Integrada</h3>
            <p className='text-gray-600'>
              Sugestões inteligentes para organização de tarefas e otimização de
              tempo.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='text-green-600 text-3xl mb-4'>📊</div>
            <h3 className='text-xl font-semibold mb-2'>Relatórios</h3>
            <p className='text-gray-600'>
              Acompanhe seu progresso com relatórios detalhados e métricas de
              produtividade.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='text-purple-600 text-3xl mb-4'>⚡</div>
            <h3 className='text-xl font-semibold mb-2'>Produtividade</h3>
            <p className='text-gray-600'>
              Gerencie projetos, colabore com equipes e cumpra prazos com
              eficiência.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
