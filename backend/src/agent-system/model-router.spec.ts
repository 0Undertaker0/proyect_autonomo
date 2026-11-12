import { describe, expect, it } from 'vitest';
import { RecoveryManager } from './recovery-manager';
import { routeModel } from './model-router';
import { TaskBoardService } from './task-board.service';

describe('model router', () => {
  it('assigns the cheapest local model to simple tasks', () => {
    expect(
      routeModel({
        taskType: 'classification',
        complexity: 15,
        importance: 30,
        risk: 10,
        budget: 0,
      }),
    ).toMatchObject({ tier: 1, model: 'phi3:mini' });
  });

  it('upgrades the selection for strategic work', () => {
    expect(
      routeModel({
        taskType: 'strategy',
        complexity: 80,
        importance: 90,
        risk: 70,
        budget: 0,
      }),
    ).toMatchObject({ tier: 2, model: 'llama3.1:8b' });
  });
});

describe('recovery manager', () => {
  it('retries failed jobs before escalating', () => {
    const manager = new RecoveryManager();

    const result = manager.handleFailure({
      agentId: 'video-producer',
      taskId: 'task-324',
      error: 'ffmpeg: invalid arguments',
    });

    expect(result.status).toBe('recovered');
    expect(result.attempts).toBe(1);
    expect(result.backoffMs).toBeGreaterThan(0);
  });

  it('blocks tasks that require manual authorization after the retry budget', () => {
    const manager = new RecoveryManager();
    const first = manager.handleFailure({
      agentId: 'social-publisher',
      taskId: 'task-999',
      error: 'auth permission denied',
    });

    const second = manager.handleFailure({
      agentId: 'social-publisher',
      taskId: 'task-999',
      error: 'auth permission denied',
    });

    const third = manager.handleFailure({
      agentId: 'social-publisher',
      taskId: 'task-999',
      error: 'auth permission denied',
    });

    const fourth = manager.handleFailure({
      agentId: 'social-publisher',
      taskId: 'task-999',
      error: 'auth permission denied',
    });

    expect(first.status).toBe('recovered');
    expect(second.status).toBe('recovered');
    expect(third.status).toBe('recovered');
    expect(fourth.status).toBe('blocked');
  });
});

describe('task board readiness', () => {
  it('marks dependent tasks as blocked until upstream work is complete', () => {
    const taskBoard = new TaskBoardService({ getDb: () => ({ prepare: () => ({ all: () => [], get: () => undefined }) }) } as any);

    taskBoard.getTaskDependencies = () => [
      { dependsOnTaskId: 'task-100', dependsOnTitle: 'Brief de contenido', dependsOnState: 'En proceso' },
    ];
    taskBoard.getTaskApprovals = () => ({ status: 'pending', requiredRole: 'director' });

    const result = taskBoard.isTaskReady('task-200');

    expect(result.ready).toBe(false);
    expect(result.pendingDependencies).toEqual(['Brief de contenido']);
    expect(result.pendingApproval).toEqual(['Aprobación requerida (director)']);
  });

  it('tracks the full transitive dependency chain for DAG-aware orchestration', () => {
    const taskBoard = new TaskBoardService({ getDb: () => ({ prepare: () => ({ all: () => [], get: () => undefined }) }) } as any);

    taskBoard.getTaskDependencies = (taskId: string) => {
      const graph: Record<string, Array<{ dependsOnTaskId: string; dependsOnTitle: string; dependsOnState: string }>> = {
        'task-400': [
          { dependsOnTaskId: 'task-300', dependsOnTitle: 'Guion', dependsOnState: 'Completada' },
        ],
        'task-300': [
          { dependsOnTaskId: 'task-200', dependsOnTitle: 'Brief', dependsOnState: 'Completada' },
        ],
        'task-200': [],
      };

      return graph[taskId] ?? [];
    };

    expect(taskBoard.getDependencyClosure('task-400')).toEqual(['task-300', 'task-200']);
  });
});
