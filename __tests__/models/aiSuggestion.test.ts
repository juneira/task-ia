import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User, Task } from '@/types/database.types';

describe('AiSuggestion Model Tests', () => {
  let testUser: User;
  let testTask: Task;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test.db';
  });

  beforeEach(async () => {
    // Criar usuário de teste único para cada teste
    testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: `test-${Date.now()}@teste.com`,
        passwordHash: await bcrypt.hash('senha123', 12),
      },
    });

    // Criar tarefa de teste
    testTask = await prisma.task.create({
      data: {
        title: 'Tarefa de Teste',
        description: 'Descrição de teste',
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany();
    await prisma.aiSuggestion.deleteMany();
    await prisma.task.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('AiSuggestion Creation', () => {
    it('should create AI suggestion with required fields', async () => {
      const suggestionData = {
        userId: testUser.id,
        taskTitle: 'Análise de tarefa',
        suggestedPriority: 'ALTA' as const,
      };

      const suggestion = await prisma.aiSuggestion.create({
        data: suggestionData,
      });

      expect(suggestion).toBeDefined();
      expect(suggestion.id).toBeDefined();
      expect(suggestion.userId).toBe(testUser.id);
      expect(suggestion.taskTitle).toBe(suggestionData.taskTitle);
      expect(suggestion.suggestedPriority).toBe(
        suggestionData.suggestedPriority
      );
      expect(suggestion.taskId).toBeNull();
      expect(suggestion.taskDescription).toBeNull();
      expect(suggestion.taskDueDate).toBeNull();
      expect(suggestion.confidence).toBeNull();
      expect(suggestion.reasoning).toBeNull();
      expect(suggestion.wasAccepted).toBeNull();
      expect(suggestion.createdAt).toBeInstanceOf(Date);
    });

    it('should create AI suggestion with all fields', async () => {
      const dueDate = new Date('2025-12-31');
      const suggestionData = {
        taskId: testTask.id,
        userId: testUser.id,
        taskTitle: 'Análise completa',
        taskDescription: 'Descrição detalhada para análise',
        taskDueDate: dueDate,
        suggestedPriority: 'MEDIA' as const,
        confidence: 0.85,
        reasoning: 'Baseado no prazo e complexidade',
        wasAccepted: true,
      };

      const suggestion = await prisma.aiSuggestion.create({
        data: suggestionData,
      });

      expect(suggestion.taskId).toBe(testTask.id);
      expect(suggestion.userId).toBe(testUser.id);
      expect(suggestion.taskTitle).toBe(suggestionData.taskTitle);
      expect(suggestion.taskDescription).toBe(suggestionData.taskDescription);
      expect(suggestion.taskDueDate).toEqual(dueDate);
      expect(suggestion.suggestedPriority).toBe(
        suggestionData.suggestedPriority
      );
      expect(suggestion.confidence).toBe(suggestionData.confidence);
      expect(suggestion.reasoning).toBe(suggestionData.reasoning);
      expect(suggestion.wasAccepted).toBe(suggestionData.wasAccepted);
    });

    it('should require userId field', async () => {
      await expect(
        prisma.aiSuggestion.create({
          data: {
            taskTitle: 'Título',
            suggestedPriority: 'ALTA',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require taskTitle field', async () => {
      await expect(
        prisma.aiSuggestion.create({
          data: {
            userId: testUser.id,
            suggestedPriority: 'ALTA',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should require suggestedPriority field', async () => {
      await expect(
        prisma.aiSuggestion.create({
          data: {
            userId: testUser.id,
            taskTitle: 'Título',
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('AiSuggestion Priority Enum', () => {
    it('should accept valid priority values', async () => {
      const priorities = ['ALTA', 'MEDIA', 'BAIXA', 'NAO_DEFINIDA'] as const;

      for (const priority of priorities) {
        const suggestion = await prisma.aiSuggestion.create({
          data: {
            userId: testUser.id,
            taskTitle: `Sugestão ${priority}`,
            suggestedPriority: priority,
          },
        });

        expect(suggestion.suggestedPriority).toBe(priority);
      }
    });

    it('should reject invalid priority values', async () => {
      await expect(
        prisma.aiSuggestion.create({
          data: {
            userId: testUser.id,
            taskTitle: 'Sugestão inválida',
            suggestedPriority: 'INVALIDA' as any,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('AiSuggestion Confidence Validation', () => {
    it('should accept confidence between 0.0 and 1.0', async () => {
      const confidenceValues = [0.0, 0.5, 0.85, 1.0];

      for (const confidence of confidenceValues) {
        const suggestion = await prisma.aiSuggestion.create({
          data: {
            userId: testUser.id,
            taskTitle: `Sugestão ${confidence}`,
            suggestedPriority: 'ALTA',
            confidence,
          },
        });

        expect(suggestion.confidence).toBe(confidence);
      }
    });

    it('should allow null confidence', async () => {
      const suggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão sem confiança',
          suggestedPriority: 'ALTA',
        },
      });

      expect(suggestion.confidence).toBeNull();
    });
  });

  describe('AiSuggestion Acceptance Tracking', () => {
    it('should track acceptance status', async () => {
      const acceptedSuggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão aceita',
          suggestedPriority: 'ALTA',
          wasAccepted: true,
        },
      });

      const rejectedSuggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão rejeitada',
          suggestedPriority: 'BAIXA',
          wasAccepted: false,
        },
      });

      const pendingSuggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão pendente',
          suggestedPriority: 'MEDIA',
        },
      });

      expect(acceptedSuggestion.wasAccepted).toBe(true);
      expect(rejectedSuggestion.wasAccepted).toBe(false);
      expect(pendingSuggestion.wasAccepted).toBeNull();
    });

    it('should update acceptance status', async () => {
      const suggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão para atualizar',
          suggestedPriority: 'ALTA',
        },
      });

      const updatedSuggestion = await prisma.aiSuggestion.update({
        where: { id: suggestion.id },
        data: { wasAccepted: true },
      });

      expect(updatedSuggestion.wasAccepted).toBe(true);
    });
  });

  describe('AiSuggestion Queries', () => {
    beforeEach(async () => {
      // Criar várias sugestões para teste
      await prisma.aiSuggestion.createMany({
        data: [
          {
            userId: testUser.id,
            taskTitle: 'Sugestão 1',
            suggestedPriority: 'ALTA',
            wasAccepted: true,
            confidence: 0.9,
          },
          {
            userId: testUser.id,
            taskTitle: 'Sugestão 2',
            suggestedPriority: 'MEDIA',
            wasAccepted: false,
            confidence: 0.7,
          },
          {
            userId: testUser.id,
            taskTitle: 'Sugestão 3',
            suggestedPriority: 'BAIXA',
            wasAccepted: null,
            confidence: 0.6,
          },
        ],
      });
    });

    it('should filter suggestions by acceptance status', async () => {
      const acceptedSuggestions = await prisma.aiSuggestion.findMany({
        where: {
          userId: testUser.id,
          wasAccepted: true,
        },
      });

      expect(acceptedSuggestions).toHaveLength(1);
      expect(acceptedSuggestions[0].taskTitle).toBe('Sugestão 1');
    });

    it('should filter suggestions by priority', async () => {
      const highPrioritySuggestions = await prisma.aiSuggestion.findMany({
        where: {
          userId: testUser.id,
          suggestedPriority: 'ALTA',
        },
      });

      expect(highPrioritySuggestions).toHaveLength(1);
      expect(highPrioritySuggestions[0].taskTitle).toBe('Sugestão 1');
    });

    it('should filter pending suggestions', async () => {
      const pendingSuggestions = await prisma.aiSuggestion.findMany({
        where: {
          userId: testUser.id,
          wasAccepted: null,
        },
      });

      expect(pendingSuggestions).toHaveLength(1);
      expect(pendingSuggestions[0].taskTitle).toBe('Sugestão 3');
    });

    it('should order by confidence descending', async () => {
      const suggestionsByConfidence = await prisma.aiSuggestion.findMany({
        where: { userId: testUser.id },
        orderBy: { confidence: 'desc' },
      });

      expect(suggestionsByConfidence).toHaveLength(3);
      expect(suggestionsByConfidence[0].confidence).toBe(0.9);
      expect(suggestionsByConfidence[1].confidence).toBe(0.7);
      expect(suggestionsByConfidence[2].confidence).toBe(0.6);
    });
  });

  describe('AiSuggestion Relationships', () => {
    it('should load suggestion with user', async () => {
      const suggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão com usuário',
          suggestedPriority: 'ALTA',
        },
      });

      const suggestionWithUser = await prisma.aiSuggestion.findUnique({
        where: { id: suggestion.id },
        include: { user: true },
      });

      expect(suggestionWithUser?.user).toBeDefined();
      expect(suggestionWithUser?.user.id).toBe(testUser.id);
      expect(suggestionWithUser?.user.email).toBe(testUser.email);
    });

    it('should load suggestion with task', async () => {
      const suggestion = await prisma.aiSuggestion.create({
        data: {
          taskId: testTask.id,
          userId: testUser.id,
          taskTitle: 'Sugestão com tarefa',
          suggestedPriority: 'ALTA',
        },
      });

      const suggestionWithTask = await prisma.aiSuggestion.findUnique({
        where: { id: suggestion.id },
        include: { task: true },
      });

      expect(suggestionWithTask?.task).toBeDefined();
      expect(suggestionWithTask?.task?.id).toBe(testTask.id);
      expect(suggestionWithTask?.task?.title).toBe(testTask.title);
    });

    it('should handle suggestion without task', async () => {
      const suggestion = await prisma.aiSuggestion.create({
        data: {
          userId: testUser.id,
          taskTitle: 'Sugestão sem tarefa',
          suggestedPriority: 'ALTA',
        },
      });

      const suggestionWithTask = await prisma.aiSuggestion.findUnique({
        where: { id: suggestion.id },
        include: { task: true },
      });

      expect(suggestionWithTask?.task).toBeNull();
    });
  });

  describe('AiSuggestion Metrics', () => {
    it('should calculate acceptance rate', async () => {
      // Criar sugestões com diferentes status
      await prisma.aiSuggestion.createMany({
        data: [
          {
            userId: testUser.id,
            taskTitle: 'S1',
            suggestedPriority: 'ALTA',
            wasAccepted: true,
          },
          {
            userId: testUser.id,
            taskTitle: 'S2',
            suggestedPriority: 'ALTA',
            wasAccepted: true,
          },
          {
            userId: testUser.id,
            taskTitle: 'S3',
            suggestedPriority: 'ALTA',
            wasAccepted: false,
          },
          {
            userId: testUser.id,
            taskTitle: 'S4',
            suggestedPriority: 'ALTA',
            wasAccepted: null,
          },
        ],
      });

      const total = await prisma.aiSuggestion.count({
        where: { userId: testUser.id, wasAccepted: { not: null } },
      });

      const accepted = await prisma.aiSuggestion.count({
        where: { userId: testUser.id, wasAccepted: true },
      });

      const acceptanceRate = accepted / total;

      expect(total).toBe(3); // Exclui sugestões pendentes
      expect(accepted).toBe(2);
      expect(acceptanceRate).toBeCloseTo(0.67, 2);
    });
  });
});
