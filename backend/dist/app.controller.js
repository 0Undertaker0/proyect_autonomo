var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Headers, Param, Patch, Post, Query, SetMetadata, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { AppService } from './app.service.js';
import { EmpireService } from './empire/empire.service.js';
import { TaskBoardService } from './agent-system/task-board.service.js';
import { ModelRouter } from './agent-system/model-router.js';
import { RecoveryManager } from './agent-system/recovery-manager.js';
import { SharedMemoryService } from './agent-system/shared-memory.service.js';
import { AuthService } from './auth/auth.service.js';
import { AuthGuard, RolesGuard } from './auth/roles.guard.js';
import { OrchestratorService } from './agent-system/orchestrator.service.js';
export const RequireRoles = (...roles) => SetMetadata('roles', roles);
let AppController = class AppController {
    appService;
    empireService;
    taskBoardService;
    modelRouter;
    recoveryManager;
    sharedMemoryService;
    authService;
    orchestratorService;
    constructor(appService, empireService, taskBoardService, modelRouter, recoveryManager, sharedMemoryService, authService, orchestratorService) {
        this.appService = appService;
        this.empireService = empireService;
        this.taskBoardService = taskBoardService;
        this.modelRouter = modelRouter;
        this.recoveryManager = recoveryManager;
        this.sharedMemoryService = sharedMemoryService;
        this.authService = authService;
        this.orchestratorService = orchestratorService;
    }
    getTokenFromHeader(authHeader) {
        if (!authHeader) {
            return null;
        }
        const [scheme, token] = authHeader.split(' ');
        if (scheme === 'Bearer' && token) {
            return token;
        }
        return authHeader;
    }
    requireAuth(authHeader) {
        const token = this.getTokenFromHeader(authHeader);
        const user = token ? this.authService.userFromToken(token) : null;
        if (!user) {
            throw new UnauthorizedException('Token de sesión inválido o expirado.');
        }
        return user;
    }
    getHello() {
        return this.appService.getHello();
    }
    getHealth() {
        return {
            status: 'ok',
            service: 'AI Content Empire backend',
            mode: 'zero-cost',
            timestamp: new Date().toISOString(),
        };
    }
    getOverview() {
        return this.empireService.getOverview();
    }
    getPipeline() {
        return this.empireService.getPipeline();
    }
    getPublishingPlan() {
        return this.empireService.getPublishingPlan();
    }
    approvePublishing(body, authorization) {
        const user = this.requireAuth(authorization);
        if (body.stage === 'qa') {
            return this.empireService.reviewQa(Boolean(body.approved ?? true), user.username);
        }
        return this.empireService.approvePublishing(Boolean(body.approved ?? true), user.username);
    }
    getAgents() {
        return this.empireService.getAgents();
    }
    getOpportunities() {
        return this.empireService.getOpportunities();
    }
    getActivity() {
        return this.empireService.getActivity();
    }
    async getTasks() {
        return this.taskBoardService.getTaskBoard();
    }
    async getTaskSummary() {
        return this.taskBoardService.getTaskSummary();
    }
    getTaskGraph() {
        return this.taskBoardService.getTaskGraph();
    }
    getOrchestratorQueue() {
        return this.orchestratorService.getExecutionQueue();
    }
    getOrchestratorPlan() {
        return this.orchestratorService.getExecutionPlan();
    }
    getOrchestratorSchedule() {
        return this.orchestratorService.getSchedulingPlan();
    }
    updateTaskStatus(taskId, body) {
        return this.orchestratorService.updateTaskStatus(taskId, body.status ?? 'En proceso', body.notes);
    }
    createTask(body, authorization) {
        this.requireAuth(authorization);
        return this.taskBoardService.createTask({
            title: String(body.title ?? 'Nueva tarea'),
            description: String(body.description ?? 'Tarea creada desde la API.'),
            priority: String(body.priority ?? 'media'),
            agentName: String(body.agentName ?? 'Orchestrator'),
            modelUsed: body.modelUsed ? String(body.modelUsed) : undefined,
            dependsOn: Array.isArray(body.dependsOn)
                ? body.dependsOn.map((item) => String(item))
                : [],
            approvalRole: body.approvalRole ? String(body.approvalRole) : 'director',
        });
    }
    updateTaskApproval(taskId, body, authorization) {
        const user = this.requireAuth(authorization);
        return this.taskBoardService.updateTaskApproval(taskId, {
            decision: body.decision ?? 'pending',
            requiredRole: body.requiredRole ?? 'director',
            approvedBy: user.username,
            notes: body.notes,
        });
    }
    getModelSelection(type, complexity, importance, risk) {
        return this.modelRouter.selectModel({
            taskType: (type ?? 'summary'),
            complexity: Number(complexity ?? 25),
            importance: Number(importance ?? 60),
            risk: Number(risk ?? 30),
            budget: this.empireService.getOverview().budget ?? 0,
        });
    }
    getRecovery(agent, task, error) {
        return this.recoveryManager.handleFailure({
            agentId: agent ?? 'recovery-agent',
            taskId: task ?? 'task-unknown',
            error: error ?? 'No error details provided.',
        });
    }
    login(body) {
        return this.authService.login(String(body.username ?? ''), String(body.password ?? ''));
    }
    getCurrentUser(authorization) {
        return this.requireAuth(authorization);
    }
    getMemory(authorization) {
        this.requireAuth(authorization);
        return this.sharedMemoryService.getMemory();
    }
    createMemory(body, authorization) {
        this.requireAuth(authorization);
        return this.sharedMemoryService.addMemory({
            key: String(body.key ?? ''),
            value: String(body.value ?? ''),
            category: String(body.category ?? 'general'),
        });
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    Get('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    Get('api/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getOverview", null);
__decorate([
    Get('api/pipeline'),
    UseGuards(AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getPipeline", null);
__decorate([
    Get('api/publishing'),
    UseGuards(AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getPublishingPlan", null);
__decorate([
    Patch('api/publishing'),
    UseGuards(AuthGuard, RolesGuard),
    RequireRoles('admin', 'director', 'analyst'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "approvePublishing", null);
__decorate([
    Get('api/agents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getAgents", null);
__decorate([
    Get('api/opportunities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getOpportunities", null);
__decorate([
    Get('api/activity'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getActivity", null);
__decorate([
    Get('api/tasks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTasks", null);
__decorate([
    Get('api/task-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTaskSummary", null);
__decorate([
    Get('api/task-graph'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getTaskGraph", null);
__decorate([
    Get('api/orchestrator/queue'),
    UseGuards(AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getOrchestratorQueue", null);
__decorate([
    Get('api/orchestrator/plan'),
    UseGuards(AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getOrchestratorPlan", null);
__decorate([
    Get('api/orchestrator/schedule'),
    UseGuards(AuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getOrchestratorSchedule", null);
__decorate([
    Patch('api/tasks/:id/status'),
    UseGuards(AuthGuard, RolesGuard),
    RequireRoles('admin', 'director'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateTaskStatus", null);
__decorate([
    Post('api/tasks'),
    UseGuards(AuthGuard, RolesGuard),
    RequireRoles('admin', 'director', 'analyst'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createTask", null);
__decorate([
    Patch('api/tasks/:id/approval'),
    UseGuards(AuthGuard, RolesGuard),
    RequireRoles('admin', 'director'),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateTaskApproval", null);
__decorate([
    Get('api/model-selection'),
    __param(0, Query('type')),
    __param(1, Query('complexity')),
    __param(2, Query('importance')),
    __param(3, Query('risk')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getModelSelection", null);
__decorate([
    Get('api/recovery'),
    __param(0, Query('agent')),
    __param(1, Query('task')),
    __param(2, Query('error')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRecovery", null);
__decorate([
    Post('api/login'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "login", null);
__decorate([
    Get('api/me'),
    UseGuards(AuthGuard),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getCurrentUser", null);
__decorate([
    Get('api/memory'),
    UseGuards(AuthGuard),
    __param(0, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getMemory", null);
__decorate([
    Post('api/memory'),
    UseGuards(AuthGuard, RolesGuard),
    RequireRoles('admin', 'director', 'analyst'),
    __param(0, Body()),
    __param(1, Headers('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createMemory", null);
AppController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [AppService,
        EmpireService,
        TaskBoardService,
        ModelRouter,
        RecoveryManager,
        SharedMemoryService,
        AuthService,
        OrchestratorService])
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map