export class RecoveryManager {
    attempts = new Map();
    handleFailure({ agentId, taskId, error }) {
        const key = `${agentId}:${taskId}`;
        const attempts = (this.attempts.get(key) ?? 0) + 1;
        this.attempts.set(key, attempts);
        if (attempts <= 3) {
            return {
                status: 'recovered',
                attempts,
                nextAction: `Reintentar con validación de entrada y revisión del error: ${error}`,
                backoffMs: 1000 * 2 ** (attempts - 1),
            };
        }
        if (error.toLowerCase().includes('auth') || error.toLowerCase().includes('permission')) {
            return {
                status: 'blocked',
                attempts,
                nextAction: 'Requiere intervención humana para autorizar la integración o permiso externo.',
                backoffMs: 0,
            };
        }
        return {
            status: 'escalated',
            attempts,
            nextAction: 'Escalar a un modelo más robusto y a un agente especializado para diagnosticar la causa raíz.',
            backoffMs: 5000,
        };
    }
}
//# sourceMappingURL=recovery-manager.js.map