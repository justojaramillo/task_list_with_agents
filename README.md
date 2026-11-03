# Lista de tareas con ventana de visibilidad

Gestor de tareas personales con planificación a largo plazo: cada tarea tiene una fecha objetivo y una antelación, y no entra en la lista de trabajo hasta que llega su ventana de visibilidad. El calendario sirve para planificar; las métricas de cumplimiento cierran el ciclo.

> El nombre del repositorio (`tasks_list_with_agents`) alude al flujo de desarrollo con agentes de OpenCode, no a una funcionalidad del producto.

## Documentación

| Documento | Contenido |
| --- | --- |
| [`docs/product.md`](docs/product.md) | Qué hace el producto: ventana de visibilidad, estados, funcionalidades con prioridad, pantallas, modelo de datos y métricas |
| [`docs/project.md`](docs/project.md) | Contexto técnico: stack instalado, qué existe hoy, decisiones de infraestructura |
| [`docs/code-rules.md`](docs/code-rules.md) | Reglas de código (tipado, nombres, payloads) |
| [`docs/frontend-rules.md`](docs/frontend-rules.md) | HTML semántico, accesibilidad WCAG 2.1 AAA y responsive |

Los agentes siguen el flujo definido en `.opencode/agents/orchestrator.md`: toda feature no trivial pasa por una spec en `specs/<id>/` (`spec.md` + `tasks.md`) antes de implementarse.

## Puesta en marcha

```bash
npm install       # instala dependencias y activa el hook de pre-commit
npm run dev       # servidor de desarrollo en http://localhost:3000
npm run lint      # ESLint con las reglas del proyecto (fallan, no avisan)
npx tsc --noEmit  # typecheck
```

El pre-commit ejecuta ESLint sobre lo staged y `tsc --noEmit` sobre el proyecto; si fallan, el commit se rechaza.

## Estado

Scaffold de Next.js 16 (App Router), React 19 y Tailwind v4. La arquitectura de carpetas es **feature-first**: `app/` solo enruta y compone, `features/<dominio>/` es dueña de su UI, acciones, consultas y reglas, y `shared/` no depende de ninguna feature. Persistencia decidida (Firebase/Firestore) y **aún no instalada**: todavía no hay API, auth, validación ni tests. Detalle en [`docs/project.md`](docs/project.md).
