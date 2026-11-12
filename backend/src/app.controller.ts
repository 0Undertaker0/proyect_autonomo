import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service.js';
import { EmpireService } from './empire/empire.service.js';
import { TaskBoardService } from './agent-system/task-board.service.js';
import { ModelRouter } from './agent-system/model-router.js';
import { RecoveryManager } from './agent-system/recovery-manager.js';
import { SharedMemoryService } from './agent-system/shared-memory.service.js';
import { AuthService } from './auth/auth.service.js';
import { AuthGuard, RolesGuard } from './auth/roles.guard.js';
import { OrchestratorService } from './agent-system/orchestrator.service.js';

export const RequireRoles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly empireService: EmpireService,
    private readonly taskBoardService: TaskBoardService,
    private readonly modelRouter: ModelRouter,
    private readonly recoveryManager: RecoveryManager,
    private readonly sharedMemoryService: SharedMemoryService,
    private readonly authService: AuthService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  private getTokenFromHeader(authHeader?: string) {
    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme === 'Bearer' && token) {
      return token;
    }

    return authHeader;
  }

  private requireAuth(authHeader?: string) {
    const token = this.getTokenFromHeader(authHeader);
    const user = token ? this.authService.userFromToken(token) : null;

    if (!user) {
      throw new UnauthorizedException('Token de sesión inválido o expirado.');
    }

    return user;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'AI Content Empire backend',
      mode: 'zero-cost',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/overview')
  getOverview() {
    return this.empireService.getOverview();
  }

  @Get('api/pipeline')
  @UseGuards(AuthGuard)
  getPipeline() {
    return this.empireService.getPipeline();
  }

  @Get('api/publishing')
  @UseGuards(AuthGuard)
  getPublishingPlan() {
    return this.empireService.getPublishingPlan();
  }

  @Patch('api/publishing')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('admin', 'director', 'analyst')
  approvePublishing(
    @Body() body: { approved?: boolean; stage?: 'qa' | 'publish'; notes?: string },
    @Headers('authorization') authorization?: string,
  ) {
    const user = this.requireAuth(authorization);

    if (body.stage === 'qa') {
      return this.empireService.reviewQa(Boolean(body.approved ?? true), user.username);
    }

    return this.empireService.approvePublishing(Boolean(body.approved ?? true), user.username);
  }

  @Get('api/agents')
  getAgents() {
    return this.empireService.getAgents();
  }

  @Get('api/opportunities')
  getOpportunities() {
    return this.empireService.getOpportunities();
  }

  @Get('api/activity')
  getActivity() {
    return this.empireService.getActivity();
  }

  @Get('api/tasks')
  async getTasks() {
    return this.taskBoardService.getTaskBoard();
  }

  @Get('api/task-summary')
  async getTaskSummary() {
    return this.taskBoardService.getTaskSummary();
  }

  @Get('api/task-graph')
  getTaskGraph() {
    return this.taskBoardService.getTaskGraph();
  }

  @Get('api/orchestrator/queue')
  @UseGuards(AuthGuard)
  getOrchestratorQueue() {
    return this.orchestratorService.getExecutionQueue();
  }

  @Get('api/orchestrator/plan')
  @UseGuards(AuthGuard)
  getOrchestratorPlan() {
    return this.orchestratorService.getExecutionPlan();
  }

  @Get('api/orchestrator/schedule')
  @UseGuards(AuthGuard)
  getOrchestratorSchedule() {
    return this.orchestratorService.getSchedulingPlan();
  }

  @Patch('api/tasks/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('admin', 'director')
  updateTaskStatus(
    @Param('id') taskId: string,
    @Body() body: { status?: string; notes?: string },
  ) {
    return this.orchestratorService.updateTaskStatus(taskId, body.status ?? 'En proceso', body.notes);
  }

  @Post('api/tasks')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('admin', 'director', 'analyst')
  createTask(@Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string) {
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

  @Patch('api/tasks/:id/approval')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('admin', 'director')
  updateTaskApproval(
    @Param('id') taskId: string,
    @Body() body: { decision?: 'approved' | 'rejected' | 'pending'; requiredRole?: string; notes?: string },
    @Headers('authorization') authorization?: string,
  ) {
    const user = this.requireAuth(authorization);

    return this.taskBoardService.updateTaskApproval(taskId, {
      decision: body.decision ?? 'pending',
      requiredRole: body.requiredRole ?? 'director',
      approvedBy: user.username,
      notes: body.notes,
    });
  }

  @Get('api/model-selection')
  getModelSelection(
    @Query('type') type: string,
    @Query('complexity') complexity: string,
    @Query('importance') importance?: string,
    @Query('risk') risk?: string,
  ) {
    return this.modelRouter.selectModel({
      taskType: (type ?? 'summary') as 'summary',
      complexity: Number(complexity ?? 25),
      importance: Number(importance ?? 60),
      risk: Number(risk ?? 30),
      budget: this.empireService.getOverview().budget ?? 0,
    });
  }

  @Get('api/recovery')
  getRecovery(
    @Query('agent') agent: string,
    @Query('task') task: string,
    @Query('error') error: string,
  ) {
    return this.recoveryManager.handleFailure({
      agentId: agent ?? 'recovery-agent',
      taskId: task ?? 'task-unknown',
      error: error ?? 'No error details provided.',
    });
  }

  @Post('api/login')
  login(@Body() body: { username?: string; password?: string }) {
    return this.authService.login(String(body.username ?? ''), String(body.password ?? ''));
  }

  @Get('api/me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Headers('authorization') authorization?: string) {
    return this.requireAuth(authorization);
  }

  @Get('api/memory')
  @UseGuards(AuthGuard)
  getMemory(@Headers('authorization') authorization?: string) {
    this.requireAuth(authorization);
    return this.sharedMemoryService.getMemory();
  }

  @Post('api/memory')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('admin', 'director', 'analyst')
  createMemory(@Body() body: Record<string, unknown>, @Headers('authorization') authorization?: string) {
    this.requireAuth(authorization);
    return this.sharedMemoryService.addMemory({
      key: String(body.key ?? ''),
      value: String(body.value ?? ''),
      category: String(body.category ?? 'general'),
    });
  }
}
