# Reglas de código

Normativas y aplicables a todo el código propio del repo (`app/`, `features/`, `shared/`, `tests/`, scripts). No aplican a `node_modules/`, `.next/`, ni a archivos generados (`next-env.d.ts`).

Cada regla indica cómo se hace cumplir. Las que no tienen verificación automática se revisan en el cierre de la tarea; si una no se puede comprobar, no es una regla, es una sugerencia.

La estructura de carpetas y las fronteras entre `app/`, `features/` y `shared/` están en `docs/project.md` §4, y también se hacen cumplir con `no-restricted-imports`.

## 1. Tamaño

| Regla | Límite | Verificación |
| --- | --- | --- |
| Métodos por clase | 10 | `local/max-methods-per-class` |
| Líneas por función | 100 | `max-lines-per-function` |

- Cuentan como métodos el constructor, getters, setters y propiedades con función (`handler = () => {}`).
- Las 100 líneas excluyen comentarios y líneas en blanco, y aplican a **cualquier** función: métodos, funciones sueltas, componentes, handlers y Server Actions.
- Si una función no cabe, no la partas con un comentario: extrae una función con nombre que exprese la intención (`validateTaskInput`, `mapRowToTask`). Si una clase pasa de 10 métodos, está haciendo más de una cosa.

```ts
// Mal: una función que valida, transforma, persiste y responde.
async function handleTask(request: Request) { /* 180 líneas */ }

// Bien: cada paso es una función con nombre y testeable.
async function handleTask(request: Request) {
  const payload = await parseTaskRequest(request);
  const task = await createTask(payload);
  return taskResponse(task);
}
```

## 2. Tipado

- **Prohibido `any`**, explícito e implícito.
- **Prohibido `unknown`**, con tres únicas excepciones: el parámetro de un *type guard*, la anotación de un `catch` y la anotación de una variable del borde (`const raw: unknown = await request.json()`). En los tres casos el valor debe estrecharse antes de usarse.
- Prohibido `@ts-ignore`. Si de verdad hace falta, `@ts-expect-error` con el motivo al lado.

`unknown` no es un tipo utilizable: es la puerta de entrada. La regla no prohíbe protegerse de datos externos, prohíbe quedarse ahí. En una firma de función (parámetro o retorno) o en un `type`, `unknown` no entra: o hay un guard que devuelve el tipo real, o el tipo está mal.

```ts
// Mal: el resto del código hereda la incertidumbre (además usa `as`, prohibido).
function parseTask(value: unknown) {
  return value as Task;
}

// Bien: un solo guard en el borde; el dominio trabaja con tipos reales.
function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  return "task_id" in value && typeof value.task_id === "string";
}

// La variable del borde se anota `unknown` y el guard la estrecha de inmediato.
const raw: unknown = await request.json();
if (!isTask(raw)) throw new InvalidTaskError();
const task: Task = raw; // a partir de aquí, tipo real
```

Sustituciones habituales:

| Situación | En lugar de `any` / `unknown` |
| --- | --- |
| Body de un Route Handler | `await request.json()` + type guard del payload |
| `JSON.parse` | helper que parsea y valida, devuelve el tipo real |
| `catch (e)` | `catch (e)` sin anotar y un guard `isError(e)` / `toError(e)` |
| Librería sin tipos | tipo mínimo propio + guard en el borde; nunca un cast a ciegas |
| Respuesta de `fetch` | validar la forma antes de confiar en ella |

Ningún cast (`as`) es aceptable, en ningún sitio: ni `as Task`, ni `as unknown as T`, ni `as const`. El tipo se declara y el valor debe encajar (`satisfies` para comprobar sin cambiar el tipo), o se escribe el guard que devuelve el tipo real. Si el compilador no acepta el valor, el error está en el tipo o en el valor, no en la falta de un cast.

## 3. Nombres

| Elemento | Formato | Ejemplo |
| --- | --- | --- |
| Clases | PascalCase | `class TaskRepository` |
| Componentes React | PascalCase | `function TaskList()` |
| Tipos, interfaces, enums | PascalCase | `type TaskStatus`, `interface Task` |
| Funciones y métodos | camelCase | `createTask`, `isCompleted` |
| Variables, parámetros, props | camelCase | `taskId`, `isPending` |
| Constantes de módulo | UPPER_SNAKE_CASE | `const MAX_PAGE_SIZE = 50` |

Los componentes van en PascalCase porque JSX trata un identificador en minúscula como etiqueta HTML: `<taskList />` no es un componente. Es la única desviación de camelCase y no es negociable.

Nombres en inglés para el código; el texto visible al usuario puede estar en español. Nada de abreviaturas opacas (`tsk`, `dto2`, `tmp`): el nombre es la documentación más barata que existe.

## 4. Protocolo: request y response en snake_case

Todo lo que cruza el borde HTTP o de Server Action viaja en **snake_case**. El dominio interno sigue en **camelCase**.

```ts
// Contrato de entrada y salida — refleja el JSON tal cual.
interface CreateTaskRequest {
  task_id?: string;
  title: string;
  is_completed?: boolean;
  due_date: string | null;
}

interface TaskResponse {
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

// Dominio interno — camelCase, sin contaminarse con el transporte.
interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
}
```

- El mapeo ocurre en un único sitio por recurso: `toDomain(response)` y `toResponse(task)`. No traduzcas campos a mano en cada componente.
- Un payload no mezcla formatos: nunca `taskId` junto a `created_at`.
- Los parámetros de query también van en snake_case (`?task_id=…&is_completed=true`).
- Los tipos `XxxRequest` / `XxxResponse` son el contrato público: cambiarlos es un cambio incompatible y va en la spec.

Verificación: no hay regla de ESLint que distinga un tipo de transporte de uno de dominio sin anotaciones extra, así que esto se revisa en el cierre de la tarea. Si el proyecto crece, se sustituye por un schema (Zod u otro) que valide y genere el tipo desde el contrato.

## 5. Cierre de tarea

Ninguna tarea se da por terminada si:

- `npm run lint` falla.
- `npx tsc --noEmit` falla.
- Se añadió una excepción (`eslint-disable`, `@ts-expect-error`, cast) sin justificarla al lado.

El hook de pre-commit (`.husky/pre-commit`) ejecuta `eslint --fix` sobre los archivos del commit y `tsc --noEmit` sobre el proyecto: si algo falla, **el commit se rechaza**. No es una barrera que se salte con `--no-verify`; si necesitas saltarla, el problema es el código.

Las excepciones se documentan con el motivo y, si son permanentes, se anotan en la spec de la feature.
