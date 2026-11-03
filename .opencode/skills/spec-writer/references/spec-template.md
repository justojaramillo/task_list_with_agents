---
id: <YYYY-MM-DD-slug>
title: <Título corto y específico>
status: draft          # draft | approved | in-progress | done
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
owners: [backend, frontend, tests, security]
---

# <Título>

## 1. Problema

Qué duele hoy, a quién y desde cuándo. Describe la situación actual, no la solución. Si hay evidencia (un ticket, una queja, una métrica), cítala.

## 2. Objetivo y no-objetivos

- **Objetivo:** resultado observable que se quiere conseguir.
- **No-objetivos:** lo que queda explícitamente fuera. Esta sección evita la mayor parte del scope creep; no la dejes vacía.

## 3. Usuarios y casos de uso

| Actor | Quiere | Para |
| --- | --- | --- |
|  |  |  |

## 4. Requisitos funcionales

Numerados y atómicos (`RF-1`, `RF-2`…). Cada uno debe poder verificarse con una acción concreta.

- **RF-1** —
- **RF-2** —

## 5. Requisitos no funcionales

Solo los que aplican; borra el resto.

- Rendimiento: tiempo o tamaño aceptable, medido cómo.
- Accesibilidad: **WCAG 2.1 AAA donde aplique** (contraste 7:1 en texto normal, objetivos ≥ 44×44 px, teclado completo, foco visible) — ver `docs/frontend-rules.md`.
- Datos y privacidad: qué se guarda, dónde y cuánto tiempo.
- Compatibilidad: navegadores, móvil, SSR/hidratación.
- i18n: idioma de la UI y de los mensajes de error.

## 6. Modelo de datos

Entidades, campos, tipos e invariantes. Parte de `docs/project.md` §5 (entidades que ya existen) y de §6 (decisiones sobre persistencia): **no asumas base de datos ni ORM**. Si la feature necesita persistencia y no está decidida, es una decisión que aprueba el usuario y que se refleja luego en `docs/project.md`.

```
Entidad
  id        string (uuid)
  campo     tipo — restricciones
```

Invariantes: qué nunca puede ocurrir (p. ej. "una tarea no puede tener título vacío").

## 7. Contrato de API y Server Actions

Una fila por endpoint o action. Los códigos de error son parte del contrato, no un detalle.

| ID | Método y ruta / Action | Entrada | Salida | Errores | Autorización |
| --- | --- | --- | --- | --- | --- |
| API-1 |  |  |  |  |  |

Validación por campo (tipo, longitud, formato, obligatoriedad):

- `campo`: ...

Los campos de request y response van en **snake_case** (`task_id`, `is_completed`, `created_at`), según `docs/code-rules.md`. El dominio interno usa camelCase y el mapeo vive en `toDomain` / `toResponse`; si el contrato cambia, es un cambio incompatible y se anota aquí.

## 8. UI y UX

Pantallas y componentes afectados. Para cada uno, los cuatro estados: vacío, cargando, error y éxito. Incluye comportamiento en móvil, navegación por teclado y qué anuncia un lector de pantalla cuando cambia el contenido.

La accesibilidad objetivo es **WCAG 2.1 AAA donde aplique** (`docs/frontend-rules.md`), y el HTML es semántico: `div` y `span` solo para presentación. Para cada pantalla, indica:

- Estructura semántica: landmarks y headings que la componen (sin saltos de nivel, un solo `h1`).
- Responsive en **360, 768 y 1024 px**: qué cambia en cada ancho (columnas, navegación, acciones) y qué se reordena o colapsa en móvil. Nada de información esencial oculta a 360.
- Contraste de los pares texto/fondo que se introducen (≥ 7:1 normal, ≥ 4.5:1 grande).
- Objetivos interactivos ≥ 44×44 px y foco visible.
- Qué se anuncia con `aria-live`/`role="status"` y en qué momento.
- Criterios AAA no aplicables, con motivo (p. ej. sin vídeo, no hay lengua de signos).

| Pantalla / componente | Estados | Notas de a11y |
| --- | --- | --- |
|  |  |  |

## 9. Seguridad

- Superficie de ataque nueva: rutas, actions, parámetros, uploads.
- Autorización: quién puede hacer qué y sobre qué recurso (no basta con "hay login").
- Datos sensibles: qué no debe llegar al cliente ni a los logs.
- Riesgos aceptados conscientemente, con su razón.

## 10. Criterios de aceptación

Formato Dado/Cuando/Entonces, un criterio por comportamiento. Deben poder escribirse como test sin preguntar nada.

- **AC-1** — Dado …, cuando …, entonces …
- **AC-2** — …

## 11. Plan de pruebas

| Criterio | Tipo (unit / integration / e2e) | Caso | Tarea |
| --- | --- | --- | --- |
| AC-1 |  |  |  |

Incluye los caminos de error: entrada inválida, no autorizado, recurso inexistente, conflicto.

## 12. Supuestos y preguntas abiertas

- **Supuesto:** … (si es falso, cambia RF-x)
- **Pregunta abierta:** … (bloqueante: sí/no)

## 13. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
|  |  |  |

## 14. Referencias

Enlaces a tickets, diseños, docs del framework o archivos del repo que esta spec reutiliza. Incluye siempre `docs/project.md` (contexto y decisiones vigentes).
