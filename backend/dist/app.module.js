var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
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
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map