// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from './src/lib/prisma';

// Setup para testes com Prisma
beforeAll(async () => {
  // Configurações globais de teste se necessário
});

afterAll(async () => {
  // Desconectar do banco após todos os testes
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Limpar banco antes de cada teste
  await prisma.notification.deleteMany();
  await prisma.aiSuggestion.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
});
