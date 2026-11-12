import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EmpireService } from './empire/empire.service.js';
import { DatabaseService } from './database/database.service.js';
import { TaskBoardService } from './agent-system/task-board.service.js';
import { AuthService } from './auth/auth.service.js';
import { AuthGuard, RolesGuard } from './auth/roles.guard.js';
import { SharedMemoryService } from './agent-system/shared-memory.service.js';
import { ModelRouter } from './agent-system/model-router.js';
import { RecoveryManager } from './agent-system/recovery-manager.js';
import { OrchestratorService } from './agent-system/orchestrator.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    EmpireService,
    DatabaseService,
    TaskBoardService,
    AuthService,
    AuthGuard,
    RolesGuard,
    SharedMemoryService,
    ModelRouter,
    RecoveryManager,
    OrchestratorService,
  ],
})
export class AppModule {}
