---
name: Spec Writer
description: "Convierte requisitos, tickets, historias de usuario o una idea suelta en specs implementables y en un plan de tareas repartido entre los agentes backend, frontend, tests y security. Úsalo siempre que el usuario pida una feature nueva, describa un requisito, pegue un ticket o una historia de usuario, pida 'una spec', 'una especificación', 'planificar esto', 'desglosar tareas', 'escribir los requisitos' o pida implementar algo no trivial en varias capas. Úsalo también antes de tocar código cuando el alcance no esté claro."
---

# Spec Writer

Convierte requisitos en dos artefactos que otros agentes pueden ejecutar sin adivinar:

- `specs/<id>/spec.md` — qué se construye y por qué, con criterios de aceptación verificables.
- `specs/<id>/tasks.md` — quién lo construye, en qué orden y cómo se sabe que está terminado.

Una spec no es documentación decorativa: es el contrato entre el usuario y los agentes que implementan. Si un agente tiene que interpretar una ambigüedad, la spec falló.

## Cuándo usarlo

Úsalo cuando llegue una feature, un ticket, una historia de usuario o un cambio que toca más de una capa (datos + UI, o UI + tests). No lo uses para arreglos de una línea, typos o preguntas sobre el código: ahí solo añades ceremonia.

Si el usuario ya trae una spec escrita, no la reescribas desde cero: revísala, complétala con las secciones que falten y normaliza el formato.

## Workflow

### 1. Reunir los requisitos

Extrae todo lo que ya está dicho antes de preguntar: el mensaje del usuario, archivos o tickets adjuntos, y el contexto del repo (`AGENTS.md`, `package.json`, rutas existentes). La mayoría de las specs se pueden escribir sin interrumpir.

Pregunta **solo** lo que bloquea una decisión de diseño y no se puede inferir del repo ni resolver con un supuesto razonable. Máximo 3 preguntas, agrupadas en un solo mensaje. Todo lo demás va a `Supuestos y preguntas abiertas` en la spec, marcado como supuesto, para que el usuario lo corrija al revisar. Nunca inventes silenciosamente: un supuesto explícito es revisable; una invención no.

### 2. Leer el terreno

Antes de escribir contratos, mira lo que ya existe para no proponer duplicados ni APIs incompatibles:

- `docs/product.md` — **lectura obligatoria**: qué hace el producto, funcionalidades con prioridad, reglas de negocio (ventana de visibilidad, estados), pantallas, modelo de datos y métricas. Si tu spec lo contradice, la spec está mal.
- `docs/project.md` — **lectura obligatoria**: stack real instalado, qué existe hoy y qué no, y decisiones técnicas. Una spec no puede asumir una pieza que no está aquí.
- `package.json` — stack y dependencias reales (no asumas librerías que no están).
- `AGENTS.md`, `docs/code-rules.md` y `docs/frontend-rules.md` — reglas que el código generado tendrá que cumplir y que el lint hará fallar.
- Rutas, componentes y modelos existentes con `glob`/`grep`, no leyendo el repo entero.
- Si el requisito usa APIs del framework, consulta la doc de la versión instalada (`node_modules/next/dist/docs/` o la tool `nextjs_docs` del MCP `next-devtools`). En este repo Next.js es 16.4.3 y difiere de versiones anteriores.

Anota en la spec qué encontraste y qué reutilizas. Una spec que ignora el código existente genera trabajo duplicado.

**Comprueba las precondiciones.** Muchas peticiones asumen algo que aún no existe ("filtrar la lista de tareas" cuando todavía no hay lista, ni modelo `Task`, ni persistencia). Antes de escribir el contrato, verifica que las entidades, rutas y datos que el requisito da por hechos existan de verdad. Si no existen, tienes tres salidas y debes elegir una explícitamente:

1. **Ampliar el alcance** e incluir el mínimo habilitador en la misma spec (con sus propias tareas), si es pequeño y sin él la feature no se puede entregar.
2. **Partir la spec** en una spec habilitadora y esta, enlazadas en `Referencias`, y decirle al usuario que la primera va antes.
3. **Marcar dependencia bloqueante** en `Supuestos y preguntas abiertas` y decirlo al entregar. Nunca escribas la spec como si el terreno ya estuviera listo.

### 3. Escribir la spec

Copia `references/spec-template.md` a `specs/<id>/spec.md` y rellénalo. `<id>` es `YYYY-MM-DD-<slug-kebab>` (por ejemplo `2026-10-25-editar-tareas`).

Las 14 secciones son el máximo, no una cuota. Con pocos requisitos puedes fusionar secciones afines (por ejemplo usuarios dentro de problema, riesgos dentro de supuestos) y escribir "No aplica" con una razón cuando algo no exista en este repo (el estado real está en `docs/project.md` §3: dilo, no lo inventes). Lo que **nunca** se puede omitir son los criterios de aceptación, el contrato de lo que se expone (API, Server Action o función interna) y el plan de pruebas. Una spec corta y completa vale más que una de 200 líneas con relleno.

Las reglas de calidad (requisitos atómicos, criterios de aceptación en Dado/Cuando/Entonces, contrato de errores, estados de UI, plan de pruebas) están en `references/spec-quality.md`. Léelo antes de dar la spec por terminada; ahí está el listón, no en el template.

### 4. Repartir el trabajo

Copia `references/tasks-template.md` a `specs/<id>/tasks.md`. Cada tarea lleva: ID (`T-01`), agente dueño, dependencias, alcance, archivos previstos y definición de terminado (DoD) ligada a criterios de aceptación.

Reparte por responsabilidad, no por capricho:

| Trabajo | Agente |
| --- | --- |
| Modelo de datos, Route Handlers, Server Actions, validación, authz | `backend` |
| Pantallas, componentes, estados, accesibilidad, estilos | `frontend` |
| Suite de unit/integration/e2e y reproducción de bugs | `tests` |
| Revisión de seguridad del diff y de la superficie de ataque | `security` |

Agrupa en olas: lo que no tiene dependencias va en la ola 1 y puede ejecutarse en paralelo; lo que depende de un contrato espera a que ese contrato exista. Security va siempre después de que haya código que revisar.

Los IDs son un contrato entre los dos archivos: si en §11 asignas un test a `T-04`, esa tarea debe existir y cubrir esos criterios en `tasks.md`. Si al repartir renombras o mueves una tarea, actualiza las dos referencias en el mismo paso; un ID huérfano hace que el orquestador cierre trabajo sin cubrir.

Los agentes comparten el mismo árbol de archivos, así que el plan debe impedir que se pisen: dentro de una ola, cada archivo tiene un único dueño. Si dos tareas de la misma ola necesitan `app/layout.tsx`, `app/page.tsx`, `globals.css` o `package.json`, van en olas distintas. Y lo que depende de un contrato (frontend consumiendo un endpoint) espera a que backend lo publique: no se implementa contra una suposición.

### 5. Cerrar

Antes de entregar, verifica:

- [ ] Cada requisito funcional tiene al menos un criterio de aceptación.
- [ ] Cada criterio de aceptación está cubierto por al menos una tarea y un test.
- [ ] Cada tarea tiene agente, dependencias y DoD verificable.
- [ ] Los IDs de tarea citados en el plan de pruebas existen en `tasks.md` y cubren lo que dicen cubrir.
- [ ] Las precondiciones que no existen están resueltas (incluidas, partidas en otra spec o marcadas como bloqueantes).
- [ ] No hay decisiones de diseño sin justificar ni supuestos escondidos en el texto.
- [ ] La spec no contradice `AGENTS.md` ni el stack real del repo.

Responde con: ruta de la spec, ruta del plan, supuestos que necesitan confirmación y el siguiente paso recomendado (aprobar la spec o lanzar la ola 1). No empieces a implementar: eso es trabajo del orquestador y de los agentes de área.

## Formato de `<id>`

`YYYY-MM-DD-<slug>` en kebab-case, en español si el usuario escribe en español: `2026-10-25-filtros-de-tareas`. Un `id` por feature. Si la feature ya existe, actualiza su spec en vez de crear otra carpeta.

## Errores comunes

- **Spec que describe la solución en vez del problema.** El "qué" y el "por qué" van en la spec; el "cómo" concreto se decide al implementar, salvo que el contrato de API o el modelo de datos ya lo fijen.
- **Requisitos no verificables** ("la UI debe ser rápida", "debe funcionar bien"). Conviértelos en algo medible o elimínalos.
- **Criterios de aceptación que repiten la implementación** ("llama a `fetch` en `/api/tasks`"). El criterio describe comportamiento observable por el usuario o el consumidor de la API.
- **Tareas de una línea por archivo.** Agrupa por resultado entregable, no por archivo tocado.
- **Meter security al final como trámite.** La sección de seguridad de la spec se escribe al principio; la revisión del agente llega al final.
