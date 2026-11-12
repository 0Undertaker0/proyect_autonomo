var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
let TaskBoardService = class TaskBoardService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    getTaskDependenciesMap() {
        const rows = this.databaseService
            .getDb()
            .prepare('SELECT task_id as taskId, depends_on_task_id as dependsOnTaskId FROM task_dependencies')
            .all();
        return rows.reduce((acc, row) => {
            acc[row.taskId] = acc[row.taskId] ? [...acc[row.taskId], row.dependsOnTaskId] : [row.dependsOnTaskId];
            return acc;
        }, {});
    }
    getTaskDependencies(taskId) {
        return this.databaseService
            .getDb()
            .prepare(`SELECT d.depends_on_task_id as dependsOnTaskId, t.title as dependsOnTitle, t.state as dependsOnState
         FROM task_dependencies d
         LEFT JOIN agent_tasks t ON t.id = d.depends_on_task_id
         WHERE d.task_id = ?`)
            .all(taskId);
    }
    getTaskApprovals(taskId) {
        const query = taskId
            ? `SELECT task_id as taskId, required_role as requiredRole, status, requested_by as requestedBy, approved_by as approvedBy, notes, created_at as createdAt, updated_at as updatedAt
         FROM task_approvals WHERE task_id = ?`
            : `SELECT task_id as taskId, required_role as requiredRole, status, requested_by as requestedBy, approved_by as approvedBy, notes, created_at as createdAt, updated_at as updatedAt
         FROM task_approvals ORDER BY created_at DESC`;
        return this.databaseService
            .getDb()
            .prepare(query)[taskId ? 'get' : 'all'](taskId ?? undefined);
    }
    getDependencyClosure(taskId, seen = new Set()) {
        if (seen.has(taskId)) {
            return [];
        }
        seen.add(taskId);
        const directDependencies = this.getTaskDependencies(taskId).map((dependency) => dependency.dependsOnTaskId);
        const transitiveDependencies = directDependencies.flatMap((dependencyId) => [
            dependencyId,
            ...this.getDependencyClosure(dependencyId, seen),
        ]);
        return Array.from(new Set(transitiveDependencies));
    }
    setTaskApproval(taskId, input) {
        const requiredRole = input.requiredRole ?? 'director';
        const status = input.status ?? 'pending';
        const requestedBy = input.requestedBy ?? null;
        const approvedBy = input.approvedBy ?? null;
        const notes = input.notes ?? null;
        this.databaseService
            .getDb()
            .prepare(`INSERT INTO task_approvals (task_id, required_role, status, requested_by, approved_by, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(task_id)
         DO UPDATE SET required_role = excluded.required_role,
                       status = excluded.status,
                       requested_by = COALESCE(excluded.requested_by, task_approvals.requested_by),
                       approved_by = COALESCE(excluded.approved_by, task_approvals.approved_by),
                       notes = COALESCE(excluded.notes, task_approvals.notes),
                       updated_at = CURRENT_TIMESTAMP`)
            .run(taskId, requiredRole, status, requestedBy, approvedBy, notes);
        return this.getTaskApprovals(taskId);
    }
    isTaskReady(taskId) {
        const dependencies = this.getTaskDependencies(taskId);
        const approval = this.getTaskApprovals(taskId);
        const pendingDependencies = dependencies
            .filter((dependency) => dependency.dependsOnState !== 'Completada')
            .map((dependency) => dependency.dependsOnTitle || dependency.dependsOnTaskId);
        const approvalBlocked = approval && approval.status !== 'approved' && approval.status !== 'approved-by-system';
        const pendingApproval = approvalBlocked ? [`Aprobación requerida (${approval?.requiredRole ?? 'director'})`] : [];
        const blockedBy = [...pendingDependencies, ...pendingApproval];
        return {
            ready: pendingDependencies.length === 0 && !approvalBlocked,
            pendingDependencies,
            pendingApproval,
            blockedBy,
            transitiveDependencies: this.getDependencyClosure(taskId),
        };
    }
    updateTaskApproval(taskId, input) {
        const existing = this.databaseService
            .getDb()
            .prepare('SELECT id FROM agent_tasks WHERE id = ?')
            .get(taskId);
        if (!existing) {
            throw new Error('La tarea indicada no existe.');
        }
        const approval = this.getTaskApprovals(taskId);
        const nextStatus = input.decision === 'approved' ? 'approved' : input.decision === 'rejected' ? 'rejected' : 'pending';
        const result = this.setTaskApproval(taskId, {
            requiredRole: input.requiredRole ?? approval?.requiredRole ?? 'director',
            status: nextStatus,
            approvedBy: input.approvedBy ?? null,
            notes: input.notes ?? undefined,
        });
        return result;
    }
    updateTaskStatus(taskId, status, notes) {
        const existing = this.databaseService
            .getDb()
            .prepare('SELECT id FROM agent_tasks WHERE id = ?')
            .get(taskId);
        if (!existing) {
            throw new Error('La tarea indicada no existe.');
        }
        const approvalStatus = status === 'Aprobada' ? 'approved' : status === 'Rechazada' ? 'rejected' : null;
        if (approvalStatus) {
            this.setTaskApproval(taskId, {
                status: approvalStatus,
                notes,
            });
        }
        const finishedAt = status === 'Completada' || status === 'Cancelada' ? new Date().toISOString() : null;
        this.databaseService
            .getDb()
            .prepare(`UPDATE agent_tasks SET state = ?, finished_at = ?, result = COALESCE(?, result), errors = ? WHERE id = ?`)
            .run(status, finishedAt, notes ?? null, status === 'Cancelada' ? notes ?? 'Tarea cancelada.' : null, taskId);
        return this.databaseService
            .getDb()
            .prepare('SELECT * FROM agent_tasks WHERE id = ?')
            .get(taskId);
    }
    getTaskBoard() {
        const tasks = this.databaseService
            .getDb()
            .prepare(`SELECT id, identifier, title, description, state, priority, agent_name as agentName, model_used as modelUsed, created_at as createdAt, finished_at as finishedAt, result, errors
         FROM agent_tasks ORDER BY created_at DESC`)
            .all();
        const dependencies = this.getTaskDependenciesMap();
        const approvals = this.getTaskApprovals();
        const approvalMap = new Map((approvals ?? []).map((approval) => [String(approval.taskId), approval]));
        return tasks.map((task) => {
            const taskId = String(task.id ?? '');
            const approval = approvalMap.get(taskId) ?? null;
            const requiresApproval = !!approval && String(approval.status ?? 'pending') !== 'approved';
            return {
                ...task,
                dependencies: dependencies[taskId] ?? [],
                requiresApproval,
                approvalStatus: approval ? String(approval.status ?? 'pending') : 'not-required',
                requiredRole: approval ? String(approval.requiredRole ?? 'director') : null,
            };
        });
    }
    createTask(input) {
        const id = randomUUID();
        const identifier = `task-${Date.now()}`;
        this.databaseService
            .getDb()
            .prepare(`INSERT INTO agent_tasks (id, identifier, title, description, state, priority, agent_name, model_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, identifier, input.title, input.description, 'Pendiente', input.priority ?? 'media', input.agentName, input.modelUsed ?? null);
        for (const dependencyId of input.dependsOn ?? []) {
            this.databaseService
                .getDb()
                .prepare('INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)')
                .run(id, dependencyId);
        }
        const approvalRole = input.approvalRole ?? 'director';
        if (approvalRole) {
            this.setTaskApproval(id, {
                requiredRole: approvalRole,
                status: 'pending',
            });
        }
        return this.databaseService
            .getDb()
            .prepare('SELECT * FROM agent_tasks WHERE id = ?')
            .get(id);
    }
    getTaskSummary() {
        const tasks = this.getTaskBoard();
        return {
            total: tasks.length,
            completed: tasks.filter((task) => task.state === 'Completada').length,
            inReview: tasks.filter((task) => task.state === 'En revisión').length,
            inProgress: tasks.filter((task) => task.state === 'En proceso').length,
            pendingApproval: tasks.filter((task) => task.requiresApproval).length,
            tasks,
        };
    }
    getTaskGraph() {
        const tasks = this.getTaskBoard();
        const nodes = tasks.map((task) => {
            const taskId = String(task.id ?? '');
            const readiness = this.isTaskReady(taskId);
            const dependencyDepth = readiness.transitiveDependencies.length;
            return {
                ...task,
                dependencyDepth,
                ready: readiness.ready,
                blockedBy: readiness.blockedBy,
            };
        });
        return {
            nodes,
            edges: this.databaseService
                .getDb()
                .prepare('SELECT task_id as source, depends_on_task_id as target FROM task_dependencies ORDER BY source')
                .all(),
            summary: {
                total: nodes.length,
                ready: nodes.filter((task) => task.ready).length,
                blocked: nodes.filter((task) => !task.ready).length,
            },
        };
    }
};
TaskBoardService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DatabaseService])
], TaskBoardService);
export { TaskBoardService };
//# sourceMappingURL=task-board.service.js.map