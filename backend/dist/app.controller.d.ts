import { AppService } from './app.service.js';
import { EmpireService } from './empire/empire.service.js';
import { TaskBoardService } from './agent-system/task-board.service.js';
import { ModelRouter } from './agent-system/model-router.js';
import { RecoveryManager } from './agent-system/recovery-manager.js';
import { SharedMemoryService } from './agent-system/shared-memory.service.js';
import { AuthService } from './auth/auth.service.js';
import { OrchestratorService } from './agent-system/orchestrator.service.js';
export declare const RequireRoles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class AppController {
    private readonly appService;
    private readonly empireService;
    private readonly taskBoardService;
    private readonly modelRouter;
    private readonly recoveryManager;
    private readonly sharedMemoryService;
    private readonly authService;
    private readonly orchestratorService;
    constructor(appService: AppService, empireService: EmpireService, taskBoardService: TaskBoardService, modelRouter: ModelRouter, recoveryManager: RecoveryManager, sharedMemoryService: SharedMemoryService, authService: AuthService, orchestratorService: OrchestratorService);
    private getTokenFromHeader;
    private requireAuth;
    getHello(): string;
    getHealth(): {
        status: string;
        service: string;
        mode: string;
        timestamp: string;
    };
    getOverview(): {
        timestamp: string;
        status: string;
        projectName: string;
        mode: string;
        budget: number;
        budgetLimit: number;
        activeAgents: number;
        topicsInvestigated: number;
        topicsInExperimentation: number;
        videosProduced: number;
        videosPublished: number;
        videosPending: number;
        viewsLast30Days: number;
        followersGained: number;
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        zeroCostStatus: string;
    };
    getPipeline(): {
        pipeline: {
            id: string;
            name: string;
            owner: string;
            status: string;
            progress: number;
            output: string;
        }[];
        totalStages: number;
        completedStages: number;
        activeStage: string;
        nextGate: string;
        approvalRequired: string;
        qaGateStatus: string;
        directorApprovalStatus: string;
        publishStatus: string;
    };
    getPublishingPlan(): {
        readyForPublish: boolean;
        channels: {
            name: string;
            channel: string;
            status: string;
            cadence: string;
            priority: string;
        }[];
        nextReleaseWindow: string;
        approvalRequired: string;
        qaGateStatus: string;
        directorApprovalStatus: string;
        publishStatus: string;
        suggestedCaption: string;
        automation: {
            thumbnails: string;
            subtitles: string;
            postTiming: string;
        };
    };
    approvePublishing(body: {
        approved?: boolean;
        stage?: 'qa' | 'publish';
        notes?: string;
    }, authorization?: string): {
        qaGateStatus: string;
        directorApprovalStatus: string;
        publishStatus: string;
        reviewBy: string;
        reviewedAt: string;
        pipeline: {
            id: string;
            name: string;
            owner: string;
            status: string;
            progress: number;
            output: string;
        }[];
        totalStages: number;
        completedStages: number;
        activeStage: string;
        nextGate: string;
        approvalRequired: string;
    } | {
        readyForPublish: boolean;
        qaGateStatus: string;
        directorApprovalStatus: string;
        publishStatus: string;
        approvedBy: string;
        approvedAt: string;
        channels: {
            name: string;
            channel: string;
            status: string;
            cadence: string;
            priority: string;
        }[];
        nextReleaseWindow: string;
        approvalRequired: string;
        suggestedCaption: string;
        automation: {
            thumbnails: string;
            subtitles: string;
            postTiming: string;
        };
    };
    getAgents(): import("./agent-system/agent-registry.js").AgentDefinition[];
    getOpportunities(): {
        id: string;
        name: string;
        score: number;
        state: string;
        market: string;
        competition: string;
        profitability: number;
        sources: string[];
    }[];
    getActivity(): string[];
    getTasks(): Promise<{
        dependencies: string[];
        requiresApproval: boolean;
        approvalStatus: string;
        requiredRole: string | null;
    }[]>;
    getTaskSummary(): Promise<{
        total: number;
        completed: number;
        inReview: number;
        inProgress: number;
        pendingApproval: number;
        tasks: (Record<string, unknown> & {
            state?: string;
            requiresApproval?: boolean;
        })[];
    }>;
    getTaskGraph(): {
        nodes: {
            dependencyDepth: number;
            ready: boolean;
            blockedBy: string[];
            id?: string;
        }[];
        edges: any;
        summary: {
            total: number;
            ready: number;
            blocked: number;
        };
    };
    getOrchestratorQueue(): {
        total: number;
        queue: {
            id: string;
            title: string;
            description: string;
            state: string;
            priority: string;
            agentName: string;
            modelUsed: string | undefined;
            dependencies: string[];
            recommendedAgent: string;
            recommendedModel: string;
            readiness: "blocked" | "ready" | "waiting";
            requiresApproval: boolean;
            approvalStatus: "pending" | "approved" | "rejected" | "not-required";
            requiredRole: string | null;
            dependencyDepth: number;
            blockingReasons: string[];
        }[];
        availableAgents: {
            id: string;
            name: string;
            status: import("./agent-system/agent-registry.js").AgentStatus;
            specialty: string;
        }[];
    };
    getOrchestratorPlan(): {
        generatedAt: string;
        total: number;
        readyNow: {
            id: string;
            title: string;
            description: string;
            state: string;
            priority: string;
            agentName: string;
            modelUsed: string | undefined;
            dependencies: string[];
            recommendedAgent: string;
            recommendedModel: string;
            readiness: "blocked" | "ready" | "waiting";
            requiresApproval: boolean;
            approvalStatus: "pending" | "approved" | "rejected" | "not-required";
            requiredRole: string | null;
            dependencyDepth: number;
            blockingReasons: string[];
        }[];
        waiting: {
            id: string;
            title: string;
            description: string;
            state: string;
            priority: string;
            agentName: string;
            modelUsed: string | undefined;
            dependencies: string[];
            recommendedAgent: string;
            recommendedModel: string;
            readiness: "blocked" | "ready" | "waiting";
            requiresApproval: boolean;
            approvalStatus: "pending" | "approved" | "rejected" | "not-required";
            requiredRole: string | null;
            dependencyDepth: number;
            blockingReasons: string[];
        }[];
        blocked: {
            id: string;
            title: string;
            description: string;
            state: string;
            priority: string;
            agentName: string;
            modelUsed: string | undefined;
            dependencies: string[];
            recommendedAgent: string;
            recommendedModel: string;
            readiness: "blocked" | "ready" | "waiting";
            requiresApproval: boolean;
            approvalStatus: "pending" | "approved" | "rejected" | "not-required";
            requiredRole: string | null;
            dependencyDepth: number;
            blockingReasons: string[];
        }[];
        nextActions: {
            id: string;
            title: string;
            priority: string;
            agent: string;
            model: string;
            dependencyDepth: number;
        }[];
    };
    getOrchestratorSchedule(): {
        generatedAt: string;
        totalBatches: number;
        readyNow: number;
        waiting: number;
        blocked: number;
        batches: {
            slot: string;
            window: string;
            focus: string;
            estimatedDuration: string;
            tasks: {
                id: string;
                title: string;
                priority: string;
                agent: string;
                model: string;
                dependencyDepth: number;
            }[];
        }[];
    };
    updateTaskStatus(taskId: string, body: {
        status?: string;
        notes?: string;
    }): any;
    createTask(body: Record<string, unknown>, authorization?: string): any;
    updateTaskApproval(taskId: string, body: {
        decision?: 'approved' | 'rejected' | 'pending';
        requiredRole?: string;
        notes?: string;
    }, authorization?: string): {
        taskId: string;
        requiredRole: string;
        status: string;
        requestedBy?: string;
        approvedBy?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
    }[] | {
        taskId: string;
        requiredRole: string;
        status: string;
        requestedBy?: string;
        approvedBy?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
    };
    getModelSelection(type: string, complexity: string, importance?: string, risk?: string): import("./agent-system/model-router.js").ModelSelectionResult;
    getRecovery(agent: string, task: string, error: string): import("./agent-system/recovery-manager.js").RecoveryResult;
    login(body: {
        username?: string;
        password?: string;
    }): {
        token: `${string}-${string}-${string}-${string}-${string}`;
        expiresAt: string;
        user: {
            id: string;
            username: string;
            role: string;
        };
    };
    getCurrentUser(authorization?: string): {
        id: string;
        username: string;
        role: string;
    };
    getMemory(authorization?: string): any;
    createMemory(body: Record<string, unknown>, authorization?: string): any;
}
