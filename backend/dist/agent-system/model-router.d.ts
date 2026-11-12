export type TaskType = 'classification' | 'summary' | 'research' | 'script' | 'strategy' | 'recovery' | 'production';
export interface ModelSelectionRequest {
    taskType: TaskType;
    complexity: number;
    importance: number;
    risk: number;
    budget: number;
}
export interface ModelSelectionResult {
    tier: 1 | 2 | 3;
    model: string;
    reason: string;
}
export declare const MODEL_CATALOG: {
    tier: number;
    model: string;
    capabilities: string[];
    maxComplexity: number;
}[];
export declare function routeModel({ taskType, complexity, importance, risk, budget, }: ModelSelectionRequest): ModelSelectionResult;
export declare class ModelRouter {
    selectModel(input: ModelSelectionRequest): ModelSelectionResult;
}
