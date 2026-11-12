# AI Content Empire

Proyecto base para una plataforma autónoma de investigación, producción y distribución de contenido digital con un equipo de agentes especializados.

## Objetivo de esta fase

- Definir la arquitectura técnica inicial.
- Crear una base de backend y frontend funcionales.
- Implementar la coordinación multiagente básica.
- Mantener el presupuesto en $0.00 con herramientas locales.
- Preparar la infraestructura para crecer sin reescribir todo el proyecto.

## Estructura

- `backend/`: API NestJS con endpoints de coordinación, métricas y tareas.
- `frontend/`: dashboard Next.js para visualización del sistema.
- `docs/architecture.md`: análisis técnico del entorno y arquitectura.

## Cómo ejecutar

1. Backend:
   - `cd backend`
   - `npm install`
   - `npm run start:dev`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

La API queda disponible en `http://localhost:3001` y el dashboard en `http://localhost:3000`.

## Reglas esenciales

- Presupuesto inicial: $0.00.
- Herramientas locales y gratuitas prioritarias.
- Modelos locales antes que APIs de pago.
- Agentes con coordinación real y recuperación de errores.
- Flujos operativos y datos estructurados, no simulaciones visuales aisladas.

## Estado actual

Esta primera entrega incluye:

- Dashboard principal en Next.js.
- Backend en NestJS con endpoints REST.
- Registro de agentes.
- Model Router.
- Recovery Manager.
- Evaluación de oportunidades y datos estructurados.
- Pruebas de integración para coordinación básica.
