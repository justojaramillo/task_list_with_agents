# Contexto técnico del proyecto

Qué existe hoy en el repositorio, con qué stack y qué está decidido a nivel técnico. **La definición funcional del producto está en `docs/product.md`**; este archivo no la repite.

> Regla de mantenimiento: si una decisión o el estado del repo cambia, se actualiza este archivo en el mismo cambio. Una spec que contradice este documento está mal; y un documento que miente es peor que no tenerlo.

## 1. Qué es

Gestor de tareas personales con **planificación a largo plazo**: cada tarea tiene fecha objetivo y una antelación; no entra en la lista de trabajo hasta que llega su ventana de visibilidad. El calendario sirve para planificar y mover fechas; las métricas de cumplimiento cierran el ciclo.

La definición funcional completa —concepto de ventana, estados, funcionalidades, pantallas, modelo de datos y métricas— está en **`docs/product.md`**. Este archivo cubre solo lo técnico: stack instalado, estado del repo y decisiones de infraestructura.

La palabra "agents" del nombre del repositorio se refiere al **flujo de desarrollo** (agentes de OpenCode), no a una funcionalidad del producto.

## 2. Stack real

Lo instalado, no lo deseado. No asumas librerías que no aparecen aquí.

| Pieza | Versión | Nota |
| --- | --- | --- |
| Next.js | 16.4.3 | App Router. **Su API difiere de versiones anteriores**: consulta `node_modules/next/dist/docs/` o la tool `nextjs_docs` del MCP `next-devtools`. |
| React | 19.3.0 | Server Components por defecto; `"use client"` solo en la hoja más pequeña que lo necesite. |
| TypeScript | 5.x | `strict` + `noImplicitAny`; reglas de tipado en `docs/code-rules.md`. |
| Tailwind CSS | 4.x | Configuración **CSS-first** en `app/globals.css`, con `@tailwindcss/turbopack`. |
| ESLint | 9.x | `eslint-config-next` + `typescript-eslint` + reglas locales en `eslint-rules/`. Las reglas **fallan**, no avisan. |
| Husky + lint-staged | 9.x / 17.x | Pre-commit: `eslint --fix` sobre lo staged + `tsc --noEmit` sobre el proyecto. |

**Decidido y aún no instalado:** **Firebase / Firestore** como persistencia (decisión del usuario, 2026-10-25). El SDK y la forma de acceso se eligen en la primera spec de datos (ver §6).

**No instalado** (y por tanto no disponible sin aprobación): librería de validación (Zod/Valibot), librería de UI, cliente HTTP, runner de tests, herramienta de autenticación.

## 3. Estado actual

Verificado el 2026-10-25:

- Solo existe el scaffold: `app/layout.tsx` y `app/page.tsx`.
- **No** hay persistencia: Firebase no está instalado ni configurado (decisión tomada, implementación pendiente).
- **No** hay Route Handlers (`app/**/route.ts`) ni Server Actions.
- **No** hay autenticación ni autorización.
- **No** hay validación de entrada (ningún esquema).
- **No** hay runner de tests ni tests.
- **No** existen `features/`, `shared/` ni `tests/`: se crean cuando la primera feature los necesite, no antes.
- `.env` está bloqueado por los permisos de OpenCode (`opencode.json`); los secretos van ahí y `.env.example` documenta las variables necesarias.

Comandos:

```sh
npm run dev        # servidor de desarrollo
npm run build      # build de producción
npm run lint       # ESLint (falla con las reglas del proyecto)
npm run lint:fix   # ESLint con --fix
npx tsc --noEmit   # typecheck
```

## 4. Arquitectura de carpetas: feature-first (FDD)

El código se organiza **por funcionalidad, no por tipo de archivo**. No hay un `components/` global que mezcle dominios ni un `lib/` cajón de sastre. Sin `src/`: `app/` vive en la raíz porque es el enrutador.

```
app/                        # solo enrutado y composición
  layout.tsx
  page.tsx                  # Hoy: lista de trabajo
  programadas/page.tsx
  completadas/page.tsx
  calendario/page.tsx
  tareas/nueva/page.tsx
  tareas/[id]/page.tsx
  metricas/page.tsx
  ajustes/page.tsx
features/
  tasks/                    # dueña de todo el ciclo de una tarea
    components/             # UI de la feature (server y client)
    actions/                # Server Actions de mutación
    queries/                # lectura de datos (server-only)
    lib/                    # reglas puras: visibleFrom, estados, cohortes
    types.ts
    index.ts                # API pública de la feature
  metrics/
  settings/
shared/
  components/               # UI sin dominio: Button, Dialog, Field
  lib/                      # fechas, formato, Result y errores
  types/                    # payloads y tipos transversales
tests/                      # e2e y helpers globales
```

`features/`, `shared/` y `tests/` **no existen todavía**: se crean con la primera feature que los necesite, igual que `app/` se crea con la primera ruta. Las rutas de arriba son la propuesta de `docs/product.md` §7.

Carpetas que no son código y no siguen esta estructura:

| Ruta | Qué va |
| --- | --- |
| `docs/` | `product.md`, `code-rules.md`, `frontend-rules.md`, este archivo |
| `specs/<id>/` | `spec.md` + `tasks.md` por feature |
| `eslint-rules/` | reglas locales del linter |
| `.opencode/` | agentes, skill `spec-writer` y plantillas |

Reglas de frontera (las hace cumplir ESLint, no solo este documento):

| Regla | Detalle |
| --- | --- |
| Dirección de dependencias | `app → features → shared`. Nunca al revés. |
| API pública | Una feature se importa solo por `@/features/<nombre>`, que resuelve a su `index.ts`. Prohibido `@/features/tasks/components/...` en cualquier archivo: fuera de la feature se usa la API pública; dentro, rutas relativas. |
| Dentro de una feature | Rutas relativas (`./lib/dates`, `../components/x`), no el alias hacia sus propias tripas. |
| Entre features | Solo por la API pública y **sin ciclos**: `metrics` puede leer de `tasks`, `tasks` no puede leer de `metrics`. Si dos features necesitan lo mismo y no es dominio de ninguna, sube a `shared/`; si es dominio de una, se queda en la dueña. |
| `shared/` | No importa de `features/` ni de `app/`, y no habla con Firestore. |
| `app/` | No contiene reglas de negocio ni acceso a datos: recibe `params`, declara `metadata` y compone componentes de `features/`. |
| Nombre de la feature | Dominio o capacidad (`tasks`, `metrics`, `settings`), nunca una pantalla (`home`, `list-page`). |
| Tests | Unitarios e integración junto al código que prueban (`features/tasks/lib/visible-from.test.ts`); e2e en `tests/e2e/`. |

Ejemplo de la frontera:

```ts
// app/page.tsx — composición, cero lógica
import { TaskList } from "@/features/tasks";

// features/metrics/queries/get-compliance.ts — dependencia acíclica por API pública
import { isTaskOverdue } from "@/features/tasks";

// features/tasks/components/task-row.tsx — dentro de la misma feature, ruta relativa
import { formatDueDate } from "../lib/format-due-date";
```

Un archivo que no encaja en ninguna de estas carpetas es señal de que la feature está mal delimitada, no de que falte una carpeta `utils/`.

El alias `@/*` apunta a la raíz del repo (`tsconfig.json`), así que las importaciones cruzadas se escriben `@/features/...` y `@/shared/...`, nunca con `../../..`.

## 5. Entidades del dominio

La entidad `Task`, sus campos, invariantes, estados derivados y consultas de Firestore están definidos en **`docs/product.md` §8**. No se duplican aquí: un modelo en dos sitios acaba contradiciéndose.

Resumen: solo se almacenan `completedAt` y `deletedAt` como hechos; el resto de estados se derivan. `visibleFrom` se materializa para poder consultarlo, pero es una función pura de `dueDate` y `leadDays`.

## 6. Decisiones tomadas

| Decisión | Estado | Motivo |
| --- | --- | --- |
| App Router + Server Components por defecto | firme | menos JavaScript en cliente y datos en servidor |
| Arquitectura **feature-first** sin `src/` (`app/` compone, `features/<dominio>/` es dueña, `shared/` es la base) | firme | el código se agrupa por funcionalidad, no por tipo; evita carpetas globales que mezclan dominios (`docs/project.md` §4) |
| Tailwind v4 CSS-first con tokens | firme | sin archivo de configuración JS; estilos en `app/globals.css` |
| Payloads en `snake_case` en el borde, camelCase en el dominio | firme | `docs/code-rules.md` §4 |
| Reglas del proyecto ejecutables (ESLint + hook), no solo documentadas | firme | una regla que no falla no existe |
| Spec + olas de tareas antes de implementar | firme | evita que los agentes se pisen y que se implemente sin criterio de aceptación |
| Accesibilidad WCAG 2.1 AAA donde aplique y responsive 360/768/1024 | firme | `docs/frontend-rules.md` |
| `.env` denegado a los agentes | firme | secretos fuera del contexto del modelo |
| Librería de validación / runner de tests | pendiente | se elige con la primera feature que los necesite, con aprobación |
| Persistencia en **Firebase (Firestore)** | firme | decisión del usuario (2026-10-25) |
| Ocultar la tarea de la lista de trabajo hasta `visibleFrom`; el calendario la muestra siempre | firme | decisión del usuario; es el diferencial del producto (`docs/product.md` §4) |
| `visibleFrom` **materializado** para poder consultarlo | propuesta | Firestore no puede consultar `dueDate − leadDays`; al ser función pura de dos campos, no caduca ni necesita cron |
| Acceso a Firestore desde el servidor (Admin SDK); el cliente no habla con Firestore | propuesta | mantiene secretos y reglas en servidor y es coherente con Server Components |
| Zona horaria única de app, configurable | propuesta | "hoy" no puede depender del dispositivo que abre la app |
| Fechas como `date` + hora local opcional, no timestamp UTC | propuesta | "el próximo mes" a las 00:00 UTC se desplaza de día según la zona |
| Las métricas se calculan por cohorte de `visibleFrom` | propuesta | incluir lo programado a un año hace que el % sea siempre bajo y castiga planificar |
| Borrado lógico + deshacer en lugar de confirmación | propuesta | menos fricción y cumple 3.3.6 (prevención de errores) |
| Un solo usuario, sin cuentas | pendiente | si la app se despliega públicamente, hace falta Firebase Auth |
| Recurrencia | pendiente | cambia el modelo a ocurrencias; no se decide en la primera spec |

Las filas marcadas **propuesta** se convierten en **firme** cuando se aprueba la spec que las implementa.

## 7. Fuera de alcance (por ahora)

La lista de no-objetivos del producto está en **`docs/product.md` §11**. Hasta que algo aparezca allí, una spec no puede dar por hecho que está fuera: si no está listado, está abierto.

## 8. Glosario

El glosario de producto está en **`docs/product.md` §13**. Los términos técnicos (spec, ola, DoD) están en el skill `spec-writer`.

## 9. Quién lee cada documento

| Documento | Consumidor | Cuándo |
| --- | --- | --- |
| `docs/product.md` | skill `spec-writer` | Lectura obligatoria en el paso 2, antes de escribir cualquier spec |
| `docs/product.md` | agente `orchestrator` | Para decidir alcance, precondiciones y qué falta antes de delegar |
| `docs/project.md` | todos los agentes | Para saber qué existe, qué no y qué está decidido técnicamente |
| ambos | agentes `backend` / `frontend` / `tests` / `security` | A través de `AGENTS.md`, que apunta a los dos |
| ambos | personas | Al incorporarse al repo: primera lectura después del `README.md` |
