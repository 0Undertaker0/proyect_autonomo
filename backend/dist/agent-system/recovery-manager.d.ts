export interface RecoveryContext {
    agentId: string;
    taskId: string;
    error: string;
}
export interface RecoveryResult {
    status: 'recovered' | 'escalated' | 'blocked';
    attempts: number;
    nextAction: string;
    backoffMs: number;
}
export declare class RecoveryManager {
    private attempts;
    handleFailure({ agentId, taskId, error }: RecoveryContext): RecoveryResult;
}
