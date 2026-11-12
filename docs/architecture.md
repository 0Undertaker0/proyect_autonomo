# AI Content Empire — arquitectura inicial

## Evaluación del entorno

- CPU: Intel Core i7-3770 con 8 núcleos lógicos.
- RAM disponible: 21 GB.
- Sistema operativo: Windows 11 x64.
- Herramientas disponibles: Node.js 24, npm y Git.
- Herramientas no instaladas inicialmente: Docker, FFmpeg y modelos locales específicos.

Esto implica que la primera versión debe priorizar un diseño local, sin dependencias de pago y con un enfoque realista para equipos personales. La fase inicial no intenta publicar en redes sociales ni consumir APIs comerciales; se enfoca en la capa de coordinación, análisis y dashboard operativo.

## Arquitectura propuesta

### 1. Frontend
- Next.js con TypeScript.
- Dashboard administrativo para temas, agentes, tareas y métricas.
- Acceso a APIs del backend local.

### 2. Backend
- NestJS.
- Endpoints REST para overview, agentes, oportunidades, actividad y recuperación.
- Lógica central de coordinación y model routing.

### 3. Agent system
- AI Director como orquestador.
- Registro central de agentes y definición de roles.
- Model Router para elegir el modelo más económico según complejidad y riesgo.
- Recovery Manager para reintentos, backoff, bloqueos y escalamiento.

### 4. Data layer
- SQLite o PostgreSQL local según la fase. El proyecto inicial usa datos locales estructurados y seed data para validar flujo operativo.
- No se almacenan credenciales en texto plano.

### 5. Zero Cost Mode
- Presupuesto fijo en $0.00.
- Solo herramientas gratuitas o locales.
- Si una integración exige terceros o pago, se marca como pendiente y se bloquea.

## Modelo de coordinación

Los agentes no operan aislados. El flujo central es:

1. AI Director recibe la solicitud.
2. El Model Router selecciona el modelo adecuado.
3. El agente responsable procesa la tarea.
4. El Recovery Manager interviene si hay error.
5. Se registran resultados y decisiones para la memoria compartida.

## Fases de desarrollo recomendadas

- Fase 1: fundamentos, autenticación, dashboard y API base.
- Fase 2: multiagente y model routing.
- Fase 3: investigación, oportunidades y experimentación.
- Fase 4: producción audiovisual local.
- Fase 5: publicación multi-plataforma y analytics.
- Fase 6: automatización, optimización y monitoreo.

## Principios del proyecto

- Cero inversión inicial.
- Procesamiento local antes que servicios externos.
- Herramientas verificables y documentadas.
- Autonomía operativa con supervisión humana.
- Aprendizaje real basado en resultados históricos.
