# Reglas de calidad de una spec

El template da la forma; esto da el listón. Una spec que falla estos puntos devuelve trabajo al usuario en forma de preguntas durante la implementación.

## Requisitos

- **Atómicos**: un requisito = una cosa verificable. "Crear y editar tareas" son dos.
- **Observables**: describen comportamiento, no estructura interna. "Al guardar, la tarea aparece en la lista sin recargar" sí; "usar un Context" no.
- **Sin ambigüedad**: si dos personas pueden leerlo distinto, no está terminado. Prohibido "rápido", "amigable", "robusto", "correcto" sin criterio medible.
- **Trazables**: cada requisito tiene al menos un criterio de aceptación y una tarea. Si un requisito no tiene tarea, o sobra o falta trabajo.

## Criterios de aceptación

- Formato **Dado / Cuando / Entonces**, en tercera persona y sin jerga de implementación.
- Uno por comportamiento; si necesitas "y" para describir dos resultados, son dos criterios.
- Cubren el camino feliz **y** los errores relevantes.
- Se pueden convertir en un test sin tomar decisiones nuevas. Si para escribirlo hay que elegir un valor, ese valor va en la spec.

Ejemplo:

```
AC-1 — Dado que existe la tarea "Comprar pan", cuando el usuario la marca como
       completada, entonces la tarea muestra el estado completado y el contador
       de pendientes baja en uno.
AC-2 — Dado que la tarea ya está completada, cuando el usuario intenta
       completarla otra vez, entonces la operación no tiene efecto y no se
       muestra ningún error.
```

## Contratos

- Los errores son parte del contrato: código, forma del cuerpo y condición que los dispara.
- Los campos de request y response van en snake_case (`task_id`, `is_completed`); el dominio interno en camelCase con mapeo en el borde. Un payload no mezcla formatos.
- Di explícitamente qué pasa con datos inválidos, duplicados, inexistentes y no autorizados.
- Si hay paginación, orden o filtros, quedan definidos aquí y no se improvisan en la UI.
- Nombra las entidades y campos igual que el código que se va a escribir.

## UI

- Los cuatro estados por pantalla: vacío, cargando, error, éxito. Una spec sin estado vacío produce pantallas en blanco.
- Define qué es un error recuperable (mensaje inline, reintento) y qué es fatal.
- Accesibilidad concreta y verificable: WCAG 2.1 AAA donde aplique — contraste 7:1, objetivos de 44×44 px, operación completa por teclado, foco visible, zoom 200 % sin pérdida, cambios de estado anunciados.
- Responsive verificado en 360, 768 y 1024 px, mobile-first. Define qué cambia en cada ancho; "se adapta solo" no es un criterio de aceptación.
- HTML semántico: define la estructura con landmarks y headings. `div`/`span` solo para presentación; si la spec describe "un div con onClick", la spec está mal.

## Seguridad

- Autorización por recurso, no solo por sesión: "el dueño de la tarea puede editarla" incluye el caso de otro usuario autenticado.
- Nunca incluyas secretos, tokens ni datos personales en ejemplos de la spec.
- Si la feature acepta URLs, HTML o archivos del usuario, nómbralo como superficie de ataque.

## Tamaño

Una spec debe caber en una revisión de 10 minutos. Si cubre más de ~5 requisitos funcionales o más de ~15 tareas, pártela en dos specs enlazadas (`specs/<id>/spec.md` y una sección "Specs relacionadas") en vez de escribir un documento que nadie va a leer.
