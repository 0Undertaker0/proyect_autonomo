import { Injectable } from '@nestjs/common';
import { AGENT_REGISTRY } from '../agent-system/agent-registry.js';
import { routeModel } from '../agent-system/model-router.js';
import { RecoveryManager } from '../agent-system/recovery-manager.js';
import { activityFeed, agentTasks, opportunities, overview } from './empire-data.js';

@Injectable()
export class EmpireService {
  private readonly recoveryManager = new RecoveryManager();

  getOverview() {
    return {
      ...overview,
      timestamp: new Date().toISOString(),
      status: 'operational',
    };
  }

  getAgents() {
    return AGENT_REGISTRY;
  }

  getOpportunities() {
    return opportunities;
  }

  getActivity() {
    return activityFeed;
  }

  getPipeline() {
    const stages = [
      {
        id: 'brief',
        name: 'Brief de contenido',
        owner: 'trend-scout',
        status: 'completado',
        progress: 100,
        output: 'Tema validado con demanda, competencia y monetización.',
      },
      {
        id: 'script',
        name: 'Guion y estructura',
        owner: 'scriptwriter',
        status: 'completado',
        progress: 100,
        output: 'Narrativa alineada a la intención viral y al tono editorial.',
      },
      {
        id: 'production',
        name: 'Producción audiovisual',
        owner: 'video-producer',
        status: 'completado',
        progress: 100,
        output: 'Render local y capturas listos para validación final.',
      },
      {
        id: 'qa',
        name: 'QA editorial y verificación',
        owner: 'qa-editor',
        status: 'en revisión',
        progress: 72,
        output: 'Validación de tono, claims, CTA y cumplimiento de la línea editorial.',
      },
      {
        id: 'director_approval',
        name: 'Aprobación del director',
        owner: 'director',
        status: 'pendiente',
        progress: 38,
        output: 'Debe confirmar la publicación final antes del lanzamiento.',
      },
      {
        id: 'publish',
        name: 'Publicación y distribución',
        owner: 'social-publisher',
        status: 'bloqueado',
        progress: 12,
        output: 'Se libera únicamente una vez que QA y dirección aprueban el material.',
      },
    ];

    const qaGateStatus = 'pendiente';
    const directorApprovalStatus = 'pendiente';
    const publishStatus = 'bloqueado';

    return {
      pipeline: stages,
      totalStages: stages.length,
      completedStages: stages.filter((stage) => stage.status === 'completado').length,
      activeStage: stages.find((stage) => stage.status !== 'completado')?.name ?? 'Sin etapa activa',
      nextGate: 'QA y aprobación del director antes del publish',
      approvalRequired: 'director',
      qaGateStatus,
      directorApprovalStatus,
      publishStatus,
    };
  }

  reviewQa(approved: boolean, reviewedBy = 'qa-editor') {
    const pipeline = this.getPipeline();
    const nextStatus = approved ? 'aprobado' : 'rechazado';

    return {
      ...pipeline,
      qaGateStatus: nextStatus,
      directorApprovalStatus: approved ? 'pendiente' : 'rechazado',
      publishStatus: approved ? 'pendiente' : 'bloqueado',
      reviewBy: reviewedBy,
      reviewedAt: new Date().toISOString(),
    };
  }

  getPublishingPlan() {
    const channels = [
      {
        name: 'YouTube Shorts',
        channel: 'youtube',
        status: 'listo',
        cadence: '2x/semana',
        priority: 'alta',
      },
      {
        name: 'Instagram Reels',
        channel: 'instagram',
        status: 'pendiente',
        cadence: '3x/semana',
        priority: 'media',
      },
      {
        name: 'TikTok',
        channel: 'tiktok',
        status: 'en prueba',
        cadence: '1x/semana',
        priority: 'media',
      },
      {
        name: 'X / Twitter',
        channel: 'x',
        status: 'listo',
        cadence: '4x/semana',
        priority: 'baja',
      },
    ];

    return {
      readyForPublish: true,
      channels,
      nextReleaseWindow: '2026-11-18T18:00:00Z',
      approvalRequired: 'director',
      qaGateStatus: 'pendiente',
      directorApprovalStatus: 'pendiente',
      publishStatus: 'pre-publicación',
      suggestedCaption: 'Tema urgente + contexto accionable + CTA corto para maximizar retención y comentarios.',
      automation: {
        thumbnails: 'Generación local con verificación visual',
        subtitles: 'Sí, en español y con variación de tono',
        postTiming: '4:00 PM y 8:30 PM según horario objetivo',
      },
    };
  }

  approvePublishing(approved: boolean, approvedBy = 'director') {
    const plan = this.getPublishingPlan();
    const approvalStatus = approved ? 'aprobado' : 'rechazado';

    return {
      ...plan,
      readyForPublish: approved,
      qaGateStatus: plan.qaGateStatus ?? 'pendiente',
      directorApprovalStatus: approvalStatus,
      publishStatus: approved ? 'aprobado' : 'rechazado',
      approvedBy,
      approvedAt: new Date().toISOString(),
    };
  }

  getTasks() {
    return agentTasks;
  }

  getModelSelection(taskType: string, complexity: number, importance = 60, risk = 30) {
    return routeModel({
      taskType: taskType as never,
      complexity,
      importance,
      risk,
      budget: overview.budget,
    });
  }

  recoverFailure(agentId: string, taskId: string, error: string) {
    return this.recoveryManager.handleFailure({ agentId, taskId, error });
  }
}
