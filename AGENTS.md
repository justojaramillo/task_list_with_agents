<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Contexto del proyecto

- `docs/product.md` — **qué hace el producto**: usuarios, funcionalidades, ventana de visibilidad, estados, pantallas, modelo de datos y métricas. Lectura obligatoria antes de proponer alcance.
- `docs/project.md` — **qué existe hoy y qué está decidido** técnicamente: stack instalado, persistencia (Firebase, aún no instalada) y arquitectura de carpetas.

**Léelos antes de proponer alcance o asumir que una pieza existe.** Si contradicen a una spec, ganan los documentos y se corrige la spec; si el producto cambia, se actualiza `docs/product.md` primero.

Hoy el repo es solo el scaffold: no hay Firestore instalado, ni API, ni auth, ni validación, ni tests.

## Arquitectura de carpetas

**Feature-first (FDD), sin `src/`**: `app/` solo enruta y compone; `features/<dominio>/` es dueña de sus componentes, Server Actions, consultas, tipos y reglas; `shared/` contiene UI y utilidades sin dominio. Dirección de dependencias `app → features → shared`, sin ciclos. Una feature se importa desde fuera solo por su API pública (`@/features/<nombre>`), nunca por sus carpetas internas. Detalle y árbol completo: `docs/project.md` §4. El lint lo hace cumplir.

## Reglas de código

Obligatorias para todo el código propio (`app/`, `features/`, `shared/`, `tests/`, scripts). Detalle, ejemplos y sustituciones: `docs/code-rules.md`.

- Máximo **10 métodos por clase** y **100 líneas por función** (sin contar comentarios ni líneas en blanco).
- Prohibido **`any`**, explícito e implícito. Prohibido **`unknown`**, salvo en el parámetro de un type guard, en `catch` o en la anotación de una variable del borde (`const raw: unknown = await request.json()`), y siempre estrechado antes de usarse.
- **PascalCase** para clases, componentes, tipos e interfaces; **camelCase** para funciones, métodos, variables y props.
- Los payloads de **request/response van en snake_case** (`task_id`, `created_at`); el dominio interno en camelCase, con mapeo en el borde (`toDomain` / `toResponse`). Un payload no mezcla formatos.
- Nada de **`as`** en ninguna forma: ni `as Task`, ni `as const`, ni `as unknown as T`. El tipo se declara y el valor debe encajar (`satisfies` para comprobar sin cambiar el tipo), o se escribe un guard.
- Nada de `@ts-ignore`: `@ts-expect-error` con el motivo al lado.
- `npm run lint` y `npx tsc --noEmit` deben pasar antes de dar una tarea por terminada. Las reglas están configuradas para **fallar**, no son sugerencias. El pre-commit hook ejecuta ambas sobre el commit y lo rechaza si fallan.

## Reglas de frontend

Obligatorias en cualquier `.tsx`. Detalle y mapeo de elementos: `docs/frontend-rules.md`.

- **HTML semántico primero**; `div` y `span` solo para layout y presentación (grid, flex, fondo, borde, sombra, animación). Nunca para estructura, texto con significado ni interacción.
- `onClick` sobre `div`/`span` es error de lint. Botón → `<button>`; navegación → `<a href>`; título → `<h1>`–`<h6>`; lista → `<ul>/<li>`; zona → `main`/`nav`/`header`/`footer`/`section`/`article`.
- Prohibido `role` con equivalente nativo (`role="button"`, `role="navigation"`, `role="heading"`…).
- **WCAG 2.1 AAA donde aplique**: contraste 7:1 en texto normal (4.5:1 en grande), objetivos ≥ 44×44 px, foco visible, operación completa por teclado, zoom 200 % sin pérdida, sin límites de tiempo ni parpadeos, cambios de estado anunciados con `aria-live`.
- **Responsive en 360, 768 y 1024 px**, mobile-first: sin scroll horizontal ni contenido cortado a 360; `md:` (768) y `lg:` (1024) definen los cambios de layout. Prohibidos los breakpoints arbitrarios y los anchos fijos de contenedor.
- El color nunca es el único portador de significado y no hay texto dentro de imágenes.

## Secretos

- **`.env` está bloqueado** en `opencode.json` (`permissions`: `read`, `edit` y `shell` con `effect: deny`). No intentes leerlo ni editarlo: la operación se rechaza. `.env.example` sí se puede leer y es donde se documentan las variables necesarias.
- Los secretos viven en `.env` (ignorado por git). Solo las variables `NEXT_PUBLIC_*` llegan al bundle del cliente; el resto nunca se importa desde un componente cliente.

