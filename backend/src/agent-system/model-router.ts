export type TaskType =
  | 'classification'
  | 'summary'
  | 'research'
  | 'script'
  | 'strategy'
  | 'recovery'
  | 'production';

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

export const MODEL_CATALOG = [
  {
    tier: 1,
    model: 'phi3:mini',
    capabilities: ['classification', 'summary', 'research'],
    maxComplexity: 35,
  },
  {
    tier: 1,
    model: 'qwen2.5:7b',
    capabilities: ['classification', 'summary', 'script'],
    maxComplexity: 55,
  },
  {
    tier: 2,
    model: 'mistral:7b',
    capabilities: ['research', 'script', 'strategy'],
    maxComplexity: 75,
  },
  {
    tier: 2,
    model: 'llama3.1:8b',
    capabilities: ['script', 'strategy', 'production'],
    maxComplexity: 88,
  },
  {
    tier: 3,
    model: 'llama3.1:70b',
    capabilities: ['strategy', 'recovery', 'critical-analysis'],
    maxComplexity: 100,
  },
];

export function routeModel({
  taskType,
  complexity,
  importance,
  risk,
  budget,
}: ModelSelectionRequest): ModelSelectionResult {
  const weightedScore = complexity * 0.45 + importance * 0.25 + risk * 0.2 + (budget > 0 ? 10 : 0);

  if (weightedScore <= 35 || taskType === 'summary' || taskType === 'classification') {
    return {
      tier: 1,
      model: 'phi3:mini',
      reason: 'Tarea rutinaria y económica con bajo riesgo y costo mínimo.',
    };
  }

  if (weightedScore <= 70 || taskType === 'research' || taskType === 'script') {
    return {
      tier: 2,
      model: 'qwen2.5:7b',
      reason: 'Necesita análisis más profundo sin requerir decisión estratégica crítica.',
    };
  }

  if (weightedScore <= 90 || taskType === 'strategy' || taskType === 'production') {
    return {
      tier: 2,
      model: 'llama3.1:8b',
      reason: 'Se prioriza un modelo local potente para decisiones operativas importantes.',
    };
  }

  return {
    tier: 3,
    model: 'llama3.1:70b',
    reason: 'Requiere máxima capacidad y respaldo para diagnosticar riesgos o decisiones críticas.',
  };
}

export class ModelRouter {
  selectModel(input: ModelSelectionRequest): ModelSelectionResult {
    return routeModel(input);
  }
}
