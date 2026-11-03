# Reglas de frontend

Aplican a cualquier `.tsx` del repo: rutas de `app/`, componentes de `features/*/components/` y de `shared/components/`. Se suman a `docs/code-rules.md`, no las sustituyen.

La regla que lo resume: **el HTML describe la estructura; CSS describe la apariencia**. Si usas un `div` para algo que tiene un elemento propio, el navegador, el lector de pantalla y el teclado pierden información que ya estaba disponible gratis.

## 1. HTML semántico

Usa el elemento que ya significa lo que estás haciendo:

| Necesitas | Elemento |
| --- | --- |
| Zona principal de la página | `<main>` (uno solo por página) |
| Bloque temático independiente | `<section>` con `aria-labelledby` o heading |
| Contenido autocontenido (un post, una tarjeta con sentido propio) | `<article>` |
| Contenido relacionado | `<aside>` |
| Navegación | `<nav>` (con `aria-label` si hay más de una) |
| Cabecera y pie | `<header>`, `<footer>` |
| Título y subtítulos | `<h1>`…`<h6>`, en orden, sin saltos |
| Lista de tareas, menú, migas | `<ul>` / `<ol>` + `<li>` |
| Formulario | `<form>`, `<label for>`, `<fieldset>` + `<legend>` si agrupa |
| Botón que hace algo | `<button type="button">` |
| Enlace que navega | `<a href>` |
| Fecha, abreviatura, código, énfasis | `<time datetime>`, `<abbr title>`, `<code>`, `<strong>` / `<em>` |
| Texto resaltado / progreso | `<mark>`, `<progress>` |

Reglas prácticas:

- **Un `<h1>` por página** y jerarquía sin saltos (`h2` → `h3`, nunca `h2` → `h4`). El tamaño se ajusta con CSS, no eligiendo otro nivel de heading.
- **Nada de `onClick` en elementos no interactivos.** Si se puede pulsar, es `<button>` o `<a>`. Un `div` con `onClick` no recibe foco ni responde a Enter/Espacio.
- **Nunca uses `role` para arreglar un elemento que ya existe.** `<div role="button">` es peor que `<button>`: hay que reimplementar foco, teclado y estados.
- **Landmarks**: `header`, `nav`, `main`, `footer` en el layout. Si hay dos `nav`, distínguelos con `aria-label`.
- **El idioma del documento debe ser el real** (`<html lang="es">` si la UI está en español). Hoy `app/layout.tsx` declara `lang="en"`: es una violación de WCAG 3.1.1 (nivel A) mientras la interfaz sea en español.
- Los formularios llevan `<label>` asociado (o `aria-label` si el diseño no admite etiqueta visible). Placeholder no es etiqueta.
- Imágenes: `alt` descriptivo o `alt=""` si son decorativas. Iconos con acción llevan nombre accesible.

## 2. `div` y `span`: solo para presentación

Permitidos cuando **no existe** un elemento semántico para lo que haces:

- Contenedores de layout: grid, flex, columnas, espaciadores.
- Envoltorios puramente visuales: fondo, borde, sombra, animación, `overflow`.
- `<span>` para aplicar estilo a un fragmento de texto sin cambiar su significado.

Prohibidos cuando hay un elemento que ya lo hace:

| Mal | Bien |
| --- | --- |
| `<div onClick={...}>Guardar</div>` | `<button type="button" onClick={...}>Guardar</button>` |
| `<div className="title">Tareas</div>` | `<h2>Tareas</h2>` |
| `<div>` con una lista de hijos | `<ul><li>…</li></ul>` |
| `<span onClick={...}>Ver más</span>` | `<button>` o `<a href>` |
| `<div>` como cabecera de página | `<header>` |
| `<div role="navigation">` | `<nav>` |
| `<div>` con `aria-live` para anuncios | `<p role="status">` / región con `aria-live` |

Un `div` con `role` y handlers de teclado reimplementados a mano es la señal de que debías usar `<button>`.

## 3. Responsive: 360, 768 y 1024 px

Toda pantalla y componente debe funcionar en los tres anchos. No es "que se vea" en desktop y luego se adapte: se construye mobile-first y se verifica en los tres.

| Ancho | Qué representa | Punto de ruptura |
| --- | --- | --- |
| 360 px | móvil base, mínimo soportado | estilos base, sin prefijo |
| 768 px | tablet vertical | `md:` |
| 1024 px | desktop / tablet horizontal | `lg:` |

Reglas:

- **Mobile-first**: el CSS base es el de 360 px; los cambios se añaden con `md:` y `lg:`. No uses `max-md:` para "deshacer" el layout de desktop.
- **360 px es el mínimo**: sin scroll horizontal, sin texto cortado, sin elementos fuera de pantalla. Si algo no cabe, se reordena o se colapsa; no se oculta información esencial.
- Usa la escala de Tailwind v4 (`md` = 768 px, `lg` = 1024 px). **Prohibidos los breakpoints arbitrarios** `min-[…]` / `max-[…]`: si de verdad hace falta uno, se define en `@theme` y se justifica en la spec.
- Nada de anchos fijos para contenedores (`w-[1200px]`): `max-w-*`, `w-full`, grid y flex.
- Imágenes y medios: `max-w-full h-auto` o `next/image` con `sizes`; nada que desborde su contenedor.
- Tablas: en 360 se convierten en lista/tarjetas o en scroll horizontal con encabezado fijo; nunca se recortan columnas.
- Tipografía fluida o escalada por breakpoint; ningún tamaño fijo que rompa al reducir.
- Zonas táctiles de 44×44 px también a 360 (coincide con 2.5.5 AAA).
- Componentes cliente que miden el DOM: no asumas `window.innerWidth`; si necesitas media queries en JS, usa `matchMedia`.

Verificación manual en cada tarea de UI: DevTools a 360, 768 y 1024, comprobar que `document.documentElement.scrollWidth === document.documentElement.clientWidth` y recorrer la pantalla con teclado en los tres anchos.

## 4. WCAG 2.1 AAA

Objetivo: **AAA en todo lo aplicable**. Algunos criterios AAA no aplican a una app de texto (lengua de signos, audiodescripción); cuando no apliquen, se anota el motivo en la spec, no se ignora en silencio.

Los que se traducen en decisiones de código:

| Criterio | Nivel | Qué exige en la práctica |
| --- | --- | --- |
| 3.1.1 Language of Page | A | `<html lang>` correcto |
| 1.4.6 Contrast (Enhanced) | AAA | Texto normal **≥ 7:1**; texto grande (≥ 18pt o ≥ 14pt bold) **≥ 4.5:1**. No uses grises "elegantes" para texto informativo |
| 1.4.9 Images of Text | AAA | Nada de texto dentro de imágenes; usa texto real |
| 1.4.8 Visual Presentation | AAA | Ancho de línea ≤ 80 caracteres, sin justificar, `line-height` ≥ 1.5, texto redimensionable al 200 % sin pérdida, sin scroll horizontal |
| 2.1.3 Keyboard (No Exception) | AAA | Todo operable con teclado, sin excepciones de "solo ratón" |
| 2.2.3 No Timing | AAA | Sin límites de tiempo; si hay expiración de sesión, se avisa y se puede extender |
| 2.2.4 Interruptions | AAA | Notificaciones y `toast` no interrumpen: se pueden posponer |
| 2.3.2 Three Flashes | AAA | Nada parpadea más de 3 veces por segundo |
| 2.4.8 Location | AAA | El usuario sabe dónde está: migas o estado activo en navegación |
| 2.4.9 Link Purpose (Link Only) | AAA | El texto del enlace identifica el destino por sí solo ("Ver tarea Comprar pan", no "Ver más") |
| 2.4.10 Section Headings | AAA | Las secciones se organizan con headings, no con divs estilizados |
| 2.5.5 Target Size | AAA | Objetivo táctil **≥ 44 × 44 CSS px** (o espaciado equivalente) |
| 3.2.5 Change on Request | AAA | Nada cambia de contexto solo con enfocar o escribir; los cambios requieren acción explícita |
| 3.3.5 Help | AAA | Ayuda contextual disponible donde se pide información |
| 3.3.6 Error Prevention (All) | AAA | Toda acción con consecuencias se puede revisar, corregir o confirmar |
| 4.1.3 Status Messages | AA | Cambios de estado anunciados con `role="status"` / `aria-live`, sin mover el foco |

Reglas derivadas que aplicamos siempre:

- **Contraste 7:1** en texto normal. Antes de añadir un color nuevo, comprueba el par texto/fondo; un token que no llega no entra.
- **Foco visible y con contraste**: `outline` no se elimina sin sustituto visible. Nunca `outline: none` a secas.
- **No transmitas información solo por color** (estado de una tarea: texto o icono + texto, no solo verde/rojo).
- **Movimiento**: respeta `prefers-reduced-motion`; nada de animaciones automáticas que no se puedan pausar.
- **Zoom 200 %** sin scroll horizontal ni contenido cortado.
- **Estados**: vacío, cargando, error y éxito deben existir y anunciarse; un spinner sin texto no comunica nada a un lector de pantalla.
- **Errores de formulario**: mensaje asociado al campo con `aria-describedby`, y resumen si hay varios.

## 5. Verificación

| Qué | Cómo |
| --- | --- |
| HTML semántico, roles y handlers | `npm run lint` — reglas `jsx-a11y/*` estrictas (un `div` con `onClick` o un `label` sin control fallan) |
| Breakpoints arbitrarios | `npm run lint` — `min-[…]`/`max-[…]` en `className` es error |
| Responsive 360 / 768 / 1024 | Manual en cada tarea: sin scroll horizontal y sin contenido cortado en los tres anchos |
| Teclado, foco, lector de pantalla | Prueba manual en cada tarea: recorrer con Tab, activar con Enter/Espacio, comprobar foco |
| Contraste, tamaño de objetivo, zoom | Manual con DevTools; el color nuevo se valida antes de entrar |
| Regresiones automatizadas | El agente `tests` añade `axe-core` (unitario con `jest-axe` o e2e con `@axe-core/playwright`) y e2e a los tres viewports cuando exista runner |

`axe` detecta una parte de los problemas (contraste, roles, labels), no la calidad de la experiencia con teclado ni los desbordes de layout. Que `axe` pase no significa que el flujo sea accesible ni responsive.

## 6. Antipatrones que rechazamos en revisión

- `<div role="button" tabIndex={0} onClick onKeyDown>` — usa `<button>`.
- `<a href="#" onClick>` — si no navega, es un botón.
- `outline: none` sin alternativa de foco.
- Texto en una imagen o icono sin nombre accesible.
- Placeholder como única etiqueta.
- `aria-label` que repite el texto visible o contradice el contenido.
- Anuncios con `aria-live="assertive"` para cosas que no son urgentes.
- Colores de estado sin texto ni icono que lo respalde.
- Ocultar contenido esencial en móvil con `hidden md:block` en vez de reordenarlo.
- Anchos fijos en px o breakpoints arbitrarios `min-[…]` para "arreglar" un layout que no era mobile-first.
