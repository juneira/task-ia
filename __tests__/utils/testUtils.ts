import { prisma } from '@/lib/prisma';

export async function cleanDatabase() {
  // Limpar em ordem para respeitar foreign keys
  await prisma.notification.deleteMany();
  await prisma.aiSuggestion.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectDatabase() {
  await cleanDatabase();
  await prisma.$disconnect();
}
