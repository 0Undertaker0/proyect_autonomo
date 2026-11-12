export type AgentStatus = 'online' | 'busy' | 'blocked' | 'idle';
export interface AgentDefinition {
    id: string;
    name: string;
    specialty: string;
    model: string;
    status: AgentStatus;
    currentTask: string;
    tasksCompleted: number;
    costPerRun: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    permissions: string[];
    toolAccess: string[];
}
export declare const AGENT_REGISTRY: AgentDefinition[];
