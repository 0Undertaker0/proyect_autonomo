import { DatabaseService } from '../database/database.service.js';
export declare class TaskBoardService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private getTaskDependenciesMap;
    getTaskDependencies(taskId: string): Array<{
        dependsOnTaskId: string;
        dependsOnTitle: string;
        dependsOnState: string;
    }>;
    getTaskApprovals(taskId?: string): Array<{
        taskId: string;
        requiredRole: string;
        status: string;
        requestedBy?: string;
        approvedBy?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
    }> | {
        taskId: string;
        requiredRole: string;
        status: string;
        requestedBy?: string;
        approvedBy?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
    };
    getDependencyClosure(taskId: string, seen?: Set<string>): string[];
    setTaskApproval(taskId: string, input: {
        requiredRole?: string;
        status?: string;
        requestedBy?: string | null;
        approvedBy?: string | null;
        notes?: string | null;
    }): {
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
    isTaskReady(taskId: string): {
        ready: boolean;
        pendingDependencies: string[];
        pendingApproval: string[];
        blockedBy: string[];
        transitiveDependencies: string[];
    };
    updateTaskApproval(taskId: string, input: {
        decision: 'approved' | 'rejected' | 'pending';
        requiredRole?: string;
        approvedBy?: string;
        notes?: string;
    }): {
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
    updateTaskStatus(taskId: string, status: string, notes?: string): any;
    getTaskBoard(): {
        dependencies: string[];
        requiresApproval: boolean;
        approvalStatus: string;
        requiredRole: string | null;
    }[];
    createTask(input: {
        title: string;
        description: string;
        priority: string;
        agentName: string;
        modelUsed?: string;
        dependsOn?: string[];
        approvalRole?: string;
    }): any;
    getTaskSummary(): {
        total: number;
        completed: number;
        inReview: number;
        inProgress: number;
        pendingApproval: number;
        tasks: (Record<string, unknown> & {
            state?: string;
            requiresApproval?: boolean;
        })[];
    };
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
}
