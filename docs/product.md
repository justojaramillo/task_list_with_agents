# Producto: lista de tareas con ventana de visibilidad

Definición funcional de la app: qué hace, para quién, con qué reglas y en qué orden se construye. Este documento se aprueba **antes** de escribir specs. El contexto técnico (stack instalado, estado del repo, decisiones de infraestructura) vive en `docs/project.md`.

> Si una spec contradice este documento, gana este documento y se corrige la spec. Si el producto cambia, se actualiza aquí primero.

## 1. Resumen

Una lista de tareas personales pensada para **planificar a largo plazo sin ruido**. Creas una tarea con su fecha objetivo y decides con cuánta antelación quieres verla; hasta que llega ese momento, la tarea no ocupa espacio en tu lista de trabajo, pero sigue visible en el calendario y en la vista de programadas. El calendario sirve para planificar y mover fechas; las métricas dicen cuánto de lo que te tocó has cumplido.

La palabra "agents" del repositorio se refiere al **flujo de desarrollo** (agentes de OpenCode que implementan), no a una funcionalidad del producto.

## 2. El problema

Las listas de tareas convencionales fallan en dos extremos opuestos:

- **Todo aparece de inmediato.** Una tarea para dentro de un año ocupa un hueco en la lista desde hoy y compite con lo urgente durante 365 días. El resultado es una lista que se vuelve un archivo y deja de mirarse.
- **Esconder a mano no funciona.** Si la guardas en una nota aparte o la silencias, se olvida. Nadie confía en un sistema que pierde cosas.

La app resuelve las dos: **oculta por defecto, pero de forma verificable**. La tarea no está escondida: está programada, y siempre puedes ver en qué fecha aparecerá.

## 3. Usuarios y casos de uso

**Un solo usuario** (decisión pendiente de confirmar: ver §10). No hay cuentas ni compartición en el alcance actual.

| Caso | Ejemplo |
| --- | --- |
| Obligaciones periódicas | ITV del coche en abril, renovar el DNI en 2028, seguro anual |
| Eventos con preparación | "Viaje en junio" → reservar alojamiento 30 días antes |
| Planificación anual | "Revisar la declaración de la renta" con 15 días de antelación |
| Trabajo de la semana | Tareas normales que deben verse ya |

## 4. Concepto central: la ventana de visibilidad

Toda tarea tiene tres fechas:

| Concepto | Fórmula | Significado |
| --- | --- | --- |
| `createdAt` | — | cuándo la registraste |
| `visibleFrom` | `dueDate − leadDays` | cuándo entra en la lista de trabajo |
| `dueDate` | — | cuándo debe estar hecha |

```
creación              visibleFrom                      dueDate
   │                       │                              │
   ├──── programada ───────┼── pendiente ─────────────────┤
   │   (solo calendario    │   (lista de trabajo)         │
   │    y programadas)     │                              │
   │                       │                     vencida ──┴──►
```

Reglas:

- `visibleFrom` cae a las **00:00 de la zona horaria de la app**. Una antelación de 7 días con vencimiento el día 20 significa que la tarea aparece el día 13 a primera hora.
- La tarea **existe desde que se crea**. Lo que cambia es si aparece o no en la lista de trabajo.
- El **calendario la muestra siempre**, también mientras está programada. Planificar exige ver el futuro; trabajar exige foco.
- La vista **Programadas** existe para que "no verla" no signifique "olvidarla": muestra la tarea y la fecha exacta en que aparecerá.
- Si mueves la fecha, `visibleFrom` se recalcula. Si la nueva ventana ya empezó, la tarea aparece de inmediato.

## 5. Estados y transiciones

Los únicos hechos que determinan el estado son `completedAt` y `deletedAt`. Todo lo demás se deriva. Un estado almacenado se queda obsoleto; uno derivado no puede mentir.

| Estado | Condición | Lista de trabajo | Calendario |
| --- | --- | --- | --- |
| **Programada** | `now < visibleFrom` y sin completar | no | sí |
| **Pendiente** | `visibleFrom ≤ now ≤ dueDate` y sin completar | sí | sí |
| **Vencida** | `now > dueDate` y sin completar | sí, destacada | sí |
| **Completada** | `completedAt ≠ null` | no (vista Completadas) | sí, marcada |
| **Eliminada** | `deletedAt ≠ null` | no | no |

Transiciones:

| Acción | Efecto |
| --- | --- |
| Crear | Programada o pendiente, según si `visibleFrom` ya pasó |
| Llegar `visibleFrom` | Programada → pendiente (automático, sin proceso en segundo plano) |
| Llegar `dueDate` | Pendiente → vencida (automático) |
| Completar | Cualquier estado abierto → completada; sella `completedAt` |
| Descompletar | Completada → estado derivado que corresponda |
| Mover de fecha | Recalcula `visibleFrom`; puede hacer que aparezca o desaparezca de la lista |
| Eliminar | Eliminada; deshacer durante unos segundos y en la papelera |

## 6. Funcionalidades

Prioridad **MoSCoW**: `Must` (sin esto no hay producto), `Should` (siguiente), `Could` (cuando lo anterior esté sólido), `Won't` (fuera por ahora).

### 6.1 Gestión de tareas

| Funcionalidad | Descripción | Prioridad |
| --- | --- | --- |
| Crear tarea | Título obligatorio, fecha objetivo, antelación (con valor por defecto), notas | Must |
| Editar tarea | Cambiar cualquier campo; recalcula la ventana | Must |
| Completar / descompletar | Sella o limpia `completedAt` | Must |
| Eliminar con deshacer | Borrado lógico; se puede recuperar | Must |
| Notas | Texto libre por tarea | Should |
| Bandeja de entrada | Tareas sin fecha, para capturar y programar después | Could |
| Duplicar tarea | Para obligaciones parecidas | Could |

### 6.2 Planificación y calendario

| Funcionalidad | Descripción | Prioridad |
| --- | --- | --- |
| Lista de trabajo | Tareas en ventana, agrupadas en Vencidas / Hoy / Esta semana / Más adelante | Must |
| Vista Programadas | Tareas con ventana futura y la fecha en que aparecerán | Must |
| Vista Completadas | Historial de lo hecho | Must |
| Calendario mensual | Rejilla de mes con todas las tareas, incluidas las programadas | Must |
| Mover de fecha | Cambiar la fecha de una tarea desde el calendario o el detalle | Must |
| Reprogramar vencida | Acción rápida "pasar a mañana / elegir fecha" | Should |
| Agenda de 7 días | Lista de lo que viene, sin rejilla | Should |
| Vista semana / día | Planificación con más detalle | Could |
| Recurrencia | Tareas que se repiten (anual, mensual, semanal) | Could |
| Duración | Distinguir "vence" de "lo hago de 10 a 11" | Could |

**Recurrencia no es un añadido menor:** una tarea recurrente no se completa globalmente, se completan *ocurrencias*. Si entra, el modelo de datos cambia y debe diseñarse antes de implementarlo, no después.

### 6.3 Seguimiento

| Funcionalidad | Descripción | Prioridad |
| --- | --- | --- |
| % de cumplimiento | Ver §9 | Must |
| Puntualidad | % de completadas antes de su fecha objetivo | Should |
| Vencidas abiertas | Conteo, no porcentaje | Should |
| Completadas por semana | Volumen, no ratio | Could |
| Reprogramaciones por tarea | Señal de evitación crónica | Could |
| Historial de cambios | Auditoría y base de las métricas | Could |

### 6.4 Organización

| Funcionalidad | Descripción | Prioridad |
| --- | --- | --- |
| Búsqueda | Por título y notas | Should |
| Filtro por estado y fecha | Vencidas, esta semana, sin fecha | Should |
| Etiquetas | Categorías libres | Could |
| Prioridad | Alta / media / baja | Could |
| Subtareas | Checklist dentro de una tarea | Could |

Si entran subtareas, el padre cuenta como cumplido cuando lo están todos los hijos, y **los hijos no cuentan por separado en el porcentaje**. Si no se decide así, el porcentaje se infla.

### 6.5 Datos

| Funcionalidad | Descripción | Prioridad |
| --- | --- | --- |
| Persistencia en Firestore | Ver `docs/project.md` §2 | Must |
| Copia de seguridad JSON | Exportar todo | Should |
| Exportar `.ics` | Llevar las tareas al calendario real | Could |
| Importar | Desde JSON o `.ics` | Could |

### 6.6 Transversal

Aplica a todo lo anterior; no es una fase.

| Requisito | Detalle |
| --- | --- |
| Accesibilidad | WCAG 2.1 AAA donde aplique: contraste 7:1, objetivos ≥ 44×44 px, teclado completo, foco visible, zoom 200 %, estados anunciados (`docs/frontend-rules.md`) |
| HTML semántico | Lista → `<ul>/<li>`; calendario → tabla real con encabezados de día; formulario → `<form>` + `<label>` |
| Responsive | 360, 768 y 1024 px, mobile-first |
| Idioma | Español; `<html lang="es">` |
| Estados de UI | Vacío, cargando, error y éxito en cada pantalla |

## 7. Pantallas y flujos

### Pantallas propuestas

| Ruta | Nombre | Contenido |
| --- | --- | --- |
| `/` | Hoy | Lista de trabajo: Vencidas, Hoy, Esta semana, Más adelante |
| `/programadas` | Programadas | Agrupadas por mes en que aparecerán |
| `/completadas` | Completadas | Historial |
| `/calendario` | Calendario | Mes con todas las tareas por día |
| `/tareas/nueva` | Nueva tarea | Formulario |
| `/tareas/[id]` | Detalle | Ver, editar, completar, eliminar |
| `/metricas` | Métricas | Cumplimiento, puntualidad, vencidas |
| `/ajustes` | Ajustes | Antelación por defecto, zona horaria |

Las rutas son una propuesta, no un contrato: se confirman en la spec de la primera feature.

### Flujos

1. **Programar a futuro.** Crear tarea con fecha 12 meses vista y antelación 30 días → aparece en Programadas y en el calendario del mes que viene, no en Hoy.
2. **Aparición automática.** Al llegar `visibleFrom`, la tarea entra en la lista de trabajo sin que el usuario haga nada.
3. **Mover en el calendario.** Arrastrar o cambiar la fecha desde el detalle → se recalcula la ventana. Si la nueva ventana ya empezó, aparece de inmediato.
4. **Completar.** Marca la tarea → sale de la lista activa, entra en Completadas y en las métricas.
5. **Vencer.** La tarea se queda visible y destacada; acciones: completar, reprogramar, eliminar.
6. **Deshacer borrado.** Tras eliminar, aviso con opción de recuperar.

## 8. Modelo de datos

Firestore, colección `tasks`. El `id` es el identificador del documento.

| Campo | Tipo | Regla |
| --- | --- | --- |
| `title` | string | obligatorio, no vacío, máximo 200 caracteres |
| `notes` | string \| null | opcional, máximo 2000 caracteres |
| `dueDate` | string `YYYY-MM-DD` | obligatorio |
| `dueTime` | string `HH:mm` \| null | opcional; sin hora, vence al final del día |
| `leadDays` | number | entero `>= 0`; por defecto 7 |
| `visibleFrom` | string `YYYY-MM-DD` | **materializado** = `dueDate − leadDays`, recalculado al escribir |
| `completedAt` | timestamp \| null | `null` = abierta |
| `deletedAt` | timestamp \| null | borrado lógico |
| `createdAt` / `updatedAt` | timestamp | |

**Por qué `visibleFrom` se guarda pese a ser derivado:** Firestore no puede consultar `dueDate − leadDays`. Se calcula al crear y al editar, a partir de dos campos almacenados, así que **no puede quedar obsoleto** y no necesita ningún proceso periódico. Es distinto de guardar `isVisible`, que sí caducaría.

Consultas e índices que esto exige:

| Vista | Consulta | Índice compuesto |
| --- | --- | --- |
| Programadas | `deletedAt == null && completedAt == null && visibleFrom > hoy` | (`deletedAt`, `completedAt`, `visibleFrom`) |
| Lista de trabajo | `deletedAt == null && completedAt == null && visibleFrom <= hoy` | (`deletedAt`, `completedAt`, `visibleFrom`) |
| Calendario | `deletedAt == null && visibleFrom` en rango | (`deletedAt`, `visibleFrom`) |
| Métricas | `deletedAt == null && visibleFrom` en el periodo | (`deletedAt`, `visibleFrom`) |

Invariantes:

- `title` no vacío ni solo espacios.
- `leadDays >= 0`; valores negativos se rechazan en el borde.
- `visibleFrom <= dueDate`.
- `completedAt >= createdAt`.
- Una tarea eliminada no aparece en ninguna vista, pero sigue en la base de datos.

Zona horaria: **una sola** para toda la app (configuración, no por usuario). "Hoy" y `visibleFrom` se calculan en esa zona; las fechas se guardan como texto ISO, no como timestamp UTC.

> Si la bandeja de entrada entra en el producto (§6.1), `dueDate` deja de ser obligatorio y con él cambian `visibleFrom`, las consultas y las métricas: una tarea sin fecha no tiene ventana. Es una decisión de modelo, no un campo opcional añadido al final.

## 9. Métricas

La fórmula evidente es una trampa: si `cumplimiento = completadas / todas`, crear diez tareas para el año que viene hunde la métrica a 0 % **por planificar**, que es justo lo que la app premia. La métrica castigaría su uso correcto.

Definición adoptada, sobre una **cohorte**: las tareas que entraron en ventana en el periodo.

```
cohorte(periodo)     = tareas no eliminadas con visibleFrom dentro del periodo
cumplimiento         = completadas de la cohorte / cohorte
puntualidad          = completadas de la cohorte a tiempo / completadas de la cohorte
vencidas abiertas    = abiertas de la cohorte con dueDate < ahora
```

- **No se cuentan** las tareas todavía programadas: no se te pedía nada de ellas.
- Las completadas se cuentan **aunque se hayan completado después del periodo**; por eso el número de un mes pasado puede mejorar. Es la lectura correcta: "de lo que te tocó en marzo, ¿cuánto acabaste haciendo?".
- El periodo en curso es **provisional** y mejora según completas. La UI lo dice.
- `cumplimiento` no distingue dificultad: diez tareas triviales valen lo mismo que diez costosas. Es un indicador, no una nota.

## 10. Decisiones de producto

| Decisión | Estado | Motivo |
| --- | --- | --- |
| Ventana de visibilidad: la tarea se oculta de la lista hasta `visibleFrom` | firme | es el diferencial del producto |
| El calendario muestra también las tareas programadas | firme | sin eso no se puede planificar |
| Vista Programadas con la fecha de aparición | firme | "oculto" solo funciona si es verificable |
| Los estados se derivan; solo se guardan `completedAt` y `deletedAt` | firme | un estado almacenado se queda obsoleto |
| Persistencia en Firebase (Firestore) | firme | decisión del usuario |
| Antelación por tarea con valor por defecto global | propuesta | evita repetir "una semana" en cada formulario |
| Borrado lógico con deshacer | propuesta | menos fricción que confirmar, y cumple 3.3.6 |
| Métricas por cohorte de `visibleFrom` | propuesta | no castiga planificar a futuro |
| Un solo usuario, sin cuentas | pendiente | depende de si la app se despliega o se usa en local |
| Bandeja de entrada y recurrencia | pendiente | fase posterior; recurrencia cambia el modelo |
| Nombre comercial del producto | pendiente | hoy es "lista de tareas" |

## 11. No-objetivos (por ahora)

No están en el producto y una spec no puede darlos por hechos:

- Multiusuario, cuentas compartidas o asignación de tareas.
- Notificaciones por email o push.
- Sincronización bidireccional con Google Calendar u Outlook.
- Adjuntos y almacenamiento de archivos.
- "IA que prioriza" o genera tareas.
- Gamificación con puntos, medallas o rankings.
- App móvil nativa y funcionamiento offline.

Cada uno puede entrar más adelante; ninguno justifica retrasar el núcleo.

## 12. Orden de construcción

La prioridad MoSCoW dice **qué** importa; esto dice **en qué orden se entrega**. Cada fase se escribe como una o más specs y no empieza sin aprobación explícita.

| Fase | Contenido | Por qué antes |
| --- | --- | --- |
| **1. Núcleo** | Modelo `Task` + Firestore, CRUD con deshacer, ventana de visibilidad, listas Hoy / Programadas / Completadas, calendario mensual, vencidas, estados de UI | Sin esto no hay producto; todo lo demás lo presupone |
| **2. Medición** | % de cumplimiento, puntualidad, vencidas abiertas, export JSON | Usa los mismos datos; entrega valor sin tocar el modelo |
| **3. Fricción** | Búsqueda, filtros, agenda de 7 días, reprogramar vencidas, bandeja de entrada | Cuando ya hay volumen real de tareas que ordenar y capturar |
| **4. Solo con aprobación** | Recurrencia, etiquetas, prioridad, subtareas, `.ics`, vista semana/día | Recurrencia y bandeja cambian el modelo; el resto es superficie a mantener |

Regla de corte: una fase no se da por terminada con la UI funcionando. Incluye sus criterios de aceptación, sus pruebas (unitarias, de integración y de accesibilidad) y sus estados vacío / cargando / error.

## 13. Glosario

| Término | Significado |
| --- | --- |
| Tarea | Unidad de trabajo con fecha objetivo y antelación |
| Fecha objetivo (`dueDate`) | Cuándo debe estar hecha |
| Antelación (`leadDays`) | Días antes de la fecha objetivo en que la tarea entra en la lista de trabajo |
| Ventana de visibilidad | Periodo que empieza en `visibleFrom` |
| Programada | Tarea creada cuya ventana aún no ha empezado |
| Cohort | Conjunto de tareas que entraron en ventana en un periodo |
| Zona horaria de la app | Zona única con la que se calcula "hoy" y `visibleFrom` |
