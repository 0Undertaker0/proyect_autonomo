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
export declare class OrchestratorService {
    private readonly taskBoardService;
    constructor(taskBoardService: TaskBoardService);
    private resolveRecommendedAgent;
    getExecutionQueue(): {
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
            status: import("./agent-registry.js").AgentStatus;
            specialty: string;
        }[];
    };
    getExecutionPlan(): {
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
    getSchedulingPlan(): {
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
    updateTaskStatus(taskId: string, status: string, notes?: string): any;
}
