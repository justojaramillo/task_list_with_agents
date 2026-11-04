import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proyecto Task List",
  description:
    "Lista de tareas con ventana de visibilidad. Prueba de despliegue en AWS, Cloudflare y Vercel.",
};

const conceptos = [
  {
    nombre: "Fecha objetivo",
    texto: "El día en que la tarea debe estar hecha.",
  },
  {
    nombre: "Antelación",
    texto: "Cuántos días antes quieres empezar a verla.",
  },
  {
    nombre: "Ventana de visibilidad",
    texto:
      "Hasta que llega, la tarea no aparece en tu lista de trabajo, pero sigue en el calendario.",
  },
];

const plataformas = ["AWS", "Cloudflare", "Vercel"];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-12 md:px-10 md:py-20">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 md:text-5xl dark:text-zinc-50">
          Proyecto Task List
        </h1>
        <p className="text-lg leading-8 text-zinc-800 dark:text-zinc-200">
          Una lista de tareas personales para planificar a largo plazo sin
          ruido. Cada tarea tiene una fecha objetivo y una antelación: no entra
          en tu lista de trabajo hasta que llega su momento, pero siempre
          puedes ver en qué fecha aparecerá.
        </p>
      </header>

      <section aria-labelledby="como-funciona" className="flex flex-col gap-4">
        <h2
          id="como-funciona"
          className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Cómo funciona
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {conceptos.map((concepto) => (
            <li
              key={concepto.nombre}
              className="rounded-lg border border-zinc-400 p-4 dark:border-zinc-500"
            >
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {concepto.nombre}
              </h3>
              <p className="mt-1 leading-7 text-zinc-800 dark:text-zinc-200">
                {concepto.texto}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="despliegue" className="flex flex-col gap-4">
        <h2
          id="despliegue"
          className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Prueba de despliegue en AWS / Cloudflare / Vercel
        </h2>
        <p className="leading-7 text-zinc-800 dark:text-zinc-200">
          Esta página sirve para comprobar que la aplicación se despliega y
          responde en cada plataforma.
        </p>
        <ul className="flex flex-wrap gap-3">
          {plataformas.map((plataforma) => (
            <li
              key={plataforma}
              className="rounded-full border border-zinc-950 px-5 py-2 font-medium text-zinc-950 dark:border-zinc-50 dark:text-zinc-50"
            >
              {plataforma}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
