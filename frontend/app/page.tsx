"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Overview = {
  projectName: string;
  mode: string;
  budget: number;
  activeAgents: number;
  topicsInvestigated: number;
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

type Agent = {
  id: string;
  name: string;
  specialty: string;
  model: string;
  status: string;
  currentTask: string;
  tasksCompleted: number;
  priority: string;
};

type Opportunity = {
  id: string;
  name: string;
  score: number;
  state: string;
  market: string;
  competition: string;
  profitability: number;
  sources: string[];
};

type Task = {
  id: string;
  title: string;
  description: string;
  state: string;
  priority: string;
  agentName: string;
  modelUsed?: string;
  createdAt?: string;
  dependencies?: string[];
  requiresApproval?: boolean;
  approvalStatus?: string;
  requiredRole?: string | null;
};

type TaskSummary = {
  total: number;
  completed: number;
  inReview: number;
  inProgress: number;
  tasks: Task[];
};

type QueueItem = {
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
  readiness: "blocked" | "ready" | "waiting";
  requiresApproval?: boolean;
  approvalStatus?: string;
  requiredRole?: string | null;
};

type PipelineStage = {
  id: string;
  name: string;
  owner: string;
  status: string;
  progress: number;
  output: string;
};

type UserSession = {
  id: string;
  username: string;
  role: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const STORAGE_KEY = "ai-content-empire-session";

export default function Home() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [executionPlan, setExecutionPlan] = useState<{
    generatedAt: string;
    total: number;
    readyNow: Array<{ id: string; title: string; priority: string; agent: string; model: string; dependencyDepth: number }>;
    waiting: Array<{ id: string; title: string; priority: string; agent: string; model: string; dependencyDepth: number }>;
    blocked: Array<{ id: string; title: string; priority: string; agent: string; model: string; dependencyDepth: number }>;
    nextActions: Array<{ id: string; title: string; priority: string; agent: string; model: string; dependencyDepth: number }>;
  } | null>(null);
  const [pipeline, setPipeline] = useState<{ pipeline: PipelineStage[]; totalStages: number; completedStages: number; activeStage: string; nextGate: string; qaGateStatus?: string; directorApprovalStatus?: string; publishStatus?: string; approvalRequired?: string } | null>(null);
  const [schedule, setSchedule] = useState<{ generatedAt: string; totalBatches: number; readyNow: number; waiting: number; blocked: number; batches: Array<{ slot: string; window: string; focus: string; estimatedDuration: string; tasks: Array<{ id: string; title: string; priority: string; agent: string; model: string; dependencyDepth: number }> }> } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "admin", password: "admin123" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "media",
    agentName: "Orchestrator",
    approvalRole: "director",
  });

  const applyToken = (nextToken: string | null) => {
    setToken(nextToken);
    if (nextToken) {
      localStorage.setItem(STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadDashboard = async (authToken: string) => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const [overviewRes, agentsRes, opportunitiesRes, activityRes, tasksRes, taskSummaryRes, queueRes, executionPlanRes, pipelineRes, scheduleRes] = await Promise.all([
      fetch(`${API_BASE}/api/overview`, { headers }),
      fetch(`${API_BASE}/api/agents`, { headers }),
      fetch(`${API_BASE}/api/opportunities`, { headers }),
      fetch(`${API_BASE}/api/activity`, { headers }),
      fetch(`${API_BASE}/api/tasks`, { headers }),
      fetch(`${API_BASE}/api/task-summary`, { headers }),
      fetch(`${API_BASE}/api/orchestrator/queue`, { headers }),
      fetch(`${API_BASE}/api/orchestrator/plan`, { headers }),
      fetch(`${API_BASE}/api/pipeline`, { headers }),
      fetch(`${API_BASE}/api/orchestrator/schedule`, { headers }),
    ]);

    if (
      !overviewRes.ok ||
      !agentsRes.ok ||
      !opportunitiesRes.ok ||
      !activityRes.ok ||
      !tasksRes.ok ||
      !taskSummaryRes.ok ||
      !queueRes.ok ||
      !executionPlanRes.ok ||
      !pipelineRes.ok ||
      !scheduleRes.ok
    ) {
      throw new Error("La sesión expiró o el backend rechazó la autenticación.");
    }

    const overviewData = await overviewRes.json();
    const agentsData = await agentsRes.json();
    const opportunitiesData = await opportunitiesRes.json();
    const activityData = await activityRes.json();
    const tasksData = await tasksRes.json();
    const taskSummaryData = await taskSummaryRes.json();
    const queueData = await queueRes.json();
    const executionPlanData = await executionPlanRes.json();
    const pipelineData = await pipelineRes.json();
    const scheduleData = await scheduleRes.json();

    setOverview(overviewData);
    setAgents(agentsData);
    setOpportunities(opportunitiesData);
    setActivity(activityData);
    setTasks(tasksData);
    setTaskSummary(taskSummaryData);
    setQueue(queueData.queue ?? []);
    setExecutionPlan(executionPlanData);
    setPipeline(pipelineData);
    setSchedule(scheduleData);
  };
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    async function hydrateSession() {
      const activeToken = storedToken as string;

      try {
        const meRes = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        if (!meRes.ok) {
          throw new Error("Sesión inválida");
        }

        const meData = await meRes.json();
        setToken(activeToken);
        setUser(meData);
        await loadDashboard(activeToken);
      } catch {
        applyToken(null);
        setUser(null);
        setError("La sesión almacenada es inválida. Inicia sesión nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    void hydrateSession();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await res.json();
      const nextToken = data.token as string;
      const nextUser = data.user as UserSession;

      applyToken(nextToken);
      setUser(nextUser);
      await loadDashboard(nextToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
      applyToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    applyToken(null);
    setUser(null);
    setOverview(null);
    setAgents([]);
    setOpportunities([]);
    setActivity([]);
    setTasks([]);
    setTaskSummary(null);
    setQueue([]);
    setExecutionPlan(null);
    setError(null);
    setLoading(false);
  };

  const handleTaskStatusUpdate = async (taskId: string, nextStatus: string) => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus, notes: `Estado actualizado por el director: ${nextStatus}` }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la tarea");
      }

      await loadDashboard(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la tarea");
    }
  };

  const handleTaskApproval = async (taskId: string, decision: "approved" | "rejected") => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision,
          requiredRole: "director",
          notes: decision === "approved" ? "Aprobado por el director desde el panel operativo." : "Rechazado por el director desde el panel operativo.",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar la decisión de aprobación");
      }

      await loadDashboard(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo decidir la aprobación");
    }
  };

  const handlePublishApproval = async (approved: boolean, stage: "qa" | "publish" = "publish") => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/publishing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved,
          stage,
          notes: stage === "qa"
            ? approved
              ? "QA aprobada por el director desde el panel operativo."
              : "QA rechazada por el director desde el panel operativo."
            : approved
              ? "Publicación aprobada por el director desde el panel operativo."
              : "Publicación rechazada por el director desde el panel operativo.",
        }),
      });

      if (!response.ok) {
        throw new Error(stage === "qa" ? "No se pudo registrar la decisión de QA" : "No se pudo registrar la decisión de publicación");
      }

      await loadDashboard(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo decidir la aprobación del flujo");
    }
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Necesitas iniciar sesión para crear una tarea.");
      return;
    }

    setTaskLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          agentName: taskForm.agentName,
          approvalRole: taskForm.approvalRole,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la tarea");
      }

      setTaskForm({ title: "", description: "", priority: "media", agentName: "Orchestrator", approvalRole: "director" });
      await loadDashboard(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la tarea");
    } finally {
      setTaskLoading(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      { label: "Presupuesto", value: `$${overview.budget.toFixed(2)}`, tone: "primary" },
      { label: "Temáticas investigadas", value: overview.topicsInvestigated.toString(), tone: "info" },
      { label: "Videos producidos", value: overview.videosProduced.toString(), tone: "success" },
      { label: "Seguidores ganados", value: overview.followersGained.toLocaleString(), tone: "warning" },
      { label: "Visualizaciones 30 días", value: overview.viewsLast30Days.toLocaleString(), tone: "info" },
      { label: "Agentes activos", value: overview.activeAgents.toString(), tone: "dark" },
    ];
  }, [overview]);

  if (loading) {
    return <main className="dashboard-loading">Cargando panel de control...</main>;
  }

  if (!token || !user || !overview) {
    return (
      <main className="auth-shell">
        <div className="auth-card">
          <span className="eyebrow">ACCESO RESTRINGIDO</span>
          <h1>AI Content Empire</h1>
          <p>Inicia sesión para gestionar la operación local del sistema multiagente.</p>

          <form onSubmit={handleLogin} className="auth-form">
            <label>
              Usuario
              <input
                type="text"
                value={loginForm.username}
                onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" disabled={authLoading}>
              {authLoading ? "Iniciando sesión..." : "Entrar al panel"}
            </button>
          </form>

          <div className="auth-hint">
            Credenciales por defecto: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="eyebrow">PLATAFORMA AUTÓNOMA</span>
          <h1>{overview.projectName}</h1>
        </div>

        <nav className="nav">
          {['Inicio', 'Temáticas', 'Equipo IA', 'Actividad', 'Producción', 'Monetización', 'Configuración'].map((item) => (
            <button key={item} type="button" className="nav-item active">
              {item}
            </button>
          ))}
        </nav>

        <div className="status-card">
          <span className="status-label">Zero Cost Mode</span>
          <strong>Activo</strong>
          <p>{overview.zeroCostStatus}</p>
        </div>
      </aside>

      <section className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Panel operativo</p>
            <h2>Resumen ejecutivo</h2>
          </div>
          <div className="topbar-actions">
            <div className="user-pill">{user.username} · {user.role}</div>
            <button type="button" className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </header>

        <div className="summary-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className={`summary-card ${card.tone}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>

        <section className="panel task-panel">
          <div className="panel-heading">
            <h3>Gestión de tareas</h3>
            <span>{taskSummary ? `${taskSummary.total} totales` : "Sin datos"}</span>
          </div>

          <div className="task-board-layout">
            <form onSubmit={handleCreateTask} className="task-form">
              <label>
                Título
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Ej: Analizar tendencia de video"
                  required
                />
              </label>

              <label>
                Descripción
                <textarea
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describa el objetivo y el contexto operacional"
                  rows={3}
                  required
                />
              </label>

              <div className="task-form-row">
                <label>
                  Prioridad
                  <select
                    value={taskForm.priority}
                    onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </label>

                <label>
                  Agente
                  <input
                    value={taskForm.agentName}
                    onChange={(event) => setTaskForm((current) => ({ ...current, agentName: event.target.value }))}
                  />
                </label>
              </div>

              <label>
                Requiere aprobación
                <select
                  value={taskForm.approvalRole}
                  onChange={(event) => setTaskForm((current) => ({ ...current, approvalRole: event.target.value }))}
                >
                  <option value="director">Director</option>
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                </select>
              </label>

              <button type="submit" disabled={taskLoading}>
                {taskLoading ? "Creando..." : "Crear tarea"}
              </button>
            </form>

            <div className="task-list">
              {(tasks.slice(0, 5)).map((task) => (
                <article key={task.id} className="task-item">
                  <div className="meta-row between">
                    <h4>{task.title}</h4>
                    <span className="task-chip">{task.priority}</span>
                  </div>
                  <p>{task.description}</p>
                  <div className="meta-row">
                    <span className="pill">{task.state}</span>
                    <span>{task.agentName}</span>
                  </div>
                  {task.dependencies && task.dependencies.length > 0 ? (
                    <small>Dependencias: {task.dependencies.join(', ')}</small>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        {schedule ? (
          <section className="panel">
            <div className="panel-heading">
              <h3>Plan de horario</h3>
              <span>{schedule.totalBatches} ventanas</span>
            </div>

            <div className="queue-list">
              {schedule.batches.map((batch) => (
                <article key={batch.slot} className="queue-item">
                  <div className="meta-row between">
                    <h4>{batch.slot}</h4>
                    <span className="task-chip">{batch.window}</span>
                  </div>
                  <div className="meta-row">
                    <span className="pill">{batch.focus}</span>
                    <span>{batch.estimatedDuration}</span>
                  </div>
                  {batch.tasks.length > 0 ? (
                    <ul className="activity-list compact-list">
                      {batch.tasks.map((task) => (
                        <li key={task.id}>
                          <strong>{task.title}</strong> · {task.priority} · {task.agent} · {task.model}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">Sin tareas en esta ventana.</div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {executionPlan ? (
          <section className="panel">
            <div className="panel-heading">
              <h3>Plan operativo</h3>
              <span>{executionPlan.readyNow.length} listas · {executionPlan.waiting.length} en espera</span>
            </div>

            <div className="queue-list">
              {executionPlan.nextActions.length > 0 ? (
                executionPlan.nextActions.map((entry) => (
                  <article key={entry.id} className="queue-item">
                    <div className="meta-row between">
                      <h4>{entry.title}</h4>
                      <span className="task-chip">{entry.priority}</span>
                    </div>
                    <div className="meta-row">
                      <span className="pill">ready</span>
                      <span>{entry.agent}</span>
                      <span>{entry.model}</span>
                    </div>
                    <small>Profundidad de dependencias: {entry.dependencyDepth}</small>
                  </article>
                ))
              ) : (
                <div className="empty-state">Sin tareas listas para lanzarse ahora mismo.</div>
              )}
            </div>
          </section>
        ) : null}

        {pipeline ? (
          <section className="panel">
            <div className="panel-heading">
              <h3>Pipeline editorial</h3>
              <span>{pipeline.completedStages}/{pipeline.totalStages} etapas</span>
            </div>

            <div className="pipeline-list">
              {pipeline.pipeline.map((stage) => (
                <article key={stage.id} className="pipeline-item">
                  <div className="meta-row between">
                    <h4>{stage.name}</h4>
                    <span className="task-chip">{stage.progress}%</span>
                  </div>
                  <div className="meta-row">
                    <span className="pill">{stage.status}</span>
                    <span>{stage.owner}</span>
                  </div>
                  <p>{stage.output}</p>
                  <div className="progress-bar">
                    <span style={{ width: `${stage.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>

            <div className="pipeline-summary">
              <strong>Etapa activa:</strong> {pipeline.activeStage}
              <br />
              <strong>Siguiente gate:</strong> {pipeline.nextGate}
              <br />
              <strong>QA gate:</strong> {pipeline.qaGateStatus ?? "pendiente"}
              <br />
              <strong>Aprobación del director:</strong> {pipeline.directorApprovalStatus ?? "pendiente"}
              <br />
              <strong>Estado de publicación:</strong> {pipeline.publishStatus ?? "bloqueado"}
              <br />
              <strong>Requiere aprobación:</strong> {pipeline.approvalRequired ?? "director"}
            </div>
            <div className="queue-actions pipeline-actions">
              <button type="button" onClick={() => handlePublishApproval(true, "qa")}>Aprobar QA</button>
              <button type="button" onClick={() => handlePublishApproval(false, "qa")}>Rechazar QA</button>
              <button type="button" onClick={() => handlePublishApproval(true, "publish")}>Aprobar publicación</button>
              <button type="button" onClick={() => handlePublishApproval(false, "publish")}>Rechazar publicación</button>
            </div>
          </section>
        ) : null}

        <div className="panel-grid">
          <section className="panel">
            <div className="panel-heading">
              <h3>Agentes IA</h3>
              <span>{agents.length} activos</span>
            </div>
            <div className="agent-list">
              {agents.slice(0, 6).map((agent) => (
                <article key={agent.id} className="agent-card">
                  <div>
                    <h4>{agent.name}</h4>
                    <p>{agent.specialty}</p>
                  </div>
                  <div className="meta-row">
                    <span className="pill">{agent.status}</span>
                    <span>{agent.model}</span>
                  </div>
                  <small>{agent.currentTask}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h3>Oportunidades</h3>
              <span>Revisión</span>
            </div>
            <div className="opportunity-list">
              {opportunities.map((topic) => (
                <article key={topic.id} className="opportunity-card">
                  <div className="meta-row between">
                    <h4>{topic.name}</h4>
                    <strong>{topic.score}</strong>
                  </div>
                  <p>{topic.market} · {topic.state}</p>
                  <small>{topic.sources.join(" · ")}</small>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <h3>Cola operativa</h3>
            <span>{queue.length} tareas</span>
          </div>

          <div className="queue-list">
            {queue.slice(0, 5).map((entry) => (
              <article key={entry.id} className="queue-item">
                <div className="meta-row between">
                  <h4>{entry.title}</h4>
                  <span className="task-chip">{entry.priority}</span>
                </div>
                <p>{entry.description}</p>
                <div className="meta-row">
                  <span className="pill">{entry.readiness}</span>
                  <span>{entry.recommendedAgent}</span>
                  <span>{entry.recommendedModel}</span>
                  {entry.requiresApproval ? <span className="pill warning">Requiere {entry.requiredRole ?? "director"}</span> : null}
                </div>
                <div className="queue-actions">
                  {entry.requiresApproval && (user.role === "director" || user.role === "admin") ? (
                    <>
                      <button type="button" onClick={() => handleTaskApproval(entry.id, "approved")}>Aprobar</button>
                      <button type="button" onClick={() => handleTaskApproval(entry.id, "rejected")}>Rechazar</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => handleTaskStatusUpdate(entry.id, "En revisión")}>En revisión</button>
                      <button type="button" onClick={() => handleTaskStatusUpdate(entry.id, "Completada")}>Completar</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h3>Actividad reciente</h3>
            <span>{activity.length} eventos</span>
          </div>
          <ul className="activity-list">
            {activity.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}



