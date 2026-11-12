import { Injectable } from '@nestjs/common';
import { AGENT_REGISTRY } from './agent-registry.js';
import { routeModel } from './model-router.js';
import { TaskBoardService } from './task-board.service.js';

export interface OrchestratedTask {
  id: string;
  title: string;
  description: string;
  state: string;
  priority: string;
  agentName: string;
  modelUsed?: string;
  dependencies: string[];
  recommendedAgent: string;
  recommendedModel: string;
  readiness: 'blocked' | 'ready' | 'waiting';
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not-required';
  requiredRole?: string | null;
  dependencyDepth: number;
  blockingReasons: string[];
}

type TaskRecord = {
  id?: string;
  title?: string;
  description?: string;
  state?: string;
  priority?: string;
  agentName?: string;
  modelUsed?: string;
  dependencies?: string[];
  requiresApproval?: boolean;
  approvalStatus?: string;
  requiredRole?: string | null;
};

@Injectable()
export class OrchestratorService {
  constructor(private readonly taskBoardService: TaskBoardService) {}

  private resolveRecommendedAgent(task: { title: string; description: string; priority: string }) {
    const haystack = `${task.title} ${task.description}`.toLowerCase();

    if (haystack.includes('video') || haystack.includes('render') || haystack.includes('audiovisual')) {
      return 'video-producer';
    }

    if (haystack.includes('script') || haystack.includes('guion') || haystack.includes('narrativa')) {
      return 'scriptwriter';
    }

    if (haystack.includes('investig') || haystack.includes('trend') || haystack.includes('market')) {
      return 'trend-scout';
    }

    if (haystack.includes('compet') || haystack.includes('public') || haystack.includes('audiencia')) {
      return 'market-analyst';
    }

    if (haystack.includes('quality') || haystack.includes('valid') || haystack.includes('audit')) {
      return 'quality-controller';
    }

    if (haystack.includes('publish') || haystack.includes('social')) {
      return 'social-publisher';
    }

    if (task.priority === 'alta') {
      return 'ai-director';
    }

    return 'researcher';
  }

  getExecutionQueue() {
    const tasks = (this.taskBoardService.getTaskBoard() as TaskRecord[])
      .filter((task) => task.state !== 'Completada')
      .map((task) => {
        const priority = String(task.priority ?? 'media').toLowerCase();
        const recommendedAgent = this.resolveRecommendedAgent({
          title: String(task.title ?? ''),
          description: String(task.description ?? ''),
          priority,
        });

        const routing = routeModel({
          taskType: 'research',
          complexity: priority === 'alta' ? 80 : priority === 'media' ? 55 : 30,
          importance: 70,
          risk: 25,
          budget: 0,
        });

        const dependencies = Array.isArray(task.dependencies) ? task.dependencies : [];
        const readinessStatus = this.taskBoardService.isTaskReady(String(task.id ?? ''));
        const hasPendingApproval = Boolean(task.requiresApproval) || readinessStatus.pendingApproval.length > 0;
        const blockingReasons = [...readinessStatus.pendingDependencies, ...readinessStatus.pendingApproval];
        const readiness = readinessStatus.ready ? 'ready' : dependencies.length > 0 || hasPendingApproval ? 'waiting' : 'blocked';

        return {
          id: String(task.id ?? ''),
          title: String(task.title ?? 'Tarea sin título'),
          description: String(task.description ?? ''),
          state: String(task.state ?? 'Pendiente'),
          priority,
          agentName: String(task.agentName ?? recommendedAgent),
          modelUsed: task.modelUsed,
          dependencies: readinessStatus.pendingDependencies,
          recommendedAgent,
          recommendedModel: routing.model,
          readiness,
          requiresApproval: Boolean(task.requiresApproval),
          approvalStatus: String(task.approvalStatus ?? 'not-required') as 'pending' | 'approved' | 'rejected' | 'not-required',
          requiredRole: task.requiredRole ?? null,
          dependencyDepth: readinessStatus.transitiveDependencies.length,
          blockingReasons,
        } satisfies OrchestratedTask;
      });

    const queue = tasks.sort((a, b) => {
      const readinessWeight = { ready: 3, waiting: 2, blocked: 1 } as Record<string, number>;
      const priorityWeight = { alta: 3, media: 2, baja: 1 } as Record<string, number>;

      return (
        readinessWeight[b.readiness] - readinessWeight[a.readiness] ||
        priorityWeight[b.priority.toLowerCase()] - priorityWeight[a.priority.toLowerCase()] ||
        b.dependencyDepth - a.dependencyDepth
      );
    });

    return {
      total: queue.length,
      queue,
      availableAgents: AGENT_REGISTRY.map((agent) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        specialty: agent.specialty,
      })),
    };
  }

  getExecutionPlan() {
    const executionQueue = this.getExecutionQueue();
    const readyNow = executionQueue.queue.filter((task) => task.readiness === 'ready');
    const waiting = executionQueue.queue.filter((task) => task.readiness === 'waiting');
    const blocked = executionQueue.queue.filter((task) => task.readiness === 'blocked');

    return {
      generatedAt: new Date().toISOString(),
      total: executionQueue.total,
      readyNow,
      waiting,
      blocked,
      nextActions: readyNow.slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        agent: task.recommendedAgent,
        model: task.recommendedModel,
        dependencyDepth: task.dependencyDepth,
      })),
    };
  }

  getSchedulingPlan() {
    const executionQueue = this.getExecutionQueue();
    const readyNow = executionQueue.queue.filter((task) => task.readiness === 'ready');
    const waiting = executionQueue.queue.filter((task) => task.readiness === 'waiting');
    const blocked = executionQueue.queue.filter((task) => task.readiness === 'blocked');

    const batches = [
      {
        slot: 'Ahora',
        window: '0-90 min',
        focus: 'Lanzamiento inmediato',
        estimatedDuration: '1-2 horas',
        tasks: readyNow.slice(0, 4).map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          agent: task.recommendedAgent,
          model: task.recommendedModel,
          dependencyDepth: task.dependencyDepth,
        })),
      },
      {
        slot: 'Siguiente ventana',
        window: '1-3 h',
        focus: 'Tareas pendientes con dependencias',
        estimatedDuration: '2-4 horas',
        tasks: waiting.slice(0, 4).map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          agent: task.recommendedAgent,
          model: task.recommendedModel,
          dependencyDepth: task.dependencyDepth,
        })),
      },
      {
        slot: 'Lanzamiento editorial',
        window: 'hoy / tarde',
        focus: 'QA, director y publicación',
        estimatedDuration: '30-60 min',
        tasks: executionQueue.queue
          .filter((task) => /qa|publish|approval|director|review/i.test(task.title) || task.requiresApproval)
          .slice(0, 4)
          .map((task) => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            agent: task.recommendedAgent,
            model: task.recommendedModel,
            dependencyDepth: task.dependencyDepth,
          })),
      },
    ];

    return {
      generatedAt: new Date().toISOString(),
      totalBatches: batches.length,
      readyNow: readyNow.length,
      waiting: waiting.length,
      blocked: blocked.length,
      batches,
    };
  }

  updateTaskStatus(taskId: string, status: string, notes?: string) {
    return this.taskBoardService.updateTaskStatus(taskId, status, notes);
  }
}
