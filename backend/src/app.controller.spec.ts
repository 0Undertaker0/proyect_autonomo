import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EmpireService } from './empire/empire.service.js';
import { TaskBoardService } from './agent-system/task-board.service.js';
import { ModelRouter } from './agent-system/model-router.js';
import { RecoveryManager } from './agent-system/recovery-manager.js';
import { SharedMemoryService } from './agent-system/shared-memory.service.js';
import { AuthService } from './auth/auth.service.js';
import { OrchestratorService } from './agent-system/orchestrator.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const taskBoardService = {
      getTaskBoard: async () => [{ id: 't1', title: 'Task 1', state: 'Completada' }],
      getTaskSummary: async () => ({ total: 1, completed: 1, inReview: 0, inProgress: 0, tasks: [] }),
      getTaskGraph: () => ({ nodes: [], edges: [] }),
      createTask: () => ({ id: 't1', title: 'Task 1' }),
    } as unknown as TaskBoardService;

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        EmpireService,
        { provide: TaskBoardService, useValue: taskBoardService },
        { provide: ModelRouter, useValue: { selectModel: () => ({ tier: 1, model: 'phi3:mini', reason: 'ok' }) } },
        { provide: RecoveryManager, useValue: { handleFailure: () => ({ status: 'recovered', attempts: 1, nextAction: 'retry', backoffMs: 1000 }) } },
        { provide: SharedMemoryService, useValue: { getMemory: () => [], addMemory: () => ({ id: 'm1' }) } },
        { provide: AuthService, useValue: { login: () => ({ token: 'test-token', user: { id: 'u1', username: 'admin', role: 'admin' } }), userFromToken: () => ({ id: 'u1', username: 'admin', role: 'admin' }) } },
        { provide: OrchestratorService, useValue: { getExecutionQueue: () => ({ total: 0, queue: [], availableAgents: [] }), updateTaskStatus: () => ({ id: 't1' }) } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the project welcome message', () => {
      expect(appController.getHello()).toContain('AI Content Empire');
    });
  });
});
