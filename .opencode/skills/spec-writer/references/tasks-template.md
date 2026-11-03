---
spec: <YYYY-MM-DD-slug>
status: draft          # draft | in-progress | done
updated: <YYYY-MM-DD>
---

# Tareas — <Título>

## Cómo se lee

- Estados: `[ ]` pendiente · `[~]` en curso · `[x]` hecho · `[!]` bloqueado.
- Cada tarea declara **agente**, **depende de**, **archivos** y **DoD**. Sin DoD no se puede cerrar.
- **Propiedad:** dentro de una ola, cada archivo tiene un solo dueño. Si dos tareas de la misma ola listan el mismo archivo, muévelas a olas distintas o reasigna.
- **Fronteras:** el trabajo se reparte por feature (`features/<dominio>/`). Fuera de ella solo se importa su API pública (`@/features/<nombre>`), nunca sus carpetas internas (`docs/project.md` §4).
- El agente dueño no cambia el alcance: si la spec está mal, se actualiza la spec primero.

## Ola 1 — sin dependencias (paralelizable)

### T-01 — <resultado entregable>

- **Agente:** backend
- **Depende de:** —
- **Cubre:** RF-1, RF-2 · AC-1
- **Alcance:** qué entra exactamente. Lo que no se menciona, no entra.
- **Archivos:** `app/tareas/[id]/page.tsx`, `features/tasks/actions/update-task.ts`, `features/tasks/lib/update-task.ts`
- **DoD:**
  - [ ] Contrato de la sección 7 implementado, incluidos los errores.
  - [ ] `npx tsc --noEmit` y `npm run lint` sin errores.
  - [ ] Caso verificado manualmente con el dev server.

### T-02 — <resultado entregable>

- **Agente:** frontend
- **Depende de:** —
- **Cubre:** RF-3 · AC-3
- **Alcance:**
- **Archivos:**
- **DoD:**
  - [ ] Estados vacío, cargando, error y éxito implementados.
  - [ ] Navegable por teclado, foco visible, `label` en los controles.

## Ola 2 — depende de la ola 1

### T-03 — <resultado entregable>

- **Agente:** frontend
- **Depende de:** T-01
- **Cubre:** AC-1
- **Alcance:** conectar la UI al contrato ya implementado en T-01.
- **Archivos:**
- **DoD:**

## Tests

### T-04 — Suite de <área>

- **Agente:** tests
- **Depende de:** T-01, T-03
- **Cubre:** AC-1, AC-2, AC-3
- **Alcance:** unitarios de la lógica, integración del handler y e2e del flujo principal. Si no hay runner configurado, propón e instala Vitest + Testing Library (y Playwright para e2e) pidiendo aprobación.
- **DoD:**
  - [ ] Cada criterio de aceptación tiene al menos un test.
  - [ ] Casos de error cubiertos: inválido, no autorizado, inexistente.
  - [ ] `npm test` en verde y salida real mostrada.

## Security

### T-05 — Revisión de seguridad del diff

- **Agente:** security
- **Depende de:** T-01, T-03, T-04
- **Alcance:** authz por recurso, validación de entrada, secretos, XSS, dependencias y cabeceras. Read-only: reporta, no parchea.
- **DoD:**
  - [ ] Hallazgos por severidad con `archivo:línea` y remediación.
  - [ ] Hallazgos críticos/altos convertidos en tareas nuevas o cerrados antes de dar la feature por terminada.

## Orden de ejecución

1. **Ola 1 (paralelo):** T-01, T-02
2. **Ola 2:** T-03
3. **Tests:** T-04
4. **Seguridad:** T-05
5. **Cierre:** actualizar `status` de esta spec y de `spec.md`, y resumir al usuario qué se entregó.
