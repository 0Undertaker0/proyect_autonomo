export declare class EmpireService {
    private readonly recoveryManager;
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
    getAgents(): import("../agent-system/agent-registry.js").AgentDefinition[];
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
    reviewQa(approved: boolean, reviewedBy?: string): {
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
    approvePublishing(approved: boolean, approvedBy?: string): {
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
    getTasks(): {
        id: string;
        title: string;
        owner: string;
        status: string;
        priority: string;
        updatedAt: string;
    }[];
    getModelSelection(taskType: string, complexity: number, importance?: number, risk?: number): import("../agent-system/model-router.js").ModelSelectionResult;
    recoverFailure(agentId: string, taskId: string, error: string): import("../agent-system/recovery-manager.js").RecoveryResult;
}
